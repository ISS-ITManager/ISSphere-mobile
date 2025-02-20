import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonGrid, IonIcon, IonContent, IonItem, IonLabel, IonList, IonPage, IonModal, IonRadio, IonRadioGroup, IonHeader, IonButtons, IonTextarea, IonDatetimeButton, IonDatetime, useIonToast, IonSelect, IonSelectOption, IonCol, IonRow, IonInput, IonText, IonNote, IonCheckbox, IonSearchbar, IonChip } from '@ionic/react';
import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router';
// import MasterComponent '../../components/MasterComponent';
import MasterComponent from '../../components/MasterComponent';
import { addOutline, saveOutline, checkmarkCircleOutline, closeCircleOutline, checkmarkOutline, closeOutline, navigateOutline, chevronForwardOutline, arrowBackOutline, arrowForwardOutline, fileTrayStackedOutline, funnel, filter } from 'ionicons/icons';

import { workOrderCategoryApi, workOrderTypeApi, entityApi, workOrderTaskHistoryApi, assigneeApi, groupApi, propertyApi, zoneApi, levelApi, roomApi, workOrderRequestApi } from '../../api/api';
import ModalComponent from '../../components/Modal';
import { formatDate, hasPermission } from '../../utilities/globalfns';
import ModalComponent1 from '../../components/ModalComponent1';


const WorkOrderRequestCreate: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const { formData } = location.state ? location.state : { formData: null };
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
    const [filteredCount, setFilteredCount] = useState(0);
    const [totalWOR, setTotalWOR] = useState(100);
    const [openSort, setOpenSort] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);
    const [searchStartDate, setSearchStartDate] = useState();
    const [searchEndDate, setSearchEndDate] = useState();
    const [searchStatus, setSearchStatus] = useState(); //accepted, new, declined
    const [searchPriority, setSearchPriority] = useState(); //low, med, high


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
        if (currentDescrp && selectedType && (selectedZone || selectedGroup || selectedProperty || selectedEntity || selectedRoom)) {
            try {
                let dataList = {
                    work_order_description: currentDescrp,
                    work_order_type: selectedType
                };
                if (selectedGroup) dataList.group = selectedGroup;
                if (selectedEntity) dataList.entity = selectedEntity;
                if (selectedZone) dataList.zone = selectedZone;
                if (selectedProperty) dataList.property = selectedProperty;
                if (selectedRoom) dataList.room = selectedRoom;

                console.log("dataList: " + JSON.stringify(dataList));

                const req = await workOrderRequestApi.store(dataList);
                console.log("workOrderRequestApi: " + JSON.stringify(req));

                clearFields();
            } catch (error) {

            }

            let req = await fetchWOR();
            if (req) {
                setOpenCreate(false);
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
        const req = await workOrderRequestApi.get(totalWOR); //.list();
        // console.log("req fetchWOR total: " + (req.data?.data?.total));
        setTotalWOR(req.data?.data?.total);
        setWorkOrderRequests(req.data.data.data);
        setFilteredWOR(req.data.data.data);
        setFilteredCount(req?.data?.data?.data?.length);
        return req.data.data.data;
    }

    // const fetchWORAll = async () => {
    //     if (totalWOR) {
    //         try {
    //             const req = await workOrderRequestApi.get(totalWOR);
    //             setTotalWOR(req.data?.data?.total);
    //             setWorkOrderRequests(req.data.data.data);
    //             setFilteredWOR(req.data.data.data);
    //             setFilteredCount(req?.data?.data?.data?.length);
    //             return req.data.data.data;
    //         } catch (error) {
    //             console.log("fetchWORAll error: " + JSON.stringify(error.message));

    //         }
    //     }

    // }

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
                <IonLabel>
                    <h2><b>Work Order Details</b></h2>
                </IonLabel>
                <IonCard className='task-card'>
                    <IonList>
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

                <IonLabel><h2><b>Location Details</b></h2></IonLabel>
                <IonCard className='task-card'>
                    <IonList>
                        <IonItem>
                            <IonLabel position="stacked">Group</IonLabel>
                            <IonSelect
                                className='ion-text-end'
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
                    disabled={!hasPermission("work-order-request.create")}
                    expand="block"
                    onClick={handleSaveWOReq}>
                    Save <IonIcon slot="start" icon={saveOutline} />
                </IonButton>
            </>
        )
    }

    const viewContent = (selectedRequest) => {
        return (
            <IonCard className="task-card animate__animated  animate__slideInUp" style={{ marginTop: '-10px' }}>
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
        let req = await fetchWOR();
        if (req) {
            setOpenCreate(false);
        }
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
                    console.error("Error saving remarks:", error.message);
                    // presentToast("Error saving remarks.");
                }
            } else {
                present({
                    message: "Please provide valid remarks.",
                    duration: 1500,
                    position: 'top',
                });
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
            await history.push({
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

    const handleReset = () => {
        setFilteredWOR(workOrderRequests);
        setFilteredCount(workOrderRequests?.length);
        setOpenFilter(false);
        setSearchStatus(undefined);
        setSearchPriority(undefined);
    }
    const handleSearch = async (e) => {
        const val = (e.target as HTMLInputElement).value;
        setSearchTerm(val);

        if (val.trim() === '') {
            setFilteredWOR(workOrderRequests || []);
            setFilteredCount(workOrderRequests?.length);
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
                setFilteredCount(filteredResults?.length);
            } catch (error) {
                console.error("Error during search: ", error);
            }
        }
    };

    const handleSort = async (criteria) => {
        let filteredResults = workOrderRequests;
        if(criteria)
        {
            if(criteria.key === 'requested_date')
            {
                if(criteria.type === 'desc')
                {
                    filteredResults = await workOrderRequests?.sort((a, b)=> new Date(b.requested_date) - new Date(a.requested_date))
                }
                else {
                    filteredResults = await workOrderRequests?.sort((a, b)=> new Date(a.requested_date) - new Date(b.requested_date))
                }
            }
            else{
                if(criteria.key === 'reference_number')
                {
                    filteredResults = await workOrderRequests?.sort((a,b) => String(a.reference_number || "").localeCompare(b.reference_number ))
                }
                if(criteria.key === 'work_order_description')
                {
                    filteredResults = await workOrderRequests?.sort((a,b) => String(a.work_order_description || "").localeCompare(b.work_order_description ));
                }
            }
        }
    }


    const handleSearchFilter = () => {
        let filteredResults = workOrderRequests;

        console.log("searchStatus: " + searchStatus + " | searchPriority:" + searchPriority + " |dateFrom: " + searchStartDate + " |dateTo: " + searchEndDate);




        if (searchStatus || searchPriority || searchStartDate || searchEndDate) {
            filteredResults = workOrderRequests?.filter((item) => 
            (
                // searchStatus && searchStatus!== undefined && 
                // String(item.is_accepted).localeCompare(searchStatus.toString())
                parseInt(item.is_accepted) === parseInt(searchStatus)
            )

            // {


            //     const matchesStatus =
            //         (searchStatus && searchStatus !== undefined)
            //             ? parseInt(item.is_accepted) === parseInt(searchStatus)
            //             : true;

            //     const matchesPriority =
            //         (searchPriority && searchPriority !== undefined)
            //             ? item?.priority?.includes(searchPriority)
            //             : true;

            //     const matchesDate = (searchStartDate && searchEndDate && searchStartDate !== undefined && searchEndDate !== undefined) ?
            //         (searchStartDate && searchStartDate ? (new Date(item?.requested_date) >= new Date(searchStartDate) &&
            //             new Date(item?.requested_date) <= new Date(searchEndDate)) : true) : true

            //     return matchesStatus && matchesPriority && matchesDate;
            // }

            );
        }
        else {
            filteredResults = workOrderRequests;
        }

        setFilteredWOR(filteredResults);
        setFilteredCount(filteredResults?.length);
    };

    const modalContent = () => {
        return (
            <IonContent>
                <IonItem>
                    <IonLabel>Status</IonLabel>
                    <IonSelect
                        label="Select Status"
                        value={searchStatus}
                        onIonChange={(e) => setSearchStatus(e.target.value)}
                    >
                        <IonSelectOption value={0}>New</IonSelectOption>
                        <IonSelectOption value={1}>Accepted</IonSelectOption>
                        <IonSelectOption value={2}>Declined</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel>Priority</IonLabel>
                    <IonSelect
                        label="Select Priority"
                        value={searchPriority}
                        onIonChange={(e) => setSearchPriority(e.target.value)}
                    >
                        <IonSelectOption value={"low"}>Low</IonSelectOption>
                        <IonSelectOption value={"medium"}>Medium</IonSelectOption>
                        <IonSelectOption value={"high"}>High</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel>Date From</IonLabel>
                    <IonDatetimeButton datetime="start-datetime" />
                    <IonModal keepContentsMounted={true}>
                        <IonDatetime
                            presentation="date"
                            id="start-datetime"
                            value={searchStartDate}
                            onIonChange={(e) => {
                                const selectedDate = e.detail.value?.split("T")[0];
                                setSearchStartDate(selectedDate);
                            }}
                        />
                    </IonModal>
                </IonItem>
                <IonItem>
                    <IonLabel>Date To</IonLabel>
                    <IonDatetimeButton datetime="end-datetime" />
                    <IonModal keepContentsMounted={true}>
                        <IonDatetime
                            presentation="date"
                            id="end-datetime"
                            value={searchEndDate}
                            onIonChange={(e) => {
                                const selectedDate = e.detail.value?.split("T")[0];
                                setSearchEndDate(selectedDate);
                            }}
                        />
                    </IonModal>
                </IonItem>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "1rem",
                    }}
                >
                    <IonButton fill="outline" onClick={() => handleReset()}>
                        Reset
                    </IonButton>
                    <IonButton
                        onClick={() => {
                            handleSearchFilter();
                            setOpenFilter(false);
                        }}
                    >
                        Apply
                    </IonButton>
                </div>
            </IonContent>
        );
    };

    const modalContentSort = () => {
        const items =
            [{
                key: 'requested_date',
                name: 'Requested Date (ascending)',
                type: 'asc'
            },
            {
                key: 'requested_date',
                name: 'Requested Date (descending)',
                type: 'desc'
            },
            {
                key: 'reference_number',
                name: 'Work Order Request #',
            },
            {
                key: 'work_order_description',
                name: 'Description',
            },
            ]
        return (
            <IonContent>
                <IonList>
                    <IonRadioGroup
                        onIonChange={(e) => {
                            setOpenSort(false);
                            handleSort(e.detail.value)
                            // console.log('Current value:', JSON.stringify(e.detail.value))
                        }}
                    >
                        {items.map((itm, index) => (
                            <IonItem key={index}>
                                <IonRadio key={index} value={itm}>{itm.name}</IonRadio>
                            </IonItem>
                        ))}
                    </IonRadioGroup>
                </IonList>
            </IonContent>
        )
    }

    useEffect(() => {
        fetchWOR();
        const state: any = history.location.state;
        if (formData || state?.formData) {
            console.log("from approvedPage: " + JSON.stringify(formData) + " | state: " + JSON.stringify(state?.formData));
            fetchWOR();
        }
    }, [location.state])

    return (
        <MasterComponent title={"Work Order Request"}>
            <IonRow>
                <IonCol size='8'>
                    <IonSearchbar
                        placeholder='Search'
                        value={searchTerm}
                        onIonInput={handleSearch}
                    />
                </IonCol>
                <IonCol >
                    <IonButton onClick={handleOpenCreate} size="default">
                        <IonIcon icon={addOutline} slot="start" />
                        Add
                    </IonButton>
                </IonCol>
            </IonRow>
            <IonRow className="row-container">
                <IonButton fill="clear" size='small' onClick={() => setOpenSort(true)}>
                    <IonIcon icon={funnel} slot="start" /> Sort
                </IonButton>
                <IonButton fill="clear" size='small' onClick={() => setOpenFilter(true)}>
                    <IonIcon icon={filter} slot="start" /> Filter
                </IonButton>
                <IonNote><small>{filteredCount} results </small></IonNote>
                {/* <IonLabel onClick={fetchWORAll}>See All</IonLabel> */}
            </IonRow>

            {/* Display Work Order Request details */}
            {!openCreate &&
                <IonList>
                    <div className='div-overflow'>
                        {filteredWOR.map((task, index) => (
                            <IonCard key={index} className="task-card minimal-work-order-card animate__animated animate__slideInUp"
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
                                            <IonButton color="primary"
                                                disabled={!hasPermission("work-order-request-schedule.create")}
                                                onClick={() => handleOpenApprove(task)}>
                                                <IonIcon icon={checkmarkOutline} />
                                                Accept</IonButton>
                                            <IonButton
                                                disabled={!hasPermission("work-order-request.decline")}
                                                color="danger"
                                                onClick={() => handleDecline(task)}>
                                                <IonIcon icon={closeOutline} />Decline</IonButton>
                                        </div>}
                                </IonCardContent>
                            </IonCard>
                        ))}
                        {/* <IonButton className='ion-padding' expand='block'>See All</IonButton> */}
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


            {/* sorting and filtering */}
            <ModalComponent1
                title={"Filter Work Order Request"}
                isOpen={openFilter}
                onClose={() => setOpenFilter(false)}
                getContentModal={modalContent}
            />
            <ModalComponent1
                title={"Sort Work Order Request by"}
                isOpen={openSort}
                onClose={() => setOpenSort(false)}
                getContentModal={modalContentSort}
            />
        </MasterComponent>
    )
}

export default WorkOrderRequestCreate;