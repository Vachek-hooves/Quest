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
        finalScores: [],
    });

    const [suddenDeathQuizState, setSuddenDeathQuizState] = useState({
        highScore: 0,        
        gamesPlayed: 0,
        bestStreak: 0,       
        lastPlayedDate: null,
        lives: 3,
        scoreMultiplier: 2,
        timedScoreBalance: 0
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
                    finalScores: [],
                };
                await AsyncStorage.setItem('timedQuizState', JSON.stringify(initialTimedState));
                setTimedQuizState(initialTimedState);
            }

            // Load Sudden Death state with lives and multiplier
            const storedSudden = await AsyncStorage.getItem('suddenDeathQuizState');
            if (storedSudden) {
                const parsedState = JSON.parse(storedSudden);
                // Ensure lives and multiplier exist in stored state
                setSuddenDeathQuizState({
                    ...parsedState,
                    lives: parsedState.lives ?? 3,
                    scoreMultiplier: parsedState.scoreMultiplier ?? 2
                });
            } else {
                const initialSuddenState = {
                    highScore: 0,
                    gamesPlayed: 0,
                    bestStreak: 0,
                    lastPlayedDate: null,
                    lives: 3,
                    scoreMultiplier: 2
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
            const newTimedState = { ...timedQuizState };
            const newSuddenState = { ...suddenDeathQuizState };
            
            newTimedState.gamesPlayed += 1;
            
            // Store final score and update balance for sudden death
            const finalScore = {
                score: correctAnswers,
                date: new Date().toISOString(),
                timePerQuestion
            };
            newTimedState.finalScores = [...(newTimedState.finalScores || []), finalScore]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            
            // Ensure timedScoreBalance is a number
            newSuddenState.timedScoreBalance = (newSuddenState.timedScoreBalance || 0) + correctAnswers;
            
            if (correctAnswers > newTimedState.highScore) {
                newTimedState.highScore = correctAnswers;
            }
            
            if (!newTimedState.bestTime || timePerQuestion < newTimedState.bestTime) {
                newTimedState.bestTime = timePerQuestion;
            }
            
            newTimedState.lastPlayedDate = new Date().toISOString();
            
            await AsyncStorage.setItem('timedQuizState', JSON.stringify(newTimedState));
            await AsyncStorage.setItem('suddenDeathQuizState', JSON.stringify(newSuddenState));
            setTimedQuizState(newTimedState);
            setSuddenDeathQuizState(newSuddenState);
        } catch (error) {
            console.error('Error updating timed quiz score:', error);
        }
    };

    const convertScoreToLives = async (scoresToConvert) => {
        try {
            if (!scoresToConvert || isNaN(scoresToConvert)) {
                console.log('Invalid score to convert:', scoresToConvert);
                return 0;
            }

            const newState = { ...suddenDeathQuizState };
            const livesToAdd = Math.floor(scoresToConvert / 2); // 2 scores = 1 life
            const remainingScore = scoresToConvert % 2;
            
            if (livesToAdd > 0) {
                newState.lives = (newState.lives || 0) + livesToAdd;
                newState.timedScoreBalance = remainingScore;
                
                await AsyncStorage.setItem('suddenDeathQuizState', JSON.stringify(newState));
                setSuddenDeathQuizState(newState);
                
                return livesToAdd;
            }
            return 0;
        } catch (error) {
            console.error('Error converting score to lives:', error);
            return 0;
        }
    };

    const updateSuddenDeathLives = async (action, correctAnswers = 0) => {
        try {
            const newState = { ...suddenDeathQuizState };
            
            if (action === 'use' && newState.lives > 0) {
                newState.lives -= 1;
            } else if (action === 'earn' && correctAnswers === 2) {
                // Add a life for every 2 correct answers
                newState.lives += 1;
            }
            
            await AsyncStorage.setItem('suddenDeathQuizState', JSON.stringify(newState));
            setSuddenDeathQuizState(newState);
        } catch (error) {
            console.error('Error updating lives:', error);
        }
    };

    const resetSuddenDeathLives = async () => {
        try {
            const newState = { 
                ...suddenDeathQuizState,
                lives: 3 
            };
            await AsyncStorage.setItem('suddenDeathQuizState', JSON.stringify(newState));
            setSuddenDeathQuizState(newState);
        } catch (error) {
            console.error('Error resetting lives:', error);
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
        updateSuddenDeathLives,
        resetSuddenDeathLives,
        getRandomQuestions,
        convertScoreToLives,
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