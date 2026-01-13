import { button } from '@/form/components';
import { Player } from '@minecraft/server';

interface ActionButtonProps {
  iconPath?: string,
  children?: string | string[],
  onClick?: (player: Player) => any,
};

export default function Button({
  iconPath = '',
  children = [],
  onClick = () => {},
}: ActionButtonProps) {
  return button({
    text: typeof children === 'object' ? children.join('\n') : children,
    iconPath,
    handler: onClick,
  });
};
