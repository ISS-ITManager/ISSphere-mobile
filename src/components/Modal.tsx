import React, { forwardRef } from "react";
import {
  IonModal,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import "./Modal.css";

interface ModalProps {
  title: string;
  getModalContent: () => React.ReactNode;
  onClose: () => void;
}

const ModalComponent = forwardRef<HTMLIonModalElement, ModalProps>(
  ({ title, getModalContent, onClose }, ref) => {
    const handleClose = () => {
      if (ref && "current" in ref && ref.current) {
        ref.current.dismiss();
      }
      onClose();
    };

    return (
      <IonModal
        ref={ref}
        initialBreakpoint={0.75}
        breakpoints={[0.75, 1]}
        backdropDismiss={true}
        className="custom-ios-modal"
      >
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>{title}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleClose}>
                <IonIcon icon={closeOutline} className="close-button" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">{getModalContent()}</IonContent>
      </IonModal>
    );
  }
);

export default ModalComponent;
