import { View, Text } from 'react-native'
import React from 'react'
import ListUsers from './Home/ListUsers';
import Forums from './Home/Forums';
import Settings from './Home/Settings';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';  // ou un autre jeu d'icônes, comme FontAwesome
//import Settings from './Home/Settings'; // ou le chemin correct vers Settings


const Tab= createMaterialBottomTabNavigator();
export default function Home(props) {
  const currentUserId=props.route.params.currentUserId;
  return (
    <Tab.Navigator>
    <Tab.Screen
      name="Users"
      component={ListUsers} initialParams={{currentUserId}}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="people" color={color} size={24} />
        ),
      }}
    />
    <Tab.Screen
      name="Forums"
      component={Forums}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="chatbubbles" color={color} size={24} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={Settings}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="cog-outline" color={color} size={24} />
        ),
      }}
      initialParams={{currentUserId}}
    />
  </Tab.Navigator>
  )
}