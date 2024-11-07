import {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

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

    const saveImageToStorage = async (imageUri) => {
        try {
            // Create a unique filename
            const fileName = `marker_image_${Date.now()}.jpg`;
            // Define the destination path in app's documents directory
            const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

            // Copy the image from temp location to permanent storage
            await RNFS.copyFile(imageUri, destPath);

            return destPath;
        } catch (error) {
            console.error('Error saving image:', error);
            return null;
        }
    };

    const addUserMarker = async (newMarker) => {
        try {
            // Save image to permanent storage
            const savedImagePath = await saveImageToStorage(newMarker.image);
            if (!savedImagePath) {
                throw new Error('Failed to save image');
            }

            // Create marker with permanent image path
            const markerToSave = {
                ...newMarker,
                image: savedImagePath
            };

            const updatedMarkers = [...userMarkers, markerToSave];
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