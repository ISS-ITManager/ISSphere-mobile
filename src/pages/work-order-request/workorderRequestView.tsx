import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useHistory, useLocation, useParams } from 'react-router';
import MasterComponent from '../../components/MasterComponent';
import { chevronForwardOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, arrowBackOutline, arrowForwardOutline, caretForwardOutline } from 'ionicons/icons';

import { assigneeApi, workOrderRequestApi, teamApi, serviceProviderServiceApi, serviceApi, workOrderApi } from '../../api/api';
import { formatDate, formatDateOnly, hasPermission } from '../../utilities/globalfns';
import { IonCard, IonChip, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonButton, IonIcon, IonItem, IonLabel, IonText, IonBadge, IonAccordionGroup, IonAccordion } from '@ionic/react';
import BadgeComponent from '../../utilities/badgecomponent';

const WorkOrderRequestView: React.FC = (prop) => {
    const history = useHistory();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();

    // const { selectedRequest } = location.state ? location.state : { selectedRequest: {} }; 
    // const [selectedWOR, setSelectedWOR] = useState(selectedRequest);
    const [selectedWOR, setSelectedWOR] = useState();
    const [workOrderList, setWorkOrderList] = useState([]);
    // console.log("selectedREquest: " + JSON.stringify(selectedRequest));

    const retrieveRelatedWO = async (id) => {
        if (id) {
            try {
                const req = await workOrderApi.list(id);
                setWorkOrderList(req.data.data);
                // console.log("req: " + JSON.stringify(req.data.data));

            } catch (error) {
                console.log("retrieveRelatedWO: " + JSON.stringify(error.message));

            }
        }
    }
    const fetchRequestOrder = async (workOrderId) => {

        if (workOrderId) {
            try {
                const req = await workOrderRequestApi.show(workOrderId);
                setSelectedWOR(req?.data?.data);
                // console.log("fetchRequestOrder: " + JSON.stringify(req?.data?.data));

                await retrieveRelatedWO(req?.data?.data?.work_order_request?.id);
            } catch (error) {
                console.log("fetchRequestOrder error: " + JSON.stringify(error));
            }
        }
    }

    useEffect(() => {
        fetchRequestOrder(id);
    }, [id]);
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

    const handleOpenWO=(id)=> {
        if(hasPermission("work-order.view"))
        {
            history.push(`/work-orders/${id}`);
        }
    }

    return (
        <MasterComponent title={"View Work Order Request"}>
            {selectedWOR && <>

                <IonCard className="ion-padding task-card animate__animated  animate__pulse"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginTop: '10px' }}>
                        <div>{getIsAcceptedColor(selectedWOR?.work_order_request?.is_accepted)}</div>
                        <div>{getPriority(selectedWOR.work_order_request?.priority)}</div>
                    </div>
                    <IonCardHeader>
                        <IonCardTitle>{selectedWOR.work_order_request?.reference_number}
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonItem>
                        <IonLabel> <b>Description: </b></IonLabel>
                        <IonText>{selectedWOR.work_order_request?.work_order_description} </IonText>
                    </IonItem>
                    <IonItem>
                        <IonLabel>  <b>Type: </b></IonLabel>
                        <IonText>{selectedWOR.work_order_request?.work_order_type.work_order_type}</IonText>
                    </IonItem>
                    <IonItem>
                        <IonLabel><b>Date Requested: </b></IonLabel>
                        <IonText className='ion-text-end'>
                            {formatDate(selectedWOR?.work_order_request?.requested_date)}
                        </IonText>
                    </IonItem>
                    <IonItem>
                        <IonLabel><b>Location: </b></IonLabel>
                        <IonText className='ion-text-end'>
                            {selectedWOR?.location?.group}
                            <IonIcon icon={chevronForwardOutline} />
                            {selectedWOR?.location?.entity}
                            <IonIcon icon={chevronForwardOutline} />
                            {selectedWOR?.location?.property}
                            <IonIcon icon={chevronForwardOutline} />
                            {selectedWOR?.location?.zone}
                            <IonIcon icon={chevronForwardOutline} />
                            {selectedWOR?.location?.level}
                            {<IonIcon icon={chevronForwardOutline} /> &&
                                selectedWOR?.location?.room}
                        </IonText>
                    </IonItem>
                    <IonItem>
                        <IonLabel><b> Requested by: </b></IonLabel>
                        <IonText >{selectedWOR.work_order_request?.requested_by?.profile?.first_name} {selectedWOR.work_order_request?.requested_by?.profile?.last_name} </IonText>
                    </IonItem>

                </IonCard>

                {workOrderList && workOrderList?.length > 0 &&
                    <IonCard className="task-card animate__animated  animate__pulse" style={{ marginLeft: '4%', marginTop: '-10px' }}>
                        <IonCardHeader><b>Work Orders</b></IonCardHeader>
                        <IonAccordionGroup multiple>
                            {workOrderList
                                .sort((a, b) => new Date(a.start_date) - new Date(b.end_date))
                                .map((item, index) => (
                                    <IonAccordion value={item.reference_number} key={index} >
                                        <IonItem slot="header">
                                            <IonLabel>{item.reference_number}</IonLabel>
                                        </IonItem>
                                        <div className="ion-padding" slot="content" 
                                        onClick={() => handleOpenWO(item.id)}>
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