import { useEffect, useState, useRef } from "react";
import {
  IonCard,
  IonIcon,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonContent,
  IonSelect,
  IonSelectOption,
  IonDatetimeButton,
  IonDatetime,
  IonModal,
  IonPage,
  IonNote,
  IonRadioGroup,
  IonRadio,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router";
import MasterComponent from "../../components/MasterComponent";
import { caretForwardOutline, calendarOutline, filter, funnel } from "ionicons/icons";
import BadgeComponent from "../../utilities/badgecomponent";
import "./../dashboard/dashboard.css";
import { getWorkOrdersPaginate } from "../../api/api";
import "./workorderlist.css";
import ModalComponent1 from "../../components/ModalComponent1";
import HeaderComponent from "../../components/HeaderComponent";
import ScheduleCard from "../../components/ScheduleCard";


const WorkOrderList: React.FC = ({ title }) => {
  const history = useHistory();
  const location = useLocation();
  const { workOrdersLen } = location.state
    ? location.state
    : { workOrdersLen: 10 };


  const modal = useRef<HTMLIonModalElement>(null);

  const [workOrders, setWorkOrders] = useState();
  const [filteredWO, setFilteredWO] = useState();
  const [searchTerm, setSearchTerm] = useState();
  const [openFilter, setOpenFilter] = useState(false);
  const [searchStartDate, setSearchStartDate] = useState();
  const [searchEndDate, setSearchEndDate] = useState();
  const [searchStatus, setSearchStatus] = useState("");
  const [filteredCount, setFilteredCount] = useState(0);
  const [openSort, setOpenSort] = useState(false);

  const handleSearch = async (e) => {
    const val = (e.target as HTMLInputElement).value;
    setSearchTerm(val);

    if (val.trim() === "") {
      setFilteredWO(workOrders || []);
      setFilteredCount(workOrders?.length);
    } else {
      try {
        // Filter through requests and check multiple properties
        const filteredResults =
          workOrders && workOrders.length > 0
            ? workOrders?.filter(
              (item) =>
                item.work_order_reference_number
                  ?.toLowerCase()
                  .includes(val.toLowerCase()) ||
                item.work_order_description
                  ?.toLowerCase()
                  .includes(val.toLowerCase()) ||
                item.status?.toLowerCase().includes(val.toLowerCase()) ||
                item.property?.toLowerCase().includes(val.toLowerCase())
            )
            : [];

        // console.log("Filtered Results: ", filteredResults);

        // Set filtered results
        setFilteredWO(filteredResults);
        setFilteredCount(filteredResults?.length);
      } catch (error) {
        console.error("Error during search: ", error);
      }
    }
  };

  const handleSearchFilter = () => {
    let filteredResults = workOrders;
    if (searchStartDate && searchEndDate) {
      console.log(
        "searchStartDate: " +
        searchStartDate +
        " | searchEndDate: " +
        searchEndDate +
        " | searchStatus: " +
        searchStatus
      );

      filteredResults = workOrders?.filter(
        (item) =>
          new Date(item.start_date) >= new Date(searchStartDate) &&
          new Date(item.end_date) <= new Date(searchEndDate)
      );
    }
    if (searchStatus) {
      filteredResults = workOrders?.filter((item) =>
        item.status?.toLowerCase().includes(searchStatus.toLowerCase())
      );
    }
    setFilteredWO(filteredResults);
  };

  const handleSort = async (criteria) => {
    console.log("criteria: " + JSON.stringify(criteria));

    let filteredResults = workOrders;
    if (criteria) {
      if (criteria.key === 'start_date' || criteria.key === 'end_date') {
        if (criteria.key === 'start_date') {
          if (criteria.type === 'desc') {
            filteredResults = await workOrders?.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
          }
          else {
            filteredResults = await workOrders?.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
          }
        }
        else {
          if (criteria.type === 'desc') {
            filteredResults = await workOrders?.sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
          }
          else {
            filteredResults = await workOrders?.sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
          }
        }
      }
      else {
        if(criteria.key === 'work_order_description')
        {
          filteredResults = await workOrders?.sort((a,b) => String(a.work_order_description || "").localeCompare(b.work_order_description ))
        }
        if(criteria.key === 'work_order_reference_number')
        {
          filteredResults = await workOrders?.sort((a,b) => a.work_order_reference_number.localeCompare(b.work_order_reference_number))
        }
      }
    }

  }

  const fetchData = async () => {
    try {
      const req = await getWorkOrdersPaginate(workOrdersLen);
      // console.log("req: " + JSON.stringify(req.data.data));
      setWorkOrders(req.data.data);
      setFilteredWO(req.data.data);
      setFilteredCount(req?.data?.data?.length);
    } catch (error) {
      console.log("error on fetchData: " + JSON.stringify(error.message));
    }
  };

  const handleReset = () => {
    setSearchStatus("");
    setSearchStartDate(undefined);
    setSearchEndDate(undefined);
    setOpenFilter(false);
    setFilteredWO(workOrders);
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
        key: 'start_date',
        name: 'Start Date (ascending)',
        type: 'asc'
      },
      {
        key: 'start_date',
        name: 'Start Date (descending)',
        type: 'desc'
      },
      {
        key: 'end_date',
        name: 'End Date (ascending)',
        type: 'asc'
      },
      {
        key: 'end_date',
        name: 'End Date (descending)',
        type: 'desc'
      },
      {
        key: 'work_order_reference_number',
        name: 'Work Order #',
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
    fetchData();
  }, []);

  return (
    <MasterComponent title={"Work Order"} >
        <div forceOverscroll={false} scrollY={false}>
          <IonRow>
            <IonCol size="10">
              <IonSearchbar
                placeholder="Search "
                value={searchTerm}
                onIonInput={handleSearch}
              />
            </IonCol>
            <IonCol>
              <IonButton
                className="filter-button"
                onClick={() => setOpenFilter(true)}
              >
                <IonIcon icon={filter} />
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="row-container">
          <IonButton fill="clear" size="small" onClick={() => setOpenSort(true)}><IonIcon icon={funnel} /></IonButton>
          <IonNote ><small>{filteredCount} results</small></IonNote>
        </IonRow>
        </div>
        <div className="div-overflow">
          {filteredWO &&
            filteredWO?.length > 0 &&
            filteredWO?.map((item, index) => (
              <ScheduleCard
                style={{ animationDelay: `${index * 0.1}s` }}
                startTime={item.start_time}
                endTime={item.end_time}
                startDate={item.start_date}
                endDate={item.end_date}
                refNumber={item.work_order_reference_number}
                description={item.work_order_description}
                group={item.group}
                entity={item.entity}
                property={item.property}
                zone={item.zone}
                level={item.level}
                room={item.room}
                status={item.status}
                onClickCard={() => history.push(`/work-orders/${item.id}`)}
              />
            ))}
        </div>
        <ModalComponent1
          title={"Filter Work Order"}
          isOpen={openFilter}
          onClose={() => setOpenFilter(false)}
          getContentModal={modalContent}
        />
        <ModalComponent1
        title={"Sort Work Order by"}
        isOpen={openSort}
        onClose={() => setOpenSort(false)}
        getContentModal={modalContentSort}
      />
     </MasterComponent>
  );
};
export default WorkOrderList;
