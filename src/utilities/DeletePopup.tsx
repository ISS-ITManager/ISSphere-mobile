import React, { forwardRef, useImperativeHandle, useState } from "react";
import { IonAlert } from "@ionic/react";

export interface DeletePopupRef {
  showDeleteConfirmation: (message: string, onConfirm: () => void) => void;
}

const DeletePopup = forwardRef<DeletePopupRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => void) | null
  >(null);

  useImperativeHandle(ref, () => ({
    showDeleteConfirmation: (msg: string, onConfirm: () => void) => {
      setMessage(msg);
      setOnConfirmCallback(() => onConfirm);
      setIsOpen(true);
    },
  }));

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    setIsOpen(false);
  };

  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={() => setIsOpen(false)}
      header="Delete Confirmation"
      message={message}
      buttons={[
        {
          text: "Cancel",
          role: "cancel",
          handler: () => setIsOpen(false),
        },
        {
          text: "Confirm",
          handler: handleConfirm,
        },
      ]}
    />
  );
});

export default DeletePopup;
