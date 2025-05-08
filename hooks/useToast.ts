import { useState, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  type: ToastType;
  message: string;
  visible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<Toast>({
    type: "info",
    message: "",
    visible: false,
  });

  const show = useCallback(
    ({ type, message }: { type: ToastType; message: string }) => {
      setToast({
        type,
        message,
        visible: true,
      });

      // Auto hide after 3 seconds
      setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
    },
    []
  );

  const hide = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    show,
    hide,
  };
};
