import { dropdown } from '@/form/components';

interface DropdownProps {
  label: string;
  options: string[];
  defaultValueIndex?: number;
};

/**
 * ModalFormでドロップダウン選択を行えるコンポーネント
 */
export default function Dropdown({
  label,
  options,
  defaultValueIndex,
}: DropdownProps) {
  return dropdown({
    label,
    options,
    defaultIndex: defaultValueIndex,
  });
};
