import React, { createContext, useState, useContext } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

    const [urgentDays, setUrgentDays] = useState(1); // Default to 1 day

    return (
        <SettingsContext.Provider
            value={{
                urgentDays,
                setUrgentDays,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);