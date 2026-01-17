import { Player } from '@minecraft/server';
import { ModalFormData, ActionFormData } from '@minecraft/server-ui';
import { ActionButton, FormComponent, StatelessFormComponent } from './types';

/**
 * トグル
 * @param opts
 * @returns {FormComponent<boolean>}
 */
export function toggle(opts: {
  label: string;
  default: boolean;
  handler?(player: Player, value: boolean): void;
}): FormComponent<boolean> {
  return {
    type: 'toggle',
    opts,
    render(form: ModalFormData) {
      form.toggle(opts.label, { defaultValue: opts.default });
    },
    handle(player, value) {
      opts.handler?.(player, value);
    }
  };
}

/**
 * テキストフィールド
 * @param opts 
 * @returns {FormComponent<string>}
 */
export function textField(opts: {
  label: string;
  placeholder?: string;
  default?: string;
  tooltip?: string;
  handler?(player: Player, value: string): void;
}): FormComponent<string> {
  return {
    type: 'text_field',
    opts,
    render(form: ModalFormData) {
      form.textField(
        opts.label,
        opts.placeholder ?? '',
        {
          defaultValue: opts.default ?? '',
          tooltip: opts.tooltip,
        },
      );
    },
    handle(player, value) {
      opts.handler?.(player, value);
    }
  };
}

/**
 * スライダー
 * @param opts 
 * @returns {FormComponent<number>}
 */
export function slider(opts: {
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  handler?(player: Player, value: number): void;
}): FormComponent<number> {
  return {
    type: 'slider',
    opts,
    render(form: ModalFormData) {
      form.slider(
        opts.label,
        opts.min,
        opts.max,
        { valueStep: opts.step ?? 1, defaultValue: opts.default } 
      );
    },
    handle(player, value) {
      opts.handler?.(player, value);
    }
  };
}

/**
 * ドロップダウン
 * @param opts 
 * @returns {FormComponent<number>}
 */
export function dropdown(opts: {
  label: string;
  options: string[];
  defaultIndex?: number;
  handler?(player: Player, value: number): void;
}): FormComponent<number> {
  return {
    type: 'dropdown',
    opts,
    render(form: ModalFormData) {
      form.dropdown(
        opts.label,
        opts.options,
        { defaultValueIndex: opts.defaultIndex ?? 0 }
      );
    },
    handle(player, value) {
      opts.handler?.(player, value);
    }
  };
}

/**
 * ヘッダー
 */
export function header(opts: {
  text: string;
}): StatelessFormComponent {
  return {
    type: 'header',
    opts,
    render(form: ModalFormData) {
      form.header(opts.text);
    },
  };
}

/**
 * ラベル
 */
export function label(opts: {
  text: string;
}): StatelessFormComponent {
  return {
    type: 'label',
    opts,
    render(form: ModalFormData) {
      form.label(opts.text);
    },
  };
}

/**
 * Divider
 */
export function divider(): StatelessFormComponent {
  return {
    type: 'divider',
    render(form: ModalFormData) {
      form.divider();
    },
  };
}

/**
 * ボタン (ActionForm)
 * @param opts 
 * @returns {ActionButton}
 */
export function button(opts: {
  text: string;
  iconPath?: string;
  handler(player: Player): void;
}): ActionButton {
  return {
    render(form: ActionFormData) {
      if (opts.iconPath) {
        form.button(opts.text, opts.iconPath);
      } else {
        form.button(opts.text);
      }
    },
    handle(player: Player) {
      opts.handler(player);
    }
  };
}
