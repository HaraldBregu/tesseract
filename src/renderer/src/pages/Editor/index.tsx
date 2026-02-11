import { memo, useReducer } from "react";
import {
    editorContext as EditorContext,
    reducer,
    initialState,
} from "./provider";
import EditorContent from "./ELayout";

const EditorContextProvider = memo(({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <EditorContext.Provider value={[state, dispatch]} >
            {children}
        </EditorContext.Provider>
    )
})

export default memo(() => {
    return (
        <EditorContextProvider>
            <EditorContent />
        </EditorContextProvider>
    )
})

