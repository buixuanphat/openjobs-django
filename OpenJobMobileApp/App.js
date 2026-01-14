import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Styles from './screens/Home/Styles';
import MyStyles from './styles/MyStyles';
import Categories from './components/Categories';
import Home from './screens/Home/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/User/Login';
import { Icon, Provider as PaperProvider } from 'react-native-paper';

import Register from './screens/User/Register';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext, useEffect, useReducer, useState } from 'react';
import { MyTokenContext, MyUserContext } from './utils/MyContexts';
import MyUserReducer from './reducers/MyUserReducer';
import Profile from './screens/User/User';
import JobDetails from './screens/Home/JobDetails';
import Applications from './screens/Home/Applications';
import PostJobs from './screens/Home/PostJobs';
import ViewApplications from './screens/Home/ViewApplications';
import MyJobs from './screens/Home/MyJobs';
import UserDetails from './screens/User/UserDetails';
import JobHistory from './screens/Home/JobHistory';
import Chat from './screens/Home/Chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from './utils/Apis';
import Shift from './screens/Home/Shift';
import ChatDetails from './screens/Home/ChatDetails';
import MyEmployment from './screens/Home/MyEmployment';
import MyTokenReducer from './reducers/MyTokenReducer';
import EmployerRatings from './screens/Home/EmployerRatings';
import CandidateManagement from './screens/Home/CandidateManagement';


const Stack = createNativeStackNavigator();

const StackNavigatior = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Job" component={Home} options={{ title: "Trang Chủ" }} />
      <Stack.Screen name="UserDetails" component={UserDetails} options={{ title: "Thông tin cá nhân" }} />
      <Stack.Screen name="JobDetails" component={JobDetails} options={{ title: "Chi tiết tin tuyển dụng" }} />
      <Stack.Screen name="ViewApplications" component={ViewApplications} options={{ title: "Danh sách ứng viên" }} />
      <Stack.Screen name="Applications" component={Applications} options={{ title: "Lịch sử tuyển dụng" }} />
      <Stack.Screen name="JobHistory" component={JobHistory} options={{ title: "Lịch sử tin đăng tuyển" }} />
      <Stack.Screen name="PostJobs" component={PostJobs} options={{ title: "Đăng tin ứng tuyển" }} />
      <Stack.Screen name="Shift" component={Shift} options={{ title: "Ca làm việc" }} />
      <Stack.Screen name="ChatDetails" component={ChatDetails} options={{ headerShown: false, title: "Đoạn chat của tôi" }} />
      <Stack.Screen name="MyEmployment" component={MyEmployment} options={{ headerShown: false, title: "Công việc của tôi" }} />
      <Stack.Screen name="EmployerRatings" component={EmployerRatings} options={{ title: "Đánh giá" }} />
      <Stack.Screen name="CandidateManagement" component={CandidateManagement} options={{ title: "Nhân viên" }} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  const [user,] = useContext(MyUserContext);

  return (
    <Tab.Navigator>
      {user === null ?
        <>
          <Tab.Screen name='Login' component={Login} />
          <Tab.Screen name='Register' component={Register} />
        </> : <>
          <Tab.Screen name='Home' component={StackNavigatior} options={{ title: "Trang chủ", headerShown: false, tabBarIcon: ({ color }) => <Icon color={color} source="home" size={24} /> }} />
          <Tab.Screen name='Chat' component={Chat} options={{ title: 'Trò chuyện', tabBarLabel: 'Trò chuyện', tabBarIcon: ({ color }) => <Icon color={color} source="message-text" size={24} /> }} />
          <Tab.Screen name='Profile' component={Profile} options={{ title: "Hồ sơ", tabBarIcon: ({ color }) => <Icon color={color} source="account" size={24} /> }} />
        </>
      }
      {user && user.role === 'employer' && (
        <>
          <Tab.Screen name='PostJobs' component={PostJobs} options={{ headerShown: false, title: "Đăng tin", tabBarIcon: ({ color }) => <Icon color={color} source="note-plus" size={24} /> }} />
          <Tab.Screen name='MyJobs' component={MyJobs} options={{ title: "Tin đã đăng" }} />
        </>
      )}
      {/* {user && user.role === 'candidate' && (
        <Tab.Screen name='Applications' component={Applications} options={{ title: "Việc đã ứng tuyển" }} />
      )} */}
    </Tab.Navigator>
  );
}



export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [myToken, tokenDispatch] = useReducer(MyTokenReducer, null)

  const loadInfo = async () => {
    try {
      let token = await AsyncStorage.getItem("token");
      tokenDispatch({
        "type": "login",
        "payload": token
      });

      let res = await authApis(token).get(endpoints['current-user']);

      dispatch({
        "type": "login",
        "payload": res.data
      });
    }
    catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    loadInfo()
  }, [])

  return (
    <PaperProvider>
      <MyTokenContext.Provider value={[myToken, tokenDispatch]}>
        <MyUserContext.Provider value={[user, dispatch]}>
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        </MyUserContext.Provider>
      </MyTokenContext.Provider>
    </PaperProvider>
  );
}


