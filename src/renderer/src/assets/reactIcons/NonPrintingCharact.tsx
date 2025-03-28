
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type NonPrintingCharactProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const NonPrintingCharact = (props: NonPrintingCharactProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M10.34 11.178a3.333 3.333 0 0 1 0-6.666h6.666v1.666h-1.667v13.334h-1.667V6.178h-1.666v13.334h-1.667z" />
    </SvgIcon>
  );
};

export default NonPrintingCharact;
