import {AppProvider} from './store/appContext';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  UserScreen,
  MapScreen,
  QuizChooseScreen,
  FavoritePlaces,
} from './screen/TabScreen';
import {
  TimeQuizScreen,
  SuddenQuizScreen,
  PlayQuizScreen,
  FavoriteDetailsScreen,
  UserWelcomeScreen,
} from './screen/StackScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import {toastConfig} from './config/toastConfiguration';
import {TouchableOpacity,AppState} from 'react-native';
import {useState,useEffect} from 'react';
import {
  toggleBackgroundMusic,
  setupPlayer,
  pauseBackgroundMusic,
  playBackgroundMusic,
} from './config/backgroundSound';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [isPlaySound, setIsPlaySound] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && isPlaySound) {
        playBackgroundMusic();
      } else if (nextAppState === 'inactive' || nextAppState === 'background') {
        pauseBackgroundMusic();
      }
    });
    const initMusic = async () => {
      await setupPlayer();
      await playBackgroundMusic();
      setIsPlaySound(true);
    };
    initMusic();

    return () => {
      subscription.remove();
      pauseBackgroundMusic();
    };
  }, []);

  const soundToggle = () => {
    const updatedState = toggleBackgroundMusic();
    setIsPlaySound(updatedState);
  };
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        animation: 'fade',
        animationDuration: 1000,
        tabBarStyle: {
          height: 100,
          backgroundColor: '#1A1A1A',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 10,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={{height: '100%'}}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
          />
        ),
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'MapScreen') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'UserScreen') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'QuizChooseScreen') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'FavoritePlaces') {
            iconName = focused ? 'heart' : 'heart-outline';
          }

          return <Icon name={iconName} size={40} color={color} />;
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#888888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          paddingBottom: 5,
        },
        tabBarItemStyle: {
          padding: 5,
        },
      })}>
      <Tab.Screen
        name="UserScreen"
        component={UserScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen
        name="QuizChooseScreen"
        component={QuizChooseScreen}
        options={{
          tabBarLabel: 'Quiz',
        }}
      />
      <Tab.Screen
        name="FavoritePlaces"
        component={FavoritePlaces}
        options={{tabBarLabel: 'Favorites'}}
      />
      <Tab.Screen
        name=" "
        component={NoComponent}
        options={{
          tabBarIcon: () => (
            <TouchableOpacity onPress={soundToggle}>
              {isPlaySound ? (
                <Icon name="volume-high" size={40} color="gold" />
              ) : (
                <Icon name="volume-mute" size={40} color="gold" />
              )}
            </TouchableOpacity>
          ),
          tabBarLabel: 'Sound',
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '500',
            color: isPlaySound ? '#D4AF37' : '#888888',
          },
        }}
        listeners={{tabPress: e => e.preventDefault()}}
      />
    </Tab.Navigator>
  );
};

const NoComponent = () => null;

function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 1000,
          }}>
          <Stack.Screen name="UserWelcomePage" component={UserWelcomeScreen} />
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
          <Stack.Screen name="TimeQuizScreen" component={TimeQuizScreen} />
          <Stack.Screen name="SuddenQuizScreen" component={SuddenQuizScreen} />
          <Stack.Screen name="PlayQuizScreen" component={PlayQuizScreen} />
          <Stack.Screen
            name="FavoriteDetailsScreen"
            component={FavoriteDetailsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} position="top" topOffset={50} />
    </AppProvider>
  );
}

export default App;
