
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Bell } from 'lucide-react';
import Pusher from 'pusher-js';
import { useEffect, useRef } from 'react';
import { notificationApi } from '../api/api';
import InitializeEcho from './EchoInstance';

declare global {
    interface Window {
      Pusher: any;
    }
}

interface EchoStartParams {
    channel: string;   
    listener: string; 
}


const reverbHost = import.meta.env.VITE_API_REVERB_HOST;
const reverbPort = import.meta.env.VITE_API_REVERB_PORT;
const reverbKey = import.meta.env.VITE_API_REVERB_KEY;


const EchoStart = (param : EchoStartParams) => {
    
    const queryClient = useQueryClient();
    if (typeof window !== "undefined") {
        window.Pusher = Pusher;
    }
    
	const audioRef = useRef<HTMLAudioElement | null>(null);
	useEffect(() => {
		audioRef.current = new Audio("/sounds/pop.wav");
	}, []);
	
	const playSound = () => {
		const audio = new Audio("/sounds/pop.wav"); // Path to the sound file in the public folder
		audioRef.current?.play().catch((error) => {
			console.error("Audio playback failed:", error);
		});


	};

    const notifcationMutation = useMutation({
        mutationFn: (count: any) => notificationApi.get(count),
        onSuccess: (data) => {
            // toast.success(data.data.data.unread)
            alert(data.data.data.unread);
        },
    });

    const SetNotificationCount = () => {
        notifcationMutation.mutate(5);
    }

    
    const echo = InitializeEcho(reverbKey, reverbHost, reverbPort);
    
	useEffect(() => {
        echo.channel(param.channel)
        .listen(param.listener, (event) => {
            console.log('Received event:', event);
            // toast.success(event.notification.message, {
            //     position: "bottom-right",
            //     icon: <Bell className='h-4 w-4'/>,
            //     style: {
            //         backgroundColor: "#0C0A09", // Custom background color (green for success)
            //         color: "#ffffff", // Custom text color
            //     },
            // });
            alert(event.notification.message);
            
            if (Notification.permission !== "granted") {
                Notification.requestPermission().then(function (permission){
                    console.log(permission);
                })
            }
          

            SetNotificationCount();
            playSound();
        });
        return () => {
            echo.leaveChannel(param.channel);
        };  
    }, []);
    
}

export {
    EchoStart
}