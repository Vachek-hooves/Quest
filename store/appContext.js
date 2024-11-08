import {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { quizData } from '../data/quizData';
import Toast from 'react-native-toast-message';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
    const [userMarkers, setUserMarkers] = useState([]);
    const [timedQuizState, setTimedQuizState] = useState({
        highScore: 0,        
        gamesPlayed: 0,
        bestTime: null,      
        lastPlayedDate: null,
        finalScores: [],
        totalScore: 0,
        averageScore: 0,
        monthlyHighScore: 0,
        weeklyHighScore: 0,
    });

    const [suddenDeathQuizState, setSuddenDeathQuizState] = useState({
        highScore: 0,        
        gamesPlayed: 0,
        bestStreak: 0,       
        lastPlayedDate: null,
        lives: 3,
        scoreMultiplier: 2,
        timedScoreBalance: 0,
        totalStreak: 0,
        averageStreak: 0,
        monthlyBestStreak: 0,
        weeklyBestStreak: 0,
    });

    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        loadUserMarkers();
        loadQuizStates();
        loadFavorites();
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
                    totalScore: 0,
                    averageScore: 0,
                    monthlyHighScore: 0,
                    weeklyHighScore: 0,
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
            
            newTimedState.gamesPlayed = (newTimedState.gamesPlayed || 0) + 1;
            newTimedState.totalScore = (newTimedState.totalScore || 0) + correctAnswers;
            
            newTimedState.averageScore = newTimedState.gamesPlayed > 0 
                ? newTimedState.totalScore / newTimedState.gamesPlayed 
                : 0;
            
            newTimedState.lastPlayedDate = new Date().toISOString();
            
            if (correctAnswers > (newTimedState.highScore || 0)) {
                newTimedState.highScore = correctAnswers;
                Toast.show({
                    type: 'success',
                    text1: 'New High Score!',
                    text2: `Congratulations! You scored ${correctAnswers} points!`,
                    position: 'top',
                    visibilityTime: 5000,
                    marginTop: 100,
                });
            }
            
            if (!newTimedState.bestTime || timePerQuestion < newTimedState.bestTime) {
                newTimedState.bestTime = timePerQuestion;
            }
            
            const currentDate = new Date();
            const lastPlayedDate = new Date(newTimedState.lastPlayedDate);
            const isThisWeek = currentDate - lastPlayedDate < 7 * 24 * 60 * 60 * 1000;
            const isThisMonth = currentDate.getMonth() === lastPlayedDate.getMonth();
            
            if (isThisWeek && correctAnswers > newTimedState.weeklyHighScore) {
                newTimedState.weeklyHighScore = correctAnswers;
            }
            
            if (isThisMonth && correctAnswers > newTimedState.monthlyHighScore) {
                newTimedState.monthlyHighScore = correctAnswers;
            }
            
            const finalScore = {
                score: correctAnswers,
                date: new Date().toISOString(),
                timePerQuestion
            };
            
            newTimedState.finalScores = [...(newTimedState.finalScores || []), finalScore]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            
            newSuddenState.timedScoreBalance = (newSuddenState.timedScoreBalance || 0) + correctAnswers;
            
            await AsyncStorage.setItem('timedQuizState', JSON.stringify(newTimedState));
            await AsyncStorage.setItem('suddenDeathQuizState', JSON.stringify(newSuddenState));
            setTimedQuizState(newTimedState);
            setSuddenDeathQuizState(newSuddenState);
        } catch (error) {
            console.error('Error updating timed quiz score:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update score',
                position: 'top',
                visibilityTime: 5000,
            });
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
                if (newState.lives === 0) {
                    newState.gamesPlayed = (newState.gamesPlayed || 0) + 1;
                    newState.totalStreak = (newState.totalStreak || 0) + (correctAnswers || 0);
                    
                    newState.averageStreak = newState.gamesPlayed > 0 
                        ? newState.totalStreak / newState.gamesPlayed 
                        : 0;
                    
                    if (correctAnswers > (newState.bestStreak || 0)) {
                        newState.bestStreak = correctAnswers;
                    }
                    
                    newState.lastPlayedDate = new Date().toISOString();
                }
            } else if (action === 'earn' && correctAnswers === 2) {
                // Add a life for every 2 correct answers
                newState.lives += 1;
            }
            
            await AsyncStorage.setItem('suddenDeathQuizState', JSON.stringify(newState));
            setSuddenDeathQuizState(newState);
        } catch (error) {
            console.error('Error updating lives:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update lives',
                position: 'top',
                visibilityTime: 5000,
            });
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

    const getGameStatistics = () => {
        return {
            timed: {
                gamesPlayed: timedQuizState.gamesPlayed || 0,
                highScore: timedQuizState.highScore || 0,
                averageScore: timedQuizState.gamesPlayed > 0 
                    ? Math.round((timedQuizState.totalScore / timedQuizState.gamesPlayed) * 10) / 10 
                    : 0,
                bestTime: timedQuizState.bestTime ? `${timedQuizState.bestTime.toFixed(1)}s` : 'N/A',
                lastPlayed: timedQuizState.lastPlayedDate 
                    ? new Date(timedQuizState.lastPlayedDate).toLocaleDateString() 
                    : 'Never',
                weeklyHighScore: timedQuizState.weeklyHighScore || 0,
                monthlyHighScore: timedQuizState.monthlyHighScore || 0,
            },
            suddenDeath: {
                gamesPlayed: suddenDeathQuizState.gamesPlayed || 0,
                highScore: suddenDeathQuizState.highScore || 0,
                bestStreak: suddenDeathQuizState.bestStreak || 0,
                averageStreak: suddenDeathQuizState.gamesPlayed > 0 
                    ? Math.round((suddenDeathQuizState.totalStreak / suddenDeathQuizState.gamesPlayed) * 10) / 10 
                    : 0,
                lastPlayed: suddenDeathQuizState.lastPlayedDate 
                    ? new Date(suddenDeathQuizState.lastPlayedDate).toLocaleDateString() 
                    : 'Never',
                weeklyBestStreak: suddenDeathQuizState.weeklyBestStreak || 0,
                monthlyBestStreak: suddenDeathQuizState.monthlyBestStreak || 0,
            }
        };
    };

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem('favorites');
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const toggleFavorite = async (place) => {
        try {
            const newFavorites = [...favorites];
            const index = newFavorites.findIndex(fav => 
                fav.id === place.id && 
                fav.location === place.location
            );

            if (index >= 0) {
                newFavorites.splice(index, 1);
                Toast.show({
                    type: 'success',
                    text1: 'Removed from favorites',
                    text2: `${place.location} was removed from your favorites`,
                    position: 'top',
                    visibilityTime: 5000,
                    marginTop: 100,
                });
            } else {
                newFavorites.push(place);
                Toast.show({
                    type: 'success',
                    text1: 'Added to favorites',
                    text2: `${place.location} was added to your favorites`,
                    position: 'top',
                    visibilityTime: 5000,
                    marginTop: 100,
                });
            }

            await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
            setFavorites(newFavorites);
        } catch (error) {
            console.error('Error updating favorites:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update favorites',
                position: 'top',
                visibilityTime: 5000,
                marginTop: 100,
            });
        }
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
        getGameStatistics,
        favorites,
        toggleFavorite,
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