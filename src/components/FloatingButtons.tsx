import React, { useState, useEffect } from "react";
import { IonBadge, IonButton, IonIcon } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  personCircleOutline,
  informationCircleOutline,
  notificationsOutline,
  menuOutline,
  colorWandOutline,
} from "ionicons/icons";
import "./FloatingButtons.css"; // Add custom styles
import { getNotificationCount, hasPermission } from "../utilities/globalfns";
import { notificationApi } from "../api/api";

const FloatingTabButtons: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [notifsCount, setNotifsCount] = useState(0);
  const history = useHistory();

  const handleToggle = () => {
    console.log("clicking toggle");
    
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const fetchNotifsCount = async () => {
      try {
        const req = await notificationApi.all();
        // console.log("req: " + JSON.stringify(req.data?.data?.unread));
        setNotifsCount(req.data?.data?.unread);
      } catch (error) {
        console.log("error: " + error);

      }
    }
    fetchNotifsCount();
    

  }, [])

  const createWorkOrderRequest = hasPermission("work-order-request.create");

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

          {createWorkOrderRequest &&
            <IonButton
              className="expanded-button"
              style={{ animationDelay: "0.1s" }}
              onClick={() => history.push("/createWOR")}
            >
              <IonIcon icon={colorWandOutline} />
            </IonButton>
          }

          <IonButton
            className="expanded-button"
            style={{ animationDelay: "0.1s" }}
            onClick={() => {history.push("/account"); handleToggle();}}
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

          {/* <IonButton
            className="expanded-button"
            style={{ animationDelay: "0.3s" }}
            onClick={()=> history.push("/notification")}
          >
            <IonIcon icon={notificationsOutline}/>            
          </IonButton> */}
          <div className="notification-button-wrapper">
            <IonButton
              className="expanded-button"
              style={{ animationDelay: "0.3s" }}
              onClick={() => history.push("/notification")}
            >
              <IonIcon icon={notificationsOutline}></IonIcon>
            </IonButton>

            {/* Badge */}
            <div className="notification-badge">{notifsCount}</div> {/* Replace '5' with dynamic data */}
          </div>



        </div>
      )}
    </div>
  );
};

export default FloatingTabButtons;
