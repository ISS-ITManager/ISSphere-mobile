import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonApp,
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonList,
  IonText,
  IonSpinner,
  IonRow,
  IonCol,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonChip,
  IonButton,
  IonGrid,
  IonBadge,
  IonInput,
} from "@ionic/react";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Header from "../../components/HeaderDashboard";
import {
  chevronForward,
  calendarOutline,
  caretForwardOutline,
  chevronDown,
  hourglassOutline,
  folderOpenOutline,
  briefcaseOutline,
  lockOpen,
  hourglass,
  close,
} from "ionicons/icons";

import { dashboardApi, getUserData, getWorkOrders, reportApi } from "../../api/api";
import BadgeComponent from "../../utilities/badgecomponent";
import Loading from "../../utilities/loadingpage";
import "./dashboard.css";
import FloatingTabButtons from "../../components/FloatingButtons";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import InitializeEcho from "../../utilities/EchoInstance";
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { formatDate, formatDateOnly, getCurrentMonthDates } from "../../utilities/globalfns";
import { Briefcase, CalendarHeart, PartyPopper } from "lucide-react";
import ScheduleCard from "../../components/ScheduleCard";

// Registering chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC<{ selectedTheme: string }> = ({ selectedTheme }) => {
  const [userData, setUserData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const history = useHistory();
  const [barColor, setBarColor] = useState("");
  const [pendingWOs, setPendingWOs] = useState(0);
  const [inprogressWOs, setInprogressWOs] = useState(0);
  const [aboutToBreachWOs, setAboutToBreachWOs] = useState(0);
  const [openWOs, setOpenWOs] = useState(0);
  const [closedWOs, setClosedWOs] = useState(0);
  const [workOrdersLen, setWorkOrdersLen] = useState(10);
  const [todayWOs, setTodayWOs] = useState();

  const safeStringify = (obj, space = 2) => {
    const cache = new Set();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (cache.has(value)) {
            return "[Circular]"; // Prevent circular references
          }
          cache.add(value);
        }
        return value;
      },
      space
    );
  };

  window.Pusher = Pusher;
  const handlePusher = () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.user?.client_id) {
      try {
        try {
          // const echo = InitializeEcho(import.meta.env.VITE_API_REVERB_KEY, import.meta.env.VITE_API_REVERB_HOST,import.meta.env.VITE_API_REVERB_PORT);
          const echo = InitializeEcho(
            import.meta.env.VITE_PROD_API_REVERB_KEY,
            import.meta.env.VITE_PROD_API_REVERB_HOST,
            import.meta.env.VITE_PROD_API_REVERB_PORT
          );

          // alert("echo: " + (echo));

          const channel = `view.work.order.status.update.${userData?.user?.client_id}`;

          echo.channel(channel).listen("UpdateWorkOrderStatus", (data) => {
            try {
              // Ensure that the event is properly serialized to avoid circular references
              const serializedEvent = JSON.parse(JSON.stringify(data));

              // alert('Received notification:' + serializedEvent);
              // alert('UpdateWorkOrderStatus: ' + safeStringify(data));

              LocalNotifications.schedule({
                notifications: [
                  {
                    title: "ISSphere",
                    body: serializedEvent,
                    id: Math.ceil(Math.random() * 100), // any random int
                    schedule: {
                      at: new Date(Date.now() + 5000),
                      allowWhileIdle: true,
                    },
                    ongoing: false,
                  },
                ],
              });

              // Handle push notification
            } catch (error) {
              console.error("Error processing the event:", error);
            }
          });
        } catch (error) {
          alert("error under new Echo: " + safeStringify(error));
        }
      } catch (error) {
        alert("Error initializing Echo: " + error.message);
      }
    }
  };

  useEffect(() => {
    // handlePusher();

    PushNotifications.addListener("registration", (token: Token) => {
      // console.log('token: ', token.value);
      localStorage.setItem("device_token", token.value);
    });

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        // alert(
        //   "pushNotificationActionPerformed: " +
        //     JSON.stringify(notification?.data)
        // );
      }
    );

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  // Update the date and time
  const updateDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentTime(now.toLocaleDateString("en-US", options));
  };

  // Get theme from localStorage initially
  const storedTheme = localStorage.getItem("theme") || "default";

  useEffect(() => {
    // Set bar color based on the theme
    const themeColors: Record<string, string> = {
      default: "#050594",
      "theme-dark": "#ff5722",
      "theme-green": "#4caf50",
      "theme-blue": "#2196f3",
    };

    // Apply the color based on the selected theme
    setBarColor(themeColors[storedTheme] || "#050594");

    // Set body class for the theme
    document.body.classList.remove("theme-dark", "theme-green", "theme-blue");
    if (storedTheme !== "default") {
      document.body.classList.add(storedTheme);
    }
  }, [storedTheme]); // Effect depends on the theme

  const getPendingWOs = async (client_id) => {
    if (client_id) {
      try {
        const req = await reportApi.workOrderPending({ client_id: client_id });
        // console.log("req: " + JSON.stringify(req));

        setInprogressWOs(req.data.data?.inprogress_work_orders);
        setOpenWOs(req.data.data?.open_work_orders);
        // setPendingWOs(parseInt(req.data.data?.open_work_orders) + parseInt(req.data.data?.inprogress_work_orders));
      } catch (error) {
        console.log("getPendingWOs error: " + JSON.stringify(error.message));
      }
    }
  };

  const getAboutToBreach = async (client_id) => {
    if (client_id) {
      try {
        const req = await reportApi.workOrderAboutToBreach({ client_id: client_id });
        // console.log("req: " + JSON.stringify(req));

        setAboutToBreachWOs(req.data.data);
        // setPendingWOs(parseInt(req.data.data?.open_work_orders) + parseInt(req.data.data?.inprogress_work_orders));
      } catch (error) {
        console.log("getPendingWOs error: " + JSON.stringify(error.message));
      }
    }
  };


  const getClosedWOs = async (client_id) => {
    if (client_id) {
      try {
        const { startOfMonth, currentDate } = getCurrentMonthDates(); //getCurrentMonthDates();
        const req = await reportApi.workOrderClosed({
          start_date: startOfMonth,
          end_date: currentDate,
          download: false,
          client_id: client_id,
        });
        setClosedWOs(req.data?.data);
        console.log("closedWOs: " + JSON.stringify(req.data?.data));

        // console.log("closedWOs: " + JSON.stringify(req.data?.data));
      } catch (error) {
        console.log("getClosedWOs error: " + JSON.stringify(error.message));
      }
    }
  };

  const fetchData = async () => {
    try {
      const user = await getUserData();
      setUserData(user);

      updateDateTime();
      const interval = setInterval(updateDateTime, 60000);

      const workOrdersData = await getWorkOrders(user.user.id);
      // console.log("workOrdersData: "+JSON.stringify(workOrdersData));

      const workOrdersArray = workOrdersData.success
        ? workOrdersData.data.data
        : [];

      // console.log("workOrdersArray: " + JSON.stringify(workOrdersArray));

      setWorkOrders(workOrdersArray);
      setWorkOrdersLen(workOrdersData.data.total);

      await getPendingWOs(user?.user?.client_id);
      await getClosedWOs(user?.user?.client_id);
      await getAboutToBreach(user?.user?.client_id);

      return () => clearInterval(interval); // Cleanup interval
    } catch (err) {
      setError("Failed to fetch data");
      localStorage.clear();
      history.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayWOs = async () => {
    try {
      const res = await dashboardApi.getTodayWO();
      setTodayWOs(res.data?.data?.today_work_orders);
    } catch (error) {
      setTodayWOs([]);
    }
  }
  useEffect(() => {
    fetchData();
    fetchTodayWOs();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <IonText color="danger">{error}</IonText>
      </div>
    );
  }

  const userName = `${userData.user.profile.first_name} ${userData.user.profile.last_name}`;

  // Chart data and configuration
  const chartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Work Orders Completed",
        data: [50, 70, 80, 60, 90, 40],
        // Alternate colors for each bar
        backgroundColor: barColor,
        borderRadius: [30, 30, 30, 30], // Fully rounded corners
        borderWidth: 0, // Border width
        barThickness: 20, // Set bar thickness (make it thinner)
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { display: false },
        beginAtZero: true,
        border: { display: false },
      },
    },
    elements: {
      bar: {
        borderWidth: 0, // Remove any borders around the bars
      },
    },
  };

  const openWOsData = {
    labels: [
      // 'Pending',
      "Open",
      "In-Progress",
    ],
    datasets: [
      {
        label: "Open Work Orders",
        data: [openWOs, inprogressWOs],
        backgroundColor: [
          // 'rgb(55,145,220)',
          "rgb(9,8,154)",
          "rgb(254,145,31)",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const handleSeeAllWOs = async () => {
    try {
      await fetchData();

      if (workOrders && workOrders !== undefined && workOrders?.length > 0) {
        history.push({
          pathname: "/workOrderlist",
          state: { workOrders: workOrders, workOrdersLen: workOrdersLen },
        });
      }
    } catch (error) {
      console.log("handleSeeAllWOs error:" + JSON.stringify(error.message));
    }
  };

  return (
    // <IonApp>
    <IonPage>
      <Header title="Dashboard" userName={userName} />

      {/* Overlapping Container Above the Header */}
      <div
        className="overlapping-container"
        style={{ borderTop: "5px solid var(--ion-color-primary)" }}
      >
      </div>
      <IonContent className="dashboard-content">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol className="ion-text-center" sizeMd="2">
              <IonCard className="dashboard-card task-card animate__animated animate__pulse">
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={hourglass} className="card-icon" />
                  <p className="card-title">In-Progress</p>
                  <h2 className="card-count">{inprogressWOs}</h2>
                </IonCardContent>
              </IonCard>
              {/* <IonCard style={{ borderRadius: '50px', height: '70px', width:'70px', alignItems:'center' }}>
                <IonCardContent>
                 <h1><b>{inprogressWOs}</b></h1>
                </IonCardContent>
              </IonCard>
              <IonLabel>In-Progress</IonLabel> */}
            </IonCol>
            <IonCol sizeMd="2">
              <IonCard className="dashboard-card task-card  animate__animated animate__pulse">
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={lockOpen} className="card-icon" />
                  <p className="card-title2">Open</p>
                  <h2 className="card-count">{openWOs}</h2>
                </IonCardContent>
              </IonCard>
               {/* <IonCard style={{ borderRadius: '50px', height: '70px', width:'70px', alignItems:'center' }}>
                <IonCardContent>
                 <h1><b>{openWOs}</b></h1>
                </IonCardContent>
              </IonCard>
              <IonLabel>Open</IonLabel> */}
            </IonCol>
            <IonCol sizeMd="2">
              <IonCard className="dashboard-card task-card  animate__animated animate__pulse">
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={close} className="card-icon" />
                  <p className="card-title" color="danger">
                    {" "}
                    About to Breach
                  </p>
                  <h2 className="card-count">{aboutToBreachWOs}</h2>
                </IonCardContent>
              </IonCard>
               {/* <IonCard style={{ borderRadius: '50px', height: '70px', width:'70px', alignItems:'center' }}>
                <IonCardContent>
                 <h1><b>{aboutToBreachWOs}</b></h1>
                </IonCardContent>
              </IonCard>
              <IonLabel>About to breach</IonLabel> */}
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Work Orders List */}
        {userData?.user?.is_assignee ?
          <IonList>
            <div className="see-all-div">
              <h2 className="section-title">
                My Work Orders
              </h2>
              <IonLabel onClick={() => handleSeeAllWOs()}>
                <b>See All </b>
                <IonIcon icon={chevronForward} />
              </IonLabel>
            </div>

            {Array.isArray(workOrders) && workOrders.length === 0 ? (
              <IonText className="no-work-orders ion-padding">
                No work orders available
              </IonText>
            ) : (
              workOrders
                .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                .map((order) => (
                  <ScheduleCard
                    startTime={order?.start_time}
                    endTime={order?.end_time}
                    startDate={order?.start_date}
                    endDate={order?.end_date}
                    refNumber={order?.work_order_reference_number}
                    description={order?.work_order_description}
                    status={order?.status}
                    group={order?.group}
                    entity={order?.entity}
                    property={order?.property}
                    zone={order?.zone}
                    level={order?.level}
                    room={order?.room}
                    onClickCard={() => history.push(`/work-orders/${order.id}`)}
                  />
                ))
            )}
            {workOrders && workOrders?.length >= 10 && (
              <IonButton
                className="ion-padding"
                onClick={handleSeeAllWOs}
                expand="block"
              >
                See All
              </IonButton>
            )}
          </IonList>
          :
          <IonList>
            <div className="see-all-div">
              <h2 className="section-title">
                Work Orders Today
              </h2>
              <IonLabel onClick={() => handleSeeAllWOs()}>
                <b>See All </b>
                <IonIcon icon={chevronForward} />
              </IonLabel>
            </div>
            {todayWOs && todayWOs?.length > 0 ?
              todayWOs?.map((item) => (
                <ScheduleCard
                  onClickCard={() => history.push(`/work-orders/${item.id}`)}
                  startDate={item.start_date}
                  endDate={item.end_date}
                  refNumber={item.reference_number}
                  status={item.status}
                />
              ))
              :
              <IonCard className="minimal-work-order-card">
                <IonCardHeader className="ion-text-center">
                  <IonCardTitle>
                    <CalendarHeart /> <small>No work orders scheduled today!</small>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="none">Click "See All" to track a Work Order.</IonItem>
                </IonCardContent>
              </IonCard>
            }
          </IonList>
        }

      </IonContent>
      {/* Floating Tab Buttons */}
      <FloatingTabButtons />
    </IonPage>
    // </IonApp>
  );
};

export default Dashboard;
