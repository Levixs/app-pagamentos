import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Routes from './src/routes';
import { NavigationContainer } from '@react-navigation/native';
import ExpenseListScreen from './src/pages/Home';

export default function App() {
  return (
    // <NavigationContainer>
    //   <Routes/>
    // </NavigationContainer>
    <ExpenseListScreen/>

  );
}

