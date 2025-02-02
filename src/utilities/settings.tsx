import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
} from "@ionic/react";
import BackButton from "../components/BackButton";

const SettingsPage: React.FC<{ onThemeChange: (theme: string) => void }> = ({
  onThemeChange,
}) => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "default"
  );

  useEffect(() => {
    document.body.classList.remove("theme-dark", "theme-green", "theme-blue");
    if (theme !== "default") {
      document.body.classList.add(theme);
    }
    localStorage.setItem("theme", theme);
    onThemeChange(theme); // Call parent function to update chart color
  }, [theme, onThemeChange]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <BackButton />
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>Choose Theme</IonLabel>
            <IonSelect
              value={theme}
              onIonChange={(e) => setTheme(e.detail.value)}
            >
              <IonSelectOption value="default">Default</IonSelectOption>
              <IonSelectOption value="theme-dark">Dark</IonSelectOption>
              <IonSelectOption value="theme-green">Green</IonSelectOption>
              <IonSelectOption value="theme-blue">Blue</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
