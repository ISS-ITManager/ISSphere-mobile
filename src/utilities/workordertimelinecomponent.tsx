import React, { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Check,
  CheckCheck,
  Clock,
  HardHat,
  Lock,
  LockOpen,
  Pause,
  User,
  X,
} from "lucide-react";
import { IonPopover } from "@ionic/react";
import { workOrderStatusApi } from "../api/api"; // Adjust the import path as needed

interface WorkOrderStatus {
  id: string;
  status: string;
  duration: number;
  first_name: string;
  last_name: string;
  date: string;
}

interface TimelineProps {
  workOrderId: string;
}

const Timeline: React.FC<TimelineProps> = ({ workOrderId }) => {
  const [workOrderStatuses, setWorkOrderStatuses] = useState<WorkOrderStatus[]>(
    []
  );
  const [totalStatus, setTotalStatus] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [popoverState, setPopoverState] = useState({
    isOpen: false,
    event: null,
    currentStatus: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWorkOrderStatuses = async () => {
      try {
        const response = await workOrderStatusApi.list(workOrderId);
        if (response && response.success && Array.isArray(response.data)) {
          setWorkOrderStatuses(response.data);
        } else {
          setWorkOrderStatuses([]);
        }
      } catch (error) {
        console.error("Error fetching work order statuses:", error);
        setWorkOrderStatuses([]);
      }
    };

    fetchWorkOrderStatuses();
  }, [workOrderId]);

  useEffect(() => {
    if (containerRef.current) {
      const initContainerWidth = containerRef.current.offsetWidth;
      const initStatusWidth = totalStatus * 25; // badge is 25px
      const valContainerWidth = initContainerWidth - initStatusWidth;
      setContainerWidth(valContainerWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [totalStatus]);

  useEffect(() => {
    setTotalDuration(
      workOrderStatuses.reduce((sum, item) => sum + Number(item.duration), 0)
    );
    setTotalStatus(workOrderStatuses.length);
  }, [workOrderStatuses]);

  const openPopover = (e: any, status: WorkOrderStatus) => {
    setPopoverState({
      isOpen: true,
      event: e.nativeEvent,
      currentStatus: status,
    });
  };

  const closePopover = () => {
    setPopoverState({ isOpen: false, event: null, currentStatus: null });
  };

  const icon = (status: string) => {
    switch (status) {
      case "cancelled":
        return <X strokeWidth="2" style={{ height: "15px", width: "15px" }} />;
      case "open":
        return (
          <LockOpen strokeWidth="2" style={{ height: "15px", width: "15px" }} />
        );
      case "pending":
        return (
          <Pause strokeWidth="2" style={{ height: "15px", width: "15px" }} />
        );
      case "in-progress":
        return (
          <HardHat strokeWidth="2" style={{ height: "15px", width: "15px" }} />
        );
      case "completed":
        return (
          <Check strokeWidth="2" style={{ height: "15px", width: "15px" }} />
        );
      case "validated":
        return (
          <CheckCheck strokeWidth="2" className="text-purple-500 h-4 w-4" />
        );
      case "closed":
        return (
          <Lock strokeWidth="2" style={{ height: "15px", width: "15px" }} />
        );
      default:
        return null;
    }
  };

  const bgColor = (status: string) => {
    switch (status) {
      case "cancelled":
        return "#EF4444";
      case "open":
        return "#EAB308";
      case "pending":
        return "#FB923C";
      case "in-progress":
        return "#3B82F6";
      case "completed":
        return "#22C55E";
      case "validated":
        return "#A855F7";
      case "closed":
        return "#27272A";
      default:
        return "";
    }
  };

  const computeWidth = (duration: number) => {
    const widthPercentage =
      totalDuration > 0 ? (duration / totalDuration) * 100 : 0;
    const widthInPx =
      widthPercentage > 0 ? (widthPercentage / 100) * containerWidth : 0;
    return Math.floor(widthInPx);
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        marginTop: "12px",
      }}
      ref={containerRef}
    >
      {workOrderStatuses.map((status) => (
        <div key={status.id} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              borderRadius: "8px",
              height: "25px",
              minWidth: "25px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: bgColor(status.status),
              color: "#ffffff",
              cursor: "pointer",
            }}
            id={`popover_${status.id}`}
          >
            {icon(status.status)}
          </div>
          <IonPopover trigger={`popover_${status.id}`}>
            <div style={{ padding: "12px", textAlign: "center" }}>
              {/* status as badge */}
              {status.status}
              {/* duration as hh:mm */}
              {status.duration}
              <small style={{ display: "flex", alignItems: "center" }}>
                <User
                  style={{
                    height: "12px",
                    width: "12px",
                    marginRight: "4px",
                    marginTop: "2px",
                  }}
                />
                {status?.first_name} {status?.last_name}
              </small>
              <small style={{ display: "flex", alignItems: "center" }}>
                <Calendar
                  style={{
                    height: "12px",
                    width: "12px",
                    marginRight: "4px",
                    marginTop: "2px",
                  }}
                />
                {status?.date}
              </small>
            </div>
          </IonPopover>
          <div
            style={{
              position: "relative",
              height: "8px",
              overflow: "hidden",
              padding: "0",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: bgColor(status.status),
                width: computeWidth(status.duration),
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
