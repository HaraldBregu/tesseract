
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type IndentDecreaseProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const IndentDecrease = (props: IndentDecreaseProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M3.5 20.379v-1.5h17v1.5zm8-3.875v-1.5h9v1.5zm0-3.875v-1.5h9v1.5zm0-3.875v-1.5h9v1.5zm-8-3.875v-1.5h17v1.5zm3.404 10.404L3.5 11.879l3.404-3.404z" />
    </SvgIcon>
  );
};

export default IndentDecrease;
