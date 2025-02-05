import React, { useState, forwardRef, useImperativeHandle } from "react";
import { IonToast } from "@ionic/react";

const ErrorPopup = forwardRef((_, ref) => {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Expose showError function to parent component
  useImperativeHandle(ref, () => ({
    showError: (msg: string) => {
      setMessage(msg);
      setIsOpen(true);
    },
  }));

  return (
    <IonToast
      isOpen={isOpen}
      onDidDismiss={() => setIsOpen(false)}
      message={message}
      duration={3000}
      color="danger"
    />
  );
});

export default ErrorPopup;
