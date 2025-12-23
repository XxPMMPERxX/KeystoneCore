/**
 * ActionForm 用ボタン要素
 */
export class Button {
  /** ボタン表示テキスト */
  text: string;

  /** アイコンパス */
  iconPath?: string | null;

  /** クリック時コールバック */
  callback?: () => void;

  /** 有効状態 */
  enabled = true;

  /** 任意データ */
  data: Record<string, unknown> = {};

  constructor(
    text: string,
    iconPath?: string | null,
    callback?: () => void
  ) {
    this.text = text;
    this.iconPath = iconPath;
    this.callback = callback;
  }

  /**
   * ボタンテキストを設定
   * @param text
   */
  setText(text: string): this {
    this.text = text;
    return this;
  }

  /**
   * ボタンアイコンを設定
   * @param iconPath
   */
  setIcon(iconPath: string | null): this {
    this.iconPath = iconPath;
    return this;
  }

  /**
   * クリック時コールバックを設定
   * @param callback
   */
  onClick(callback: () => void): this {
    this.callback = callback;
    return this;
  }

  /**
   * ボタンの有効 / 無効を設定
   * @param enabled
   */
  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  /**
   * カスタムデータを設定
   * @param key
   * @param value
   */
  setData(key: string, value: unknown): this {
    this.data[key] = value;
    return this;
  }

  /**
   * カスタムデータを取得
   * @param key
   * @returns {T|undefined}
   */
  getData<T = unknown>(key: string): T | undefined {
    return this.data[key] as T | undefined;
  }
}

/**
 * ModalForm のテキスト入力フィールド
 */
export class TextField {
  /** discriminated union 用識別子 */
  readonly type = 'textField';

  /** フィールド名（values のキー） */
  name: string;

  /** 表示ラベル */
  label: string;

  /** プレースホルダー */
  placeholderText: string;

  /** デフォルト値 */
  defaultValue?: string;

  /** 必須フラグ */
  required = false;

  /** バリデータ群 */
  validators: Array<
    (value: string) => { valid: boolean; message?: string }
  > = [];

  constructor(
    name: string,
    label: string,
    placeholderText = '',
    defaultValue?: string
  ) {
    this.name = name;
    this.label = label;
    this.placeholderText = placeholderText;
    this.defaultValue = defaultValue;
  }

  /**
   * プレースホルダーを設定
   * @param text
   */
  setPlaceholder(text: string): this {
    this.placeholderText = text;
    return this;
  }

  /**
   * デフォルト値を設定
   * @param value
   */
  setDefaultValue(value: string): this {
    this.defaultValue = value;
    return this;
  }

  /**
   * 必須項目に設定
   * @param required
   */
  setRequired(required = true): this {
    this.required = required;
    return this;
  }

  /**
   * バリデータを追加
   * @param validator
   */
  addValidator(
    validator: (value: string) => { valid: boolean; message?: string }
  ): this {
    this.validators.push(validator);
    return this;
  }

  /**
   * 値を検証
   * @param value
   */
  validate(value: string): { valid: boolean; message?: string } {
    if (this.required && !value?.trim()) {
      return {
        valid: false,
        message: `${this.label}は必須項目です。`,
      };
    }

    for (const validator of this.validators) {
      const result = validator(value);
      if (!result.valid) return result;
    }

    return { valid: true };
  }
}

/**
 * ModalForm 用ドロップダウンフィールド
 */
export class Dropdown {
  /** discriminated union 用識別子 */
  readonly type = 'dropdown';

  name: string;
  label: string;

  /** 表示オプション */
  options: string[] = [];

  /** デフォルト選択インデックス */
  defaultValueIndex = 0;

  /** オプションに紐づく任意データ */
  optionData: Map<number, unknown> = new Map();

  constructor(
    name: string,
    label: string,
    options: string[] = [],
    defaultValueIndex = 0
  ) {
    this.name = name;
    this.label = label;
    this.options = options;
    this.defaultValueIndex = defaultValueIndex;
  }

  /**
   * オプションを追加
   * @param text
   * @param data
   */
  addOption(text: string, data?: unknown): this {
    const index = this.options.length;
    this.options.push(text);
    if (data !== undefined) {
      this.optionData.set(index, data);
    }
    return this;
  }

  /**
   * オプション一覧を設定
   * @param options
   */
  setOptions(options: string[]): this {
    this.options = [...options];
    return this;
  }

  /**
   * デフォルト選択インデックスを設定
   * @param index
   */
  setDefaultIndex(index: number): this {
    this.defaultValueIndex = Math.max(
      0,
      Math.min(index, this.options.length - 1)
    );
    return this;
  }

  /**
   * オプションに紐づくデータを取得
   * @param index
   * @returns {T | undefined}
   */
  getOptionData<T = unknown>(index: number): T | undefined {
    return this.optionData.get(index) as T | undefined;
  }
}

/**
 * ModalForm 用スライダーフィールド
 */
export class Slider {
  /** discriminated union 用識別子 */
  readonly type = 'slider';

  name: string;
  label: string;

  minimumValue: number;
  maximumValue: number;
  valueStep: number;
  defaultValue: number;

  /** 表示用フォーマッタ */
  formatValue?: (value: number) => string;

  constructor(
    name: string,
    label: string,
    minimumValue = 0,
    maximumValue = 100,
    valueStep = 1,
    defaultValue = minimumValue
  ) {
    this.name = name;
    this.label = label;
    this.minimumValue = minimumValue;
    this.maximumValue = maximumValue;
    this.valueStep = valueStep;
    this.defaultValue = Math.max(
      minimumValue,
      Math.min(defaultValue, maximumValue)
    );
  }

  /**
   * 最小値を設定
   * @param min
   */
  setMinimum(min: number): this {
    this.minimumValue = min;
    this.defaultValue = Math.max(min, this.defaultValue);
    return this;
  }

  /**
   * 最大値を設定
   * @param max
   */
  setMaximum(max: number): this {
    this.maximumValue = max;
    this.defaultValue = Math.min(max, this.defaultValue);
    return this;
  }

  /**
   * ステップ値を設定
   * @param step
   */
  setStep(step: number): this {
    this.valueStep = Math.max(0.0001, step);
    return this;
  }

  /**
   * デフォルト値を設定
   * @param value
   */
  setDefaultValue(value: number): this {
    this.defaultValue = Math.max(
      this.minimumValue,
      Math.min(value, this.maximumValue)
    );
    return this;
  }

  /**
   * 値フォーマッタを設定
   * @param formatter
   */
  setValueFormatter(formatter: (value: number) => string): this {
    this.formatValue = formatter;
    return this;
  }
}

/**
 * ModalForm 用トグルフィールド
 */
export class Toggle {
  /** discriminated union 用識別子 */
  readonly type = 'toggle';

  name: string;
  label: string;
  defaultValue: boolean;

  /** 値変更時コールバック */
  onChangeCallback?: (value: boolean) => void;

  constructor(
    name: string,
    label: string,
    defaultValue = false
  ) {
    this.name = name;
    this.label = label;
    this.defaultValue = defaultValue;
  }

  /**
   * デフォルト値を設定
   * @param value
   */
  setDefaultValue(value: boolean): this {
    this.defaultValue = value;
    return this;
  }

  /**
   * 値変更時コールバックを設定
   * @param callback
   */
  onChange(callback: (value: boolean) => void): this {
    this.onChangeCallback = callback;
    return this;
  }
}
