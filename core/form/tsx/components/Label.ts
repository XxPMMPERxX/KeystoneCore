import { label } from '@/form/components';

interface LabelProps {
  text: string;
}

const Label = ({ text }: LabelProps) => {
  return label({ text });
};

export default Label;
