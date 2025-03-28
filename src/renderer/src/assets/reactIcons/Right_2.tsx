
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type Right_2Props = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Right_2 = (props: Right_2Props) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="m10.055 12.001-4.584-4.6 1.053-1.053L12.178 12l-5.654 5.654-1.053-1.054zm6.35 0-4.584-4.6 1.053-1.053L18.529 12l-5.653 5.654-1.054-1.054z" />
    </SvgIcon>
  );
};

export default Right_2;
