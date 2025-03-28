
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type AlignJustifyProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const AlignJustify = (props: AlignJustifyProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M3.5 20.379v-1.5h17v1.5zm0-3.875v-1.5h17v1.5zm0-3.875v-1.5h17v1.5zm0-3.875v-1.5h17v1.5zm0-3.875v-1.5h17v1.5z" />
    </SvgIcon>
  );
};

export default AlignJustify;
