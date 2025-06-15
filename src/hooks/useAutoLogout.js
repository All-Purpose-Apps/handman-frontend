import { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';

const useAutoLogout = () => {
  const [timeoutMinutes, setTimeoutMinutes] = useState(() => {
    const stored = localStorage.getItem('timeoutMinutes');
    return stored ? parseInt(stored, 10) : 15;
  });
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const setTimeoutDuration = (minutes) => {
    setTimeoutMinutes(minutes);
    localStorage.setItem('timeoutMinutes', minutes);
  };

  useEffect(() => {
    const auth = getAuth();
    let timer;
    let countdownTrigger;
    let countdownInterval;

    const resetTimer = () => {
      clearTimeout(timer);
      clearTimeout(countdownTrigger);
      clearInterval(countdownInterval);
      setShowCountdown(false);

      // Trigger countdown dialog 2 minutes before logout
      countdownTrigger = setTimeout(() => {
        setCountdown(120);
        setShowCountdown(true);
        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, (timeoutMinutes - 2) * 60 * 1000);

      // Sign out after full timeout
      timer = setTimeout(() => {
        signOut(auth).then(() => {
          window.location.href = '/login';
        });
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'touchmove'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer on mount

    return () => {
      clearTimeout(timer);
      clearTimeout(countdownTrigger);
      clearInterval(countdownInterval);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMinutes]);

  return { showCountdown, countdown, timeoutMinutes, setTimeoutDuration };
};

export default useAutoLogout;
