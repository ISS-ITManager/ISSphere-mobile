import React from "react";
import { IonBadge } from "@ionic/react";

interface BadgeComponentProps {
  status: string;
}

const BadgeStatus: React.FC<BadgeComponentProps> = ({ status }) => {
  let stats = status.charAt(0).toLocaleUpperCase() + status.slice(1);
    switch (status) {
      case 'in-progress':
        case 'pending':
        return <IonBadge color="warning" >
          {stats}
        </IonBadge>;
      case 'completed':
        return <IonBadge color="success" >
          {stats}
        </IonBadge>;
      case "on-hold":
        case "cancelled":
        return <IonBadge color="danger" >
          {stats}
        </IonBadge>;
      default: //new
        return <IonBadge color="tertiary" >
          {stats}
        </IonBadge>;
    }  
};

export default BadgeStatus;
