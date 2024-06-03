import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Switch } from 'react-native';
import DefaultPreference from 'react-native-default-preference';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import uuid from 'react-native-uuid';

interface ToDoItem {
    id: string;
  title: string;
  description: string;
  hasReminder: boolean;
  selectedTime: Date | null;
}

interface AddToDoScreenState {
  title: string;
  description: string;
  hasReminder: boolean;
  selectedTime: Date | null;
}

class AddToDoScreen extends Component<{}, AddToDoScreenState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      title: '',
      description: '',
      hasReminder: false,
      selectedTime: new Date(),
    };
    console.log("i cosntruct")
  }

  handleTitleChange = (text: string) => {
    this.setState({ title: text });
  };

  handleDescriptionChange = (text: string) => {
    this.setState({ description: text });
  };

  handleReminderChange = (value: boolean) => {
    this.setState({ hasReminder: value });
  };

  handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (selectedTime) {
      this.setState({ selectedTime });
    }
  };

  handleAddToDo = async () => {
    const { title, description, hasReminder, selectedTime } = this.state;
  
    // Generate a unique ID using uuid package
    const id = uuid.v4();
  
    const newToDo: ToDoItem = { id, title, description, hasReminder, selectedTime };
  
    try {
      // Save new ToDo item to storage
      await this.saveToDoItem(newToDo);
  
      // Show success message
      Alert.alert('Success', 'ToDo item added successfully');
  
      // Schedule reminder 5 minutes before selected time
      if (hasReminder && selectedTime) {
        const reminderTime = new Date(selectedTime.getTime() - 5 * 60000); // 5 minutes before
        // Schedule reminder using notifee
        await this.scheduleReminder(reminderTime, newToDo);
      }
    } catch (error) {
      // Show error message
      Alert.alert('Error', error.message || 'Failed to add ToDo item');
    }
  };
  

  saveToDoItem = async (toDoItem: ToDoItem) => {
    const storedToDoList = await DefaultPreference.get('toDoList');
    let toDoList: ToDoItem[] = [];
    if (storedToDoList) {
      toDoList = JSON.parse(storedToDoList);
    }
    toDoList.push(toDoItem);
    this.state=this.state;

    // Save updated ToDo list to storage
    try {
      await DefaultPreference.set('toDoList', JSON.stringify(toDoList));
    } catch (error) {
      throw new Error('Failed to save ToDo item');
    }
  };

  scheduleReminder = async (reminderTime: Date, toDo: ToDoItem) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTime.getTime(),
    };

    try {
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
    } catch (error) {
      throw new Error('Failed to schedule reminder');
    }
  };

  render() {
    const { title, description, hasReminder, selectedTime } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Add New ToDo</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={this.handleTitleChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={this.handleDescriptionChange}
        />
        <View style={styles.reminderContainer}>
          <Text>Set Reminder:</Text>
          <Switch value={hasReminder} onValueChange={this.handleReminderChange} />
        </View>
        {hasReminder && (
          <DateTimePicker
            value={selectedTime || new Date()}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={this.handleTimeChange}
          />
        )}
        <Button title="Add ToDo" onPress={this.handleAddToDo} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default AddToDoScreen;
