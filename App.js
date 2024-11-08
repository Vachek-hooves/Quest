import {AppProvider} from './store/appContext';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {UserScreen, MapScreen, QuizChooseScreen} from './screen/TabScreen';
import {TimeQuizScreen, SuddenQuizScreen} from './screen/StackScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator 
      screenOptions={({route}) => ({
        headerShown: false,
        animation: 'fade',
        animationDuration: 1000,
        tabBarStyle: {
          height:100,
          backgroundColor: '#1A1A1A',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 10,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={{ height: '100%' }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
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
            tabBarLabel: 'Profile'
          }}
        />
      <Tab.Screen 
        name="MapScreen" 
        component={MapScreen}
        options={{
          tabBarLabel: 'Map'
        }}
      />
      <Tab.Screen 
        name="QuizChooseScreen" 
        component={QuizChooseScreen}
        options={{
          tabBarLabel: 'Quiz'
        }}
      />
    </Tab.Navigator>
  );
};

function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right', animationDuration: 1000}}>
          <Stack.Screen name='TabNavigator' component={TabNavigator} />
          <Stack.Screen name='TimeQuizScreen' component={TimeQuizScreen} />
          <Stack.Screen name='SuddenQuizScreen' component={SuddenQuizScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

export default App;
