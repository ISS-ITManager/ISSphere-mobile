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
      case 'paused':
      return <IonBadge color="warning" >
        {stats}
      </IonBadge>;
    case "completed":
    case "compliant":
      return <IonBadge color="success" >
        {stats}
      </IonBadge>;
    case "on-hold":
    case "cancelled":
    case "breached":
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
