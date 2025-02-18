import { IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonModal, IonToolbar, IonTitle, IonHeader, IonButtons, IonTextarea, IonDatetimeButton, IonDatetime, useIonToast, IonSelect, IonSelectOption, IonCardHeader, IonCardTitle, IonText } from '@ionic/react';
import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router';
// import MasterComponent '../../components/MasterComponent';
import MasterComponent from '../../components/MasterComponent';
import { sendOutline, saveOutline, pencilOutline, folderOpenOutline, closeOutline } from 'ionicons/icons';

import { getWorkOrderTaskHistory, createTaskHistory, workOrderTaskApi, workOrderTaskHistoryApi, assigneeApi } from '../../api/api';
import ModalComponent from '../../components/Modal';
import { formatDate, hasPermission, presentToast } from '../../utilities/globalfns';
import "./workorder.css";
import ModalComponent1 from '../../components/ModalComponent1';
import BadgeComponent from '../../utilities/badgecomponent';
import useErrorAlert from '../../utilities/ErrorAlert';

const WorkOrderTasks: React.FC = () => {

    const modal = useRef<HTMLIonModalElement>(null);
    const history = useHistory();
    const location = useLocation();
    const [workOrderHistory, setWorkOrderHistory] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const closeModal = () => setIsOpen(false);
    const [isClicked, setIsClicked] = useState(false);
    const unclick = () => setIsClicked(false);
    const [assignees, setAssignees] = useState([]);
    const showError = useErrorAlert();

    const { workOrderTasks } = location.state ? location.state : { workOrderTasks: [] };
    // console.log("workOrderTasks: " + JSON.stringify(workOrderTasks));

    const [formData, setFormData] = useState({
        work_order_id: workOrderTasks?.work_order_id,
        assignee_id: workOrderTasks?.assignee_id,
        title: workOrderTasks?.title,
        description: workOrderTasks?.description,
        priority: workOrderTasks?.priority,
        status: workOrderTasks?.status,
    });

    const [formHistory, setFormHistory] = useState({
        work_order_task_id: workOrderTasks?.id,
        transaction: '',
        comment: ''
    })

    const id = workOrderTasks?.id;

    //fetch all assignees
    useEffect(() => {
        const fetchAssignees = async () => {
            try {
                const data = await assigneeApi.list();
                setAssignees(data.data.data);
                // console.log("assignees: " + JSON.stringify(data.data.data));

            } catch (error) {
                console.log("fetchAssignees error:" + error.message);
            }
        }
        fetchAssignees();
    }, [])

    const fetchWorkOrderHistory = async () => {

        if (id) {
            try {
                const data = await getWorkOrderTaskHistory(id);
                // console.log("data: " + JSON.stringify(data));

                setWorkOrderHistory(data);
                setIsOpen(true);
            } catch (err) {
                console.log("fetchWorkOrderHistory error:" + err.message);
            }
        }

    };

    const getModalContent = useCallback(() => {
        if (!workOrderHistory || !workOrderHistory?.data) return null;
        return (
            <IonList>
                {workOrderHistory && workOrderHistory.data?.map((task, index) => (
                    <IonCard key={index} className="ion-padding task-card animate__animated  animate__pulse">
                        <IonList>
                            <IonItem> @
                                <IonLabel>
                                    {task.user.email}
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>Subject</IonLabel>
                                <IonText>
                                    {task.transaction}
                                </IonText>
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>Comment</IonLabel>
                                <IonTextarea>
                                    {task.comment}
                                </IonTextarea>
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>Posted on</IonLabel>
                                <IonText>
                                    {formatDate(task.created_at)}
                                </IonText>
                            </IonItem>
                        </IonList>
                    </IonCard>
                ))}

                {workOrderHistory && workOrderHistory?.data?.length === 0 &&
                    <IonLabel>{workOrderHistory?.message}</IonLabel>
                }
            </IonList>
        )
    }, [workOrderHistory]);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormHistory(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const saveModifiedData = async (updatedData: any) => {
        setFormData(updatedData);
        console.log("updatedData: " + JSON.stringify(updatedData));

        if (updatedData) {
            try {
                let req = await workOrderTaskApi.update(formData.work_order_id, updatedData);
                console.log("req:" + JSON.stringify(req));
                return true;

            } catch (error) {
                showError(error?.response?.data?.message || error?.message);
                return false;
            }
        }
    }

    const UpdateTaskForm = ({ initialData, saveModifiedData, closeModal }) => {
        const [localFormData, setLocalFormData] = useState(initialData);

        const handleInputChange = (field, value) => {
            setLocalFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

        const handleSave = () => {
            const ret = saveModifiedData(localFormData);
            // console.log("localFormData: " + JSON.stringify(localFormData));
            const updatedTask = { ...workOrderTasks, ...localFormData };
            // console.log("updatedTask: " + JSON.stringify(updatedTask));
            // history.push(`/work-orders/${workOrderTasks?.work_order_id}`, {updatedTask });
            history.push({
                pathname: `/work-orders/${workOrderTasks?.work_order_id}`,
                state: {workOrderTasks:(ret ? updatedTask : null)}
            });
            closeModal();
        };

        return (
            <IonCard className='ion-padding task-card'>
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked"><b>Assignee</b></IonLabel>
                        <IonSelect
                            label='Assignee'
                            name="assignee_id"
                            value={localFormData.assignee_id}
                            // onIonChange={(e) => handleInputChange(e)}
                            onIonChange={(e) => handleInputChange('assignee_id', e.detail.value)}
                            placeholder="Select assginee"
                        >
                            {assignees.map((person, index) => (
                                <IonSelectOption value={person.id} key={index}>{person.first_name} {person.last_name}</IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><b>Title</b></IonLabel>
                        <IonInput
                            className='ion-text-end'
                            name='title'
                            value={localFormData.title || ''}
                            onIonInput={(e) => handleInputChange('title', e.target.value)}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><b>Description</b></IonLabel>
                        <IonTextarea
                            className='ion-text-end'
                            name='description'
                            value={localFormData.description || ''}
                            autoGrow
                            onIonInput={(e) => handleInputChange('description', e.target.value)}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><b>Priority</b></IonLabel>
                        <IonSelect
                            label='Priority'
                            name='priority'
                            value={localFormData.priority || ''}
                            onIonChange={(e) => handleInputChange('priority', e.detail.value)}
                        >
                            <IonSelectOption value="low">Low</IonSelectOption>
                            <IonSelectOption value="medium">Medium</IonSelectOption>
                            <IonSelectOption value="high">High</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked"><b>Status</b></IonLabel>
                        <IonSelect
                            name='status'
                            label='Status'
                            value={localFormData.status || ''}
                            onIonChange={(e) => handleInputChange('status', e.detail.value)}
                        >
                            <IonSelectOption value="new">New</IonSelectOption>
                            <IonSelectOption value="in-progress">In-Progress</IonSelectOption>
                            <IonSelectOption value="completed">Completed</IonSelectOption>
                            <IonSelectOption value="closed">Closed</IonSelectOption>
                            <IonSelectOption value="on-hold">On-Hold</IonSelectOption>
                            <IonSelectOption value="cancelled">Cancelled</IonSelectOption>
                            <IonSelectOption value="pending">Pending</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonButton onClick={handleSave} expand="block">
                        Save
                        <IonIcon icon={saveOutline} slot="end" />
                    </IonButton>
                </IonList>
            </IonCard>
        );
    };


    const addPost = async (data) => {

        console.log("data:" + JSON.stringify(data));
        if (data) {
            try {
                const req = await workOrderTaskHistoryApi.store(data);
                console.log("req: " + JSON.stringify(req));

            } catch (error) {
                console.log("AddPost error: " + error.message)
            }
            finally {
                setFormHistory({
                    transaction: '',
                    comment: ''
                });
            }
        }
    }

    const handleOpenModal = () => {
        setIsClicked(true);
        console.log("formData:" + JSON.stringify(formData));

    }

    return (
        <MasterComponent title={"View Work Order Task"}>
            <IonCard className='ion-padding task-card'>
                <IonCardTitle>
                    <h2>Task info
                        <IonBadge
                            color={formData.priority === 'low' ? 'success' : formData.priority === 'medium' ? 'warning' : formData.priority === 'high' ? 'danger' : 'primary'}>
                            {formData?.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                        </IonBadge>
                    </h2>
                </IonCardTitle>
                <IonList>
                    <IonItem>
                        <IonLabel><b>Title:</b></IonLabel>
                        <IonText>{formData.title}</IonText>
                    </IonItem>
                    <IonItem>
                        <IonLabel><b>Description:</b></IonLabel>
                        <IonText>{formData.description}</IonText>
                    </IonItem>
                    <IonItem className='ion-text-wrap'>
                        <IonLabel><b>Start Date:</b></IonLabel>
                        <IonText>{formatDate(workOrderTasks?.start_date)}</IonText>
                    </IonItem>
                    <IonItem className='ion-align-self-end'>
                        <IonLabel><b>Status:</b></IonLabel>
                        <BadgeComponent status={formData.status} />
                        {/* <IonText className='ion-text-uppercase'>{workOrderTasks.status}</IonText>  */}
                    </IonItem>
                    <IonItem>
                        <IonLabel><b>Completed Date:</b></IonLabel>
                        <IonText>{workOrderTasks.completed_date === null ? 'N/A' : workOrderTasks.completed_date}</IonText>
                    </IonItem>
                    <IonButton
                        onClick={handleOpenModal}
                        disabled={!hasPermission("work-order-task.edit")}
                    >
                        Modify
                        <IonIcon icon={pencilOutline} />
                    </IonButton>

                </IonList>
            </IonCard>
            <IonCard className='ion-padding task-card'>
                <IonCardTitle>
                    <IonLabel><h2>Comments and Histories</h2></IonLabel>
                </IonCardTitle>
                <IonList>
                    <IonItem>
                        <IonInput label='Subject' placeholder='Subject' name='transaction' value={formHistory.transaction}
                            onIonInput={handleInputChange}></IonInput>
                    </IonItem>
                    <IonItem>
                        <IonTextarea label='Comment' placeholder='Type your comment here' autoGrow rows={3} name='comment' value={formHistory.comment}
                            onIonInput={handleInputChange}></IonTextarea>
                    </IonItem>
                    <IonButton onClick={() => addPost(formHistory)} >
                        Post <IonIcon icon={sendOutline} slot="end" ></IonIcon>
                    </IonButton>
                    <IonButton onClick={() => fetchWorkOrderHistory()}>
                        View History <IonIcon icon={folderOpenOutline} slot="end"></IonIcon>
                    </IonButton>
                </IonList>
            </IonCard>

            {isOpen && (
                <ModalComponent1 title={"Work Order Task History"}
                    getContentModal={getModalContent}
                    onClose={closeModal}
                    isOpen={isOpen} />
            )}

            {isClicked && (
                <ModalComponent1 title={"Update Task"}
                    isOpen={isClicked}
                    onClose={unclick}
                    getContentModal={() =>
                        <UpdateTaskForm
                            initialData={formData}
                            saveModifiedData={saveModifiedData}
                            closeModal={unclick}
                        />}
                />
            )}
        </MasterComponent>
    );
};

export default WorkOrderTasks;