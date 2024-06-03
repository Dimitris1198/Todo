import React, { Component } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddToDoScreen from './AddToDoScreen';
import ToDoListScreen from './ToDoListScreen';

const Tab = createBottomTabNavigator();

class MainTabs extends Component {
  render() {
    return (
      <Tab.Navigator initialRouteName="AddToDo">
        <Tab.Screen name="AddToDo" component={AddToDoScreen} />
        <Tab.Screen name="ToDoList" component={ToDoListScreen} />
      </Tab.Navigator>
    );
  }
}

export default MainTabs;
