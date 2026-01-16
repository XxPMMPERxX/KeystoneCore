import type { Player } from './minecraft-server';

/**
 * @minecraft/server-ui のモック
 * KeystoneCore のテスト用モック実装
 */

// ActionFormResponse モック
export interface ActionFormResponse {
  canceled: boolean;
  selection?: number;
}

// ModalFormResponse モック
export interface ModalFormResponse {
  canceled: boolean;
  formValues?: (string | number | boolean)[];
}

// MessageFormResponse モック
export interface MessageFormResponse {
  canceled: boolean;
  selection?: number;
}

// ActionFormData モック
export class ActionFormData {
  private _title = '';
  private _body = '';
  private _buttons: Array<{ text: string; iconPath?: string }> = [];

  title(titleText: string): this {
    this._title = titleText;
    return this;
  }

  body(bodyText: string): this {
    this._body = bodyText;
    return this;
  }

  button(text: string, iconPath?: string): this {
    this._buttons.push({ text, iconPath });
    return this;
  }

  async show(player: Player): Promise<ActionFormResponse> {
    // デフォルトでは最初のボタンが選択されたことにする
    return {
      canceled: false,
      selection: 0,
    };
  }

  // テスト用ヘルパー
  __getTitle() {
    return this._title;
  }

  __getBody() {
    return this._body;
  }

  __getButtons() {
    return this._buttons;
  }
}

// ModalFormData モック
export class ModalFormData {
  private _title = '';
  private _controls: Array<{
    type: 'textField' | 'toggle' | 'slider' | 'dropdown';
    label: string;
    placeholderText?: string;
    defaultValue?: string | number | boolean;
    options?: string[];
    minimumValue?: number;
    maximumValue?: number;
    valueStep?: number;
  }> = [];

  title(titleText: string): this {
    this._title = titleText;
    return this;
  }

  textField(label: string, placeholderText?: string, defaultValue?: string): this {
    this._controls.push({ type: 'textField', label, placeholderText, defaultValue });
    return this;
  }

  toggle(label: string, defaultValue?: boolean): this {
    this._controls.push({ type: 'toggle', label, defaultValue });
    return this;
  }

  slider(
    label: string,
    minimumValue: number,
    maximumValue: number,
    valueStep?: number,
    defaultValue?: number
  ): this {
    this._controls.push({
      type: 'slider',
      label,
      minimumValue,
      maximumValue,
      valueStep,
      defaultValue,
    });
    return this;
  }

  dropdown(label: string, options: string[], defaultValueIndex?: number): this {
    this._controls.push({ type: 'dropdown', label, options, defaultValue: defaultValueIndex });
    return this;
  }

  async show(player: Player): Promise<ModalFormResponse> {
    // デフォルトで各コントロールのデフォルト値を返す
    const formValues = this._controls.map((control) => {
      if (control.type === 'textField') {
        return control.defaultValue || '';
      } else if (control.type === 'toggle') {
        return control.defaultValue ?? false;
      } else if (control.type === 'slider') {
        return control.defaultValue ?? control.minimumValue ?? 0;
      } else if (control.type === 'dropdown') {
        return (control.defaultValue as number) ?? 0;
      }
      return '';
    });

    return {
      canceled: false,
      formValues,
    };
  }

  // テスト用ヘルパー
  __getTitle() {
    return this._title;
  }

  __getControls() {
    return this._controls;
  }
}

// MessageFormData モック
export class MessageFormData {
  private _title = '';
  private _body = '';
  private _button1 = '';
  private _button2 = '';

  title(titleText: string): this {
    this._title = titleText;
    return this;
  }

  body(bodyText: string): this {
    this._body = bodyText;
    return this;
  }

  button1(text: string): this {
    this._button1 = text;
    return this;
  }

  button2(text: string): this {
    this._button2 = text;
    return this;
  }

  async show(player: Player): Promise<MessageFormResponse> {
    // デフォルトでは button1 が選択されたことにする
    return {
      canceled: false,
      selection: 0,
    };
  }

  // テスト用ヘルパー
  __getTitle() {
    return this._title;
  }

  __getBody() {
    return this._body;
  }

  __getButton1() {
    return this._button1;
  }

  __getButton2() {
    return this._button2;
  }
}
