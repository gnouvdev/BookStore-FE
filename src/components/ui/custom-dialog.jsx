import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CustomDialog = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  className = "",
  maxWidth = "max-w-6xl",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={`${maxWidth} h-[90vh] flex flex-col ${className}`}
      >
        {(title || description) && (
          <DialogHeader className="flex-none border-b border-gray-200 pb-4">
            {title && (
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {title}
              </DialogTitle>
            )}
            {description && <p className="text-gray-500 mt-2">{description}</p>}
          </DialogHeader>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;
