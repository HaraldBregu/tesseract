
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type DragHandleProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const DragHandle = (props: DragHandleProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M4.5 14.75v-1.5h15v1.5zm0-4v-1.5h15v1.5z" />
    </SvgIcon>
  );
};

export default DragHandle;
