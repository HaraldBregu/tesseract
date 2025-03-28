
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type CloseBigProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const CloseBig = (props: CloseBigProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="m6.4 18.655-1.054-1.054 5.6-5.6-5.6-5.6 1.053-1.053 5.6 5.6 5.6-5.6L18.653 6.4l-5.6 5.6 5.6 5.6-1.053 1.054-5.6-5.6z" />
    </SvgIcon>
  );
};

export default CloseBig;
