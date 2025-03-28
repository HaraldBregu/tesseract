import React from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import DragIndicator from '@/assets/reactIcons/DragIndicator';
import More from '@/assets/reactIcons/More';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import Button from './ui/button';

interface EditorWrapperProps {
  title: string;
  editor: Editor | null;
  setActiveEditor: (editor: Editor) => void;
}

const EditorTextArea: React.FC<EditorWrapperProps> = ({ title, editor, setActiveEditor }) => {
  return (
    <>
      <div className="h-full flex flex-col">
        <nav className="h-6 flex items-center justify-between">
          <div className='py-2 cursor-pointer'>
            <DragIndicator intent='primary' variant='tonal' size='small' />
          </div>
          <span className="text-center text-xs font-medium">{title}</span>
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  intent="secondary"
                  variant="icon"
                  size="iconSm"
                  icon={<More intent='primary' variant='tonal' size='small' />}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <span className="material-symbols-outlined mr-2">folder</span>
                  Add Folder
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="material-symbols-outlined mr-2">bookmark</span>
                  Add Bookmark
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="material-symbols-outlined mr-2">link</span>
                  Add Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
        <div className="flex-1 overflow-auto">
          <EditorContent className="h-full" editor={editor} onClick={() => setActiveEditor(editor!)} />
        </div>
      </div>
    </>
  );
};

export default EditorTextArea;
