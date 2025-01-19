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
} from "@ionic/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Header from "../../components/HeaderDashboard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  personCircleOutline,
  informationCircleOutline,
  calendarOutline,
  calendarClearOutline,
  checkmarkCircleOutline,
  briefcaseOutline,
} from "ionicons/icons";
import { getUserData, getWorkOrders } from "../../api/api";
import BadgeComponent from "../../utilities/badgecomponent";
import Loading from "../../utilities/loadingpage";
import "./dashboard.css";
import FloatingTabButtons from "../../components/FloatingButtons";

// Registering chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC<{ selectedTheme: string }> = ({ selectedTheme }) => {
  const [userData, setUserData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const history = useHistory();
  const [barColor, setBarColor] = useState("");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserData();
        setUserData(user);

        updateDateTime();
        const interval = setInterval(updateDateTime, 60000);

        const workOrdersData = await getWorkOrders(user.user.id);
        const workOrdersArray = workOrdersData.success
          ? workOrdersData.data.data
          : [];
        setWorkOrders(workOrdersArray);

        return () => clearInterval(interval); // Cleanup interval
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

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
          <h2 className="section-title">Work Orders Completed</h2>
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
          </IonCard>

          {/* Work Orders List */}
          <div className="work-orders-section">
            <h2 className="section-title">My Work Orders</h2>
            <IonList>
              {Array.isArray(workOrders) && workOrders.length === 0 ? (
                <IonText className="no-work-orders">
                  No work orders available
                </IonText>
              ) : (
                workOrders.map((order, index) => (
                  <IonCard
                    key={index}
                    className="minimal-work-order-card bounce-in-left"
                    onClick={() => history.push(`/work-orders/${order.id}`)}
                  >
                    <IonCardContent className="work-order-content">
                      {/* Header */}
                      <div className="work-order-header">
                        <h1 className="work-order-title">
                          <IonIcon
                            icon={briefcaseOutline}
                            className="icon-title"
                          />
                          {order.work_order_reference_number}
                        </h1>
                        <BadgeComponent status={order.status} />
                      </div>

                      {/* Details */}
                      <div className="work-order-grid">
                        <IonRow className="work-order-item">
                          {/* Start and End Dates in the same row */}
                          <IonCol size="auto">
                            <IonIcon icon={calendarOutline} className="icon" />
                            <span>
                              <strong>Start:</strong>{" "}
                              {new Date(order.start_date).toLocaleDateString(
                                "en-US"
                              )}
                            </span>
                          </IonCol>
                          <IonCol size="auto">
                            <IonIcon
                              icon={calendarClearOutline}
                              className="icon"
                            />
                            <span>
                              <strong>End:</strong>{" "}
                              {new Date(order.end_date).toLocaleDateString(
                                "en-US"
                              )}
                            </span>
                          </IonCol>
                        </IonRow>

                        <div className="work-order-item">
                          <IonRow className="work-order-item">
                            <IonCol size="auto">
                              <IonIcon
                                icon={informationCircleOutline}
                                className="icon"
                              />
                              <span>
                                {order.work_order_description ||
                                  "No Description"}
                              </span>
                            </IonCol>
                          </IonRow>
                        </div>
                      </div>
                    </IonCardContent>
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
