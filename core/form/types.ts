/* eslint-disable @typescript-eslint/no-explicit-any */
import { Player } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { ActionForm } from './actionForm';
import { ModalForm } from './modalForm';
import { MessageForm } from './messageForm';

export interface FormComponent<T = any> {
  render(form: ModalFormData): void;
  handle(player: Player, value: T): void;
}

export interface ModalFormConfig {
  title: string;
  previousForm?: ModalForm | ActionForm | MessageForm;
  components: FormComponent[];
}

export interface ActionButton {
  render(form: ActionFormData): void;
  handle(player: Player): void;
}

export interface ActionFormConfig {
  title: string;
  body?: string;
  previousForm?: ModalForm | ActionForm | MessageForm;
  buttons: ActionButton[];
}

export interface MessageButton {
  text: string;
  handler(player: Player): void;
}

export interface MessageFormConfig {
  title: string;
  body: string;
  previousForm?: ModalForm | ActionForm | MessageForm;
  yes: MessageButton;
  no: MessageButton;
}
