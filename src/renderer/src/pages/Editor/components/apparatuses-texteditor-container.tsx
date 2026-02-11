import { AnimatePresence, motion } from "framer-motion"
import { memo } from "react"


type ApparatusesTextEditorContainerProps = {
    expanded: boolean,
    children: React.ReactNode,
}

const ApparatusesTextEditorContainer = ({ expanded, children }: ApparatusesTextEditorContainerProps) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0, visibility: 'hidden' }}
                animate={{
                    height: expanded ? "auto" : "0px",
                    opacity: expanded ? 1 : 0,
                    visibility: expanded ? 'visible' : 'hidden'
                }}
                exit={{
                    height: 0,
                    opacity: 0,
                    visibility: 'hidden'
                }}
                className="overflow-hidden flex-1">
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default memo(ApparatusesTextEditorContainer)