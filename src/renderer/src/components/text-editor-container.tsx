interface TextEditorContainerProps {
  children: React.ReactNode;
}

export const TextEditorContainer = ({
  children
}: TextEditorContainerProps) => {
  return (
    <div className="flex flex-col h-full">
      {children}
    </div>
  )
};
