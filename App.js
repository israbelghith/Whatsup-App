import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Auth from "./Screens/Auth";
import NewAccount from "./Screens/NewAccount";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./Screens/Home";
import Chat from "./Screens/Chat";
import ChatGroup from "./Screens/ChatGroup";
import Settings from "./Screens/Home/Settings"; // ou le chemin correct

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={Auth}></Stack.Screen>
        <Stack.Screen
          options={{ headerShown: true, headerTitle: "Back to Auth" }}
          name="NewAccount"
          component={NewAccount}
        ></Stack.Screen>
        <Stack.Screen name="Home" component={Home}></Stack.Screen>
        <Stack.Screen name="Chat" component={Chat}></Stack.Screen>
        <Stack.Screen name="Settings" component={Settings}></Stack.Screen>
        <Stack.Screen name="ChatGroup" component={ChatGroup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
