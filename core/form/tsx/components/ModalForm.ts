import { ActionForm } from '@/form/actionForm';
import { MessageForm } from '@/form/messageForm';
import { createModalForm, ModalForm as ModalFormType } from '@/form/modalForm';
import { FormComponent } from '@/form/types';
import { Player } from '@minecraft/server';

interface ModalFormProps<T = any> {
  title: string;
  submitButtonText?: string;
  previousForm?: ModalFormType | ActionForm | MessageForm;
  children?: FormComponent[];
  onSubmit?: (player: Player, values?: T[] | undefined) => any;
};

/**
 * ユーザーからのテキストやその他の入力を受け取れるフォーム
 * 
 * **使用例**
 * ```tsx
 * <ModalForm
 *   title="タイトル"
 *   onSubmit={handleSubmit}
 * >
 *   <Textfield
 *     label="テキスト入力"
 *   />
 * </ModalForm>
 * ```
 */
export default function ModalForm({
  title,
  submitButtonText,
  previousForm,
  children = [],
  onSubmit = () => {},
}: ModalFormProps) {
  return createModalForm({
    title,
    submitButtonText,
    previousForm,
    components: children,
    handle: onSubmit,
  });
};
