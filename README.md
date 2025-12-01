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
3. 開発サーバーのクローン
```bash
git clone https://github.com/XxPMMPERxX/Keystone.git dev
# git clone git@github.com:XxPMMPERxX/Keystone.git dev

cd dev
```
4. `docker-compose.yml`を編集
```diff
  dev:
    image: node:20.10-alpine
-   working_dir: /app
-   volumes:
-     - ".:/app"
-   entrypoint: sh -c "npm install --force && npm run build:app"
+   working_dir: /workspace/dev
+   volumes:
+     - "..:/workspace"
+   entrypoint: sh -c "cd /workspace/dev && npm install --force && npm run build:app"
```
5. `.env`ファイルをコピーして生成
```bash
cp .env.example .env
# edit .env
```
6. `dev/package.json`の`"keystone"`を編集
```package.json
"keystone": "file:../",
```
7. 開発サーバーの起動
```bash
docker compose up
```

### 開発手順
1. core/ 配下でライブラリを作成
1. `npm run build`
1. dev/src 配下でライブラリテスト用コードを書く
1. `cd dev` 後に `docker compose up` でビルド

### ドキュメント
- [イベント](./DOCUMENT.md#イベント)
  - [単一ファイルの場合のサンプル](./DOCUMENT.md#サンプル)
  - [ファイル分けした場合の推奨サンプル](./DOCUMENT.md#ファイル分けした場合の推奨サンプル)
- [タイマー](./DOCUMENT.md#タイマー)
  - [継続処理サンプル](./DOCUMENT.md#継続処理サンプル)
  - [遅延処理サンプル](./DOCUMENT.md#遅延処理サンプル)
  - [待機処理サンプル](./DOCUMENT.md#待機処理サンプル)
- [サンプルコード](./DOCUMENT.md#サンプルコード)
