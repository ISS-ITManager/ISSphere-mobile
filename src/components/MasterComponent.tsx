import { IonPage, IonContent } from "@ionic/react";
import { useState, useEffect } from "react";
import LoadingPage from "../utilities/loadingpage";
import HeaderComponent from "./HeaderComponent";
import Header from "./Header";

const MasterComponent = ({ children, title }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer); // Clean up timeout on unmount
  }, []);

  return (
    <IonPage>
      {/* <Header title={title} /> */}
      <HeaderComponent title={title} />
      <IonContent className="ion-padding">
        <div className="row">
          <div className="col-md-2 col-12"></div>
          <div className="col-md-8 col-12">
            {loading ? <LoadingPage /> : children}
          </div>
          <div className="col-md-2 col-12"></div>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default MasterComponent;
