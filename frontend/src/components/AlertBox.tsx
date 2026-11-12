// alertbox.tsx
import React, { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoadingButton from "./LoadingButton";
import deleteGif from "./delete.gif";
import restoreGif from "./restore.gif";

type ToastType = "success" | "error" | "info" | "warn";

export const showToast = (message: string, type: ToastType = "success") => {
  switch (type) {
    case "success":
      toast.success(message, {
        id: message,
        position: "top-right",
        duration: 3000,
      });
      break;
    case "error":
      toast.error(message, {
        id: message,
        position: "top-right",
        duration: 4000,
      });
      break;
    case "info":
      toast(message, {
        id: message,
        position: "top-right",
        duration: 3000,
      });
      break;
    case "warn":
      toast(message, {
        id: message,
        position: "top-right",
        duration: 3500,
        style: {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fde68a",
        },
      });
      break;
    default:
      toast(message);
  }
};

// Popup types
type PopupType =
  | "confirm-delete"
  | "delete-success"
  | "restore-success"
  | "confirm-restore"
  | "confirm-permanent-delete"
  | "confirm-cancel";

interface ActionModalProps {
  isOpen: boolean;
  type: PopupType;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  itemName?: string;
  loading?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  type,
  onClose,
  onConfirm,
  itemName,
  loading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isExecutingRef = useRef(false);

  if (!isOpen) return null;

  const isProcessing = loading || internalLoading;

  let title = "";
  let gifSrc = "";
  let showConfirmButtons = false;
  let confirmButtonText = "OK";
  let loadingText = "Processing...";
  let confirmVariant: "danger" | "success" | "primary" = "danger";

  if (type === "confirm-delete") {
    title = itemName
      ? `Are you sure you want to delete ${itemName}?`
      : `Are you sure you want to delete?`;
    gifSrc = deleteGif;
    showConfirmButtons = true;
    confirmButtonText = "Yes, Delete";
    loadingText = "Deleting...";
    confirmVariant = "danger";
  } else if (type === "confirm-restore") {
    title = `Are you sure you want to restore ${itemName || 'this item'}?`;
    gifSrc = restoreGif;
    showConfirmButtons = true;
    confirmButtonText = "Yes, Restore";
    loadingText = "Restoring...";
    confirmVariant = "success";
  } else if (type === "confirm-permanent-delete") {
    title = `Warning: Are you sure you want to permanently delete ${itemName || 'this item'}?`;
    gifSrc = deleteGif;
    showConfirmButtons = true;
    confirmButtonText = "Yes, Permanently Delete";
    loadingText = "Deleting...";
    confirmVariant = "danger";
  } else if (type === "delete-success") {
    title = "Deleted successfully!";
    gifSrc = deleteGif;
  } else if (type === "restore-success") {
    title = "Restored successfully!";
    gifSrc = restoreGif;
  } else if (type === "confirm-cancel") {
    title = "Are you sure you want to cancel?";
    gifSrc = deleteGif;
    showConfirmButtons = true;
    confirmButtonText = "Yes, Cancel";
    loadingText = "Cancelling...";
    confirmVariant = "danger";
  }

  const handleConfirmClick = async () => {
    if (isExecutingRef.current || isProcessing) return;
    if (!onConfirm) {
      onClose();
      return;
    }

    isExecutingRef.current = true;
    setInternalLoading(true);

    try {
      const res = onConfirm();
      if (res && typeof (res as Promise<any>).then === "function") {
        await res;
      }
      onClose();
    } catch (err) {
      // Keep modal open or toast error on failure
    } finally {
      isExecutingRef.current = false;
      setInternalLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-slate-200">
        {gifSrc && (
          <img
            src={gifSrc}
            alt="status"
            className="w-20 h-20 mx-auto mb-3 object-contain"
          />
        )}
        <h2 className="text-base font-bold text-slate-900 mb-5 leading-snug">
          {title}
        </h2>

        {showConfirmButtons ? (
          <div className="flex justify-center gap-3">
            <LoadingButton
              onClick={onClose}
              disabled={isProcessing}
              variant="secondary"
              size="sm"
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              onClick={handleConfirmClick}
              loading={isProcessing}
              loadingText={loadingText}
              variant={confirmVariant}
              size="sm"
            >
              {confirmButtonText}
            </LoadingButton>
          </div>
        ) : (
          <LoadingButton
            onClick={onClose}
            variant="primary"
            size="sm"
            className="w-full"
          >
            OK
          </LoadingButton>
        )}
      </div>
    </div>
  );
};

// Toast container -> Add once in App.tsx
export const AlertContainer = () => <Toaster />;
