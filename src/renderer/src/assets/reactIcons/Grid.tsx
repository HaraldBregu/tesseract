
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type GridProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const Grid = (props: GridProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M3.5 11V3.5H11V11zm0 9.5V13H11v7.5zM13 11V3.5h7.5V11zm0 9.5V13h7.5v7.5zm-8-11h4.5V5H5zm9.5 0H19V5h-4.5zm0 9.5H19v-4.5h-4.5zM5 19h4.5v-4.5H5z" />
    </SvgIcon>
  );
};

export default Grid;
