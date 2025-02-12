
import { useIonToast } from '@ionic/react';
import {
    notificationApi
} from '../api/api';
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

export const getNotificationCount = async () => {
    try {
        const req = await notificationApi.all();
        // console.log("count: "+JSON.stringify(req.data?.data?.unread));
        let ct = JSON.stringify(req.data?.data?.unread);
        return ct;
    } catch (error) {
        console.log("getNotificationCount: " + error);
        return 0;
    }
}

export const hasPermission = (permission) => {
    const permissions = localStorage.getItem("userPermissions");
    return permissions?.includes(permission);
}

export const getCurrentMonthDates = () => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return {
        startOfMonth: startOfMonth.toISOString().split('T')[0],  // "YYYY-MM-DD"
        currentDate: currentDate.toISOString().split('T')[0],    // "YYYY-MM-DD"
    };
}