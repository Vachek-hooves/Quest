import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import TabLayout from '../../components/layout/TabLayout';

const QuizChooseScreen = () => {
  const navigation = useNavigation();
  const timerScaleAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createAnimation = (animatedValue) => {
      return Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
    };

    Animated.loop(createAnimation(timerScaleAnim)).start();
    
    // Slight delay for heart animation to create alternating effect
    setTimeout(() => {
      Animated.loop(createAnimation(heartScaleAnim)).start();
    }, 500);

    return () => {
      timerScaleAnim.setValue(1);
      heartScaleAnim.setValue(1);
    };
  }, []);

  return (
    <TabLayout>
    <View style={styles.container}>
      {/* <LinearGradient
        colors={['#1A1A1A', '#2A2A2A', '#AA8A1B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}> */}
        <View style={styles.content}>
          <LinearGradient
            colors={['#D4AF37', '#C5A028', '#AA8A1B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleContainer}>
            <Text style={styles.title}>Choose Quiz Mode</Text>
          </LinearGradient>
          
          {/* Timed Challenge Button */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('PlayQuizScreen', { mode: 'timed' })}
            style={styles.modeContainer}>
            <LinearGradient
              colors={['#D4AF37', '#C5A028', '#AA8A1B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modeGradient}>
              <View style={styles.modeContent}>
                <Text style={styles.modeName}>Timed Challenge</Text>
                <Text style={styles.modeDescription}>
                  Answer as many questions correctly as possible in 40 seconds
                </Text>
                <View style={styles.iconContainer}>
                  <Animated.View style={{ transform: [{ scale: timerScaleAnim }] }}>
                    <Icon 
                      name="timer-outline" 
                      size={40} 
                      color="#D4AF37" 
                    />
                  </Animated.View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Sudden Death Button */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('PlayQuizScreen', { mode: 'sudden-death' })}
            style={styles.modeContainer}>
            <LinearGradient
              colors={['#D4AF37', '#C5A028', '#AA8A1B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modeGradient}>
              <View style={styles.modeContent}>
                <Text style={styles.modeName}>Sudden Death</Text>
                <Text style={styles.modeDescription}>
                  Continue until your first incorrect answer
                </Text>
                <View style={styles.iconContainer}>
                  <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                    <Icon 
                      name="heart" 
                      size={40} 
                      color="#D4AF37" 
                    />
                  </Animated.View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      {/* </LinearGradient> */}
    </View></TabLayout>
  );
};

export default QuizChooseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#1A1A1A',
    
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modeContainer: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modeGradient: {
    padding: 3, // Slightly thicker border effect
  },
  modeContent: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)', // Subtle gold border
  },
  modeName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modeDescription: {
    fontSize: 16,
    color: '#E5E5E5',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)', // Subtle gold background
    borderRadius: 40,
    padding: 5,
  },
  lottieIcon: {
    width: '100%',
    height: '100%',
  },
});