# KeystoneCore

## 概要
BDSのScriptAPIを用いたビヘイビアパックを開発するうえで使える便利な処理をまとめたライブラリのようなもの。

## 開発環境構築
1. リポジトリをクローンする
```bash
git clone https://github.com/XxPMMPERxX/KeystoneCore.git
# git clone git@github.com:XxPMMPERxX/KeystoneCore.git

cd KeystoneCore
```
2. NPM install
```bash
npm install --force && npm run build
```


### 開発手順
1. feature/* 等で新しく作業ブランチを切る
1. core/ 配下でライブラリを更新
1. キリが良いところで push する
1. 動作確認は以下
    1. keystone側で package.json の dependencies を書き換え
    1. `"keystonemc": "github:XxPMMPERxX/KeystoneCore#<ブランチ名>"`
    1. `npm install -f keystonemc` を実行するとブランチの最新の状態でインストールされる


### ドキュメント
- [イベント](./DOCUMENT.md#イベント)
  - [単一ファイルの場合のサンプル](./DOCUMENT.md#単一ファイルの場合のサンプル)
  - [ファイル分けした場合の推奨サンプル](./DOCUMENT.md#ファイル分けした場合の推奨サンプル)
- [タイマー](./DOCUMENT.md#タイマー)
  - [継続処理サンプル](./DOCUMENT.md#継続処理サンプル)
  - [遅延処理サンプル](./DOCUMENT.md#遅延処理サンプル)
  - [条件待機処理サンプル](./DOCUMENT.md#条件待機処理サンプル)
  - [スリープ処理サンプル](./DOCUMENT.md#スリープ処理サンプル)
