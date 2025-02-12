import { Redirect, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { ModuleProvider } from "./utilities/ModuleProvider";

import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard/dashboard";
import Home from "./pages/Home";
import WorkOrder from "./pages/work-orders/workorder";
import Settings from "./utilities/settings";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import WorkOrderTasks from "./pages/work-orders/workordertasks";
import WorkOrderRequestCreate from "./pages/work-order-request/workorderRequestCreate";
import WorkOrderRequestApprove from "./pages/work-order-request/workorderRequestApprove";
import NotificationPage from "./pages/Notification";
import AccountPage from "./pages/Account";
import WorkOrderRequestView from "./pages/work-order-request/workorderRequestView";
import WorkOrderSLA from "./pages/work-orders/workordersla";
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import EchoInstance from "../src/utilities/EchoInstance";
import { EchoStart } from "./utilities/EchoHandler";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import WorkOrderList from "./pages/work-orders/workorderlist";

setupIonicReact();

const App: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState(
    localStorage.getItem("theme") || "default"
  );
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && savedTheme !== "default") {
      document.body.classList.add(savedTheme);
    }
  }, []);



  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Make Login the first page */}
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/dashboard">
            <Dashboard />
          </Route>
          <Route exact path="/work-orders/:id">
            <WorkOrder />
          </Route>
          <Route exact path="/workOrderlist">
            <WorkOrderList />
          </Route>
          <Route exact path="/viewWO">
            <WorkOrderTasks />
          </Route>
          <Route exact path="/createWOR">
            <WorkOrderRequestCreate />
          </Route>
          <Route exact path="/workOrderRequest/:id">
            <WorkOrderRequestView />
          </Route>
          <Route exact path="/approveWO">
            <WorkOrderRequestApprove />
          </Route>
          <Route exact path="/sla">
            <WorkOrderSLA />
          </Route>
          <Route exact path="/">
            {localStorage.getItem("userData") !== null ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
          </Route>
          <Route exact path="/notification">
            <NotificationPage />
          </Route>
          <Route exact path="/account">
            <AccountPage />
          </Route>

          {/* Make Login the first page */}
          <Route exact path="/settings">
            <Settings onThemeChange={setSelectedTheme} />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};
export default App;
