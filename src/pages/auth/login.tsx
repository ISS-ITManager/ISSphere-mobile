import React, { useState, useEffect, useRef } from "react";
import {
  IonApp,
  IonPage,
  IonContent,
  IonButton,
  IonFooter,
  IonImg,
  IonIcon,
} from "@ionic/react";
import { PushNotifications } from "@capacitor/push-notifications";
import { useHistory } from "react-router-dom";
import { loginUser, permissionApi } from "../../api/api";
import BD from "../../assets/images/abstract.png";
import sphere from "../../assets/images/sphere.png";
import { arrowForwardOutline } from "ionicons/icons";
import ErrorPopup from "../../utilities/ErrorPopup"; // Adjust the path if needed
import "./login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const errorPopupRef = useRef<any>(null); // Ref for ErrorPopup

  const pushNotifs = async () => {
    PushNotifications.requestPermissions();
    PushNotifications.register();
    try {
      await PushNotifications.addListener("registration", (token) => {
        localStorage.setItem("device_token", token.value);
      });
    } catch {
      localStorage.setItem("device_token", "xx");
    }
  };

  useEffect(() => {
    pushNotifs();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (localStorage.getItem("device_token") === null) {
        pushNotifs();
      }
      const response = await loginUser(
        email,
        password,
        localStorage.getItem("device_token"),
        "android"
      );

      if (response.success) {
        const permissions = await permissionApi.permission();
        if (permissions) {
          localStorage.setItem("userData", JSON.stringify(response.data));
          localStorage.setItem(
            "userPermissions",
            JSON.stringify(permissions.data.data.permissions)
          );
          history.push("/dashboard");
        }
      } else {
        errorPopupRef.current?.showError(response.message || "Login failed.");

        if (response.errors) {
          const errorMessages = Object.values(response.errors)
            .flat()
            .join("\n");
          errorPopupRef.current?.showError(errorMessages);
        }
      }
    } catch (error: any) {
      if (error?.response?.data) {
        const { message, errors } = error.response.data;
        if (message) {
          errorPopupRef.current?.showError(message);
        }
        if (errors) {
          const errorMessages = Object.values(errors).flat().join("\n");
          errorPopupRef.current?.showError(errorMessages);
        }
      } else {
        errorPopupRef.current?.showError(
          "Error logging in. Please try again later."
        );
      }
    }
    setIsLoading(false);
  };

  return (
    <IonApp>
      <IonPage className="ion-padding login-page">
        <IonContent forceOverscroll={false}>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: "80vh" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <IonImg src={sphere} style={{ width: "60px" }} />
              <div>
                <h1 style={{ margin: 0, fontSize: "25px", fontWeight: "bold" }}>
                  ISSPHERE
                </h1>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#666" }}>
                  Facility Management
                </h3>
              </div>
            </div>

            <div
              className="card p-4 shadow-lg"
              style={{
                maxWidth: "400px",
                width: "100%",
                background: "rgba(207, 201, 201, 0.6)",
                borderRadius: "15px",
              }}
            >
              <div className="mb-3 w-100">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-pill"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3 w-100">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg rounded-pill"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-3 w-100">
                <IonButton
                  expand="block"
                  onClick={handleLogin}
                  shape="round"
                  size="large"
                  disabled={isLoading}
                  className="custom-login-button"
                >
                  {isLoading ? "Logging In..." : "Login"}
                  <IonIcon icon={arrowForwardOutline} />
                </IonButton>
              </div>
            </div>
          </div>
        </IonContent>

        <IonFooter>
          <img
            src={BD}
            alt="Logo"
            style={{
              position: "fixed",
              bottom: "-15px",
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: "520px",
              zIndex: "-1",
            }}
          />
        </IonFooter>

        {/* Error Popup Component */}
        <ErrorPopup ref={errorPopupRef} />
      </IonPage>
    </IonApp>
  );
};

export default Login;
