import {StyleSheet, Text, View,ImageBackground} from 'react-native';
import React from 'react';

const StackLayout = ({children}) => {
  return (
    <ImageBackground
      source={require('../../assets/newBg/loader3.png')}
      style={styles.background}>
      {children}
    </ImageBackground>
  );
};

export default StackLayout;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
