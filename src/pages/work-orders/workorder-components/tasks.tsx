import React from "react";
import {
  IonContent,
  IonText,
  IonIcon,
  IonLabel,
  IonList,
  IonItem,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import {
  clipboard,
  documentText,
  calendar,
  person,
  checkmarkCircle,
  locationOutline,
  time,
  closeOutline,
} from "ionicons/icons";

import MasterComponent from "../../../components/MasterComponent";


const WorkOrderTasks = ({ workOrder }: { workOrder: any }) => {
  return (
    <MasterComponent title={"View Work Order Task"}>
      <IonCard>
        <IonLabel><h1>Task info</h1></IonLabel>
        <IonCardContent>

        </IonCardContent>
      </IonCard>
    </MasterComponent>

    );
};

export default WorkOrderTasks;