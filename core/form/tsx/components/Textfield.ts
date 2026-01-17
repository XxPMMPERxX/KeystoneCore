import { textField } from '@/form/components';

interface TextfieldProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  tooltip?: string;
};

/**
 * ModalFormでテキスト入力を行えるコンポーネント
 */
export default function Textfield({
  label,
  placeholder,
  defaultValue,
  tooltip,
}: TextfieldProps) {
  return textField({
    label,
    placeholder,
    default: defaultValue,
    tooltip,
  });
};
