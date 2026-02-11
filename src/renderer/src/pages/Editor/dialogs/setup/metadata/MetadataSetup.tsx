import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import MetadataForm from "@/pages/editor/dialogs/setup/metadata/metadata-form";
import MetadataView from "@/pages/editor/dialogs/setup/metadata/metadata-view-data";
import AppButton from "@/components/app/app-button";
import { AppDialog, AppDialogContent, AppDialogDescription, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog";
import { useElectron } from "@/hooks/use-electron";
import IconClose from "@/components/app/icons/IconClose";


interface MetadataSetupProps {
  onClose: () => void;
  isOpen: boolean;
  onSave: (metadata: Metadata) => void;
}

export default function MetadataSetup({
  onClose,
  isOpen,
  onSave,
}: MetadataSetupProps) {
  const { t } = useTranslation();
  const electron = useElectron();
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [newMetadata, setNewMetadata] = useState<Metadata | null>(null)
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isInEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchCreatedDate = async () => {
      const preferences = await electron.preferences.getPreferences();
      setPreferences(preferences);
      const metadata = await electron.doc.getMetadata();
      setMetadata(metadata);
      setNewMetadata(metadata);
    }
    fetchCreatedDate();
  }, []);

  const handleSave = () => {
    if (!newMetadata)
      return;
    setMetadata(newMetadata);
    onSave(newMetadata)
    setIsEditMode(false);
  };

  return (
    <AppDialog open={isOpen} modal={false} onOpenChange={onClose} >
      <AppDialogContent className="flex flex-col w-full xl:max-w-[60vw] max-w-[80vw] h-[98%] xl:h-[90%] !gap-0 overflow-y-auto">
        <AppDialogHeader className="!flex-1 h-[8vh]">
          <div className="flex justify-between items-center">
            <AppDialogTitle className="text-[14px] font-[700]">
              {t("metadata.title")}
            </AppDialogTitle>
            <AppButton
              variant="transparent"
              size="icon-sm"
              onClick={onClose}
              aria-label={t("dialog.close", "Close")}
              className="ml-2">
              <IconClose />
            </AppButton>
          </div>
          <AppDialogDescription />
        </AppDialogHeader>
        {preferences && <div className="!p-0 h-full overflow-y-auto">
          {!isInEditMode ? (
            <div className="w-full h-full p-0 border-gray-300" >
              {metadata && <MetadataView
                metadata={metadata}
                preferences={preferences}
              />}
            </div>
          ) : (
            <div className="w-full p-0  border-gray-300" >
              {newMetadata && <MetadataForm
                metadata={newMetadata}
                preferences={preferences}
                onChange={(metadata2: Metadata) => {
                  setNewMetadata(metadata2)
                }}
              />}
            </div>
          )}
        </div>}
        <AppDialogFooter className="!flex-1 items-center h-[8vh]">
          {
            !isInEditMode
              ? [
                <AppButton
                  key="export-style"
                  className="w-24"
                  size="xs"
                  shadow="none"
                  variant="secondary"
                  onClick={() => onClose()}
                >
                  {t("buttons.cancel")}
                </AppButton>,
                <AppButton
                  key="done"
                  className="w-24"
                  variant={"default"}
                  size="xs"
                  shadow="none"
                  onClick={() => setIsEditMode(true)}
                >
                  {t("metadata.buttons.edit")}
                </AppButton>,
              ]
              : [
                <AppButton
                  key="export-style"
                  className="w-24"
                  variant="secondary"
                  size="xs"
                  shadow="none"
                  onClick={() => setIsEditMode(false)}
                >
                  {t("buttons.cancel")}
                </AppButton>,
                <AppButton
                  key="save-edit"
                  className="w-24"
                  variant={"default"}
                  size="xs"
                  shadow="none"
                  onClick={handleSave}
                >
                  {t("buttons.save")}
                </AppButton>,
              ]
          }
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  );
}
