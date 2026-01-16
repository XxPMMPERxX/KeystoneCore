import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionForm, createActionForm } from '@/form/actionForm';
import { ModalForm, createModalForm } from '@/form/modalForm';
import { MessageForm, createMessageForm } from '@/form/messageForm';
import { button } from '@/form/components';
import { createTestPlayer, resetAllMocks } from '../../mocks/test-utils';
import { ActionFormData, ModalFormData, MessageFormData } from '@minecraft/server-ui';

describe('Form', () => {
  let player: ReturnType<typeof createTestPlayer>;

  beforeEach(() => {
    resetAllMocks();
    player = createTestPlayer();
  });

  describe('ActionForm', () => {
    it('createActionForm() でアクションフォームを作成できる', () => {
      const form = createActionForm({
        title: 'Test Form',
        body: 'Select an option',
        buttons: [],
      });

      expect(form).toBeInstanceOf(ActionForm);
    });

    it('send() でプレイヤーにフォームを送信できる', async () => {
      const buttonHandler = vi.fn();
      const testButton = button({
        text: 'Click Me',
        handler: buttonHandler,
      });

      const form = createActionForm({
        title: 'Test Form',
        body: 'Select an option',
        buttons: [testButton],
      });

      // ActionFormDataのshowメソッドをモック
      ActionFormData.prototype.show = vi.fn().mockResolvedValue({
        canceled: false,
        selection: 0,
      });

      await form.send(player);

      expect(ActionFormData.prototype.show).toHaveBeenCalledWith(player);
      expect(buttonHandler).toHaveBeenCalledWith(player);
    });

    it('フォームがキャンセルされた場合、前のフォームに戻る', async () => {
      const previousForm = createActionForm({
        title: 'Previous Form',
        buttons: [],
      });

      const previousFormSendSpy = vi.spyOn(previousForm, 'send').mockResolvedValue();

      const form = createActionForm({
        title: 'Current Form',
        buttons: [],
        previousForm,
      });

      ActionFormData.prototype.show = vi.fn().mockResolvedValue({
        canceled: true,
      });

      await form.send(player);

      expect(previousFormSendSpy).toHaveBeenCalledWith(player);
    });

    it('複数のボタンを持つフォームを作成できる', async () => {
      const button1Handler = vi.fn();
      const button2Handler = vi.fn();

      const form = createActionForm({
        title: 'Multi Button Form',
        buttons: [
          button({ text: 'Button 1', handler: button1Handler }),
          button({ text: 'Button 2', handler: button2Handler }),
        ],
      });

      ActionFormData.prototype.show = vi.fn().mockResolvedValue({
        canceled: false,
        selection: 1, // 2番目のボタンを選択
      });

      await form.send(player);

      expect(button1Handler).not.toHaveBeenCalled();
      expect(button2Handler).toHaveBeenCalledWith(player);
    });
  });

  describe('ModalForm', () => {
    it('createModalForm() でモーダルフォームを作成できる', () => {
      const form = createModalForm({
        title: 'Test Modal',
        components: [],
      });

      expect(form).toBeInstanceOf(ModalForm);
    });

    it('send() でプレイヤーにフォームを送信できる', async () => {
      const formHandler = vi.fn();

      const form = createModalForm({
        title: 'Test Modal',
        components: [],
        handle: formHandler,
      });

      ModalFormData.prototype.show = vi.fn().mockResolvedValue({
        canceled: false,
        formValues: [],
      });

      await form.send(player);

      expect(ModalFormData.prototype.show).toHaveBeenCalledWith(player);
      expect(formHandler).toHaveBeenCalledWith(player, []);
    });

    it('フォームがキャンセルされた場合、前のフォームに戻る', async () => {
      const previousForm = createModalForm({
        title: 'Previous Modal',
        components: [],
      });

      const previousFormSendSpy = vi.spyOn(previousForm, 'send').mockResolvedValue();

      const form = createModalForm({
        title: 'Current Modal',
        components: [],
        previousForm,
      });

      ModalFormData.prototype.show = vi.fn().mockResolvedValue({
        canceled: true,
      });

      await form.send(player);

      expect(previousFormSendSpy).toHaveBeenCalledWith(player);
    });

    it('各コンポーネントのハンドラが値とともに呼ばれる', async () => {
      const componentHandler = vi.fn();

      const form = createModalForm({
        title: 'Test Modal',
        components: [
          {
            render: (form) => form.textField('Name', 'Enter your name'),
            handle: componentHandler,
          },
        ],
      });

      ModalFormData.prototype.show = vi.fn().mockResolvedValue({
        canceled: false,
        formValues: ['TestValue'],
      });

      await form.send(player);

      expect(componentHandler).toHaveBeenCalledWith(player, 'TestValue');
    });
  });

  describe('MessageForm', () => {
    it('createMessageForm() でメッセージフォームを作成できる', () => {
      const form = createMessageForm({
        title: 'Confirm',
        body: 'Are you sure?',
        yes: { text: 'Yes', handler: () => {} },
        no: { text: 'No', handler: () => {} },
      });

      expect(form).toBeInstanceOf(MessageForm);
    });

    it('send() でプレイヤーにフォームを送信できる', async () => {
      const yesHandler = vi.fn();
      const noHandler = vi.fn();

      const form = createMessageForm({
        title: 'Confirm',
        body: 'Are you sure?',
        yes: { text: 'Yes', handler: yesHandler },
        no: { text: 'No', handler: noHandler },
      });

      MessageFormData.prototype.show = vi.fn().mockResolvedValue({
        canceled: false,
        selection: 0, // Yesを選択
      });

      await form.send(player);

      expect(MessageFormData.prototype.show).toHaveBeenCalledWith(player);
      expect(yesHandler).toHaveBeenCalledWith(player);
      expect(noHandler).not.toHaveBeenCalled();
    });

    it('Noボタンを選択した場合、noハンドラが呼ばれる', async () => {
      const yesHandler = vi.fn();
      const noHandler = vi.fn();

      const form = createMessageForm({
        title: 'Confirm',
        body: 'Are you sure?',
        yes: { text: 'Yes', handler: yesHandler },
        no: { text: 'No', handler: noHandler },
      });

      MessageFormData.prototype.show = vi.fn().mockResolvedValue({
        canceled: false,
        selection: 1, // Noを選択
      });

      await form.send(player);

      expect(yesHandler).not.toHaveBeenCalled();
      expect(noHandler).toHaveBeenCalledWith(player);
    });

    it('フォームがキャンセルされた場合、前のフォームに戻る', async () => {
      const previousForm = createMessageForm({
        title: 'Previous Message',
        body: 'Previous',
        yes: { text: 'Yes', handler: () => {} },
        no: { text: 'No', handler: () => {} },
      });

      const previousFormSendSpy = vi.spyOn(previousForm, 'send').mockResolvedValue();

      const form = createMessageForm({
        title: 'Current Message',
        body: 'Current',
        yes: { text: 'Yes', handler: () => {} },
        no: { text: 'No', handler: () => {} },
        previousForm,
      });

      MessageFormData.prototype.show = vi.fn().mockResolvedValue({
        canceled: true,
      });

      await form.send(player);

      expect(previousFormSendSpy).toHaveBeenCalledWith(player);
    });
  });
});
