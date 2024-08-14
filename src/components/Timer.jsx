import React, { useState, useEffect } from 'react';

const Timer = ({ isActive, onComplete, isPaused }) => {
    const [timeLeft, setTimeLeft] = useState(60); 
    const [isDelayed, setIsDelayed] = useState(true); 

    useEffect(() => {
        let delayTimer;
        let countdownTimer;

        if (isActive && timeLeft > 0 && isDelayed) {
            delayTimer = setTimeout(() => {
                setIsDelayed(false); 
            }, 0); 
        }

        if (isActive && !isDelayed && !isPaused) {
            countdownTimer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(countdownTimer);
                        if (onComplete) onComplete(); 
                        return 0; 
                    }
                    return prevTime - 1;
                });
            }, 1000); 
        }
        return () => {
            clearTimeout(delayTimer);
            clearInterval(countdownTimer);
        };
    }, [isActive, timeLeft, isDelayed, isPaused, onComplete]);

    return (
        <div>
            <h1 className='text-red-600 text-3xl'>
                {isDelayed ? "60" : (timeLeft > 0 ? timeLeft : "Time's up!")}
            </h1>
        </div>
    );
};

export default Timer;
