/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionFormData,
  ModalFormData,
  MessageFormData,
  ActionFormResponse,
  ModalFormResponse,
  MessageFormResponse,
} from '@minecraft/server-ui';
import { Player } from '@minecraft/server';
import { TextField, Dropdown, Slider, Toggle } from './elements';

/**
 * 利用されるすべてのFormData型
 */
export type AnyFormData =
  | ActionFormData
  | ModalFormData
  | MessageFormData;

/**
 * 利用されるすべてのFormResponse型
 */
export type AnyFormResponse =
  | ActionFormResponse
  | ModalFormResponse
  | MessageFormResponse;

/**
 * イベントコールバック型
 */
export type FormEventCallback = (...args: any[]) => void;

/**
 * すべてのFormクラスの基底となる抽象クラス
 * @abstract
 */
export abstract class BaseForm {
  /** 内部Formインスタンス */
  protected form?: AnyFormData;

  /** Formタイトル */
  protected title = '';

  /** Formボディ */
  protected body = '';

  /** 登録要素 */
  protected elements: unknown[] = [];

  /** イベントコールバック管理 */
  protected callbacks: Map<string, FormEventCallback[]> = new Map();

  protected constructor() {
    if (new.target === BaseForm) {
      throw new Error('BaseForm は抽象クラスです。');
    }
  }

  /**
   * Formタイトルを設定
   * @param title
   */
  setTitle(title: string): this {
    this.title = title;
    if (this.form && 'title' in this.form) {
      (this.form as any).title(title);
    }
    return this;
  }

  /**
   * Formボディテキストを設定
   * @param body
   */
  setBody(body: string): this {
    this.body = body;
    if (this.form && 'body' in this.form) {
      (this.form as any).body(body);
    }
    return this;
  }

  /**
   * Form要素を追加 (継承先で実装)
   * @param element
   */
  abstract addElement(element: unknown): this;

  /**
   * FormDataを生成 (継承先で実装)
   */
  protected abstract initializeForm(): AnyFormData;

  /**
   * プレイヤーにFormを表示
   * @param player
   */
  async show(player: Player): Promise<unknown> {
    if (!this.form) {
      this.form = this.initializeForm();
    }

    const response = await this.form.show(player);
    return this.handleResponse(response, player);
  }

  /**
   * Form応答処理 (共通処理)
   * @param response
   * @param player
   */
  protected handleResponse(
    response: AnyFormResponse,
    player: Player
  ): {
    success: boolean;
    canceled?: boolean;
    reason?: string;
    response?: AnyFormResponse;
  } {
    if (response.canceled) {
      return {
        success: false,
        canceled: true,
        reason: response.cancelationReason,
      };
    }

    return { success: true, response };
  }

  /**
   * イベントリスナーを登録
   * @param event
   * @param callback
   */
  on(event: string, callback: FormEventCallback): this {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
    return this;
  }

  /**
   * イベントを発火
   * @param event
   * @param args
   */
  protected emit(event: string, ...args: any[]): void {
    this.callbacks.get(event)?.forEach(cb => cb(...args));
  }

  /**
   * Form状態を初期化
   */
  reset(): this {
    this.form = undefined;
    this.elements = [];
    return this;
  }

  /**
   * Form設定を検証
   */
  validate(): boolean {
    if (!this.title.trim()) {
      console.warn('Form にタイトルが設定されていません。');
    }
    return true;
  }
}


/**
 * ActionFormのボタン定義
 */
export interface ActionButton {
  text: string;
  iconPath?: string | null;
  callback?: (player: Player, index: number) => void;
}

/**
 * ボタンベースのActionForm
 */
export class BaseActionForm extends BaseForm {
  protected buttons: ActionButton[] = [];

  constructor() {
    super();
  }

  protected initializeForm(): ActionFormData {
    const form = new ActionFormData();
    if (this.title) form.title(this.title);
    if (this.body) form.body(this.body);

    this.buttons.forEach(b =>
      form.button(b.text, b.iconPath ?? undefined)
    );

    return form;
  }

  /**
   * ボタンを追加
   * @param button
   */
  addElement(button: ActionButton): this {
    this.buttons.push(button);
    return this;
  }

  protected handleResponse(
    response: ActionFormResponse,
    player: Player
  ) {
    const base = super.handleResponse(response, player);
    if (!base.success) return base;

    const index = response.selection!;
    const button = this.buttons[index];

    button?.callback?.(player, index);
    this.emit('buttonClick', player, index, button);

    return { success: true, buttonIndex: index, button };
  }
}


/**
 * ModalFormで使用可能なフィールド型
 */
export type ModalField =
  | TextField
  | Dropdown
  | Slider
  | Toggle;

/**
 * 入力フィールドを持つModalForm
 */
export class BaseModalForm extends BaseForm {
  protected fields: ModalField[] = [];

  constructor() {
    super();
  }

  protected initializeForm(): ModalFormData {
    const form = new ModalFormData();
    if (this.title) form.title(this.title);

    this.fields.forEach(field => {
      switch (field.type) {
        case 'textField':
          form.textField(
            field.label,
            field.placeholderText,
            { defaultValue: field.defaultValue ?? '' }
          );
          break;
        case 'dropdown':
          form.dropdown(
            field.label,
            field.options,
            { defaultValueIndex: field.defaultValueIndex }
          );
          break;
        case 'slider':
          form.slider(
            field.label,
            field.minimumValue,
            field.maximumValue,
            {
              valueStep: field.valueStep,
              defaultValue: field.defaultValue,
            }
          );
          break;
        case 'toggle':
          form.toggle(field.label, {
            defaultValue: field.defaultValue,
          });
          break;
      }
    });

    return form;
  }

  /**
   * フィールドを追加
   * @param field
   */
  addElement(field: ModalField): this {
    this.fields.push(field);
    return this;
  }

  protected handleResponse(
    response: ModalFormResponse,
    player: Player
  ) {
    const base = super.handleResponse(response, player);
    if (!base.success) return base;

    const values: Record<string, unknown> = {};
    this.fields.forEach((f, i) => {
      values[f.name] = response.formValues![i];
    });

    this.emit('submit', player, values);

    return { success: true, values };
  }
}


/**
 * 確認、選択用MessageForm
 */
export class BaseMessageForm extends BaseForm {
  private button1Text = '';
  private button2Text = '';
  private button1Callback?: (player: Player) => void;
  private button2Callback?: (player: Player) => void;

  constructor() {
    super();
  }

  protected initializeForm(): MessageFormData {
    const form = new MessageFormData();
    if (this.title) form.title(this.title);
    if (this.body) form.body(this.body);
    if (this.button1Text) form.button1(this.button1Text);
    if (this.button2Text) form.button2(this.button2Text);
    return form;
  }

  /**
   * 左側ボタン設定
   * @param text
   * @param callback
   */
  setButton1(text: string, callback?: (player: Player) => void): this {
    this.button1Text = text;
    this.button1Callback = callback;
    return this;
  }

  /**
   * 右側ボタン設定
   * @param text
   * @param callback
   */
  setButton2(text: string, callback?: (player: Player) => void): this {
    this.button2Text = text;
    this.button2Callback = callback;
    return this;
  }

  addElement(): this {
    throw new Error('MessageForm は addElement を使用できません。');
  }

  protected handleResponse(
    response: MessageFormResponse,
    player: Player
  ) {
    const base = super.handleResponse(response, player);
    if (!base.success) return base;

    if (response.selection === 0) {
      this.button1Callback?.(player);
    } else {
      this.button2Callback?.(player);
    }

    this.emit('buttonClick', player, response.selection);
    return { success: true, selection: response.selection };
  }
}
