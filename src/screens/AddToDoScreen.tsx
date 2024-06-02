import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import uuid from 'react-native-uuid';
import DefaultPreference from 'react-native-default-preference';
import notifee, { TriggerType, TimestampTrigger } from '@notifee/react-native';

interface ToDoItem {
  id: string;
  title: string;
  description: string;
}

interface AddToDoScreenState {
  title: string;
  description: string;
}

class AddToDoScreen extends Component<{}, AddToDoScreenState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      title: '',
      description: '',
    };
  }

  handleTitleChange = (text: string) => {
    this.setState({ title: text });
  };

  handleDescriptionChange = (text: string) => {
    this.setState({ description: text });
  };

  handleAddToDo = async () => {
    const { title, description } = this.state;
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please enter a title and description');
      return;
    }

    const newToDo: ToDoItem = {
      id: uuid.v4().toString(),
      title,
      description,
    };

    try {
      const storedToDoList = await DefaultPreference.get('toDoList');
      const toDoList = storedToDoList ? JSON.parse(storedToDoList) : [];
      const updatedToDoList = [...toDoList, newToDo];

      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      await this.scheduleReminder(newToDo);
      
      this.setState({ title: '', description: '' });
      Alert.alert('Success', 'To-Do item added successfully');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  scheduleReminder = async (toDo: ToDoItem) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 60 * 1000, // Schedule to show in 1 minute
    };

    await notifee.createTriggerNotification(
      {
        title: 'Reminder',
        body: `Don't forget: ${toDo.title}`,
        android: {
          channelId: 'default',
        },
      },
      trigger
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Add a New Task</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          onChangeText={this.handleTitleChange}
          value={this.state.title}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          onChangeText={this.handleDescriptionChange}
          value={this.state.description}
          multiline
        />
        <Button title="Add Task"  color="#841584" onPress={this.handleAddToDo} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#7938b5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#430e75',
    borderRadius: 5,
    padding: 10,
  },
});

export default AddToDoScreen;
