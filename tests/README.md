# KeystoneCore テストガイド

KeystoneCoreの単体テスト環境です。

## テストの実行

```bash
# すべてのテストを実行
npm test

# ウォッチモードでテストを実行
npm run test:watch

# テストUIを起動
npm run test:ui

# カバレッジを含めてテストを実行
npm run test:coverage
```

## ディレクトリ構造

```
tests/
├── mocks/                      # モックファイル
│   ├── minecraft-server.ts     # @minecraft/server のモック
│   ├── minecraft-server-ui.ts  # @minecraft/server-ui のモック
│   └── test-utils.ts           # テスト用ヘルパー関数
└── unit/                       # ユニットテスト
    ├── math/                   # 数学関連のテスト
    ├── timer/                  # タイマー関連のテスト
    ├── event/                  # イベント関連のテスト
    └── form/                   # フォーム関連のテスト
```

## モックの使い方

### @minecraft/server モック

`@minecraft/server` パッケージのモックが自動的に適用されます。

```typescript
import { system, world, Player } from '@minecraft/server';
import { createTestPlayer, tickSystem } from '../mocks/test-utils';

// プレイヤーを作成
const player = createTestPlayer('TestPlayer');

// システムタイマーをシミュレート
tickSystem(10); // 10 tick進める
```

### @minecraft/server-ui モック

フォームUIのモックも自動的に適用されます。

```typescript
import { ActionFormData } from '@minecraft/server-ui';

// フォームデータはモックされている
const form = new ActionFormData();
```

## テストの書き方

### 公開APIを中心にテスト

ユーザーが実際に使用するインターフェースをテストします。

```typescript
import { Vector3 } from '@/math/vector3';

describe('Vector3', () => {
  it('2つのベクトルを加算できる', () => {
    const v1 = new Vector3(1, 2, 3);
    const v2 = new Vector3(4, 5, 6);
    const result = v1.addVector(v2);

    expect(result.x).toBe(5);
    expect(result.y).toBe(7);
    expect(result.z).toBe(9);
  });
});
```

### ユーザー目線のテストケース

実際の使用シナリオを想定してテストを書きます。

```typescript
it('プレイヤーにウェルカムメッセージを表示できる', async () => {
  const player = createTestPlayer();
  const form = createActionForm({
    title: 'Welcome!',
    body: 'Hello, player!',
    buttons: [
      new Button({ text: 'OK', handle: () => {} })
    ]
  });

  await form.send(player);
  // フォームが正しく表示されたことを確認
});
```

## 注意事項

### EventManager のテスト

EventManagerは初期化時にworld.afterEvents/beforeEventsを自動的にsubscribeするため、
通常の単体テストが難しい場合があります。この場合は統合テストを検討してください。

### Timer のテスト

Timerのテストでは`tickSystem()`ヘルパーを使用してシステムタイマーをシミュレートします。

```typescript
import { repeating } from '@/timer/timer';
import { tickSystem } from '../../mocks/test-utils';

it('定期的にコールバックを実行できる', () => {
  const callback = vi.fn();

  repeating({
    every: 5,
    run: callback
  });

  // 5 tick進める
  tickSystem(5);
  expect(callback).toHaveBeenCalledTimes(1);
});
```

## カバレッジ

テストカバレッジは以下のコマンドで確認できます：

```bash
npm run test:coverage
```

カバレッジレポートは `coverage/` ディレクトリに生成されます。

## トラブルシューティング

### モックが動作しない

- `vitest.config.ts` でaliasが正しく設定されているか確認
- テストファイルでimportパスが正しいか確認（`@minecraft/server` ではなく相対パス）

### テストがタイムアウトする

非同期処理やPromiseを使用する場合は、適切にawaitしているか確認してください。

```typescript
it('非同期処理のテスト', async () => {
  const result = await someAsyncFunction();
  expect(result).toBe(expected);
});
```
