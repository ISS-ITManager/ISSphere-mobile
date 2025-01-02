import React, { useEffect, useState } from "react";
import { IonContent, IonPage, IonIcon } from "@ionic/react";
import { personCircle, time, checkmarkCircle } from "ionicons/icons";

const hardcodedResponse = [
  {
    id: 1,
    status: "open",
    date: "2024-12-26 10:13:32",
    duration: 0,
    actual_time: 0,
    remarks: null,
    active: 0,
  },
  {
    id: 2,
    status: "in-progress",
    date: "2024-12-26 10:20:55",
    duration: 2,
    actual_time: 0,
    remarks: null,
    active: 0,
  },
  {
    id: 4,
    status: "completed",
    date: "2024-12-26 19:25:11",
    duration: 2,
    actual_time: 0,
    remarks: null,
    active: 1,
  },
];

const TimelineBar: React.FC = () => {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth - 40); // Adjust width for padding
    };

    // Set initial container width
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Calculate the total duration of the entire process
  const totalDuration = hardcodedResponse.reduce(
    (total, item) => total + item.duration,
    0
  );

  // Compute the width in px between each status and icon
  const computeWidth = (duration: number) => {
    const widthPercentage =
      totalDuration > 0 ? (duration / totalDuration) * 100 : 0;
    const widthInPx =
      widthPercentage > 0 ? (widthPercentage / 100) * containerWidth : 0; // Convert percentage to px
    return Math.floor(widthInPx);
  };

  const icons = {
    open: personCircle,
    "in-progress": time,
    completed: checkmarkCircle,
  };

  return (
    <IonPage>
      <IonContent>
        <div style={{ padding: "20px", display: "flex", alignItems: "center" }}>
          <div
            style={{
              position: "relative",
              height: "20px",
              width: "100%",
              backgroundColor: "#e0e0e0",
              borderRadius: "10px",
            }}
          >
            {hardcodedResponse.map((item, index) => {
              const leftPosition = hardcodedResponse
                .slice(0, index + 1)
                .reduce((sum, task) => sum + task.duration, 0);

              const width = computeWidth(item.duration);
              const position = (leftPosition / totalDuration) * 100;

              return (
                <div
                  key={item.id}
                  style={{
                    position: "absolute",
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                    textAlign: "center",
                  }}
                >
                  <IonIcon
                    icon={icons[item.status]}
                    style={{
                      fontSize: "30px",
                      color:
                        item.status === "open"
                          ? "#d9534f"
                          : item.status === "in-progress"
                          ? "#f0ad4e"
                          : "#5bc0de",
                    }}
                  />
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TimelineBar;
