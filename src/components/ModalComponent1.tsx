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
    IonCard,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";

const ModalComponent1 = ({ title, getContentModal, onClose, isOpen }) => {
    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{title}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" >
                {getContentModal()}
            </IonContent>
        </IonModal>
    )
}

export default ModalComponent1;