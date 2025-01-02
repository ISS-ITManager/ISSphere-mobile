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
import Header from "../../components/Header";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  personCircleOutline,
  informationCircleOutline,
  calendarOutline,
  calendarClearOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { getUserData, getWorkOrders } from "../../api/api";
import BadgeComponent from "../../utilities/badgecomponent";

// Registering chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const history = useHistory();
  const OPEN = "open";
  const INPROGRESS = "in-progress";
  const COMPLETED = "completed";
  const CLOSED = "closed";
  const CANCELLED = "cancelled";
  const PENDING = "pending";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserData();
        setUserData(user);

        updateDateTime();
        const interval = setInterval(updateDateTime, 60000);

        const workOrdersData = await getWorkOrders(user.user.id);

        // Extract relevant data for work orders
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
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <IonSpinner name="bubbles" />
      </div>
    );
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
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 5,
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
    elements: { bar: { borderWidth: 0 } },
  };

  const categories = [
    { amount: "- $165", label: "Food" },
    { amount: "- $5600", label: "Furniture" },
    { amount: "- $2700", label: "Subscription" },
  ];

  return (
    <IonApp>
      <IonPage>
        <Header title="Dashboard" />
        <IonContent
          className="ion-padding"
          style={{ backgroundColor: "var(--ion-color-light)" }}
        >
          {/* User Information Card */}
          <IonCard
            className="ion-padding"
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              backgroundColor: "var(--ion-color-tertiary)",
            }}
          >
            <IonCardContent
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "12px",
              }}
            >
              <IonIcon
                icon={personCircleOutline}
                style={{
                  fontSize: "40px",
                  color: "var(--ion-color-secondary)",
                }}
              />
              <div>
                <h3
                  className="ion-margin-0"
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "var(--ion-color-dark)",
                  }}
                >
                  Hello, {userName}!
                </h3>
                <p
                  className="ion-text-muted ion-margin-top"
                  style={{
                    fontSize: "14px",
                    color: "var(--ion-color-secondary)",
                  }}
                >
                  {currentTime}
                </p>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Work Orders Chart */}
          <h2
            className="ion-no-margin ion-text-dark"
            style={{ fontSize: "24px", marginBottom: "15px" }}
          >
            Work Orders Completed
          </h2>
          <IonCard className="ion-padding" style={{ marginBottom: "20px" }}>
            <IonCardContent>
              <p
                className="ion-margin-top ion-text-muted"
                style={{ fontSize: "14px", marginBottom: "20px" }}
              >
                Weekly progress
              </p>
              <div style={{ marginTop: "20px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </IonCardContent>
          </IonCard>

          {/* Categories Section */}
          {/* <div className="ion-margin-top">
            <h2
              className="ion-no-margin ion-text-dark"
              style={{ fontSize: "24px", marginBottom: "15px" }}
            >
              Category
            </h2>
            <Swiper
              spaceBetween={10}
              slidesPerView="auto"
              style={{ paddingBottom: "20px", paddingLeft: "20px" }}
            >
              {categories.map((item, index) => (
                <SwiperSlide key={index} style={{ width: "auto" }}>
                  <IonCard
                    className="ion-padding ion-text-center"
                    style={{ maxWidth: "150px", margin: "0 auto" }}
                  >
                    <IonCardContent>
                      <p
                        className="ion-margin-0 ion-font-weight-bold"
                        style={{ fontSize: "18px" }}
                      >
                        {item.amount}
                      </p>
                      <p
                        className="ion-margin-0 ion-text-muted"
                        style={{ fontSize: "14px" }}
                      >
                        {item.label}
                      </p>
                    </IonCardContent>
                  </IonCard>
                </SwiperSlide>
              ))}
            </Swiper>
          </div> */}

          {/* Work Orders List */}
          <div className="ion-margin-top">
            <h2
              className="ion-no-margin ion-text-dark"
              style={{
                fontSize: "24px",
                marginBottom: "15px",
                // fontWeight: "600",
                color: "#333",
              }}
            >
              My Work Orders
            </h2>
            <IonList>
              {Array.isArray(workOrders) && workOrders.length === 0 ? (
                <IonText
                  color="medium"
                  style={{ fontSize: "16px", fontStyle: "italic" }}
                >
                  No work orders available
                </IonText>
              ) : (
                workOrders.map((order, index) => (
                  <IonCard
                    key={index}
                    className="ion-padding"
                    style={{
                      marginBottom: "15px",
                      borderRadius: "12px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    onClick={() => history.push(`/work-orders/${order.id}`)}
                  >
                    <IonCardContent style={{ padding: "20px" }}>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "var(--ion-color-dark)",
                        }}
                      >
                        {`Work Order: ${order.work_order_reference_number}`}
                      </h3>
                      <div className="ion-grid">
                        <div className="ion-row">
                          <div className="ion-col-6">
                            <p
                              style={{
                                fontSize: "14px",
                                color: "var(--ion-color-dark)",
                                marginTop: "10px",
                              }}
                            >
                              <IonIcon
                                icon={informationCircleOutline}
                                style={{ marginRight: "8px" }}
                              />
                              <strong>Description:</strong>{" "}
                              {order.work_order_description || "N/A"}
                            </p>
                            <p
                              style={{
                                fontSize: "14px",
                                color: "var(--ion-color-dark)",
                              }}
                            >
                              <IonIcon
                                icon={calendarOutline}
                                style={{ marginRight: "8px" }}
                              />
                              <strong>Start Date:</strong>{" "}
                              {new Date(order.start_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div className="ion-col-6">
                            <p
                              style={{
                                fontSize: "14px",
                                color: "var(--ion-color-dark)",
                              }}
                            >
                              <IonIcon
                                icon={calendarClearOutline}
                                style={{ marginRight: "8px" }}
                              />
                              <strong>End Date:</strong>{" "}
                              {new Date(order.end_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <p>
                              <BadgeComponent status={order.status} />
                            </p>
                          </div>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))
              )}
            </IonList>
          </div>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default Dashboard;
