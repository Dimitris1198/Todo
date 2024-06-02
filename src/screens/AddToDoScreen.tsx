import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
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
  toDoList: ToDoItem[];
}

class AddToDoScreen extends Component<{}, AddToDoScreenState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      title: '',
      description: '',
      toDoList: [],
    };
  }

  handleTitleChange = (text: string) => {
    this.setState({ title: text });
  };

  handleDescriptionChange = (text: string) => {
    this.setState({ description: text });
  };

  handleAddToDo = async () => {
    const { title, description, toDoList } = this.state;
    const newToDo: ToDoItem = {
      id: uuid.v4().toString(),
      title,
      description,
    };

    const updatedToDoList = [...toDoList, newToDo];
    this.setState({ toDoList: updatedToDoList, title: '', description: '' });

    try {
      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      await this.scheduleReminder(newToDo);
      Alert.alert('Ωραια', 'ΤΟ εφτιαξες μαγκα μου');
    } catch (error) {
      Alert.alert('Οχι και τοσο ωραια', 'Κατι πηγε λαθος');
    }
  };

  scheduleReminder = async (toDo: ToDoItem) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 60 * 1000, // Schedule to show in 1 minute
    };

    await notifee.createTriggerNotification(
      {
        title: 'Υπενθημιση',
        body: `Μην ξεχασεις το : ${toDo.title}`,
        android: {
          channelId: 'default',
        //  smallIcon: 'name-of-a-small-icon',  an thelw allh eikona
        },
      },
      trigger
    );
  };

  render() {
    return (
      <View>
        <Text>Προσθηκη νεο για να κανεις πραγμα</Text>
        <TextInput
          placeholder="Τιτλος"
          onChangeText={this.handleTitleChange}
          value={this.state.title}
        />
        <TextInput
          placeholder="Περιγραφη"
          onChangeText={this.handleDescriptionChange}
          value={this.state.description}
        />
        <Button title="Προσθηκη" onPress={this.handleAddToDo} />
      </View>
    );
  }
}

export default AddToDoScreen;
