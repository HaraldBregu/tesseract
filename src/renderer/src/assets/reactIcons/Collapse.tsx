
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type CollapseProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Collapse = (props: CollapseProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="m12 10.455-4.6 4.6-1.054-1.054 5.653-5.653L17.654 14 16.6 15.055z" />
    </SvgIcon>
  );
};

export default Collapse;
