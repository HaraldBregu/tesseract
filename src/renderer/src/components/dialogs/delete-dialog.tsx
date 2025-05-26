import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Button from "../ui/button"

export default function DeleteDialog({
    title,
    description,
    cancelButtonText,
    onCancel,
    confirmButtonText,
    onConfirm,
    children = null,
    ...props
}) {
    return (
        <Dialog {...props}>
            <DialogContent >
                <DialogHeader>
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                {children}
                <DialogFooter>
                    <Button
                        type="submit"
                        intent="secondary"
                        variant="filled"
                        size="small"
                        onClick={onCancel}
                    >
                        <span>{cancelButtonText}</span>
                    </Button>
                    <Button
                        type="submit"
                        intent="destructive"
                        variant="filled"
                        size="small"
                        onClick={onConfirm}
                    >
                        <span>{confirmButtonText}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
