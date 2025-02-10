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
  pauseOutline,
  lockOpen,
  hourglass,
} from "ionicons/icons";

import { getUserData, getWorkOrders, reportApi } from "../../api/api";
import BadgeComponent from "../../utilities/badgecomponent";
import Loading from "../../utilities/loadingpage";
import "./dashboard.css";
import FloatingTabButtons from "../../components/FloatingButtons";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { PushNotifications } from '@capacitor/push-notifications';
import InitializeEcho from "../../utilities/EchoInstance";
import { LocalNotifications } from "@capacitor/local-notifications";
import BadgeStatus from "../../utilities/BadgeStatus";

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
  const [openWOs, setOpenWOs] = useState(0);
  const [closedWOs, setClosedWOs] = useState(0);
  const [workOrdersLen, setWorkOrdersLen] = useState(10);

  const safeStringify = (obj, space = 2) => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return "[Circular]"; // Prevent circular references
        }
        cache.add(value);
      }
      return value;
    }, space);
  };

  window.Pusher = Pusher;
  const handlePusher = () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.user?.client_id) {
      try {

        try {

          // const echo = InitializeEcho(import.meta.env.VITE_API_REVERB_KEY, import.meta.env.VITE_API_REVERB_HOST,import.meta.env.VITE_API_REVERB_PORT);
          const echo = InitializeEcho(import.meta.env.VITE_PROD_API_REVERB_KEY, import.meta.env.VITE_PROD_API_REVERB_HOST, import.meta.env.VITE_PROD_API_REVERB_PORT);

          // alert("echo: " + (echo));

          const channel = `view.work.order.status.update.${userData?.user?.client_id}`;

          echo.channel(channel)
            .listen('UpdateWorkOrderStatus', (data) => {

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
                        allowWhileIdle: true
                      },
                      ongoing: false,
                    }
                  ]
                })



                // Handle push notification
              } catch (error) {
                console.error('Error processing the event:', error);
              }
            });
        }
        catch (error) {
          alert("error under new Echo: " + safeStringify(error))
        }


      } catch (error) {
        alert("Error initializing Echo: " + error.message);
      }
    }
  };

  useEffect(() => {
    // handlePusher();

    PushNotifications.addListener('registration',
      (token: Token) => {
        // console.log('token: ', token.value);
        localStorage.setItem('deviceToken', token.value);

      }
    );

    LocalNotifications.addListener('registration',
      (token: Token) => {
        // console.log('token: ', token.value);
        localStorage.setItem('deviceToken', token.value);

      }
    );


    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      alert("pushNotificationActionPerformed: " + JSON.stringify(notification?.data));

    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      alert("Notification: " + JSON.stringify(notification?.data));
    });

    return () => {
      PushNotifications.removeAllListeners();
    }
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
  function getCurrentMonthDates() {
    const currentDate = new Date();

    // Get the start date of the current month (set the day to 1)
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Return both the start of the month and the current date in "YYYY-MM-DD" format
    return {
      startOfMonth: startOfMonth.toISOString().split("T")[0], // "YYYY-MM-DD"
      currentDate: currentDate.toISOString().split("T")[0], // "YYYY-MM-DD"
    };
  }
  const getClosedWOs = async (client_id) => {
    if (client_id) {
      try {
        const { startOfMonth, currentDate } = getCurrentMonthDates();
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
  }


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

      return () => clearInterval(interval); // Cleanup interval
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

    datasets: [{
      label: 'Open Work Orders',
      data: [openWOs, inprogressWOs],
      backgroundColor: [
        // 'rgb(55,145,220)',
        'rgb(9,8,154)',
        'rgb(254,145,31)'
      ],
      hoverOffset: 4
    }]
  }

  const handleSeeAllWOs = async () => {
    try {
      await fetchData();      

      if (workOrders && workOrders !== undefined && workOrders?.length > 0) {

        history.push({
          pathname: '/workOrderlist',
          state: { workOrders: workOrders, workOrdersLen: workOrdersLen }
        })
      }
    }
    catch (error) {
      console.log("handleSeeAllWOs error:" + JSON.stringify(error.message));

    }
  }

  return (
    <IonApp>
      <IonPage>
        <Header title="Dashboard" userName={userName} />

        {/* Overlapping Container Above the Header */}
        <div
          className="overlapping-container"
          style={{ borderTop: "5px solid var(--ion-color-primary)" }}
        >
          {/* This container overlaps the bottom of the header */}
        </div>

        {/* IonContent (Content of the Page) */}
        <IonContent className="dashboard-content">
          {/* Work Orders Chart */}
          {/* <h2 className="section-title">Work Orders Completed</h2>
          <IonCard
            className="minimal-work-order-card fade-in"
            style={{ backgroundColor: "var(--ion-color-secondary)" }}
          >
            <IonCardContent>
              <p className="chart-description">Weekly progress</p>
              <div className="chart-container">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </IonCardContent>
          </IonCard> */}
          {(openWOs > 0 || pendingWOs > 0 || inprogressWOs > 0) && (


          {/* pending work orders */}
          {/* {(openWOs > 0 || pendingWOs > 0 || inprogressWOs > 0) &&

            <IonCard
              className="minimal-work-order-card fade-in"
              style={{ backgroundColor: "var(--ion-color-secondary)" }}
            >
              <IonCardContent>
                <p className="chart-description">
                  <b>Total Pending Work Orders</b>
                </p>
                <center>
                  <div className="chart-container">
                    <Pie data={openWOsData} />
                  </div>
                </center>
              </IonCardContent>
            </IonCard>

          )}
          } */}

          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol className="ion-text-center" sizeMd="3">
                {/* <IonCard
                  className="minimal-work-order-card fade-in"
                  style={{ backgroundColor: "var(--ion-color-secondary)" }}
                >
                  <IonCardHeader>
                    <div>
                      <IonIcon icon={hourglass} size="large" />
                      <span className="card-title">Total In-Progress Work Orders</span>
                    </div>
                  </IonCardHeader>

                  <div className="total-number-container">
                    <IonChip className="total-chip">
                      {inprogressWOs}
                    </IonChip>
                  </div>
                </IonCard> */}
                <IonCard className="dashboard-card task-card animate__animated animate__pulse">
                  <IonCardContent className="ion-text-center">
                    <IonIcon icon={hourglass} className="card-icon" />
                    <p className="card-title">
                      Total In-Progress Work Orders
                    </p>
                    <h2 className="card-count">
                      {inprogressWOs}
                    </h2>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol sizeMd="3">

                <IonCard className="dashboard-card task-card  animate__animated animate__pulse">
                  <IonCardContent className="ion-text-center">
                    <IonIcon icon={lockOpen} className="card-icon" />
                    <p className="card-title">Total Open Work Orders</p>
                    <h2 className="card-count">{openWOs}</h2>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Work Orders List */}
          <div>
            <IonList>

              <h2 className="section-title">
                {" "}
                {!userData?.user.is_assignee ? "" : "My "} Work Orders{" "}
                {`(${workOrders.length})`}
              </h2>

              <div className="see-all-div">
                <h2 className="section-title"> {!userData?.user.is_assignee ? "" : "My "} Work Orders {`(${workOrders.length})`}</h2>
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

                workOrders.map((order, index) => (
                  <IonCard
                    key={index}
                    className="ion-padding task-card minimal-work-order-card bounce-in-left "
                    onClick={() => history.push(`/work-orders/${order.id}`)}
                    style={{ marginLeft: "4%" }}
                  >
                    <IonCardHeader>
                      <IonCardTitle>
                        <div className="work-order-header">
                          {order.work_order_reference_number}
                          <BadgeComponent status={order.status} />
                        </div>
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonItem lines="none">
                      <IonLabel>
                        <b>Description:</b>
                      </IonLabel>
                      <IonText className="ion-text-end">
                        {order.work_order_description}
                      </IonText>
                    </IonItem>
                    <IonItem lines="none">
                      <IonLabel>
                        <b>Schedule:</b>
                      </IonLabel>
                      <IonText>
                        {order.end_date === order.start_date
                          ? order.start_date
                          : ` ${order.start_date} - ${order.end_date}`}
                      </IonText>
                    </IonItem>
                    <IonItem lines="none">
                      <IonLabel>
                        <IonChip
                          className="ion-text-uppercase"
                          outline={true}
                          color="warning"
                        >
                          <IonIcon icon={calendarOutline} />
                          <b>{order.day}</b>
                        </IonChip>
                      </IonLabel>
                      <IonText className="ion-text-end">
                        <b>
                          {order.start_time} - {order.end_time}
                        </b>
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <b>Location: </b>
                      </IonLabel>
                      <IonText className="ion-text-end">
                        {order?.group}
                        <IonIcon icon={caretForwardOutline} />
                        {order?.entity}
                        <IonIcon icon={caretForwardOutline} />
                        {order?.property}
                        <IonIcon icon={caretForwardOutline} />
                        {order?.zone}
                        <IonIcon icon={caretForwardOutline} />
                        {order?.level}
                        {<IonIcon icon={caretForwardOutline} /> && order?.room}
                      </IonText>
                    </IonItem>
                  </IonCard>
                ))

                workOrders
                  .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                  .map((order, index) => (
                    <IonCard
                      key={index}
                      className="ion-padding task-card minimal-work-order-card bounce-in-left "
                      onClick={() => history.push(`/work-orders/${order.id}`)}
                      style={{ marginLeft: '4%' }}
                    >
                      <IonCardHeader>
                        <IonCardTitle>
                          <div className="work-order-header">
                            {order.work_order_reference_number}
                            <BadgeComponent status={order.status} />
                          </div>
                        </IonCardTitle>
                      </IonCardHeader>
                      <IonItem lines="none">
                        <IonLabel><b>Description:</b></IonLabel>
                        <IonText className="ion-text-end">{order.work_order_description}</IonText>
                      </IonItem>
                      <IonItem lines="none">
                        <IonLabel><b>Schedule:</b></IonLabel>
                        <IonText>
                          {order.end_date === order.start_date
                            ? order.start_date
                            : ` ${order.start_date} - ${order.end_date}`}
                        </IonText>
                      </IonItem>
                      <IonItem lines="none" >
                        <IonLabel>
                          <IonChip className="ion-text-uppercase" outline={true} color="warning">

                            <IonIcon icon={calendarOutline} />
                            <b>{order.day}</b>
                          </IonChip>
                        </IonLabel>
                        <IonText className="ion-text-end">
                          <b>{order.start_time} - {order.end_time}</b>
                        </IonText>
                      </IonItem>
                      <IonItem>
                        <IonLabel><b>Location: </b></IonLabel>
                        <IonText className='ion-text-end'>
                          {order?.group}
                          <IonIcon icon={caretForwardOutline} />
                          {order?.entity}
                          <IonIcon icon={caretForwardOutline} />
                          {order?.property}
                          <IonIcon icon={caretForwardOutline} />
                          {order?.zone}
                          <IonIcon icon={caretForwardOutline} />
                          {order?.level}
                          {<IonIcon icon={caretForwardOutline} /> &&
                            order?.room}
                        </IonText>
                      </IonItem>
                    </IonCard>
                  ))
              )}
            </IonList>
          </div>
        </IonContent>
        {/* Floating Tab Buttons */}
        <FloatingTabButtons />
      </IonPage>
    </IonApp>
  );
};

export default Dashboard;
