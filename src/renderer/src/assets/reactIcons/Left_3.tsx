
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type Left_3Props = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Left_3 = (props: Left_3Props) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M13.5 15.807 9.69 11.999 13.5 8.191z" />
    </SvgIcon>
  );
};

export default Left_3;
