import { Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { ActionFormConfig } from './types';

/**
 * アイコン付きボタンを配置できるアクションフォーム
 */
export class ActionForm {
  private readonly config: ActionFormConfig;

  constructor(config: ActionFormConfig) {
    this.config = config;
  }

  async send(player: Player): Promise<void> {
    // UI描画
    const form = new ActionFormData()
      .title(this.config.title);

    if (this.config.body) {
      form.body(this.config.body);
    }

    for (const btn of this.config.buttons) {
      btn.render(form);
    }

    const res = await form.show(player);

    // ESC / ×
    if (res.canceled) {
      this.config.previousForm?.send(player);
      return;
    }

    // 値のハンドリング
    const index = res.selection;
    if (index === undefined) return;

    const button = this.config.buttons[index];
    button?.handle(player);
  }
}

export function createActionForm(config: ActionFormConfig): ActionForm {
  return new ActionForm(config);
}
