
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type PlayProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Play = (props: PlayProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M8.5 18.098V5.906l9.577 6.096z" />
    </SvgIcon>
  );
};

export default Play;
