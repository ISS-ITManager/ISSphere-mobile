import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { notificationsOutline, personCircleOutline } from "ionicons/icons";
import BackButton from "./BackButton";
import { notificationApi } from "../api/api";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const history = useHistory();
  const [notifsCount, setNotifsCount] = useState(0);
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
  return (
    <IonHeader collapse="fade" className="ion-no-border">
      <IonToolbar className="ion-no-border">
        <BackButton />
        <IonTitle>{title}</IonTitle>
        <div slot="end" className="ion-align-items-center">
          <IonButton fill="clear" className="ion-padding-0" onClick={() => history.push("/notification")}>
            <IonIcon
              icon={notificationsOutline}
              className="ion-text-muted"
              style={{ fontSize: "35px", color: "#333" }}
            />
            {notifsCount > 0 &&
              <div
                className="notification-badge"
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "#f53d3d",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "12px",
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {notifsCount}
              </div>
            }
          </IonButton>

          <IonButton
            fill="clear"
            className="ion-padding-0"
            onClick={() => history.push("/account")}
          >
            <IonIcon
              icon={personCircleOutline}
              className="ion-text-muted"
              style={{ fontSize: "35px", color: "#333" }}
            />
          </IonButton>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
