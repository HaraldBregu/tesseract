import Button from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";


export interface IConfirmationModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string 
  description?: string
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  cancelButtonText,
  confirmButtonText,
}: IConfirmationModal) => {
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 m-0 p-6 flex items-center justify-center bg-black/50 z-50 w-full">
        <div className="bg-white dark:bg-grey-10 rounded-lg max-w-sm w-[21rem] max-h-full overflow-auto p-6">
          <DialogHeader className="flex gap-2">
            <DialogTitle className="font-semibold text-[15px] text-center dark:text-grey-90">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center dark:text-grey-80 whitespace-pre-line">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-between gap-2 ">
            <Button
              className="btn btn-outline w-full items-center justify-center"
              onClick={() => onOpenChange(false)}
              size="mini"
              intent={"secondary"}
              variant={"tonal"}
            >
              {cancelButtonText}
            </Button>
            <Button
              className="btn bg-destructive-90 text-destructive w-full items-center justify-center"
              size="mini"
              intent={"primary"}
              onClick={() => onConfirm()}
            >
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
