import { IonCol, IonGrid, IonHeader, IonRow, IonToolbar, IonTitle, IonButton, IonIcon } from "@ionic/react"
import { useState, useEffect } from "react";
import BackButton from "./BackButton";

const HeaderComponent = ({ title }) => {
    return (        
        <IonHeader>
            <IonToolbar>
                <BackButton/>
                <IonTitle>{title}</IonTitle>
            </IonToolbar>
        </IonHeader>
    )
}

export default HeaderComponent;