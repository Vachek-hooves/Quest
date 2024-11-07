import {AppProvider} from './store/appContext';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {UserScreen,MapScreen,QuizChooseScreen} from './screen/TabScreen';
import {TimeQuizScreen,SuddenQuizScreen} from './screen/StackScreen';
const Stack=createNativeStackNavigator();
const Tab=createBottomTabNavigator();

const TabNavigator=()=>{
  return (
    <Tab.Navigator screenOptions={{headerShown:false,animation:'fade',animationDuration:1000}}>
      <Tab.Screen name="MapScreen" component={MapScreen} />
      <Tab.Screen name="UserScreen" component={UserScreen} />
      <Tab.Screen name="QuizChooseScreen" component={QuizChooseScreen} />
    </Tab.Navigator>
  )
}

function App(){
  return(

  <>
  <AppProvider>
    <NavigationContainer >
      <Stack.Navigator screenOptions={{headerShown:false,animation:'fade',animationDuration:1000}}>
       <Stack.Screen name='TabNavigator' component={TabNavigator} />
       <Stack.Screen name='TimeQuizScreen' component={TimeQuizScreen} />
       <Stack.Screen name='SuddenQuizScreen' component={SuddenQuizScreen} />  
      </Stack.Navigator>
    </NavigationContainer>
  </AppProvider>
  </>
  );
}


export default App;
