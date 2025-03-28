
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type Right_3Props = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Right_3 = (props: Right_3Props) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M10.5 15.807V8.19L14.308 12z" />
    </SvgIcon>
  );
};

export default Right_3;
