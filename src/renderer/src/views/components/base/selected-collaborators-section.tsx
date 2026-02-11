
interface SelectedCollaboratorsSectionProps {
    title: string;
    children: React.ReactNode;
    visible: boolean;
}
const SelectedCollaboratorsSection = ({
    title,
    children,
    visible,
}: SelectedCollaboratorsSectionProps) => {
    if (!visible)
        return null

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">
                {title}
            </p>
            <div className="border border-grey-80 dark:border-grey-30 rounded-md p-3 bg-grey-95 dark:bg-grey-20">
                <div className="flex flex-wrap gap-2">
                    {children}
                    {/* <List
                        data={Array.from(selectedCollaborators)}
                        renderItem={(data) => {
                            return (
                                <div
                                    key={data.userId}
                                    className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 rounded-full px-3 py-1.5"
                                >
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold">
                                        {getInitials(data.userName || "")}
                                    </div>
                                    <span className="text-sm font-medium">{data.userName}</span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveCollaborator(data)}
                                        disabled={isSubmitting}
                                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors disabled:opacity-50"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            );
                        }}
                    /> */}
                </div>
            </div>
        </div>
    );
};

export default SelectedCollaboratorsSection;