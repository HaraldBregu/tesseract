
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type DropdownProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Dropdown = (props: DropdownProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M12 14.308 8.19 10.5h7.616z" />
    </SvgIcon>
  );
};

export default Dropdown;
