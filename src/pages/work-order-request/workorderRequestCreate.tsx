import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonGrid, IonIcon, IonContent, IonItem, IonLabel, IonList, IonPage, IonModal, IonToolbar, IonTitle, IonHeader, IonButtons, IonTextarea, IonDatetimeButton, IonDatetime, useIonToast, IonSelect, IonSelectOption, IonCol, IonRow, IonInput, IonText, IonNote, IonCheckbox, IonSearchbar } from '@ionic/react';
import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router';
// import MasterComponent '../../components/MasterComponent';
import MasterComponent from '../../components/MasterComponent';
import { addOutline, saveOutline, checkmarkCircleOutline, closeCircleOutline, checkmarkOutline, closeOutline, navigateOutline, chevronForwardOutline, arrowBackOutline, arrowForwardOutline, fileTrayStackedOutline } from 'ionicons/icons';

import { workOrderCategoryApi, workOrderTypeApi, entityApi, workOrderTaskHistoryApi, assigneeApi, groupApi, propertyApi, zoneApi, levelApi, roomApi, workOrderRequestApi } from '../../api/api';
import ModalComponent from '../../components/Modal';
import { formatDate, presentToast } from '../../utilities/globalfns';
import ModalComponent1 from '../../components/ModalComponent1';


const WorkOrderRequestCreate: React.FC = () => {
    const history = useHistory();
    const [category, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [selectedEntity, setSelectedEntity] = useState<string>('');
    const [selectedProperty, setSelectedProperty] = useState<string>('');
    const [selectedZone, setSelectedZone] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [selectedRoom, setSelectedRoom] = useState<string>('');
    const [workOrderType, setWorkOrderType] = useState([]);
    const [locationGroup, setLocationGroup] = useState([]);
    const [locationEntity, setLocationEntity] = useState([]);
    const [locationProperty, setLocationProperty] = useState([]);
    const [locationZone, setLocationZone] = useState([]);
    const [locationLevel, setLocationLevel] = useState([]);
    const [locationRoom, setLocationRoom] = useState([]);
    const [currentDescrp, setCurrentDescrp] = useState<string>('');
    const [openCreate, setOpenCreate] = useState(false);
    const [openRequest, setOpenRequest] = useState(false);
    const [workOrderRequests, setWorkOrderRequests] = useState([]);
    const [filteredWOR, setFilteredWOR] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState();
    const [declineWO, setDeclineWO] = useState();
    const [openDecline, setOpenDecline] = useState(false);
    const [declineRemarks, setDeclineRemarks] = useState();
    const [searchTerm, setSearchTerm] = useState();


    const [present] = useIonToast();



    const fetchWOCategory = async () => {
        try {
            const req = await workOrderCategoryApi.list();
            // console.log("woCat: " + JSON.stringify(req));
            setCategory(req.data.data);

        } catch (error) {
            console.log("fetchWOCategory error: " + JSON.stringify(error));

        }

    }

    const fetchWOType = async (selectedCategory) => {
        if (selectedCategory) {
            try {
                const req = await workOrderTypeApi.list(selectedCategory);
                // console.log("fetchWOType: " + JSON.stringify(req));
                setWorkOrderType(req.data.data);

            } catch (error) {
                console.log("fetchWOType error : " + JSON.stringify(error));

            }
        }
    }

    const fetchGroup = async () => {
        try {
            const req = await groupApi.list();
            setLocationGroup(req.data.data);
            // console.log("groups:" + JSON.stringify(req.data.data));
        } catch (error) {
            console.log("fetchGroup error:" + JSON.stringify(error));

        }
    }

    const fetchEntity = async (selectedGroup) => {
        if (selectedGroup) {
            try {
                const req = await entityApi.list(selectedGroup);
                setLocationEntity(req.data.data);
                // console.log("fetchEntity:" + JSON.stringify(req.data.data));
            } catch (error) {

            }
        }
    }

    const fetchProperty = async (selectedEntity) => {
        if (selectedEntity) {
            try {
                const req = await propertyApi.list(selectedEntity);
                setLocationProperty(req.data.data)
                // console.log("fetchProperty:" + JSON.stringify(req.data.data));
            } catch (error) {

            }
        }
    }

    const fetchZone = async (selectedProperty) => {
        if (selectedProperty) {
            try {
                const req = await zoneApi.list(selectedProperty);
                setLocationZone(req.data.data);
                // console.log("fetchZone:" + JSON.stringify(req.data.data));
            } catch (error) {

            }
        }
    }

    const fetchLevel = async (selectedZone) => {
        if (selectedZone) {
            try {
                const req = await levelApi.list(selectedZone);
                setLocationLevel(req.data.data);
                // console.log("fetchLevel:" + JSON.stringify(req.data.data));
            } catch (error) {

            }
        }
    }

    const fetchRooms = async (selectedLevel) => {
        if (selectedLevel) {
            try {
                const req = await roomApi.list(selectedLevel);
                setLocationRoom(req.data.data);
                console.log("fetchRooms:" + JSON.stringify(req.data.data));
            } catch (error) {

            }
        }
    }

    const fetchRequestOrder = async (workOrderId) => {

        if (workOrderId) {
            try {
                const req = await workOrderRequestApi.show(workOrderId);
                setSelectedRequest(req.data.data);
                return req.data.data;
                // console.log("selectedRequest: " + +JSON.stringify(req.data.data));
            } catch (error) {
                console.log("fetchRequestOrder error: " + JSON.stringify(error));
            }
        }
    }

    const handleCategoryChange = async (e) => {
        setSelectedCategory(e.target.value);
        await fetchWOType(e.target.value);
    }

    const handleGroup = async (e) => {
        setSelectedGroup(e.target.value);
        await fetchEntity(e.target.value);
    }

    const handleEntity = async (e) => {
        setSelectedEntity(e.target.value);
        await fetchProperty(e.target.value);
    }

    const handleProperty = async (e) => {
        setSelectedProperty(e.target.value);
        await fetchZone(e.target.value);
    }

    const handleZone = async (e) => {
        setSelectedZone(e.target.value);
        await fetchLevel(e.target.value);
    }

    const handleLevel = async (e) => {
        setSelectedLevel(e.target.value);
        await fetchRooms(e.target.value);
    }

    const handleSaveWOReq = async () => {
        if (currentDescrp && selectedType && selectedZone) {
            try {
                const req = await workOrderRequestApi.store({ work_order_description: currentDescrp, work_order_type: selectedType, zone: selectedZone });
                console.log("workOrderRequestApi: " + JSON.stringify(req));
                present(req.data.message, 1500, top);
                clearFields();
                await fetchWOR();
                setOpenCreate(false);
            } catch (error) {

            }
        }
    }

    const handleOpenRequest = async (taskId) => {
        const requestedData = await fetchRequestOrder(taskId);
        // console.log("selectedRequest: " + JSON.stringify(selectedRequest));
        if (taskId && requestedData) {
            history.push(
                {
                    pathname: `/workOrderRequest/${taskId}`,
                    state: { selectedRequest: requestedData }
                }
            )
        }
    }

    const handleDecline = (wo) => {

        if (wo) {
            setDeclineWO(wo)
            setOpenDecline(true);
        }
    }

    const fetchWOR = async () => {
        const req = await workOrderRequestApi.list();
        // console.log("req: " + JSON.stringify(req.data.data));
        setWorkOrderRequests(req.data.data.data);
        setFilteredWOR(req.data.data.data);
    }

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

    const handleOpenCreate = () => {
        setOpenCreate(true);
        fetchWOCategory();
        fetchGroup();
    }

    const clearFields = () => {
        setSelectedCategory('');
        setSelectedType('');
        setCurrentDescrp('');
        setSelectedGroup('');
        setSelectedEntity('');
        setSelectedProperty('');
        setSelectedZone('');
        setSelectedLevel('');
        setSelectedRoom('');
    }


    const createContent = () => {
        return (
            <>
                <IonCard className='task-card'>
                    <IonList>
                        <IonItem lines='none'>
                            <IonLabel><h2><b>Work Order Details</b></h2></IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Work Order Category</IonLabel>
                            <IonSelect
                                name="workOrderCategory"
                                value={selectedCategory}
                                onIonChange={handleCategoryChange}
                                placeholder="Select category"
                            >
                                {category.map((cat, index) => (
                                    <IonSelectOption value={cat.id} key={index}>{cat.work_order_category}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Work Order Type</IonLabel>
                            <IonSelect
                                name="work_order_type"
                                value={selectedType}
                                onIonChange={(e) => setSelectedType(e.target.value)}
                                placeholder="Select type"
                            >
                                {workOrderType.map((wotype, index) => (
                                    <IonSelectOption value={wotype.id} key={index}>{wotype.work_order_type}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Description</IonLabel>
                            <IonTextarea
                                name="work_order_description"
                                value={currentDescrp}
                                onIonInput={(e) => setCurrentDescrp(e.target.value)}
                                placeholder="Enter description"
                                autoGrow
                            />
                        </IonItem>
                    </IonList>
                </IonCard>

                <IonCard className='task-card'>
                    <IonList>
                        <IonItem lines='none'>
                            <IonLabel><h2><b>Location Details</b></h2></IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Group</IonLabel>
                            <IonSelect
                                name="group"
                                value={selectedGroup}
                                onIonChange={handleGroup}
                                placeholder="Select group"
                            >
                                {locationGroup.map((group, index) => (
                                    <IonSelectOption value={group.id} key={index}>{group.country_code} - {group.group}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Entity</IonLabel>
                            <IonSelect
                                name="entity"
                                value={selectedEntity}
                                onIonChange={handleEntity}
                                placeholder="Select entity"
                            >

                                {locationEntity.map((ent, index) => (
                                    <IonSelectOption value={ent.id} key={index}>{ent.entity}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">Property</IonLabel>
                            <IonSelect
                                name="property"
                                value={selectedProperty}
                                onIonChange={handleProperty}
                                placeholder="Select property"
                            >
                                {locationProperty.map((property, index) => (
                                    <IonSelectOption value={property.id} key={index}>{property.property}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">Zone</IonLabel>
                            <IonSelect
                                name="zone"
                                value={selectedZone}
                                onIonChange={handleZone}
                                placeholder="Select zone"
                            >
                                {locationZone.map((zone, index) => (
                                    <IonSelectOption value={zone.id} key={index}>{zone.zone}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">Level</IonLabel>
                            <IonSelect
                                name="level"
                                value={selectedLevel}
                                onIonChange={handleLevel}
                                placeholder="Select level"
                            >
                                {locationLevel.map((level, index) => (
                                    <IonSelectOption value={level.id} key={index}>{level.level}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">Room</IonLabel>
                            <IonSelect
                                name="room"
                                value={selectedRoom}
                                onIonChange={(e) => setSelectedRoom(e.target.value)}
                                placeholder="Select room"
                            >
                                {locationRoom.map((room, index) => (
                                    <IonSelectOption value={room.id} key={index}>{room.room}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                    </IonList>
                </IonCard>

                <IonButton
                    expand="block"
                    onClick={handleSaveWOReq}>
                    Save <IonIcon slot="start" icon={saveOutline} />
                </IonButton>
            </>
        )
    }

    const viewContent = (selectedRequest) => {
        return (
            <IonCard className="task-card animate__animated  animate__pulse" style={{marginTop: '-10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginTop: '10px' }}>
                    <div>{getIsAcceptedColor(selectedRequest.work_order_request.is_accepted)}</div>
                    <div>{getPriority(selectedRequest.work_order_request.priority)}</div>
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
                        {formatDate(selectedRequest.work_order_request.requested_date)}
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
        )
    }

    const handleCloseCreateModal = async () => {
        setOpenCreate(false);
        await fetchWOR();
    }

    const handleCloseDeclineModal = async () => {
        setOpenDecline(false);
        setDeclineWO(null);
        setDeclineRemarks(null);
        await fetchWOR();
    };

    const declineContent = (reference_number, id, declineRemarks, setDeclineRemarks, closeDecline) => {
        const saveDeclineRemarks = async (id, remarks) => {
            if (id && remarks) {
                try {
                    console.log("ID:", id, "| Remarks:", remarks);

                    const req = await workOrderRequestApi.decline({ work_order_request: id, remarks });
                    closeDecline();
                } catch (error) {
                    console.error("Error saving remarks:", error);
                    presentToast("Error saving remarks.");
                }
            } else {
                presentToast("Please provide valid remarks.");
            }
        };

        return (
            <IonCard className="task-card bounce-in-right">
                <IonCardContent>
                    <IonLabel>Enter Remarks for {reference_number}</IonLabel>
                    <IonTextarea
                        placeholder="Type your comments here..."
                        value={declineRemarks}
                        onIonInput={(e) => setDeclineRemarks(e.target.value)}
                    ></IonTextarea>
                    <IonButton
                        expand="block"
                        onClick={() => saveDeclineRemarks(id, declineRemarks)}
                    >
                        Save <IonIcon slot="start" icon={saveOutline} />
                    </IonButton>
                </IonCardContent>
            </IonCard>
        );
    };

    const handleOpenApprove = async (workOrderRequest) => {

        const reqData = await fetchRequestOrder(workOrderRequest.id);
        // console.log("selectedRequest: "+JSON.stringify(selectedRequest));
        if (workOrderRequest && reqData) {
            history.push({
                pathname: '/approveWO',
                state: { workOrderRequest: reqData }
            });
        }
    }

    // useEffect(() => {
    //     if (selectedRequest && taskId) {
    //       // Only navigate if both state values are available
    //       history.push({
    //         pathname: `/approveWO`,
    //         state: { selectedRequest: selectedRequest },
    //       });
    //     }
    //   }, [selectedRequest, taskId, history]); 

    const handleSearch = async (e) => {
        const val = (e.target as HTMLInputElement).value;
        setSearchTerm(val);

        if (val.trim() === '') {
            setFilteredWOR(workOrderRequests || []);
        } else {
            try {
                // Filter through requests and check multiple properties
                const filteredResults = workOrderRequests && workOrderRequests.length > 0
                    ? workOrderRequests.filter((item) =>
                        item.reference_number?.toLowerCase().includes(val.toLowerCase()) ||
                        item.work_order_description?.toLowerCase().includes(val.toLowerCase()) ||
                        item.work_order_type?.toLowerCase().includes(val.toLowerCase()) ||
                        item.priority?.toLowerCase().includes(val.toLowerCase())
                    )
                    : [];

                console.log("Filtered Results: ", filteredResults);

                // Set filtered results
                setFilteredWOR(filteredResults);
            } catch (error) {
                console.error("Error during search: ", error);
            }
        }
    };


    useEffect(() => {
        fetchWOR();
    }, [])

    return (
        <MasterComponent title={"Work Order Request"}>
            <IonItem>
                {/* <IonLabel><h2><b>Work Order Requests List</b></h2></IonLabel> */}
                <IonSearchbar
                    placeholder='Search Work Order Request'
                    value={searchTerm}
                    onIonInput={handleSearch}
                />
                <IonButton onClick={handleOpenCreate}
                    size="default"
                    slot="end"
                >
                    <IonIcon icon={addOutline} slot="start" />
                    Add
                </IonButton>
            </IonItem>

            {/* Display Work Order Request details */}
            {!openCreate &&
                <IonList>
                    <div style={{ marginLeft: '-15px' }}>
                        {filteredWOR.map((task, index) => (
                            <IonCard key={index} className="task-card bounce-in-right"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginTop: '8px' }}>
                                    <div>{getIsAcceptedColor(task.is_accepted)}</div>
                                    <div>{getPriority(task.priority)}</div>
                                </div>
                                <IonCardHeader>
                                    <IonCardTitle
                                        onClick={() => handleOpenRequest(task.id)}>{task.reference_number}
                                    </IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <p> {task.work_order_description} </p>
                                    <IonCardSubtitle>{task.work_order_category} | {task.work_order_type}</IonCardSubtitle>
                                    {task.is_accepted === "0" &&
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                                            <IonButton color="primary" onClick={() => handleOpenApprove(task)}>
                                                <IonIcon icon={checkmarkOutline} />
                                                Accept</IonButton>
                                            <IonButton color="danger" onClick={() => handleDecline(task)}>
                                                <IonIcon icon={closeOutline} />Decline</IonButton>
                                        </div>}
                                </IonCardContent>
                            </IonCard>
                        ))}
                    </div>
                </IonList>
            }

            {/* Open Create Work Order */}
            {openCreate &&
                <ModalComponent1
                    title={"Add Work Order Request"}
                    isOpen={openCreate}
                    onClose={handleCloseCreateModal}
                    getContentModal={createContent}
                />
            }

            {/* Open Work Order Request */}
            {openRequest && selectedRequest?.work_order_request &&
                <>
                    <ModalComponent1
                        title={"View Work Order Request"}
                        isOpen={openRequest}
                        onClose={() => setOpenRequest(false)}
                        getContentModal={() => viewContent(selectedRequest)}
                    />
                </>
            }

            {/* Display Work Order Decline remarks */}
            {openDecline && declineWO &&
                <ModalComponent1
                    title={"Decline Work Order"}
                    isOpen={openDecline}
                    onClose={handleCloseDeclineModal}
                    getContentModal={() =>
                        declineContent(
                            declineWO.reference_number,
                            declineWO.id,
                            declineRemarks,
                            setDeclineRemarks,
                            handleCloseDeclineModal
                        )}
                />
            }

        </MasterComponent>
    )
}

export default WorkOrderRequestCreate;