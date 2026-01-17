import { header } from '@/form/components';

interface HeaderProps {
  text: string;
}

/**
 * ModalFormでヘッダーを表示するコンポーネント
 */
const Header = ({ text }: HeaderProps) => {
  return header({ text });
};

export default Header;
