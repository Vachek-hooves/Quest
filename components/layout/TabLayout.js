import {StyleSheet, Text, View,ImageBackground} from 'react-native';


const TabLayout = ({children}) => {
  
    return (
        <ImageBackground
          source={require('../../assets/newBg/loader3.png')}
          style={styles.background}>
          {children}
        </ImageBackground>
      );
  
}

export default TabLayout

const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
  });