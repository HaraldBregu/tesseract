
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type LeftProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Left = (props: LeftProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M9.173 18.663 2.5 11.99l6.673-6.674 1.044 1.045-4.863 4.879h16.155v1.5H5.364l4.878 4.878z" />
    </SvgIcon>
  );
};

export default Left;
