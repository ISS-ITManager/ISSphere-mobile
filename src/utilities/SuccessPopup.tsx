import React, { forwardRef, useImperativeHandle, useState } from "react";
import { IonAlert } from "@ionic/react";

export interface SuccessPopupRef {
  showSuccess: (message: string) => void;
}

const SuccessPopup = forwardRef<SuccessPopupRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  useImperativeHandle(ref, () => ({
    showSuccess: (msg: string) => {
      setMessage(msg);
      setIsOpen(true);
    },
  }));

  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={() => setIsOpen(false)}
      header="Success"
      message={message}
      buttons={["OK"]}
    />
  );
});

export default SuccessPopup;
