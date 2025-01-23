import { IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonModal, IonToolbar, IonTitle, IonHeader, IonButtons, IonTextarea, IonDatetimeButton, IonDatetime, useIonToast, IonSelect, IonSelectOption } from '@ionic/react';
import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router';
// import MasterComponent '../../components/MasterComponent';
import MasterComponent from '../../components/MasterComponent';
import { sendOutline, saveOutline, pencilOutline, folderOpenOutline, closeOutline } from 'ionicons/icons';

import { getWorkOrderTaskHistory, createTaskHistory, workOrderTaskApi, workOrderTaskHistoryApi, assigneeApi } from '../../api/api';
import ModalComponent from '../../components/Modal';
import { formatDate, presentToast } from '../../utilities/globalfns';

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

    const { workOrderTasks } = location.state ? location.state : { workOrderTasks: [] };
    // console.log("workOrderTasks: " + JSON.stringify(workOrderTasks));

    const [formData, setFormData] = useState({
        work_order_id: workOrderTasks?.work_order_id,
        assignee_id: workOrderTasks?.assignee_id,
        title: workOrderTasks?.title,
        description: workOrderTasks?.description,
        priority: workOrderTasks?.priority
    });

    const [formHistory, setFormHistory] = useState({
        work_order_task_id: workOrderTasks?.id,
        transaction: '',
        comment: ''
    })

    const id = workOrderTasks.id;

    //fetch all assignees
    useEffect(() => {
        const fetchAssignees = async () => {
            try {
                const data = await assigneeApi.list();
                setAssignees(data.data.data);
                // console.log("assignees: " + JSON.stringify(data.data.data));

            } catch (error) {
                console.log(error);
            }
        }
        fetchAssignees();
    }, [])

    const fetchWorkOrderHistory = async () => {

        if (id) {
            try {
                const data = await getWorkOrderTaskHistory(id);
                console.log("data: " + JSON.stringify(data));

                setWorkOrderHistory(data);
                setIsOpen(true);
            } catch (err) {

            }
        }
        console.log("id: " + id + " | " + JSON.stringify(workOrderHistory));

    };

    const getModalContent = useCallback(() => {
        if (!workOrderHistory || !workOrderHistory?.data) return null;
        return (
            <IonList>
                {workOrderHistory && workOrderHistory.data?.map((task, index) => (
                    <IonCard key={index}>
                        <IonList>
                            <IonItem> @
                                <IonLabel>
                                    {task.user.email}
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>Subject</IonLabel>
                                <IonInput readonly>
                                    {task.transaction}
                                </IonInput>
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>Comment</IonLabel>
                                <IonTextarea>
                                    {task.comment}
                                </IonTextarea>
                            </IonItem>
                            <IonItem>
                                <IonLabel position='stacked'>Posted on</IonLabel>
                                <IonInput readonly>
                                    {formatDate(task.created_at)}
                                </IonInput>
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

    const saveModifiedData = (updatedData: any) => {
        setFormData(updatedData);
        console.log("updatedData: " + JSON.stringify(updatedData));

        try {
            let req = workOrderTaskApi.update(formData.work_order_id, updatedData);
            console.log("req:" + JSON.stringify(req));

        } catch (error) {
            presentToast("Error: " + error)
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
            saveModifiedData(localFormData);
            presentToast("Successfully saved");
            // console.log("localFormData: " + JSON.stringify(localFormData));
            const updatedTask = { ...workOrderTasks, ...localFormData };
            // console.log("updatedTask: " + JSON.stringify(updatedTask));

            history.push(`/work-orders/${workOrderTasks.id}`, { updatedTask });
            closeModal();
        };

        return (
            <IonList>
                <IonItem>
                    <IonLabel position="stacked">Assignee</IonLabel>
                    <IonSelect
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
                    <IonLabel position="stacked">Title</IonLabel>
                    <IonInput
                        name='title'
                        value={localFormData.title || ''}
                        onIonInput={(e) => handleInputChange('title', e.target.value)}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Description</IonLabel>
                    <IonTextarea
                        name='description'
                        value={localFormData.description || ''}
                        autoGrow
                        onIonInput={(e) => handleInputChange('description', e.target.value)}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Priority</IonLabel>
                    <IonSelect
                        name='priority'
                        value={localFormData.priority || ''}
                        onIonChange={(e) => handleInputChange('priority', e.detail.value)}
                    >
                        <IonSelectOption value="low">Low</IonSelectOption>
                        <IonSelectOption value="medium">Medium</IonSelectOption>
                        <IonSelectOption value="high">High</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonButton onClick={handleSave} expand="block">
                    Save
                    <IonIcon icon={saveOutline} slot="end" />
                </IonButton>
            </IonList>
        );
    };

    const ModalContainer = ({ isOpen, closeModal, getModalContent, title }) => {
        return (
            <IonModal isOpen={isOpen} onDidDismiss={closeModal}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>{title}</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={closeModal}>Close</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <p>
                        {getModalContent()}
                    </p>
                </IonContent>
            </IonModal>
        )
    }

    const addPost = async (data) => {

        console.log("data:" + JSON.stringify(data));
        if (data) {
            try {
                const req = await workOrderTaskHistoryApi.store(data);
                console.log("req: " + JSON.stringify(req));

                presentToast("Successfully saved")

            } catch (error) {
                presentToast("Error: " + error.message)
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
            <IonCard className='ion-padding'>
                <IonLabel>
                    <h2>Task info
                        <IonBadge
                            color={formData.priority === 'low' ? 'success' : formData.priority === 'medium' ? 'warning' : formData.priority === 'high' ? 'danger' : 'primary'}>
                            {formData?.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                        </IonBadge>
                    </h2>
                </IonLabel>
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked">Title:</IonLabel>
                        <IonInput value={formData.title} readonly />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Description:</IonLabel>
                        <IonTextarea value={formData.description} autoGrow readonly
                        />
                    </IonItem>
                    <IonItem className='ion-text-wrap'>
                        <IonLabel position="stacked">Start Date:</IonLabel>
                        <IonInput value={formatDate(workOrderTasks?.start_date)} readonly />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Completed Date:</IonLabel>
                        <IonInput value={workOrderTasks.completed_date === null ? 'N/A' : workOrderTasks.completed_date} readonly />
                    </IonItem>
                    <IonButton
                        onClick={handleOpenModal}
                    >
                        Modify
                        <IonIcon icon={pencilOutline} />
                    </IonButton>

                </IonList>
            </IonCard>
            <IonCard className='ion-padding'>
                <IonLabel><h2>Comments and Histories</h2></IonLabel>
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
                    <IonButton onClick={fetchWorkOrderHistory}>
                        View History <IonIcon icon={folderOpenOutline} slot="end"></IonIcon>
                    </IonButton>
                </IonList>
            </IonCard>

            {isOpen && (<ModalContainer title={"Work Order Task History"}
                getModalContent={getModalContent}
                closeModal={closeModal}
                isOpen={isOpen}
            />)}

            {isClicked && (
                <ModalContainer
                    title="Update Task"
                    isOpen={isClicked}
                    closeModal={unclick}
                    // getModalContent={getContentModify(formData,saveModifiedData)}
                    getModalContent={() =>
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