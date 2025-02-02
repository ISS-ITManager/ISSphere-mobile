import React from "react";
import { IonBadge } from "@ionic/react";

interface BadgeComponentProps {
  priority: string;
}

const BadgePriority: React.FC<BadgeComponentProps> = ({ priority }) => {
  let prio = priority.charAt(0).toLocaleUpperCase() + priority.slice(1);
    switch (priority) {
      case 'medium':
        return <IonBadge color="warning" >
          {prio}
        </IonBadge>;
      case 'low':
        return <IonBadge color="success" >
          {prio}
        </IonBadge>;
      case "high":
        return <IonBadge color="danger" >
          {prio}
        </IonBadge>;
      default: //new
        return <IonBadge color="tertiary" >
          {prio}
        </IonBadge>;
    }  
};

export default BadgePriority;
