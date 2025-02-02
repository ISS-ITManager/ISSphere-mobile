import React, { useState } from "react";
import {
  IonApp,
  IonPage,
  IonContent,
  IonButton,
  IonFooter,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonImg,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { loginUser, permissionApi } from "../../api/api";
import BD from "../../assets/images/abstract.png";//bdsf.png";
import sphere from "../../assets/images/sphere.png";
import { arrowForwardOutline } from 'ionicons/icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const history = useHistory();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      const permissions = await permissionApi.permission();


      if (response.success && permissions) {
        // Save response data to localStorage
        localStorage.setItem("userData", JSON.stringify(response.data));
        localStorage.setItem("userPermissions", JSON.stringify(permissions.data.data.permissions))

        // Navigate to the dashboard
        history.push("/dashboard");
      } else {
        setErrorMessage("Invalid credentials, please try again.");
      }
    } catch (error) {
      setErrorMessage("Error logging in. Please try again later."+error);
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
            {/* <div className="text-center mb-4">
              <IonImg src={sphere} style={{ width: '60px', marginLeft: '-40px' }} />
              <div>
                <h1 className="fw-bold text-color-primary">ISSPHERE</h1>
                <h3>Facility Management</h3>
              </div>
            </div> */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom:'20px' }}>
              <IonImg src={sphere} style={{ width: '60px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '25px', fontWeight: 'bold' }}>ISSPHERE</h1>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'normal', color: '#666' }}>Facility Management</h3>
              </div>
            </div>

            <div
              className="card p-4 shadow-lg"
              style={{
                maxWidth: "400px",
                width: "100%",
                background: "rgba(207, 201, 201, 0.6)",
                borderRadius: "15px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="mb-3 w-100">
                <label
                  htmlFor="email"
                  className="form-label"
                  style={{ color: "#333333" }}
                >
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
                <label
                  htmlFor="password"
                  className="form-label"
                  style={{ color: "#333333" }}
                >
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
                >
                  {isLoading ? "Logging In..." : "Login"}
                  <IonIcon icon={arrowForwardOutline} />
                </IonButton>
              </div>
              {errorMessage && (
                <div className="alert alert-danger w-100 text-center">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </IonContent>

        <IonFooter className="position-relative">
          <img
            src={BD}
            alt="Logo"
            style={{
              position: "fixed",
              bottom: "-15px",
              left: "50%",
              transform: "translateX(-50%)",
              height: "auto",
              maxWidth: "520px",
              zIndex: "-1",
            }}
          />
        </IonFooter>
      </IonPage>
    </IonApp>
  );
};

export default Login;
