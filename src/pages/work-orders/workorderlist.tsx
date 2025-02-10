import { useEffect, useState } from "react";
import { IonCard, IonIcon, IonCardHeader, IonCardTitle, IonChip, IonItem, IonLabel, IonList, IonSearchbar, IonText, IonGrid, IonRow, IonCol, IonButton, IonContent, IonSelect, IonSelectOption, IonDatetimeButton, IonDatetime, IonModal } from "@ionic/react";
import { useHistory, useLocation } from "react-router";
import MasterComponent from "../../components/MasterComponent";
import { caretForwardOutline, calendarOutline, filter } from "ionicons/icons";
import BadgeComponent from "../../utilities/badgecomponent";
import "./../dashboard/dashboard.css";
import { getWorkOrdersPaginate } from "../../api/api";
import './workorderlist.css';
import ModalComponent1 from "../../components/ModalComponent1";

const WorkOrderList: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const { workOrdersLen } = location.state ? location.state : { workOrdersLen: 10 };

    const [workOrders, setWorkOrders] = useState();
    const [filteredWO, setFilteredWO] = useState();
    const [searchTerm, setSearchTerm] = useState();
    const [openFilter, setOpenFilter] = useState(false);
    const [searchStartDate, setSearchStartDate] = useState();
    const [searchEndDate, setSearchEndDate] = useState();
    const [searchStatus, setSearchStatus] = useState('');

    const handleSearch = async (e) => {
        const val = (e.target as HTMLInputElement).value;
        setSearchTerm(val);

        if (val.trim() === '') {
            setFilteredWO(workOrders || []);
        } else {
            try {
                // Filter through requests and check multiple properties
                const filteredResults = workOrders && workOrders.length > 0
                    ? workOrders?.filter((item) =>
                        item.work_order_reference_number?.toLowerCase().includes(val.toLowerCase()) ||
                        item.work_order_description?.toLowerCase().includes(val.toLowerCase()) ||
                        item.status?.toLowerCase().includes(val.toLowerCase()) ||
                        item.property?.toLowerCase().includes(val.toLowerCase())
                    )
                    : [];

                console.log("Filtered Results: ", filteredResults);

                // Set filtered results
                setFilteredWO(filteredResults);
            } catch (error) {
                console.error("Error during search: ", error);
            }
        }
    };
    const handleSearchFilter = () => {

        let filteredResults = workOrders;
        if (searchStartDate && searchEndDate) {
            console.log("searchStartDate: " + searchStartDate + " | searchEndDate: " + searchEndDate + " | searchStatus: " + searchStatus);

            filteredResults = workOrders?.filter((item) => new Date(item.start_date) >= new Date(searchStartDate) && new Date(item.end_date) <= new Date(searchEndDate));
        }
        if (searchStatus) {
            filteredResults = workOrders?.filter((item) => item.status?.toLowerCase().includes(searchStatus.toLowerCase()));
        }
        setFilteredWO(filteredResults);
    }

    const fetchData = async () => {
        try {
            const req = await getWorkOrdersPaginate(workOrdersLen);
            // console.log("req: " + JSON.stringify(req.data.data));
            setWorkOrders(req.data.data);
            setFilteredWO(req.data.data);

        } catch (error) {
            console.log("error on fetchData: " + JSON.stringify(error.message));

        }
    }
 
    const handleReset=()=> {
        setSearchStatus('');
        setSearchStartDate(undefined);
        setSearchEndDate(undefined);
        setOpenFilter(false);
        setFilteredWO(workOrders);
    }

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
                        <IonSelectOption value={"open"}>Open</IonSelectOption>
                        <IonSelectOption value={"in-progress"}>In-Progress</IonSelectOption>
                        <IonSelectOption value={"pending"}>Pending</IonSelectOption>
                        <IonSelectOption value={"completed"}>Completed</IonSelectOption>
                        <IonSelectOption value={"closed"}>Closed</IonSelectOption>
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
                            onIonChange={(e) =>{
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
                            onIonChange={(e) =>{
                                const selectedDate = e.detail.value?.split("T")[0]; 
                                setSearchEndDate(selectedDate);
                              }}
                        />
                    </IonModal>
                </IonItem>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                    <IonButton fill="outline" onClick={()=> handleReset()}>Reset</IonButton>
                    <IonButton
                        onClick={() => { handleSearchFilter(); setOpenFilter(false) }}
                    >Apply</IonButton>
                </div>
            </IonContent>
        )
    }

    useEffect(() => {
        fetchData();

    }, [])

    return (
        <MasterComponent title={"Work Orders List"}>
            <div>
                <IonRow>
                    <IonCol size='9'>
                        <IonSearchbar
                            placeholder='Search here'
                            value={searchTerm}
                            onIonInput={handleSearch} />
                    </IonCol>
                    <IonCol>
                        <IonButton 
                            className="filter-button"
                            onClick={() => setOpenFilter(true)}>
                            <IonIcon icon={filter} />
                        </IonButton>
                    </IonCol>
                </IonRow>
            </div>
            <div className="div-overflow">
                {filteredWO && filteredWO?.length > 0 &&
                    filteredWO.map((item, index) => (
                        <IonCard key={index}
                            className="task-card bounce-in-right card-margin-top"
                            onClick={() => history.push(`/work-orders/${item.id}`)}
                            style={{ animationDelay: `${index * 0.1}s` }}>
                            <IonCardHeader>
                                <IonCardTitle>
                                    <div className="work-order-header icon-title">
                                        <IonLabel>{item.work_order_reference_number}</IonLabel>
                                        <BadgeComponent status={item.status} />
                                    </div>
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonItem>
                                <IonLabel><b>Description</b> </IonLabel>
                                <IonText className="ion-text-end">{item.work_order_description}</IonText>
                            </IonItem>
                            <IonItem lines="none">
                                <IonLabel><b>Schedule:</b></IonLabel>
                                <IonText>
                                    {item.end_date === item.start_date
                                        ? item.start_date
                                        : ` ${item.start_date} - ${item.end_date}`}
                                </IonText>
                            </IonItem>
                            <IonItem>
                                <IonLabel>
                                    <IonChip className="ion-text-uppercase" outline={true} color="warning">

                                        <IonIcon icon={calendarOutline} />
                                        <b>{item.day}</b>
                                    </IonChip>
                                </IonLabel>
                                <IonText className="ion-text-end">
                                    <b>{item.start_time} - {item.end_time}</b>
                                </IonText>
                            </IonItem>
                            <IonItem>
                                <IonLabel><b>Location: </b></IonLabel>
                                <IonText className='ion-text-end'>
                                    {item?.group}
                                    <IonIcon icon={caretForwardOutline} />
                                    {item?.entity}
                                    <IonIcon icon={caretForwardOutline} />
                                    {item?.property}
                                    <IonIcon icon={caretForwardOutline} />
                                    {item?.zone}
                                    <IonIcon icon={caretForwardOutline} />
                                    {item?.level}
                                    {<IonIcon icon={caretForwardOutline} /> &&
                                        item?.room}
                                </IonText>
                            </IonItem>
                        </IonCard>
                    ))
                }
            </div>
            <ModalComponent1 title={"Filter Work Order"}
                isOpen={openFilter}
                onClose={() => setOpenFilter(false)}
                getContentModal={modalContent}
            />
        </MasterComponent>
    )
}
export default WorkOrderList;