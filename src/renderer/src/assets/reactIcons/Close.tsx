
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type CloseProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Close = (props: CloseProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="m8.228 16.836-1.064-1.064 3.773-3.773-3.773-3.748 1.064-1.063L12 10.96l3.748-3.774 1.063 1.064-3.773 3.748 3.773 3.773-1.063 1.063L12 13.063z" />
    </SvgIcon>
  );
};

export default Close;
