import { toggle } from '@/form/components';

interface ToggleProps {
  label: string;
  defaultValue?: boolean;
};

/**
 * ModalFormでトグル切り替えを行えるコンポーネント
 */
export default function Toggle({
  label,
  defaultValue = false,
}: ToggleProps) {
  return toggle({
    label,
    default: defaultValue,
  });
}
