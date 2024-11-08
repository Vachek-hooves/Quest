import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../store/appContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const PlayQuizScreen = ({ route, navigation }) => {
  const { mode } = route.params;
  const { 
    getRandomQuestions, 
    updateTimedQuizScore, 
    updateSuddenDeathScore 
  } = useAppContext();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40); // for timed mode
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

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
    setQuestions(getRandomQuestions(mode === 'timed' ? 20 : 50)); // More questions for sudden death
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
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswerCorrect = selectedOption === currentQuestion.correctOption;
    
    setSelectedAnswer(selectedOption);
    setIsCorrect(isAnswerCorrect);

    if (mode === 'sudden-death' && !isAnswerCorrect) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show feedback for 1 second
      handleGameOver();
      return;
    }

    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
      animateScoreIcon();
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Wait for feedback animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSelectedAnswer(null);
    setIsCorrect(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (mode === 'sudden-death') {
      setQuestions(prev => [...prev, ...getRandomQuestions(10)]);
    } else {
      handleGameOver();
    }
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
    } else {
      await updateSuddenDeathScore({ streak: score });
    }
  };

  if (!questions.length) return null;

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
          <Icon 
            name="arrow-back" 
            size={28} 
            color="#D4AF37"
          />
        </TouchableOpacity>

        {/* Updated Header */}
        <View style={styles.header}>
          <View style={styles.headerItem}>
            <Animated.View style={{ 
              transform: [{ scale: scoreIconScale }],
              marginRight: 8 
            }}>
              <Icon 
                name="trophy-outline" 
                size={24} 
                color="#D4AF37"
              />
            </Animated.View>
            <Text style={styles.score}>{score}</Text>
          </View>
          
          {mode === 'timed' && (
            <View style={styles.headerItem}>
              <Icon 
                name="timer-outline" 
                size={24} 
                color="#D4AF37" 
                style={styles.headerIcon}
              />
              <Text style={[
                styles.timer,
                timeLeft <= 10 && styles.timerWarning
              ]}>
                {timeLeft}s
              </Text>
            </View>
          )}
          {mode === 'sudden-death' && (
            <View style={styles.headerItem}>
              <Icon 
                name="heart" 
                size={24} 
                color="#D4AF37" 
                style={styles.headerIcon}
              />
              <Text style={styles.lives}>1</Text>
            </View>
          )}
        </View>

        {/* Question */}
        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.question}>{currentQuestion.question}</Text>
        </Animated.View>

        {/* Options with feedback */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(option)}
              disabled={gameOver || selectedAnswer !== null}
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

        {/* Updated Game Over Modal */}
        {gameOver && (
          <View style={styles.gameOverContainer}>
            <LinearGradient
              colors={['#2A2A2A', '#1A1A1A']}
              style={styles.gameOverContent}
            >
              <Text style={styles.gameOverText}>Game Over!</Text>
              
              <View style={styles.resultsContainer}>
                <View style={styles.resultItem}>
                  <Icon name="trophy-outline" size={30} color="#D4AF37" />
                  <Text style={styles.resultLabel}>Final Score</Text>
                  <Text style={styles.resultValue}>{score}</Text>
                </View>

                {mode === 'timed' && (
                  <View style={styles.resultItem}>
                    <Icon name="timer-outline" size={30} color="#D4AF37" />
                    <Text style={styles.resultLabel}>Time per Question</Text>
                    <Text style={styles.resultValue}>
                      {((Date.now() - startTime) / score / 1000).toFixed(1)}s
                    </Text>
                  </View>
                )}

                {mode === 'sudden-death' && (
                  <View style={styles.resultItem}>
                    <Icon name="trending-up" size={30} color="#D4AF37" />
                    <Text style={styles.resultLabel}>Best Streak</Text>
                    <Text style={styles.resultValue}>{score}</Text>
                  </View>
                )}
              </View>

              <View style={styles.gameOverButtons}>
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
        )}
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
  },
  resultsContainer: {
    width: '100%',
    marginVertical: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 20,
  },
  gameOverButton: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '60%',
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