import { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';

const useAutoLogout = (timeoutMinutes = 15) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    const auth = getAuth();
    let timer;
    let countdownInterval;

    const resetTimer = () => {
      clearTimeout(timer);
      setShowCountdown(false);
      setCountdown(120);
      timer = setTimeout(() => {
        signOut(auth).then(() => {
          window.location.href = '/login';
        });
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer on mount

    countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      setShowCountdown(true);
    }, (timeoutMinutes - 2) * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMinutes]);

  return { showCountdown, countdown };
};

export default useAutoLogout;
