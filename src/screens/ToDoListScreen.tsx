import React, { Component } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import DefaultPreference from 'react-native-default-preference';
import notifee, { EventType } from '@notifee/react-native';
import uuid from 'react-native-uuid';
import BuildConfig from 'react-native-build-config';

// const BuildConfig = require('react-native-build-config')
interface ToDoItem {
  id: string;
  title: string;
  description: string;
  date: string;
  hasReminder: boolean;
  selectedTime: Date | null;
}

interface ToDoListScreenState {
  toDoList: ToDoItem[];
}

class ToDoListScreen extends Component<{ navigation: any }, ToDoListScreenState> {
  isInitialLoad: boolean = true;

  constructor(props: any) {
    super(props);
    this.state = {
      toDoList: [],
    };
  }

  async componentDidMount() {
    this.loadToDoList();
    this.setupNotificationChannel();
    this.props.navigation.addListener('focus', this.handleFocus);
  }

  componentWillUnmount() {
    this.props.navigation.removeListener('focus', this.handleFocus);
  }

  handleFocus = async () => {
    if (this.isInitialLoad) {
      await this.fetchInitialToDoItems();
      this.isInitialLoad = false;
    } else {
      this.loadToDoList();
    }
  };

  async setupNotificationChannel() {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('Notification dismissed', detail.notification);
          break;
        case EventType.PRESS:
          console.log('Notification pressed', detail.notification);
          break;
      }
    });
  }

  loadToDoList = async () => {
    try {
      const storedToDoList = await DefaultPreference.get('toDoList');
      if (storedToDoList) {
        this.setState({ toDoList: JSON.parse(storedToDoList) });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load To-Do list');
    }
  };

  fetchInitialToDoItems = async () => {
    try {
      const response = await fetch(BuildConfig.todoes);
      const initialToDoItems = await response.json();
      console.log(BuildConfig.todoes)
      console.log(response)
      const toDoList = initialToDoItems.map((item: any) => ({
        id: item.task_id,
        title: item.title,
        description: '',
        date: item.date,
        hasReminder: item.has_reminder,
        selectedTime: null,
      }));

      this.setState({ toDoList });
      await DefaultPreference.set('toDoList', JSON.stringify(toDoList));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch initial To-Do items');
    }
  };

  handleDelete = async (id: string) => {
    const { toDoList } = this.state;
    const updatedToDoList = toDoList.filter(item => item.id !== id);
    this.setState({ toDoList: updatedToDoList });

    try {
      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      await notifee.cancelNotification(id);
      Alert.alert('Success', 'To-Do item deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete To-Do item');
    }
  };

  handleEditNavigation = (item: ToDoItem) => {
    this.props.navigation.navigate('EditScreen', { item });
  };

  renderItem = ({ item }: { item: ToDoItem }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDate}>{item.date}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Edit" onPress={() => this.handleEditNavigation(item)} />
        <Button title="Delete" onPress={() => this.handleDelete(item.id)} />
      </View>
    </View>
  );

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.toDoList}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 16,
    color: '#666',
  },
  itemDescription: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default ToDoListScreen;
