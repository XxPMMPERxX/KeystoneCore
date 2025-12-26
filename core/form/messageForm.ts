import { Player } from '@minecraft/server';
import { MessageFormData } from '@minecraft/server-ui';
import { MessageFormConfig } from './types';

/**
 * Yes/No二択のメッセージフォーム
 */
export class MessageForm {
  private readonly config: MessageFormConfig;

  constructor(config: MessageFormConfig) {
    this.config = config;
  }

  async send(player: Player): Promise<void> {
    // UI描画
    const form = new MessageFormData()
      .title(this.config.title)
      .body(this.config.body)
      .button1(this.config.yes.text)
      .button2(this.config.no.text);

    const res = await form.show(player);

    // ESC / ×
    if (res.canceled) {
      this.config.previousForm?.send(player);
      return;
    }

    // 値のハンドリング
    if (res.selection === 0) {
      this.config.yes.handler(player);
    } else if (res.selection === 1) {
      this.config.no.handler(player);
    }
  }
}

export function createMessageForm(config: MessageFormConfig): MessageForm {
  return new MessageForm(config);
}
