#!/bin/bash
# Keystone インストールスクリプト

set -e

# 色付き出力用の変数
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

KEYSTONE_REPOSITORY_URL=https://github.com/XxPMMPERxX/Keystone.git


echo "========================================="
echo "   Keystone インストールスクリプト"
echo "========================================="
echo ""

# インストールディレクトリ名を取得
get_install_dir() {
    read -r -e -p "インストール先 (Keystone):" dir_name
    if [ -z "$dir_name" ]; then
        INSTALL_DIR="Keystone"
    else
        # ディレクトリ名の検証（特殊文字を除外）
        if [[ "$dir_name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
            INSTALL_DIR="$dir_name"
        else
            echo -e "${RED}エラー: ディレクトリ名には英数字、ハイフン、アンダースコアのみ使用できます${NC}"
            echo "デフォルトの 'Keystone' を使用します"
            INSTALL_DIR="Keystone"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}インストール先:${NC} ./$INSTALL_DIR"
    echo ""
}

# インストールディレクトリを設定
get_install_dir

# Dockerがインストールされているか確認
check_docker() {
    if command -v docker &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Docker Composeがインストールされているか確認
check_docker_compose() {
    if docker compose version &> /dev/null; then
        return 0
    elif command -v docker-compose &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Dockerのインストール
install_docker() {
    echo ""
    echo -e "${YELLOW}Dockerをインストールしますか？ (y/n)${NC}"
    
    read -r response
    
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        # OS判定と自動インストール
        if [[ "$OSTYPE" == "linux-gnu"* ]] || [ -f /etc/os-release ]; then
            # Linux
            
            # Dockerインストールスクリプトのダウンロードと実行
            if curl -fsSL https://get.docker.com -o get-docker.sh; then
                sudo sh get-docker.sh
                sudo usermod -aG docker $USER
                rm get-docker.sh
                
                # Docker サービスの起動
                sudo systemctl start docker 2>/dev/null || sudo service docker start 2>/dev/null
                sudo systemctl enable docker 2>/dev/null || true
                
                echo -e "${YELLOW}※ dockerグループの変更を反映するため、一度ログアウトして再度ログインしてください${NC}"
            else
                echo -e "${RED}エラー: Dockerインストールスクリプトのダウンロードに失敗しました${NC}"
                exit 1
            fi
            
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            echo -e "${YELLOW}macOSでは Docker Desktop をインストールする必要があります${NC}"
            echo "以下のURLからダウンロードしてインストールしてください："
            echo "https://www.docker.com/products/docker-desktop/"
            echo ""
            echo "インストール完了後、このスクリプトを再実行してください"
            exit 1
            
        else
            echo -e "${RED}サポートされていないOSです: $OSTYPE${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Dockerのインストールをキャンセルしました${NC}"
        echo "Keystoneを使用するにはDockerが必要です"
        exit 1
    fi
}

# Keystoneのクローン
clone_keystone() {
    
    # Gitのインストール確認
    if ! command -v git &> /dev/null; then
        if [[ "$OSTYPE" == "linux-gnu"* ]] || [ -f /etc/os-release ]; then
            sudo apt-get update && sudo apt-get install -y git 2>/dev/null || \
            sudo yum install -y git 2>/dev/null || \
            sudo dnf install -y git 2>/dev/null
        fi
    fi
    
    # 既存のディレクトリがある場合の確認
    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${YELLOW}警告: $INSTALL_DIR ディレクトリが既に存在します${NC}"
        echo "削除して続行しますか？ (y/n)"
        
        read -r response
        
        if [[ "$response" == "y" || "$response" == "Y" ]]; then
            rm -rf "$INSTALL_DIR"
        else
            echo "インストールを中止しました"
            exit 1
        fi
    fi
    
    # リポジトリのクローン
    if git clone "$KEYSTONE_REPOSITORY_URL" "$INSTALL_DIR" 2>/dev/null; then
        # .gitディレクトリを削除
        rm -rf "$INSTALL_DIR/.git"
        
        # .env ファイルのセットアップ
        if [ -f "$INSTALL_DIR/.env.example" ]; then
            cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
        fi
        
        # macOS/LinuxでのUID/GID設定
        CURRENT_UID=$(id -u)
        CURRENT_GID=$(id -g)

        # UIDが既に存在する場合は置き換え、存在しない場合は追加
        if grep -q "^UID=" "$INSTALL_DIR/.env"; then
            sed -i.bak "s/^UID=.*/UID=$CURRENT_UID/" "$INSTALL_DIR/.env"
        else
            echo "" >> "$INSTALL_DIR/.env"
            echo "# User ID設定" >> "$INSTALL_DIR/.env"
            echo "UID=$CURRENT_UID" >> "$INSTALL_DIR/.env"
        fi

        # GIDが既に存在する場合は置き換え、存在しない場合は追加
        if grep -q "^GID=" "$INSTALL_DIR/.env"; then
            sed -i.bak "s/^GID=.*/GID=$CURRENT_GID/" "$INSTALL_DIR/.env"
        else
            # UIDがすでに追加されている場合はコメントを追加しない
            if ! grep -q "# User ID設定" "$INSTALL_DIR/.env"; then
                echo "" >> "$INSTALL_DIR/.env"
                echo "# User ID設定" >> "$INSTALL_DIR/.env"
            fi
            echo "GID=$CURRENT_GID" >> "$INSTALL_DIR/.env"
        fi

        # バックアップファイルを削除
        rm -f "$INSTALL_DIR/.env.bak"
    else
        echo -e "${RED}エラー: リポジトリのクローンに失敗しました${NC}"
        exit 1
    fi
}

# Docker Composeの起動
start_docker_compose() {
    
    cd "$INSTALL_DIR"
    
    # docker-compose.ymlファイルの存在確認
    if [ ! -f "docker-compose.yml" ] && [ ! -f "docker-compose.yaml" ]; then
        echo -e "${RED}エラー: docker-compose.ymlファイルが見つかりません${NC}"
        exit 1
    fi
    
    # Dockerコンテナ起動の確認
    echo -e "${GREEN}Dockerコンテナを起動しますか？ (y/n)${NC}"
    
    read -r response
    
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        # Docker Composeの起動
        if docker compose version &> /dev/null; then
            docker compose up
        else
            docker-compose up
        fi
    else
        echo ""
        echo "========================================="
        echo "   セットアップが完了しました"
        echo "========================================="
        echo ""
        echo "手動で起動する場合: cd $INSTALL_DIR && docker compose up -d"
    fi
}

# メイン処理
main() {
    # Dockerの確認とインストール
    if ! check_docker; then
        install_docker
    fi
    
    # Docker Composeの確認
    if ! check_docker_compose; then
        echo -e "${RED}エラー: Docker Composeがインストールされていません${NC}"
        echo "Docker Desktopを最新版に更新するか、docker-composeを個別にインストールしてください"
        exit 1
    fi
    
    # Keystoneのクローン
    clone_keystone
    
    # Docker Composeの起動
    start_docker_compose
}

# スクリプトの実行
main
