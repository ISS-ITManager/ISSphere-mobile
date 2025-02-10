import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: any;
  }
}

let echo: Echo | null = null;

const InitializeEcho = (reverbKey: string, reverbHost: string, reverbPort: string) => {
    if (!echo) {
        if (typeof window !== 'undefined') {
            window.Pusher = Pusher;
        }
        echo = new Echo({
            broadcaster: 'reverb',
            key: reverbKey,
            wsHost: reverbHost,
            wsPort: reverbPort,
            forceTLS: false,
            disableStats: true,
            enabledTransports: ['ws', 'wss'],
        });
    }
    return echo;
};

export default InitializeEcho;