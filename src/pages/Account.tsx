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
import logo from "../assets/images/sphere.png";

const AccountPage: React.FC = () => {
  const history = useHistory();
  const [userDetails, setUserDetails] = useState();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const logoPath = userData?.user?.client?.logo_path;
  const handleLogout = async () => {
    try {
      const req = await logout();
      console.log("req: " + JSON.stringify(req));
      localStorage.clear();
      history.push("/");
      window.location.reload();
    }
    catch (error) {
      console.log("error logout: " + JSON.stringify(error));
    }
  }


  useEffect(() => {
    const retrieveNotifications = async () => {
      // console.log("userData: " + userData.id);

      const req = await userApi.show(userData.user.id);
      console.log("req: " + JSON.stringify(req.data));
      setUserDetails(req.data?.data)
    }
    retrieveNotifications();

  }, []);
  const gender =
    [{
      id: 1,
      name: "Male"
    }, {
      id: 2,
      name: "Female"
    }
    ];


  return (
    <MasterComponent title={"Account"}>
      {userDetails &&
        <>
          <IonCard className='task-card'>
            <IonCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><h3><b>Profile</b></h3></div>
                <div style={{ display: "flex" }}>
                  <img src={logoPath || logo} style={{ height: '50px', width: '50px' }} />
                </div>
              </div>
            </IonCardHeader>
            <IonList className="ion-justify-content-evenly">
              <IonItem>
                <IonLabel>First Name: </IonLabel>
                <IonInput className="ion-text-end" value={userDetails?.profile?.first_name || ''}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Middle Name: </IonLabel>
                <IonInput className="ion-text-end" value={userDetails.profile.middle_name}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Last Name: </IonLabel>
                <IonInput className="ion-text-end" value={userDetails.profile.last_name}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Birthdate: </IonLabel>
                <IonInput className="ion-text-end" value={userDetails.profile.birthdate}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Sex: </IonLabel>
                <IonSelect
                  value={userDetails?.profile?.sex}
                  onIonChange={(e) => {
                    // Handle selection change (if needed, e.g., update the user profile)
                    console.log("Selected gender ID: ", e.target.value);
                  }}
                >
                  {gender.map((item) => (
                    <IonSelectOption
                      className="ion-text-end"
                      key={item.id} value={item.id}>
                      {item.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Mobile: </IonLabel>
                <IonInput className="ion-text-end" value={userDetails.profile.mobile_number}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Email: </IonLabel>
                <IonInput className="ion-text-end" value={userDetails.email}></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Client Name: </IonLabel>
                <IonText className="ion-text-end">{userData?.user?.client?.client}</IonText>
              </IonItem>
            </IonList>
          </IonCard>
          <IonButton expand="block">
            Save <IonIcon icon={saveOutline} slot="end" />
          </IonButton>
          <IonButton expand="block" onClick={handleLogout} fill="outline">
            Logout
            <IonIcon icon={logOutOutline} slot="end" />
          </IonButton>
        </>
      }
    </MasterComponent>
  );
};

export default AccountPage;
