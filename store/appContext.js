import {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
    const [userMarkers, setUserMarkers] = useState([]);

    // Load user markers from storage on app start
    useEffect(() => {
        loadUserMarkers();
    }, []);

    const loadUserMarkers = async () => {
        try {
            const stored = await AsyncStorage.getItem('userMarkers');
            if (stored) {
                setUserMarkers(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading markers:', error);
        }
    };

    const addUserMarker = async (newMarker) => {
        try {
            const updatedMarkers = [...userMarkers, newMarker];
            setUserMarkers(updatedMarkers);
            await AsyncStorage.setItem('userMarkers', JSON.stringify(updatedMarkers));
        } catch (error) {
            console.error('Error saving marker:', error);
        }
    };

    const value = {
        userMarkers,
        addUserMarker
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};       