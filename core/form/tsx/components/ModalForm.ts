import { ActionForm } from '@/form/actionForm';
import { MessageForm } from '@/form/messageForm';
import { createModalForm, ModalForm as ModalFormType } from '@/form/modalForm';
import { FormComponent } from '@/form/types';
import { Player } from '@minecraft/server';

interface ModalFormProps<T = any> {
  title: string;
  previousForm?: ModalFormType | ActionForm | MessageForm;
  children?: FormComponent[];
  onSubmit?: (player: Player, values?: T[] | undefined) => any;
};

export default function ModalForm({
  title,
  previousForm,
  children = [],
  onSubmit = () => {},
}: ModalFormProps) {
  return createModalForm({
    title,
    previousForm,
    components: children,
    handle: onSubmit,
  });
};
