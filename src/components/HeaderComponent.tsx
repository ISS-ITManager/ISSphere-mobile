import { IonCol, IonGrid, IonHeader, IonRow, IonToolbar, IonTitle, IonButton, IonIcon } from "@ionic/react"
import { useState } from "react";
import BackButton from "./BackButton";
import { notificationsOutline, personCircleOutline } from "ionicons/icons";
import { useHistory } from "react-router";

const HeaderComponent = ({ title }) => {
    const [backButton, setBackButton] = useState(true);
    const history = useHistory();
    return (
        <IonHeader>
            <IonToolbar>

                <IonGrid>
                    <IonRow>
                        <IonCol>
                            {!backButton && (
                                <button className="btn btn-sm btn-outline-primary mt-2 rounded-pill" >
                                    <i className="bx bx-menu"></i>
                                </button>
                            )}
                            {backButton && (<BackButton />)}
                        </IonCol>

                            <IonTitle>{title}</IonTitle>
                    </IonRow>
                </IonGrid>
            </IonToolbar>
        </IonHeader>
    )
}

export default HeaderComponent;