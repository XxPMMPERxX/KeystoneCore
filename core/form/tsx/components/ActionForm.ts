import { ActionButton } from '@/form/types';
import { ActionForm as ActionFormType, createActionForm } from '@/form/actionForm';
import { ModalForm } from '@/form/modalForm';
import { MessageForm } from '@/form/messageForm';

interface ActionFormProps {
  title: string;
  body?: string;
  previousForm?: ModalForm | ActionFormType | MessageForm;
  children?: ActionButton[];
};

export default function ActionForm({
  title,
  body,
  previousForm,
  children = [],
}: ActionFormProps) {
  return createActionForm({
    title,
    body,
    previousForm,
    buttons: children,
  });
};
