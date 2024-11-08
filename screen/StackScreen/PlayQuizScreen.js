import { StyleSheet, Text, View, TouchableOpacity, Animated, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../store/appContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const PlayQuizScreen = ({ route, navigation }) => {
  const { mode } = route.params;
  const { 
    getRandomQuestions, 
    updateTimedQuizScore, 
    updateSuddenDeathLives,
    suddenDeathQuizState,
    resetSuddenDeathLives,
    convertScoreToLives
  } = useAppContext();
  console.log(suddenDeathQuizState);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40); // for timed mode
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(0); // Track correct answers

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scoreIconScale = useRef(new Animated.Value(1)).current;

  const animateScoreIcon = () => {
    Animated.sequence([
      Animated.spring(scoreIconScale, {
        toValue: 1.7,
        duration: 200,
        useNativeDriver: true,
        friction: 3
      }),
      Animated.spring(scoreIconScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        friction: 3
      })
    ]).start();
  };

  useEffect(() => {
    setQuestions(getRandomQuestions(mode === 'timed' ? 20 : 50));
    if (mode === 'timed') {
      setStartTime(Date.now());
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, []);

  const handleAnswer = async (selectedOption) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswerCorrect = selectedOption === currentQuestion.correctOption;
    
    setSelectedAnswer(selectedOption);
    setIsCorrect(isAnswerCorrect);

    if (mode === 'sudden-death') {
      if (!isAnswerCorrect) {
        // Wrong answer handling
        if (suddenDeathQuizState.lives > 1) {
          // Still has lives left
          await updateSuddenDeathLives('use');
          setTimeout(() => {
            setSelectedAnswer(null);
            setIsCorrect(null);
            setCurrentQuestionIndex(prev => prev + 1);
          }, 1000);
        } else {
          // Last life lost - game over
          await updateSuddenDeathLives('use');
          setTimeout(() => {
            handleGameOver();
          }, 1000);
        }
        setCorrectStreak(0);
        return;
      } else {
        // Correct answer handling
        const newStreak = correctStreak + 1;
        setCorrectStreak(newStreak);
        if (newStreak % 2 === 0) {
          await updateSuddenDeathLives('earn', 2);
        }
      }
    }

    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
      animateScoreIcon();
    }

    // Wait for feedback animation
    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (mode === 'sudden-death') {
        setQuestions(prev => [...prev, ...getRandomQuestions(10)]);
      } else {
        handleGameOver();
      }
    }, 1000);
  };

  const getOptionStyle = (option) => {
    if (selectedAnswer !== option) return ['#D4AF37', '#C5A028'];
    return isCorrect ? 
      ['#4CAF50', '#45A049'] : // Green gradient for correct
      ['#FF4444', '#CC0000']; // Red gradient for wrong
  };

  const handleGameOver = async () => {
    setGameOver(true);
    if (mode === 'timed') {
      const timePerQuestion = (Date.now() - startTime) / score / 1000;
      await updateTimedQuizScore({ correctAnswers: score, timePerQuestion });
    }
  };

  const handleUseLife = async () => {
    await updateSuddenDeathLives('use');
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuestions(prev => [...prev, ...getRandomQuestions(10)]);
    }
  };

  const renderLives = () => {
    if (mode !== 'sudden-death') return null;
    
    return (
      <View style={styles.headerItem}>
        <Icon 
          name="heart" 
          size={24} 
          color="#D4AF37" 
          style={styles.headerIcon}
        />
        <Text style={styles.lives}>
          {suddenDeathQuizState.lives || 0}
        </Text>
      </View>
    );
  };

  // Add function to reset game state
  const resetGameState = () => {
    setGameOver(false);
    setScore(0);
    setCorrectStreak(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    const newQuestions = getRandomQuestions(50);
    setQuestions(newQuestions);
  };

  // Update the game over modal render
  const renderGameOver = () => {
    if (!gameOver) return null;

    return (
      <View style={styles.gameOverContainer}>
        <LinearGradient
          colors={['#2A2A2A', '#1A1A1A']}
          style={styles.gameOverContent}
        >
          <Text style={styles.gameOverTitle}>Game Over!</Text>
          
          <View style={styles.resultsContainer}>
            <View style={styles.resultItem}>
              <Icon name="trophy" size={24} color="#D4AF37" />
              <Text style={styles.resultLabel}>Final Score</Text>
              <Text style={styles.resultValue}>{score}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Icon name="trending-up" size={24} color="#D4AF37" />
              <Text style={styles.resultLabel}>Best Streak</Text>
              <Text style={styles.resultValue}>{correctStreak}</Text>
            </View>
          </View>

          <View style={styles.gameOverButtons}>
            {mode === 'sudden-death' && suddenDeathQuizState.timedScoreBalance >= 2 && (
              <TouchableOpacity
                style={styles.gameOverButton}
                onPress={async () => {
                  const livesAdded = await convertScoreToLives(suddenDeathQuizState.timedScoreBalance);
                  if (livesAdded > 0) {
                    Alert.alert(
                      'Lives Added', 
                      `Converted ${livesAdded * 2} scores to ${livesAdded} lives!`,
                      [
                        {
                          text: 'Continue Playing',
                          onPress: () => {
                            resetGameState();
                          }
                        }
                      ]
                    );
                  }
                }}
              >
                <LinearGradient
                  colors={['#D4AF37', '#C5A028']}
                  style={styles.gameOverButtonGradient}
                >
                  <Text style={styles.gameOverButtonText}>
                    Convert Score to Lives ({Math.floor(suddenDeathQuizState.timedScoreBalance / 2)} available)
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.gameOverButton}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={['#D4AF37', '#C5A028']}
                style={styles.gameOverButtonGradient}
              >
                <Text style={styles.gameOverButtonText}>Back to Menu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // Update the main render to ensure questions are available
  if (!questions.length || currentQuestionIndex >= questions.length) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={styles.gradient}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={28} color="#D4AF37" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerItem}>
            <Animated.View style={{ transform: [{ scale: scoreIconScale }] }}>
              <Icon name="trophy-outline" size={24} color="#D4AF37" />
            </Animated.View>
            <Text style={styles.score}>{score}</Text>
          </View>
          
          {mode === 'sudden-death' ? (
            <View style={styles.headerItem}>
              <Icon name="heart" size={24} color="#D4AF37" />
              <Text style={styles.lives}>{suddenDeathQuizState.lives}</Text>
            </View>
          ) : (
            <View style={styles.headerItem}>
              <Icon name="timer-outline" size={24} color="#D4AF37" />
              <Text style={[styles.timer, timeLeft <= 10 && styles.timerWarning]}>
                {timeLeft}s
              </Text>
            </View>
          )}
        </View>

        {/* Question and Options */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              <LinearGradient
                colors={getOptionStyle(option)}
                style={styles.optionGradient}
              >
                <Text style={styles.optionText}>{option}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {renderGameOver()}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  gradient: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 30
  },
  backButton: {
    position: 'absolute',
    // top: 50,
    // left: 20,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    zIndex: 1,
    bottom: 60,
    right:80
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
    marginTop: 40,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerIcon: {
    marginRight: 8,
  },
  score: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  timerWarning: {
    color: '#FF4444', // Red color for warning
    fontWeight: 'bold',
  },
  lives: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  question: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  optionGradient: {
    padding: 15,
  },
  optionText: {
    color: '#1A1A1A',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gameOverContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverContent: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: '#1A1A1A',
  },
  gameOverTitle: {
    fontSize: 28,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultsContainer: {
    width: '100%',
    marginVertical: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  resultLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 15,
    flex: 1,
  },
  resultValue: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  gameOverButtons: {
    width: '100%',
    gap: 15,
    marginTop: 20,
  },
  gameOverButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  gameOverButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  gameOverButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlayQuizScreen;