import {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { quizData } from '../data/quizData';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
    const [userMarkers, setUserMarkers] = useState([]);
    const [timedQuizState, setTimedQuizState] = useState({
        highScore: 0,        
        gamesPlayed: 0,
        bestTime: null,      
        lastPlayedDate: null,
    });

    const [suddenDeathQuizState, setSuddenDeathQuizState] = useState({
        highScore: 0,        
        gamesPlayed: 0,
        bestStreak: 0,       
        lastPlayedDate: null,
    });

    useEffect(() => {
        loadUserMarkers();
        loadQuizStates();
    }, []);

    // User Markers functions
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
            const fileName = `marker_image_${Date.now()}.jpg`;
            const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
            await RNFS.copyFile(imageUri, destPath);
            return destPath;
        } catch (error) {
            console.error('Error saving image:', error);
            return null;
        }
    };

    const addUserMarker = async (newMarker) => {
        try {
            const savedImagePath = await saveImageToStorage(newMarker.image);
            if (!savedImagePath) {
                throw new Error('Failed to save image');
            }

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

    // Quiz States functions
    const loadQuizStates = async () => {
        try {
            // Load Timed Challenge state
            const storedTimed = await AsyncStorage.getItem('timedQuizState');
            if (storedTimed) {
                setTimedQuizState(JSON.parse(storedTimed));
            } else {
                const initialTimedState = {
                    highScore: 0,
                    gamesPlayed: 0,
                    bestTime: null,
                    lastPlayedDate: null,
                };
                await AsyncStorage.setItem('timedQuizState', JSON.stringify(initialTimedState));
                setTimedQuizState(initialTimedState);
            }

            // Load Sudden Death state
            const storedSudden = await AsyncStorage.getItem('suddenDeathQuizState');
            if (storedSudden) {
                setSuddenDeathQuizState(JSON.parse(storedSudden));
            } else {
                const initialSuddenState = {
                    highScore: 0,
                    gamesPlayed: 0,
                    bestStreak: 0,
                    lastPlayedDate: null,
                };
                await AsyncStorage.setItem('suddenDeathQuizState', JSON.stringify(initialSuddenState));
                setSuddenDeathQuizState(initialSuddenState);
            }
        } catch (error) {
            console.error('Error loading quiz states:', error);
        }
    };

    const updateTimedQuizScore = async (results) => {
        try {
            const { correctAnswers, timePerQuestion } = results;
            const newState = { ...timedQuizState };
            
            newState.gamesPlayed += 1;
            
            if (correctAnswers > newState.highScore) {
                newState.highScore = correctAnswers;
            }
            
            if (!newState.bestTime || timePerQuestion < newState.bestTime) {
                newState.bestTime = timePerQuestion;
            }
            
            newState.lastPlayedDate = new Date().toISOString();
            
            await AsyncStorage.setItem('timedQuizState', JSON.stringify(newState));
            setTimedQuizState(newState);
        } catch (error) {
            console.error('Error updating timed quiz score:', error);
        }
    };

    const updateSuddenDeathScore = async (results) => {
        try {
            const { streak } = results;
            const newState = { ...suddenDeathQuizState };
            
            newState.gamesPlayed += 1;
            
            if (streak > newState.highScore) {
                newState.highScore = streak;
            }
            
            if (streak > newState.bestStreak) {
                newState.bestStreak = streak;
            }
            
            newState.lastPlayedDate = new Date().toISOString();
            
            await AsyncStorage.setItem('suddenDeathQuizState', JSON.stringify(newState));
            setSuddenDeathQuizState(newState);
        } catch (error) {
            console.error('Error updating sudden death score:', error);
        }
    };

    const getRandomQuestions = (count = 10) => {
        const shuffled = [...quizData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const value = {
        userMarkers,
        addUserMarker,
        timedQuizState,
        suddenDeathQuizState,
        updateTimedQuizScore,
        updateSuddenDeathScore,
        getRandomQuestions,
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