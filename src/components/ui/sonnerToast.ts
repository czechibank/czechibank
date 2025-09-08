import { toast } from "sonner";

export const sonnerToast = {
  show(message: string) {
    toast(message);
  },
  showError(message: string) {
    toast.error(message);
  },
  showSuccess(message: string) {
    toast.success(message, { duration: 2000 });
  },
  showWithDescription(title: string, description: string) {
    toast(title, { description });
  },

  showWithAction(title: string, description: string, action: React.ReactNode) {
    toast(title, { description, action });
  },
};
