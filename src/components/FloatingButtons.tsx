import React, { useState } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  personCircleOutline,
  informationCircleOutline,
  notificationsOutline,
  menuOutline,
} from "ionicons/icons";
import "./FloatingButtons.css"; // Add custom styles

const FloatingTabButtons: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const history = useHistory();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="floating-buttons-container">
      {/* Backdrop when expanded */}
      {isExpanded && <div className="backdrop" onClick={handleToggle}></div>}

      <IonButton
        onClick={handleToggle}
        className={`main-button ${isExpanded ? "expanded" : ""}`}
      >
        <IonIcon icon={menuOutline} />
      </IonButton>

      {/* Expanded buttons with staggered animation */}
      {isExpanded && (
        <div className={`expanded-buttons ${isExpanded ? "show" : ""}`}>
          <IonButton
            className="expanded-button"
            style={{ animationDelay: "0.1s" }}
          >
            <IonIcon icon={personCircleOutline} />
          </IonButton>
          <IonButton
            className="expanded-button"
            style={{ animationDelay: "0.2s" }}
            onClick={() => history.push("/settings")}
          >
            <IonIcon icon={informationCircleOutline} />
          </IonButton>
          <IonButton
            className="expanded-button"
            style={{ animationDelay: "0.3s" }}
          >
            <IonIcon icon={notificationsOutline} />
          </IonButton>
        </div>
      )}
    </div>
  );
};

export default FloatingTabButtons;
