import React, { useState } from 'react';
import {
  IonApp,
  IonPage,
  IonContent,
  IonButton,
  IonFooter,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { loginUser } from '../../api/api';
import BD from '../../assets/images/bdsf.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        // Save response data to localStorage
        localStorage.setItem('userData', JSON.stringify(response.data));

        // Navigate to the dashboard
        history.push('/dashboard');
      } else {
        setErrorMessage('Invalid credentials, please try again.');
      }
    } catch (error) {
      setErrorMessage('Error logging in. Please try again later.');
    }
    setIsLoading(false);
  };

  return (
    <IonApp>
      <IonPage className="ion-padding login-page">
        <IonContent forceOverscroll={false}>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: '80vh' }}
          >
            <div className="text-center mb-4">
              <i className="bx bx-globe text-primary" style={{ fontSize: '4em' }}></i>
              <h1 className="fw-bold text-primary">ISSPHERE</h1>
            </div>

            <div
              className="card p-4 shadow-lg"
              style={{
                maxWidth: '400px',
                width: '100%',
                background: 'rgba(207, 201, 201, 0.6)',
                borderRadius: '15px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              }}
            >
              <div className="mb-3 w-100">
                <label htmlFor="email" className="form-label" style={{ color: '#333333' }}>
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
                <label htmlFor="password" className="form-label" style={{ color: '#333333' }}>
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
                  color="dark"
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </IonButton>
              </div>
              {errorMessage && (
                <div className="alert alert-danger w-100 text-center">{errorMessage}</div>
              )}
            </div>
          </div>
        </IonContent>

        <IonFooter className="position-relative">
          <img
            src={BD}
            alt="Logo"
            style={{
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              height: 'auto',
              maxWidth: '520px',
              zIndex: '-1',
            }}
          />
        </IonFooter>
      </IonPage>
    </IonApp>
  );
};

export default Login;
