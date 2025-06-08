import React, { createContext, useState, useContext, useMemo } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

    const [urgentDays, setUrgentDays] = useState(1); // Default to 1 day
    const contextValue = useMemo(() => ({
        urgentDays,
        setUrgentDays,
    }), [urgentDays]);
    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);