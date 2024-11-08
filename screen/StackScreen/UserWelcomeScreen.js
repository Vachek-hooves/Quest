import React, {useEffect, useRef} from 'react';
import {ImageBackground, StyleSheet, Text, View, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const UserWelcomeScreen = () => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to TabNavigator after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('TabNavigator');
    }, 4000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../../assets/image/welcomePage.png')}
      style={styles.background}
      resizeMode="cover">
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}>
        <Animated.View
          style={[
            styles.textContainer,
            {
              transform: [{translateY: slideAnim}],
              opacity: fadeAnim,
            },
          ]}>
          <LottieView
            source={require('../../assets/animation/welcome.json')}
            autoPlay
            style={styles.lottieWelcome}
            speed={0.6}
          />
          {/* <Text style={styles.welcomeText}>Welcome to</Text> */}
          <Text style={styles.titleText}>Adventure</Text>
          <Text style={styles.titleText}>Through</Text>
          <Text style={styles.titleTextHighlight}>Rhodes</Text>
          <Text style={styles.subtitleText}>
            Discover the beauty of ancient island
          </Text>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradient: {
    height: '60%',
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  textContainer: {
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  lottieWelcome: {
    width: 400,
    height: 300,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 56,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  titleTextHighlight: {
    color: '#D4AF37',
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 56,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
    marginTop: 20,
    letterSpacing: 1,
    opacity: 0.8,
  },
});

export default UserWelcomeScreen;
