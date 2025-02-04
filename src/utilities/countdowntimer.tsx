import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ timeInMinutes }) => {
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60); // Convert minutes to seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  const formatTime = (timeInSeconds) => {
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return <span>{formatTime(timeLeft)}</span>;
};

export default CountdownTimer;
