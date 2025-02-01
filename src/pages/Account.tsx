import React, { useEffect, useState } from "react";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import MasterComponent from '../components/MasterComponent';
import './Home.css';
import { notificationApi, userApi } from "../api/api";
import { formatDate } from "../utilities/globalfns";
import { saveOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import { logOutOutline } from "ionicons/icons";
import { logout } from "../api/api";

const AccountPage: React.FC = () => {
  const history = useHistory();
  const [userDetails, setUserDetails] = useState();
  const handleLogout = async () => {
    try {
      const req = await logout();
      console.log("req: "+JSON.stringify(req));
      localStorage.clear();
      history.push("/");
      window.location.reload();
    }
    catch (error) {
      console.log("error logout: "+JSON.stringify(error));      
    }
  }


  useEffect(() => {
    const retrieveNotifications = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      // console.log("userData: " + userData.id);

      const req = await userApi.show(userData.user.id);
      console.log("req: " + JSON.stringify(req.data));
      setUserDetails(req.data?.data)
    }
    retrieveNotifications();

  }, []);


  return (
    <MasterComponent title={"Account"}>
      {userDetails &&
        <>
          <IonCard className='task-card'>
            <IonCardHeader>
              <h3><b>Profile</b></h3>
            </IonCardHeader>
            <IonList className="ion-justify-content-evenly">
              <IonItem>
                <IonLabel>First Name: </IonLabel>
                <IonInput value={userDetails?.profile?.first_name || ''}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Middle Name: </IonLabel>
                <IonInput value={userDetails.profile.middle_name}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Last Name: </IonLabel>
                <IonInput value={userDetails.profile.last_name}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Birthdate: </IonLabel>
                <IonInput value={userDetails.profile.birthdate}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Sex: </IonLabel>
                <IonSelect
                  value={userDetails.profile.sex}
                >
                  <IonSelectOption value={"1"}>Male</IonSelectOption>
                  <IonSelectOption value={"0"}>Female</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Mobile: </IonLabel>
                <IonInput value={userDetails.profile.mobile_number}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Email: </IonLabel>
                <IonInput value={userDetails.email}></IonInput>
              </IonItem>
            </IonList>

          </IonCard>
          <IonButton expand="block">
            Save <IonIcon icon={saveOutline} slot="end" />
          </IonButton>
        <IonButton expand="block" onClick={handleLogout} color="tertiary">
          Logout
          <IonIcon icon={logOutOutline} slot="end" />
        </IonButton>
        </>
      }
    </MasterComponent>
  );
};

export default AccountPage;
