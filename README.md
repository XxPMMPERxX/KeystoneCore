# Keystone Core

## description
BDS plugin library: Script API base

## Keystone Core 開発環境構築
Git Clone
```bash
git clone https://github.com/XxPMMPERxX/KeystoneCore.git
# git clone git@github.com:XxPMMPERxX/KeystoneCore.git

cd KeystoneCore
```
NPM install
```bash
npm install --force && npm run build
```
Install Dev Server
```bash
git clone https://github.com/XxPMMPERxX/Keystone.git dev
# git clone git@github.com:XxPMMPERxX/Keystone.git dev
cd dev
```
Edit docker-compose.yml
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
make .env
```bash
cp .env.example .env
# edit .env
```
Edit dev/package.json "keystone"
```package.json
"keystone": "file:../",
```
start dev server
```bash
docker compose up
```

### 開発手順
1. core/ 配下でライブラリを作成
1. `npm run build`
1. dev/src 配下でライブラリテスト用コードを書く
1. `cd dev` 後に `docker compose up` でビルド

### ドキュメント
- [Event](./DOCUMENT.md#event)
  - [単一ファイルの場合のサンプル](./DOCUMENT.md#サンプル)
  - [ファイル分けした場合の推奨サンプル](./DOCUMENT.md#ファイル分けした場合の推奨サンプル)
- [Timer](./DOCUMENT.md#timer)
  - [継続処理サンプル](./DOCUMENT.md#継続処理サンプル)
  - [遅延処理サンプル](./DOCUMENT.md#遅延処理サンプル)
  - [スリープ処理サンプル](./DOCUMENT.md#スリープ処理サンプル)
