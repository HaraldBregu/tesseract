
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type RightProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Right = (props: RightProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="m14.837 18.663-1.07-1.045 4.88-4.879H2.5v-1.5h16.156l-4.864-4.878 1.044-1.045 6.673 6.674z" />
    </SvgIcon>
  );
};

export default Right;
