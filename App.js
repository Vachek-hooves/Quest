import {AppProvider} from './store/appContext';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack=createNativeStackNavigator();
const Tab=createBottomTabNavigator();

const TabNavigator=()=>{
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
    </Tab.Navigator>
  )
}

function App(){
  return(

  <>
  <AppProvider>
    <NavigationContainer>
      <Stack.Navigator>
       <Stack.Screen name='TabNavigator' component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  </AppProvider>
  </>
  );
}


export default App;
