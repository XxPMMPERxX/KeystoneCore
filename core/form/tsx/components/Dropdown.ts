import { dropdown } from '@/form/components';

interface DropdownProps {
  label: string;
  options: string[];
  defaultValueIndex?: number;
};

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
