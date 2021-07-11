//Bibliotecas
import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import React from 'react';
import { StatusBar } from 'react-native'
import AppLoading from 'expo-app-loading';
import { ThemeProvider } from 'styled-components';


import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

//componentes próprios
import theme from './src/global/styles/theme';
import { AuthProvider } from './src/Hooks/Auth';
import { Routes } from './src/routes';


export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  //Se a fonte não foi carregada segure a tela de splash
  if (!fontsLoaded) {
    return <AppLoading />
  }

  return (
    <ThemeProvider theme={theme}>
        <StatusBar barStyle="light-content" />
        <AuthProvider> 
          <Routes />
        </AuthProvider>
    </ThemeProvider>
  )
}
