import { Player } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';
import { ModalFormConfig } from './types';

/**
 * 複数の入力フォームを配置できるモーダルフォーム
 */
export class ModalForm {
  private readonly config: ModalFormConfig;

  constructor(config: ModalFormConfig) {
    this.config = config;
  }

  async send(player: Player): Promise<void> {
    // UI描画
    const form = new ModalFormData()
      .title(this.config.title);

    if (this.config.submitButtonText) {
      form.submitButton(this.config.submitButtonText);
    }

    for (const component of this.config.components) {
      component.render(form);
    }

    const res = await form.show(player);

    // ESC / ×
    if (res.canceled) {
      this.config.previousForm?.send(player);
      return;
    }

    // 値のハンドリング
    res.formValues?.forEach((value, index) => {
      const component = this.config.components[index];
      try {
        component.handle?.(player, value);
      } catch (e) {
        console.warn(`[ModalForm] handler error at index ${index}: ${e}`);
      }
    });

    this.config.handle?.(player, res.formValues);
  }
}

export function createModalForm(config: ModalFormConfig): ModalForm {
  return new ModalForm(config);
}
