import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router';
import MasterComponent from '../../components/MasterComponent';
import { chevronForwardOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, arrowBackOutline, arrowForwardOutline, caretForwardOutline } from 'ionicons/icons';

import { assigneeApi, workOrderRequestApi, teamApi, serviceProviderServiceApi, serviceApi, workOrderApi } from '../../api/api';
import { formatDate, formatDateOnly } from '../../utilities/globalfns';
import { IonCard, IonChip, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonButton, IonIcon, IonItem, IonLabel, IonText, IonBadge, IonAccordionGroup, IonAccordion } from '@ionic/react';
import BadgeStatus from '../../utilities/BadgeStatus';
import BadgeComponent from '../../utilities/badgecomponent';

const WorkOrderRequestView: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const { selectedRequest } = location.state ? location.state : { selectedRequest: {} };
    const [workOrderList, setWorkOrderList] = useState([]);
    console.log("selectedREquest: "+JSON.stringify(selectedRequest));

    const retrieveRelatedWO = async (id) => {
        if (id) {
            try {
                const req = await workOrderApi.list(id);
                setWorkOrderList(req.data.data);
                console.log("req: " + JSON.stringify(req.data.data));

            } catch (error) {
                console.log("retrieveRelatedWO: " + JSON.stringify(error.message));

            }
        }
    }

    useEffect(() => {
        if (selectedRequest) {
            retrieveRelatedWO(selectedRequest?.work_order_request?.id);
        }
    }, []);
    const getIsAcceptedColor = (is_accepted) => {

        switch (is_accepted) {
            case "1":
                return <IonBadge color="success" >
                    <IonIcon icon={checkmarkCircleOutline} />
                    Accepted
                </IonBadge>; //Accepted
            case "2":
                return <IonBadge color="dark" >
                    <IonIcon icon={closeCircleOutline} />
                    Declined
                </IonBadge>; //Declined
            default:
                return <IonBadge color="tertiary" >
                    New
                </IonBadge>; //New
        }
    };

    const getPriority = (priority) => {
        switch (priority) {
            case 'medium':
                return <IonBadge color="warning" >
                    Medium Priority
                </IonBadge>;
            case 'low':
                return <IonBadge color="success" >
                    Low Priority
                </IonBadge>;
            case "high":
                return <IonBadge color="danger" >
                    High Priority
                </IonBadge>;
            default:
                return <IonBadge color="light" >
                    {priority}
                </IonBadge>;
        }
    }

    return (
        <MasterComponent title={"View Work Order Request"}>
            {selectedRequest && <>
                <IonCard className="ion-padding task-card animate__animated  animate__pulse" 
                // style={{ marginTop: '-10px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginTop: '10px' }}>
                        <div>{getIsAcceptedColor(selectedRequest?.work_order_request?.is_accepted)}</div>
                        <div>{getPriority(selectedRequest.work_order_request?.priority)}</div>
                    </div>
                    <IonCardHeader>
                        <IonCardTitle>{selectedRequest.work_order_request?.reference_number}
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonItem>
                        <IonLabel> <b>Description: </b></IonLabel>
                        <IonText>{selectedRequest.work_order_request?.work_order_description} </IonText>
                    </IonItem>
                    <IonItem>
                        <IonLabel>  <b>Type: </b></IonLabel>
                        <IonText>{selectedRequest.work_order_request?.work_order_type.work_order_type}</IonText>
                    </IonItem>
                    <IonItem>
                        <IonLabel><b>Date Requested: </b></IonLabel>
                        <IonText className='ion-text-end'>
                            {formatDate(selectedRequest?.work_order_request?.requested_date)}
                        </IonText>
                    </IonItem>
                    <IonItem>
                        <IonLabel><b>Location: </b></IonLabel>
                        <IonText className='ion-text-end'>
                            {selectedRequest?.location?.group}
                            <IonIcon icon={chevronForwardOutline} />
                            {selectedRequest?.location?.entity}
                            <IonIcon icon={chevronForwardOutline} />
                            {selectedRequest?.location?.property}
                            <IonIcon icon={chevronForwardOutline} />
                            {selectedRequest?.location?.zone}
                            <IonIcon icon={chevronForwardOutline} />
                            {selectedRequest?.location?.level}
                            {<IonIcon icon={chevronForwardOutline} /> &&
                                selectedRequest?.location?.room}
                        </IonText>
                    </IonItem>
                    <IonItem>
                        <IonLabel><b> Requested by: </b></IonLabel>
                        <IonText >{selectedRequest.work_order_request?.requested_by?.profile?.first_name} {selectedRequest.work_order_request?.requested_by?.profile?.last_name} </IonText>
                    </IonItem>

                </IonCard>

                {workOrderList && workOrderList?.length > 0 &&
                    <IonCard className="task-card animate__animated  animate__pulse" style={{ marginLeft: '4%', marginTop: '-10px' }}>
                        <IonCardHeader><b>Work Orders</b></IonCardHeader>
                        <IonAccordionGroup multiple>
                            {workOrderList
                            .sort((a, b)=> new Date(a.start_date) - new Date(b.end_date))
                            .map((item, index) => (
                                <IonAccordion value={item.reference_number} key={index} >
                                    <IonItem slot="header">
                                        <IonLabel>{item.reference_number}</IonLabel>
                                    </IonItem>
                                    <div className="ion-padding" slot="content" onClick={()=> history.push(`/work-orders/${item.id}`)}>
                                        <center>
                                        <IonText>
                                            {item.end_date === item.start_date
                                                ? formatDateOnly(item.start_date)
                                                : `From ${item.start_date} To ${item.end_date}`}
                                        </IonText>
                                        <IonLabel>
                                            <IonChip className="ion-text-uppercase" outline={true} color="warning">
                                                <IonIcon icon={calendarOutline} />
                                                <b>{item.day}</b>
                                            </IonChip>
                                        </IonLabel>
                                        {/* <BadgeStatus status={item.status}/> */}
                                        <BadgeComponent status={item.status} />
                                        </center>
                                    </div>
                                </IonAccordion>
                            ))}
                        </IonAccordionGroup>
                    </IonCard>
                }
            </>}
        </MasterComponent>
    )
}

export default WorkOrderRequestView;