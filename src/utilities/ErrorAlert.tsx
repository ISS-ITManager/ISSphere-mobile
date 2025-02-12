import { useIonAlert } from "@ionic/react";

const useErrorAlert = () => {
  const [presentAlert] = useIonAlert();

  const showErrorAlert = (message: string) => {
    presentAlert({
      header: "Error",
      message: message || "An unexpected error occurred.",
      buttons: ["OK"],
    });
  };

  return showErrorAlert;
};

export default useErrorAlert;
