import { IonCol, IonGrid, IonHeader, IonRow, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons } from "@ionic/react"
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import BackButton from "./BackButton";
import { notificationsOutline, personCircleOutline } from "ionicons/icons";
import { notificationApi } from "../api/api";
import "./HeaderDashboard.css";

const HeaderComponent = ({ title }) => {
    const history = useHistory();
    const [notifsCount, setNotifsCount] = useState(0);

    const fetchNotifsCount = async () => {
        try {
            const req = await notificationApi.all();
            // console.log("req: " + JSON.stringify(req.data?.data?.unread));
            setNotifsCount(req.data?.data?.unread);
        } catch (error) {
            console.log("error: " + error);

        }
    }
    useEffect(() => {
        fetchNotifsCount();
    }, [])

    return (
        <IonHeader 
        >
            <IonToolbar>
                <BackButton />
                <IonTitle>{title}</IonTitle>
                <IonButtons slot="end">
                    <IonButton fill="clear"
                        onClick={() => history.push("/notification")}
                    >
                        <IonIcon
                            icon={notificationsOutline}
                            size="large"
                        />
                        {notifsCount > 0 && (
                            <div className="notification-badge"
                            >
                                {notifsCount}
                            </div>
                        )}
                    </IonButton>
                    <IonButton fill="clear"
                        onClick={() => history.push("/account")}>
                        <IonIcon
                            icon={personCircleOutline}
                            size="large"
                        />
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    )
}

export default HeaderComponent;