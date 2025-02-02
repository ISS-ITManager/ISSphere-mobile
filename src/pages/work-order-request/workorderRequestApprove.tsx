import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonGrid, IonIcon, IonContent, IonItem, IonLabel, IonList, IonPage, IonModal, IonToolbar, IonTitle, IonHeader, IonButtons, IonTextarea, IonDatetimeButton, IonDatetime, useIonToast, IonSelect, IonSelectOption, IonCol, IonRow, IonInput, IonText, IonNote, IonCheckbox } from '@ionic/react';
import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router';
import MasterComponent from '../../components/MasterComponent';
import { addOutline, saveOutline, checkmarkCircleOutline, closeCircleOutline, arrowBackOutline, arrowForwardOutline, caretForwardOutline } from 'ionicons/icons';

import { assigneeApi,workOrderRequestApi, teamApi, serviceProviderServiceApi, serviceApi } from '../../api/api';
import { formatDate, presentToast } from '../../utilities/globalfns';

const WorkOrderRequestApprove: React.FC = () => {
    const history = useHistory();
    const location = useLocation();

    const [step, setStep] = useState(1);

    const { workOrderRequest } = location.state ? location.state : { workOrderRequest: {} };
    // console.log("workOrderRequest: "+JSON.stringify(workOrderRequest));


    const selectedRequest = workOrderRequest;
    const [assigneesList, setAssigneesList] = useState([]);
    const [teamsList, setTeamsList] = useState([]);

    const [formData, setFormData] = useState({
        work_order_request: workOrderRequest?.work_order_request?.id,
        start_date: null,
        start_time: null,
        end_date: null,
        end_time: null,
        is_repeating: '',
        recurrence: '',
        days_of_week: [],
        assignment_mode: '',
        priority: '',
        services: [],
        service_providers: [],
        teams: [],
        assignees: []
    })


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

    const getAssignees = async () => {
        try {
            const req = await assigneeApi.list();
            setAssigneesList(req.data.data);
            // console.log("assignees: " + JSON.stringify(req.data.data));

        } catch (error) {
            console.log("getAssignees error: " + JSON.stringify(error));
        }
    }

    const getTeamsList = async () => {
        try {
            const req = await teamApi.list();
            setTeamsList(req.data.data);
            // console.log("teams: " + JSON.stringify(req.data.data));

        } catch (error) {
            console.log("getTeamsList error: " + JSON.stringify(error));

        }
    }




    const handleNext = () => {
        setStep((prevStep) => prevStep + 1);
    }


    const handleBack = () => {
        setStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = () => {
        console.log("formData: " + JSON.stringify(formData))
        try {
            const req = workOrderRequestApi.storeSchedule({
                work_order_request: formData.work_order_request,
                assignment_mode: formData.assignment_mode,
                days_of_week: formData.days_of_week,
                end_date: formData.end_date,
                end_time: formData.end_time,
                is_repeating: (formData.is_repeating === 'onRepeat' ? '1' : '0'),
                priority: formData.priority,
                recurrence: formData.recurrence,
                service_providers: formData.service_providers,
                services: formData.services,
                start_date: formData.start_date,
                start_time: formData.start_time,
                ...(formData.assignment_mode === "team"
                    ? { teams: [formData.teams] }
                    : { assignees: [formData.assignees] })
            });

            console.log("req: " + JSON.stringify(req));


            history.push({
                pathname: '/createWO',
                state: { formData: formData }
            })
        } catch (error) {

        }
    }

    const handleChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value
        }))
    }

    const ScheduleDetails = ({ formData, handleNext, handleChange }) => {

        const handleEnableNext = (start_date, start_time, end_date, end_time, is_repeating, recurrence, days_of_week) => {
            if (start_date && start_time && end_date && end_time && is_repeating) {
                if (is_repeating === 'onRepeat' && recurrence === 'weekly' && days_of_week?.length > 1) {
                    return true;
                }
                else if (is_repeating === 'noRepeat') {
                    return true;
                }
                else if (is_repeating === 'onRepeat' && recurrence === 'daily') {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }

        const handleDateTime = (field, currentDateTime) => {
            const [date, time] = currentDateTime.split("T");
            if (field === "start_date") {
                handleChange(field, date);
                handleChange('start_time', time.slice(0, 5));
            }
            else {
                handleChange(field, date);
                handleChange('end_time', time.slice(0, 5));
            }
        }


        return (
            <IonCard style={{ marginLeft: '5px' }} className='ion-padding'>

                <div style={{ marginTop: '10px', padding: '1px' }}>
                    <IonLabel><b>Accept Request</b></IonLabel>
                </div>
                <IonNote>Complete the required fields below to accept this request</IonNote>
                <IonItem>
                    <IonLabel><b>Start Date:</b></IonLabel>
                    <IonDatetimeButton datetime="start-datetime" />
                    <IonModal keepContentsMounted={true}>
                        <IonDatetime
                            id="start-datetime"
                            value={
                                formData.start_date && formData.start_time
                                    ? `${formData.start_date}T${formData.start_time}`
                                    : undefined
                            }
                            formatOptions={{
                                time: {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }
                            }}

                            onIonChange={(e) => handleDateTime('start_date', e.detail.value)}
                        />
                    </IonModal>
                </IonItem>

                <IonItem>
                    <IonLabel><b>End Date:</b></IonLabel>
                    <IonDatetimeButton datetime="end-datetime" />
                    <IonModal keepContentsMounted={true}>
                        <IonDatetime
                            id="end-datetime"
                            value={
                                formData.end_date && formData.end_time
                                    ? `${formData.end_date}T${formData.end_time}`
                                    : undefined
                            }

                            formatOptions={{
                                time: {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }
                            }}
                            onIonChange={(e) => handleDateTime('end_date', e.detail.value)}
                        />
                    </IonModal>
                </IonItem>
                <IonItem>
                    <IonSelect label='Repeat Settings'
                        value={formData.is_repeating}
                        onIonChange={(e) => handleChange('is_repeating', e.target.value)}>
                        <IonSelectOption value='noRepeat'>Does not Repeat</IonSelectOption>
                        <IonSelectOption value='onRepeat'>On Repeat</IonSelectOption>
                    </IonSelect>
                </IonItem>
                {formData.is_repeating === 'onRepeat' &&
                    <IonItem>
                        <IonSelect label='Select Recurrence'
                            value={formData.recurrence}
                            onIonChange={(e) => handleChange('recurrence', e.target.value)}>
                            <IonSelectOption value='daily'>Daily</IonSelectOption>
                            <IonSelectOption value='weekly'>Weekly</IonSelectOption>
                        </IonSelect>
                    </IonItem>}
                {formData.recurrence === 'weekly' &&
                    <IonItem>
                        <IonLabel position="stacked">Select Days</IonLabel>
                        <IonSelect
                            value={formData.days_of_week}
                            //   label='Select days'
                            placeholder="Select days"
                            multiple
                            onIonChange={(e) => handleChange('days_of_week', e.target.value)}
                        >
                            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
                                <IonSelectOption key={index} value={day.toLowerCase()}>{day}</IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                }
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                    <IonButton disabled={!handleEnableNext(formData.start_date, formData.start_time, formData.end_date, formData.end_time, formData.is_repeating, formData.recurrence, formData.days_of_week)}
                        onClick={() => handleNext()}
                    >
                        Next
                        <IonIcon slot="end" icon={arrowForwardOutline} />
                    </IonButton>
                </div>


            </IonCard>
        )
    }

    const AssigneeDetails = ({ formData, handlePrev, handleNext, handleChange, assigneesList, teamsList }) => {
        return (
            <IonCard style={{ marginLeft: '5px' }} className='ion-padding'>
                <div style={{ marginTop: '10px', padding: '1px' }}>
                    <IonLabel><b>Assign to Assignee or Team</b></IonLabel>
                </div>
                <IonItem>
                    <IonLabel position="stacked">Select Mode of Assignment</IonLabel>
                    <IonSelect
                        value={formData.assignment_mode}
                        onIonChange={(e) => handleChange('assignment_mode', e.target.value)}
                    >
                        <IonSelectOption value="team">Teams</IonSelectOption>
                        <IonSelectOption value="assignee">Assignee</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">{`Select ${formData.assignment_mode === "team" ? "Team" : "Assignee"}`}</IonLabel>
                    <IonSelect
                        value={
                            formData.assignment_mode === "team"
                                ? formData.teams
                                : formData.assignees
                        }
                        onIonChange={(e) =>
                            handleChange(
                                formData.assignment_mode === "team" ? 'teams' : 'assignees',
                                e.target.value
                            )
                        }
                    >
                        {formData.assignment_mode === "team" &&
                            teamsList.map((team, index) => (
                                <IonSelectOption value={team.id} key={index}>
                                    {team.team}
                                </IonSelectOption>
                            ))}

                        {formData.assignment_mode === "assignee" &&
                            assigneesList.map((assignee, index) => (
                                <IonSelectOption value={assignee.id} key={index}>
                                    {assignee.first_name} {assignee.last_name}
                                </IonSelectOption>
                            ))}
                    </IonSelect>
                </IonItem>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                    <IonButton onClick={handlePrev}>
                        <IonIcon slot="start" icon={arrowBackOutline} />
                        Previous
                    </IonButton>

                    <IonButton onClick={handleNext} >
                        Next
                        <IonIcon slot="end" icon={arrowForwardOutline} />
                    </IonButton>
                </div>
            </IonCard>
        )
    }


    const ServicesDetails = ({ formData, handlePrev, handleSubmit, handleChange }) => {
        const [providerList, setProviderList] = useState([]);
        const [serviceList, setServiceList] = useState([]);

        const getServiceList = async (priority) => {
            if (priority) {
                try {
                    const req = await serviceApi.list(priority);
                    setServiceList(req.data.data);
                } catch (error) {
                    console.log("getServiceList error: " + JSON.stringify(error));
                }
            }
        }

        const getServiceProviderList = async (serviceId) => {
            if (serviceId) {
                try {
                    const req = await serviceProviderServiceApi.list(serviceId);
                    setProviderList(req.data.data);
                } catch (error) {
                    console.log("getServiceProviderList error: " + JSON.stringify(error));
                }
            }
        }

        const handlePriority = async (priority) => {
            if (priority) {
                await getServiceList(priority);
                handleChange('priority',  priority);
            }
        }

        const handleServices = async(serviceId)=> {
            if(serviceId)
            {
                await getServiceProviderList(serviceId);
                handleChange('services', serviceId);
            }
        }

        return (
            <IonCard style={{ marginLeft: '5px' }} className='ion-padding'>
                <div style={{ marginTop: '10px', padding: '1px' }}>
                    <IonLabel><b>Assign to Assignee or Team</b></IonLabel>
                </div>
                <IonItem>
                    <IonSelect label='Select Priority'
                        color={"danger"}
                        value={formData.priority}
                        onIonChange={(e) => handlePriority(e.target.value)}>
                        <IonSelectOption value='low' >Low</IonSelectOption>
                        <IonSelectOption value='medium'>Medium</IonSelectOption>
                        <IonSelectOption value='high' >High</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonSelect label='Select Services'
                        value={formData.services}
                        multiple
                        onIonChange={(e) => handleServices(e.target.value)}>
                        {serviceList.map((serv, index) => (
                            <IonSelectOption value={serv.id} key={index}>{serv.service}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonSelect label='Select Service Provider'
                        value={formData.service_providers}
                        multiple
                        onIonChange={(e) => handleChange('service_providers', e.target.value)}>
                        {providerList.map((provider, index) => (
                            <IonSelectOption value={provider.id} key={index}>{provider.provider}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                    <IonButton onClick={handlePrev}>
                        <IonIcon slot="start" icon={arrowBackOutline} />
                        Previous
                    </IonButton>

                    <IonButton onClick={handleSubmit} >
                        Save
                        <IonIcon slot="end" icon={saveOutline} />
                    </IonButton>
                </div>

            </IonCard>
        );
    }


    useEffect(() => {

        getAssignees();
        getTeamsList();
    }, []);

    return (
        <MasterComponent title={"Accept Request"}>
            {selectedRequest &&
                <>
                    <IonCard className="task-card bounce-in-right" style={{ marginLeft: '5px', marginTop: '-10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginTop: '10px' }}>
                            <div>{getIsAcceptedColor(selectedRequest?.work_order_request?.is_accepted)}</div>
                            <div>{getPriority(selectedRequest?.work_order_request?.priority)}</div>
                        </div>
                        <IonCardHeader>
                            <IonCardTitle>{selectedRequest.work_order_request?.reference_number}
                            </IonCardTitle>
                        </IonCardHeader>
                        {/* <IonCardContent> */}
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
                                <IonIcon icon={caretForwardOutline} />
                                {selectedRequest?.location?.entity}
                                <IonIcon icon={caretForwardOutline} />
                                {selectedRequest?.location?.property}
                                <IonIcon icon={caretForwardOutline} />
                                {selectedRequest?.location?.zone}
                                <IonIcon icon={caretForwardOutline} />
                                {selectedRequest?.location?.level}
                                {<IonIcon icon={caretForwardOutline} /> &&
                                    selectedRequest?.location?.room}
                            </IonText>
                        </IonItem>
                        <IonItem>
                            <IonLabel><b> Requested by: </b></IonLabel>
                            <IonText >{selectedRequest.work_order_request?.requested_by?.profile?.first_name} {selectedRequest.work_order_request?.requested_by?.profile?.last_name} </IonText>
                        </IonItem>

                    </IonCard>

                    {step === 1 && <ScheduleDetails formData={formData} handleNext={handleNext} handleChange={handleChange} />}

                    {step === 2 && <AssigneeDetails formData={formData} handlePrev={handleBack} handleNext={handleNext} handleChange={handleChange} assigneesList={assigneesList} teamsList={teamsList} />}

                    {step === 3 && <ServicesDetails formData={formData}
                        handlePrev={handleBack}
                        handleSubmit={handleSubmit}
                        handleChange={handleChange}
                    />
                    }

                </>
            }
        </MasterComponent>
    )
}
export default WorkOrderRequestApprove;