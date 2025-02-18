import React, { useState, useEffect } from "react";
import { IonHeader, IonText, IonToolbar, IonTitle, IonImg } from "@ionic/react";
import "./HeaderDashboard.css";
import coverImage from "../assets/images/abstract.png";
import logo from "../assets/images/sphere.png";
import { PartyPopper } from 'lucide-react';

interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  const [dateTime, setDateTime] = useState(new Date());
  const userData = JSON.parse(localStorage.getItem("userData"));
  const logoPath = userData?.user?.client?.logo_path;
  // console.log("userData: "+JSON.stringify(userData?.user?.client?.client));


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
    <div className="header-container">
      <div>
        <img src={logoPath || logo} className="logo-100" />
      </div>
      <div className="dashboard-container">
        <h3 className="greeting">
          <b>{userName}</b>
        </h3>
        <p className="org-name"> {userData?.user?.client?.client}</p>
        <p className="date-time">{formattedDate}</p>
      </div>
    </div>

  );
};

export default Header;
