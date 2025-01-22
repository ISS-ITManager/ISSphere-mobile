import { IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonModal, IonToolbar, IonTitle, IonHeader, IonButtons, IonTextarea, IonDatetimeButton, IonDatetime, useIonToast, IonSelect, IonSelectOption } from '@ionic/react';
import React, { useRef, useState, useCallback } from 'react'
import { useHistory, useLocation } from 'react-router';
// import MasterComponent '../../components/MasterComponent';
import MasterComponent from '../../components/MasterComponent';
import { sendOutline, saveOutline, pencilOutline, folderOpenOutline, closeOutline } from 'ionicons/icons';

import { getWorkOrderTaskHistory, createTaskHistory, workOrderTaskApi, workOrderTaskHistoryApi } from '../../api/api';
import ModalComponent from '../../components/Modal';

const WorkOrderTasks: React.FC = () => {

    const modal = useRef<HTMLIonModalElement>(null);
    const history = useHistory();
    const location = useLocation();
    const [workOrderHistory, setWorkOrderHistory] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const closeModal = () => setIsOpen(false);
    const [present] = useIonToast();
    const [isClicked, setIsClicked] = useState(false);
    const unclick = () => setIsClicked(false);

    const { workOrderTasks } = location.state ? location.state : { workOrderTasks: [] };
    // console.log("workOrderTasks: "+JSON.stringify(workOrderTasks));

    const [formData, setFormData] = useState({
        work_order_id: workOrderTasks.work_order_id,
        assignee_id: workOrderTasks.assignee_id,
        title: workOrderTasks.title,
        description: workOrderTasks.description,
        priority: workOrderTasks.priority
    });

    const [formHistory, setFormHistory] = useState({
        work_order_task_id: workOrderTasks.id,
        transaction: '',
        comment: ''
    })





    const id = workOrderTasks.id;
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
                        <IonItem> @
                            <IonLabel>
                                {task.user.email}
                            </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel><p>Subject</p></IonLabel>
                            <IonLabel>
                                {task.transaction}
                            </IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel><p>Comment</p></IonLabel>
                            <IonTextarea autoGrow rows={3}>
                                {task.comment}
                            </IonTextarea>
                        </IonItem>
                        <IonItem>
                            <IonLabel><p>Posted on</p></IonLabel>
                            <IonLabel>
                                {new Date(task.created_at).toISOString()}
                            </IonLabel>
                        </IonItem>
                    </IonCard>
                ))}

                {workOrderHistory && workOrderHistory?.data?.length === 0 &&
                    <IonLabel>{workOrderHistory?.message}</IonLabel>
                }
            </IonList>

            // <IonList>
            //     <IonItem>
            //         <IonLabel>
            //             <h2>Work Order History</h2>
            //             <p>Subject</p>
            //             <p>Comments</p>
            //         </IonLabel>
            //     </IonItem>
            // </IonList>
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
            console.log("localFormData: " + JSON.stringify(localFormData));

            closeModal();
        };

        return (
            <IonList>
                <IonItem>
                    <IonLabel position="stacked">Title</IonLabel>
                    <IonInput
                        value={localFormData.title || ''}
                        onIonChange={(e) => handleInputChange('title', e.detail.value)}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Description</IonLabel>
                    <IonTextarea
                        value={localFormData.description || ''}
                        autoGrow
                        rows={4}
                        onIonChange={(e) => handleInputChange('description', e.detail.value)}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Priority</IonLabel>
                    <IonSelect
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

    const presentToast = (message) => {
        present({
            message: message,
            duration: 1500,
            position: 'top'
        })
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
                {/* <IonRow> */}

                <IonLabel>
                    <h2>Task info
                        <IonBadge color={formData.priority === 'low' ? 'success' : formData.priority === 'medium' ? 'warning' : formData.priority === 'high' ? 'danger' : 'primary'}>
                            {formData.priority}
                        </IonBadge>
                    </h2>
                </IonLabel>
                {/* </IonRow> */}
                <IonList>
                    <IonItem>
                        <IonInput label='Title' value={formData.title} readonly />
                    </IonItem>
                    <IonItem>
                        <IonTextarea label='Description' value={formData.description} autoGrow rows={4} readonly
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput label='Start Date' value={workOrderTasks?.start_date} readonly />
                    </IonItem>
                    <IonItem>
                        <IonInput label='Completed Date' value={workOrderTasks.completed_date === null ? 'N/A' : workOrderTasks.completed_date} readonly />
                    </IonItem>
                    <IonButton
                        // onClick={() => setIsClicked(true)}
                        onClick={handleOpenModal}
                    // onClick={() => setIsClicked(prevState => !prevState)}
                    >
                        Modify
                        {/* {isClicked ? 'Save' : 'Modify'}
                        <IonIcon icon={isClicked ? saveOutline : pencilOutline} slot="end" /> */}
                        <IonIcon icon={pencilOutline} />
                    </IonButton>
                    {/* <IonButton
                        onClick={() => {
                            if (isClicked) {
                                saveData(); // Call saveData when the button text is "Save"
                            }
                            setIsClicked(prevState => !prevState); // Toggle the isClicked state
                        }}
                    >
                        {isClicked ? 'Save' : 'Modify'}
                        <IonIcon icon={isClicked ? saveOutline : pencilOutline} slot="end" />
                    </IonButton> */}
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
                        <IonTextarea label='Comment' placeholder='Type your comment here' autoGrow rows={4} name='comment' value={formHistory.comment}
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

            {/* {workOrderHistory &&
                <ModalComponent
                    ref={modal}
                    getModalContent={getModalContent}
                    title='History'
                    onClose={modal.current?.dismiss()}
                />} */}


            {/* <IonModal isOpen={isOpen}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Work Order Task History</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <p>
                        {getModalContent()}
                    </p>
                </IonContent>
            </IonModal> */}

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

            {/* {isClicked && (
                <ModalContainer
                    title="Update Task"
                    getModalContent={() => getContentModify(formData, setFormData, saveModifiedData, () => setIsClicked(false))}
                    isOpen={isClicked}
                    closeModal={() => setIsClicked(false)}
                />
            )} */}

        </MasterComponent>
    );
};

export default WorkOrderTasks;