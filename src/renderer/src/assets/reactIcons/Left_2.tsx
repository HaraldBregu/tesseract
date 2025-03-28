
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type Left_2Props = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Left_2 = (props: Left_2Props) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M11.125 17.655 5.47 12.001l5.653-5.653L12.179 7.4l-4.584 4.6 4.584 4.6zm6.35 0-5.654-5.654 5.653-5.653L18.528 7.4l-4.584 4.6 4.584 4.6z" />
    </SvgIcon>
  );
};

export default Left_2;
