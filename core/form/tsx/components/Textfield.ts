import { textField } from '@/form/components';

interface TextfieldProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
};

export default function Textfield({
  label,
  placeholder = '',
  defaultValue = '',
}: TextfieldProps) {
  return textField({
    label,
    placeholder,
    default: defaultValue,
  });
};
