import React from "react";
import { IonBadge } from "@ionic/react";
import {
  AiOutlineLock as LockOpen,
  AiOutlinePause as Pause,
} from "react-icons/ai"; // Example imports
import {
  FaHardHat as HardHat,
  FaCheck as Check,
  FaLock as Lock,
  FaTimes as X,
} from "react-icons/fa"; // Example imports
import { MdCheckCircle as CheckCheck } from "react-icons/md"; // Example imports

interface BadgeComponentProps {
  status: string;
}

const BadgeComponent: React.FC<BadgeComponentProps> = ({ status }) => {
  const statusStyles = {
    open: {
      color: "white",
      backgroundColor: "#fbbf24",
      icon: <LockOpen className="h-4 w-4" />,
    },
    new: {
      color: "white",
      backgroundColor: "#fbbf24",
      icon: <LockOpen className="h-4 w-4" />,
    },
    "in-progress": {
      color: "white",
      backgroundColor: "#3b82f6",
      icon: <HardHat className="h-4 w-4" />,
    },
    completed: {
      color: "white",
      backgroundColor: "#22c55e",
      icon: <Check className="h-4 w-4" />,
    },
    pending: {
      color: "white",
      backgroundColor: "#f97316",
      icon: <Pause className="h-4 w-4" />,
    },
    validated: {
      color: "white",
      backgroundColor: "#a855f7",
      icon: <CheckCheck className="h-4 w-4" />,
    },
    closed: {
      color: "white",
      backgroundColor: "#1c1917",
      icon: <Lock className="h-4 w-4" />,
    },
    cancelled: {
      color: "white",
      backgroundColor: "red",
      icon: <X className="h-4 w-4" />,
    },
  };

  const statusKey = status;
  const { color, backgroundColor, icon } =
    statusStyles[statusKey] || statusStyles.closed;

  return (
    <IonBadge
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "16px",
        padding: "10px 20px",
        borderRadius: "20px",
        fontWeight: "bold",
        marginBottom: "15px",
        color,
        backgroundColor,
      }}
    >
      {icon} {status && status.charAt(0).toUpperCase() + status.slice(1)}
    </IonBadge>
  );
};

export default BadgeComponent;
