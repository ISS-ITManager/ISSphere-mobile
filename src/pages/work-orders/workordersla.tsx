import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router';
import { workOrderApi } from '../../api/api';
import {
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonTab,
  IonSearchbar,
  IonList,
  IonItem,
  IonAvatar,
  IonImg,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonAccordionGroup,
  IonAccordion,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButtons,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonCardHeader,
  IonCardTitle,
  IonAlert,
  IonChip
} from "@ionic/react";
import CountdownTimer from "../../utilities/countdowntimer";
import BadgeStatus from "../../utilities/BadgeStatus";
import MasterComponent from '../../components/MasterComponent';

const WorkOrderSLA: React.FC = () => {
  const location = useLocation();
  const { sla, workOrder } = location.state ? location.state : { sla: null, workOrder: null };
  const [responseTime, setResponseTime] = useState(null);
  const [openResponseTime, setOpenResponseTime] = useState(null);
  const [resolutionTime, setResolutionTime] = useState(null);
  console.log("resolutionTime: " + JSON.stringify(resolutionTime));

  useEffect(() => {
    if (workOrder && workOrder?.id) {
      const fetchData = async () => {
        await fetchResponseTime(workOrder?.id);
        await fetchOpenResponseTime(workOrder?.id);
        await fetchResolutionTime(workOrder?.id);
      }
      fetchData();



    }
  }, [workOrder])

  const calculateTimeDifference = (givenTimeInMinutes: number) => {
    const currentTime = new Date(); // Current date and time
    const givenTime = new Date(currentTime.getTime() + givenTimeInMinutes * 60000); // Add the given time (in minutes)

    // Get the difference in milliseconds
    const diffInMilliseconds = givenTime.getTime() - currentTime.getTime();

    // Convert milliseconds to minutes
    const diffInMinutes = Math.floor(diffInMilliseconds / 60000); // 60000 ms = 1 minute

    // Convert minutes into hours and remaining minutes
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    // Return the formatted time difference
    return `${hours} hours, ${minutes} mins`;
  };


  const fetchResponseTime = async (id) => { //from New to Open (Accepted)
    if (id) {
      try {
        const res = await workOrderApi.responseTime(id);
        setResponseTime(res.data.data);
      } catch (error) {
        console.log("fetchResponseTime error:" + JSON.stringify(error.message));
      }
    }
  }

  const fetchOpenResponseTime = async (id) => { // from Open to In-Progress
    if (id) {
      try {
        const res = await workOrderApi.openResponseTime(id);
        setOpenResponseTime(res.data.data);
      } catch (error) {
        console.log("fetchOpenResponseTime error:" + JSON.stringify(error.message));
        setOpenResponseTime(null);
      }
    }
  }


  const fetchResolutionTime = async (id) => { //from In-Progress to Closed
    if (id) {
      try {
        const res = await workOrderApi.resolutionTime(id);
        setResolutionTime(res.data.data);
      } catch (error) {
        console.log("fetchResolutionTime error:" + JSON.stringify(error.message));
      }
    }
  }

  const convertMinutes = (timeInMinutes) => {
    let hrs = Math.floor(timeInMinutes / 60);
    let mins = Math.floor(timeInMinutes % 60)
    return `${hrs} hrs, ${mins} mins`
  }
  return (
    <>
      <MasterComponent title={"Services and SLAs"}>
        {sla &&
          <>
            <IonCard className="task-card" >
              <IonCardHeader><b>Services and SLAs</b></IonCardHeader>
              <IonItem>
                <IonLabel>Service</IonLabel>
                <IonText className="ion-text-end">{sla?.service?.service}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Provider</IonLabel>
                <IonText>{sla?.service_provider}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>SLA</IonLabel>
                <IonText>{sla?.service?.sla?.sla_name}</IonText>
              </IonItem>
            </IonCard>
            <IonGrid>
              <IonRow>
                <IonCol >
                  <div className="task-card">
                    <IonCardHeader><IonLabel>Open Response Time</IonLabel></IonCardHeader>
                    <IonItem>
                      <IonInput labelPlacement="stacked"
                        label="Target"
                        value={`${sla?.service?.sla?.sla_response_time} mins`} />
                    </IonItem>
                    <IonItem>
                      <IonInput labelPlacement="stacked"
                        label="Actual"
                        value={responseTime?.response_time} />
                    </IonItem>
                    <IonItem>
                      <IonInput readonly
                        label="Remaining"
                        labelPlacement="stacked"
                        value={
                          `${sla?.service?.sla?.sla_response_time - responseTime?.response_time} mins`
                        } />
                    </IonItem>
                    <IonItem lines="none">
                      <IonLabel position="stacked">Status</IonLabel>
                      <IonText>
                        {workOrder?.active_status?.status === "open" ? '' :
                          <BadgeStatus
                            status={responseTime?.response_time <= sla?.service?.sla?.sla_response_time ? 'compliant' : 'breached'}
                          />}
                      </IonText>
                    </IonItem>
                  </div>
                </IonCol>
                {/* In-Progress */}
                <IonCol>
                  <div className="task-card">
                    <IonCardHeader><IonLabel>In-Progress Response Time</IonLabel></IonCardHeader>
                    <IonItem>
                      <IonInput readonly
                        label="Target"
                        labelPlacement="stacked"
                        value={`${sla?.service?.sla?.sla_response_time} mins`} />
                    </IonItem>
                    <IonItem>
                      <IonInput readonly
                        label="Actual"
                        labelPlacement="stacked"
                        value={`${openResponseTime?.response_time} mins`} />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Remaining</IonLabel>
                      <IonText>
                        {workOrder?.active_status?.status === "open" ?
                          <>
                            <CountdownTimer timeInMinutes={sla?.service?.sla?.sla_response_time} /> mins
                          </> :
                          `${openResponseTime?.response_time} mins`
                        }
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Status</IonLabel>
                      <IonText>
                        {workOrder?.active_status?.status === "open" ?
                          '' :
                          <BadgeStatus
                            status={openResponseTime?.response_time <= sla?.service?.sla?.sla_response_time ? 'compliant' : 'breached'}
                          />
                        }
                      </IonText>

                    </IonItem>
                  </div>
                </IonCol>
              </IonRow>
              {/* Resolution Time */}
              <IonRow>
                <IonCard className="task-card">
                  <IonCardHeader><IonLabel>Resolution Time</IonLabel></IonCardHeader>
                  <IonItem>
                    <IonLabel>Target</IonLabel>
                    <IonText>{sla?.service?.sla?.sla_resolution_time} mins</IonText>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Actual</IonLabel>
                    <IonText>{resolutionTime ? convertMinutes(resolutionTime) : calculateTimeDifference(workOrder?.status_durations?.inprogress)}</IonText>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Remaining</IonLabel>
                    <IonText>
                      {workOrder?.active_status?.status === "in-progress" ? <CountdownTimer timeInMinutes={resolutionTime} />
                        : <> {sla?.service?.sla?.sla_resolution_time - workOrder?.status_durations?.inprogress} mins</>
                      }
                      {/* {resolutionTime ?
                        `${<CountdownTimer timeInMinutes={resolutionTime} />} mins`
                        : sla?.service?.sla?.sla_resolution_time} */}
                    </IonText>
                  </IonItem>
                  <IonItem>
                    <IonLabel position='stacked'>Status</IonLabel>
                    <IonText className='ion-text-end'>
                      {workOrder?.active_status?.status === "in-progress" && ""}
                      {workOrder?.active_status?.status === "pending" &&
                        <BadgeStatus
                          status={'paused'}
                        />
                      }
                      {(workOrder?.active_status?.status === "completed" || workOrder?.active_status?.status === "") &&
                        <BadgeStatus
                          status={workOrder?.active_status?.status}
                        />}
                    </IonText>
                  </IonItem>
                </IonCard>
              </IonRow>
            </IonGrid>
          </>
        }
      </MasterComponent>
    </>
  )
}

export default WorkOrderSLA;
