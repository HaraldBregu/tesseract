
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type Left_1Props = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Left_1 = (props: Left_1Props) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="m14 17.655-5.654-5.654 5.653-5.653L15.054 7.4l-4.6 4.6 4.6 4.6z" />
    </SvgIcon>
  );
};

export default Left_1;
