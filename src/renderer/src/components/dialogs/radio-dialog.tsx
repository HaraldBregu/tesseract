import DeleteDialog from "./delete-dialog";

export function RadioSelectDialog({
    title,
    description,
    cancelButtonText,
    onCancel,
    confirmButtonText,
    onConfirm,
    children,
    ...props
}) {
    return (
        <DeleteDialog {...props}
            title={title}
            description={description}
            cancelButtonText={cancelButtonText}
            onCancel={onCancel}
            confirmButtonText={confirmButtonText}
            onConfirm={onConfirm}
        >
            {children}
        </DeleteDialog>
    )
}
