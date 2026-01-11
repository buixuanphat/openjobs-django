import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Styles from './screens/Home/Styles';
import MyStyles from './styles/MyStyles';
import Categories from './components/Categories';
import Home from './screens/Home/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/User/Login';
import { Provider as PaperProvider } from 'react-native-paper';

import Register from './screens/User/Register';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext, useReducer } from 'react';
import { MyUserContext } from './utils/MyContexts';
import MyUserReducer from './reducers/MyUserReducer';
import Profile from './screens/User/User';
import JobDetails from './screens/Home/JobDetails';
import Applications from './screens/Home/Applications';
import PostJobs from './screens/Home/PostJobs';
import ViewApplications from './screens/Home/ViewApplications';
import MyJobs from './screens/Home/MyJobs';


const Stack=createNativeStackNavigator();

const StackNavigatior=()=>{
  return(
    <Stack.Navigator>
      <Stack.Screen name="Job" component={Home} options={{title:"Trang Chủ"}}/>

      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      
      <Stack.Screen name="JobDetails" component={JobDetails} options={{title:"Chi tiết tin tuyển dụng"}}/>
      <Stack.Screen name="ViewApplications" component={ViewApplications} options={{title:"Danh sách ứng viên"}}/>
      <Stack.Screen name="Applications" component={Applications} options={{title:"Lịch sử tuyển dụng"}}/>
      <Stack.Screen name="PostJobs" component={PostJobs} options={{title:"Đăng tin ứng tuyển"}}/>
    </Stack.Navigator>
  );
}

const Tab=createBottomTabNavigator();
const TabNavigator=()=>{
  const [user, ] = useContext(MyUserContext);

  return(
    <Tab.Navigator>
      <Tab.Screen name='Home' component={StackNavigatior} options={{ title: "Trang chủ", headerShown: false }}/>
      {user && user.role === 'employer' && (
        <>
          <Tab.Screen name='PostJobs' component={PostJobs} options={{ title: "Đăng tin" }}/>
          <Tab.Screen name='MyJobs' component={MyJobs} options={{ title: "Tin đã đăng" }}/>
        </>
      )}
      {/* {user && user.role === 'candidate' && (
        <Tab.Screen name='Applications' component={Applications} options={{ title: "Việc đã ứng tuyển" }} />
      )} */}
      {user===null?
        <>
          <Tab.Screen name='Login' component={Login}/>
          <Tab.Screen name='Register' component={Register}/>
        </>:<>
          <Tab.Screen name='Profile' component={Profile}/>  
        </>
      }
    </Tab.Navigator>
  );
}



export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user,dispatch]}>
      <PaperProvider>
        <NavigationContainer>
        <TabNavigator/>
      </NavigationContainer>
      </PaperProvider>
    </MyUserContext.Provider>

  );
}


