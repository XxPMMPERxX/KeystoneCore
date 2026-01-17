import { ActionForm as ActionFormType } from '@/form/actionForm';
import { createMessageForm, MessageForm as MessageFormType } from '@/form/messageForm';
import { ModalForm as ModalFormType } from '@/form/modalForm';
import { Player } from '@minecraft/server';

interface MessageFormProps {
  title: string;
  children?: string[];
  previousForm?: ActionFormType | MessageFormType | ModalFormType;
  yesLabel: string;
  noLabel: string;
  onClickYes?: (player: Player) => void;
  onClickNo?: (player: Player) => void;
};

const MessageForm = ({
  title,
  children = [],
  previousForm,
  yesLabel,
  noLabel,
  onClickYes = () => {},
  onClickNo = () => {},
}: MessageFormProps) => {
  return createMessageForm({
    title,
    body: typeof children === 'object' ? children.join('\n') : children,
    previousForm,
    yes: {
      text: yesLabel,
      handler: onClickYes,
    },
    no: {
      text: noLabel,
      handler: onClickNo,
    },
  });
};

export default MessageForm;
