
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type BurgerProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Burger = (props: BurgerProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M3.5 17.636v-1.5h17v1.5zm0-4.884v-1.5h17v1.5zm0-4.885v-1.5h17v1.5z" />
    </SvgIcon>
  );
};

export default Burger;
