import React, { useEffect, useState } from "react";
import { IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import MasterComponent from '../components/MasterComponent';
import './Home.css';
import { notificationApi, workOrderRequestApi } from "../api/api";
import { formatDate, hasPermission } from "../utilities/globalfns";
import { checkmarkDone } from "ionicons/icons";
import { useHistory } from "react-router";

const NotificationPage: React.FC = () => {
  const history = useHistory();
  const [allNotifs, setAllNotifs] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState();

  const fetchRequestOrder = async (workOrderId) => {

    if (workOrderId) {
      try {
        const req = await workOrderRequestApi.show(workOrderId);
        setSelectedRequest(req.data.data);
        // console.log("selectedRequest: " + JSON.stringify(req.data.data));
      } catch (error) {
        console.log("fetchRequestOrder error: " + JSON.stringify(error));
      }
    }
  }


  const handleOpenWOR = (id) => {
    if (id) {
      fetchRequestOrder(id);
    }
  }

  useEffect(() => {
    console.log("selectedRequest: "+JSON.stringify(selectedRequest));
    
    if (selectedRequest) {
      history.push({
        pathname: `/workOrderRequest/${selectedRequest?.work_order_request?.id}`,
        state: { selectedRequest },
      });
    }
  }, [selectedRequest]); 

  useEffect(() => {
    const retrieveNotifications = async () => {
      const req = await notificationApi.all();
      // console.log("req: " + JSON.stringify(req.data.data?.notifications)); 
      setAllNotifs(req.data?.data?.notifications)
    }
    retrieveNotifications();

  }, []);


  return (
    <MasterComponent title={"Notifications"}>
      <IonList>
        {allNotifs?.map((notification, index) => {
          const data = JSON.parse(notification.data)
          return (
            <IonCard key={index} className='task-card'>
              <IonCardHeader>
                <IonLabel>
                  {notification.is_read ? <IonIcon icon={checkmarkDone} /> : <div className="unread-indicator" style={{ marginTop: '13px', marginLeft: '-5px' }} />}
                  {formatDate(notification.created_at)}
                </IonLabel>
              </IonCardHeader>
              <IonCardContent>
                <IonItem lines="none">
                  {notification.message}
                </IonItem>
                <IonItem lines="none">
                  <IonLabel
                    aria-disabled={!hasPermission("work-order-request.view")}
                    onClick={() => handleOpenWOR(data.id)}
                  >
                    <b>{data.reference_number}</b>
                  </IonLabel>
                  <IonText>{data.work_order_description}</IonText>
                </IonItem>
              </IonCardContent>
            </IonCard>
          )
        })}
      </IonList>
    </MasterComponent>
  );
};

export default NotificationPage;
