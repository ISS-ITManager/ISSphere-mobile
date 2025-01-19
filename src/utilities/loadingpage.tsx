import React from "react";
import Icon from "../assets/images/repair.gif";

const LoadingPage: React.FC = () => {
  const styles = {
    overlay: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.6)", // Semi-transparent white background to show content behind
      zIndex: 9999, // Ensure it appears on top of other elements
      pointerEvents: "none", // Optional: allows interaction with elements behind the overlay
    },
    modal: {
      width: "250px", // Set a smaller width
      height: "auto", // Allow height to adjust automatically
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    gif: {
      width: "80px", // Icon size
      height: "80px",
      marginBottom: "10px", // Space between icon and text
    },
    text: {
      fontSize: "16px", // Text size
      color: "#333", // Dark text color
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <img src={Icon} alt="Loading animation" style={styles.gif} />
        {/* <p style={styles.text}>loading... Please wait</p> */}
      </div>
    </div>
  );
};

export default LoadingPage;
