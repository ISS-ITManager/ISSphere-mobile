
import { useIonToast } from '@ionic/react';
export const formatDate = (apiDateString) => {
    const date = new Date(apiDateString);
    const options = {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    return date
        .toLocaleString('en-US', options)
        .replace(/,/, ','); // Replace only the first comma after the day

}



export const presentToast = (message) => {
    const [present] = useIonToast();
    present({
        message: message,
        duration: 1500,
        position: 'top'
    })
}