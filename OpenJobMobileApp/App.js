import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Styles from './screens/Home/Styles';
import MyStyles from './styles/MyStyles';
import Categories from './components/Categories';


export default function App() {
  return (
    <View style={MyStyles.container}>
      <Categories/>
    </View>

  );
}


