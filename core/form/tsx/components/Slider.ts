import { slider } from '@/form/components';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
};

/**
 * ModalFormでスライダー表示するコンポーネント
 */
export default function Slider({
  label,
  min,
  max,
  step,
  defaultValue = min,
}: SliderProps) {
  return slider({
    label,
    min,
    max,
    step,
    default: defaultValue,
  });
};
