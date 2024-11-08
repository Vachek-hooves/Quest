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

  const fadeAnim = useRef(new Animated.Value(1)).current;

  

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

  const handleAnswer = (selectedOption) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctOption;

    if (mode === 'sudden-death' && !isCorrect) {
      handleGameOver();
      return;
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
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

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (mode === 'sudden-death') {
        setQuestions(prev => [...prev, ...getRandomQuestions(10)]);
      }
    } else if (mode === 'timed') {
      // For timed mode, wrong answers don't end the game
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }
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
            <Icon 
              name="trophy-outline" 
              size={24} 
              color="#D4AF37" 
              style={styles.headerIcon}
            />
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
              <Text style={styles.timer}>{timeLeft}s</Text>
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

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(option)}
              disabled={gameOver}
            >
              <LinearGradient
                colors={['#D4AF37', '#C5A028']}
                style={styles.optionGradient}
              >
                <Text style={styles.optionText}>{option}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Game Over Modal */}
        {gameOver && (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>Game Over!</Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            <TouchableOpacity
              style={styles.playAgainButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.playAgainText}>Back to Menu</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverText: {
    fontSize: 32,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 30,
  },
  playAgainButton: {
    backgroundColor: '#D4AF37',
    padding: 15,
    borderRadius: 10,
  },
  playAgainText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlayQuizScreen;