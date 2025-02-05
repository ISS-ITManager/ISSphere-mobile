import { IonButton, IonIcon } from "@ionic/react";
import { useHistory } from "react-router"
import {chevronBackOutline} from 'ionicons/icons';

const BackButton = () => {
    const history = useHistory();

    const handleBackClick = () => {
        history.goBack();
    }
    return (
        <>

            {/* <button className='btn mt-2 btn-outline-primary
            btn-sm mt-1 rounded-pill' onClick={handleBackClick}>
                <i className='bx bx-chevron-left' ></i> Back
            </button> */}
            <IonButton onClick={handleBackClick} fill="clear" shape="round">
                <IonIcon icon={chevronBackOutline} /> Back
            </IonButton>
        </>
    )
}
export default BackButton;