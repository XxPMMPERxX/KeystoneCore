# KeystoneCore

## 開発環境構築
1. リポジトリをクローンする
   ```bash
   git clone https://github.com/XxPMMPERxX/KeystoneCore.git
   # git clone git@github.com:XxPMMPERxX/KeystoneCore.git

   cd KeystoneCore
   ```
2. NPM install
    ```bash
    npm install && npm run build
    ```
<br />

## 開発手順
1. feature/* 等で新しく作業ブランチを切る
1. core/ 配下でライブラリを更新
1. キリが良いところで push する
1. 動作確認は以下
    1. [keystone](https://github.com/XxPMMPERxX/Keystone)側で package.json の dependencies を書き換え
    1. `"keystonemc": "github:XxPMMPERxX/KeystoneCore#<ブランチ名>"`
    1. `npm install keystonemc` を実行するとブランチの最新の状態でインストールされる
