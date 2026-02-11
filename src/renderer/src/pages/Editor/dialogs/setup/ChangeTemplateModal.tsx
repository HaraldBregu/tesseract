import ConfirmationModal from "@/components/confirmation-modal";
import ChooseTemplateModal, { ChooseTemplateModalProps } from "./ChooseTemplateModal";
import { useTranslation } from "react-i18next";

interface ChangeTemplateModalProps extends ChooseTemplateModalProps {
    confirmModalProps: {
        open: boolean;
        onCancel: (open: boolean) => void;
        onSelectTemplate: () => void;
        description: string;
    }
}

function ChangeTemplateModal({ open, onClose, onSelectTemplate, confirmModalProps }: ChangeTemplateModalProps) {
    const { t } = useTranslation();

    return (
        <ChooseTemplateModal
            open={open}
            onClose={onClose}
            onSelectTemplate={onSelectTemplate}
            confirmModal={
                confirmModalProps.open && <div className="text-[13px]">
                    <ConfirmationModal
                        open={confirmModalProps.open}
                        onOpenChange={confirmModalProps.onCancel}
                        onConfirm={confirmModalProps.onSelectTemplate}
                        title={t('confirmChangeTemplateModal.title')}
                        description={confirmModalProps.description}
                        confirmButtonText={t('confirmChangeTemplateModal.buttons.confirm')}
                        cancelButtonText={t('confirmChangeTemplateModal.buttons.cancel')}
                    >
                    </ConfirmationModal>
                </div>
            }
        >
        </ChooseTemplateModal>
    )
}

export default ChangeTemplateModal;
