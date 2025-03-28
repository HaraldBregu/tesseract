
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon';

type InnerMarginNoteProps = Omit<SvgIconProps, 'children' | 'viewBox'>;

const InnerMarginNote = (props: InnerMarginNoteProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path fillRule="evenodd" d="M8.25 22h-1.5V2h1.5zm2.402-12.776v1.5h6.597v-1.5zm0 3.692v1.5h6.597v-1.5zm0-7.385v1.5h6.597v-1.5z" clipRule="evenodd" />
    </SvgIcon>
  );
};

export default InnerMarginNote;
