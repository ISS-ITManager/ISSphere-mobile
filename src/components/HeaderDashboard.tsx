import React, { useState, useEffect } from "react";
import { IonText } from "@ionic/react";
import "./HeaderDashboard.css";
import coverImage from "../assets/images/abstract.png";

interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedDate = dateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="header-container"
      style={{
        backgroundImage: `url(${coverImage})`,
        backgroundSize: "150px",
        backgroundPosition: "right -5px top 50px",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="header-content">
        <div className="greeting-section">
          <IonText>
            <h2 className="greeting"> <b>{userName}</b></h2>
            <p className="date-time">{formattedDate}</p>
          </IonText>
        </div>
      </div>
    </div>
  );
};

export default Header;
