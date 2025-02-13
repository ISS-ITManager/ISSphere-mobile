import { useEffect, } from 'react';
import { useHistory } from 'react-router-dom';
import { PushNotifications } from '@capacitor/push-notifications';

const NotificationListener = () => {
    const history = useHistory();

    useEffect(() => {
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received: ', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            const { id, reference_number } = JSON.parse(notification?.notification?.data?.work_order);
            if (id && reference_number) {
                console.log(`route to /work-orders/${id}`);
                // alert(`/work-orders/${id}`);
                try {
                    history.push(`/work-orders/${id}`);
                } catch (error) {
                    window.location.href = `/work-orders/${id}`;
                }
            }
        });

        return () => {
            PushNotifications.removeAllListeners();
        };
    }, [history]);

    return null;
};

export default NotificationListener;
