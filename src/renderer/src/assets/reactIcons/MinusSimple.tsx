
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type MinusSimpleProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const MinusSimple = (props: MinusSimpleProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M5.5 12.75v-1.5h13v1.5z" />
    </SvgIcon>
  );
};

export default MinusSimple;
