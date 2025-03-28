
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type PlusSimpleProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const PlusSimple = (props: PlusSimpleProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M11.25 20.5v-7.75H3.5v-1.5h7.75V3.5h1.5v7.75h7.75v1.5h-7.75v7.75z" />
    </SvgIcon>
  );
};

export default PlusSimple;
