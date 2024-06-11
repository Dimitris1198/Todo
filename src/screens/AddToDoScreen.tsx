import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Switch } from 'react-native';
import DefaultPreference from 'react-native-default-preference';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import uuid from 'react-native-uuid';

interface ToDoItem {
  id: string;
  title: string;
  description: string;
  date: string;
  hasReminder: boolean;
  selectedTime: Date | null;
}

interface AddToDoScreenState {
  title: string;
  description: string;
  date: Date;
  hasReminder: boolean;
  selectedTime: Date | null;
  showDatePicker: boolean;
  showTimePicker: boolean;
}

class AddToDoScreen extends Component<{}, AddToDoScreenState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      title: '',
      description: '',
      date: new Date(),
      hasReminder: false,
      selectedTime: new Date(),
      showDatePicker: false,
      showTimePicker: false,
    };
  }

  handleTitleChange = (text: string) => {
    this.setState({ title: text });
  };

  handleDescriptionChange = (text: string) => {
    this.setState({ description: text });
  };

  handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      this.setState({ date: selectedDate, showDatePicker: false });
    }
  };

  handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (selectedTime) {
      this.setState({ selectedTime, showTimePicker: false });
    }
  };

  handleReminderChange = (value: boolean) => {
    this.setState({ hasReminder: value });
  };

  handleAddToDo = async () => {
    const { title, description, date, hasReminder, selectedTime } = this.state;
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    const id = uuid.v4().toString();
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const newToDo: ToDoItem = { id, title, description, date: formattedDate, hasReminder, selectedTime };

    try {
      await this.saveToDoItem(newToDo);
      Alert.alert('Success', 'ToDo item added successfully');

      if (hasReminder && selectedTime) {
        const reminderTime = moment(selectedTime).toDate();
        await this.scheduleReminder(reminderTime, newToDo);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add ToDo item');
      console.log(error)
    }
  };

  saveToDoItem = async (toDoItem: ToDoItem) => {
    const storedToDoList = await DefaultPreference.get('toDoList');
    let toDoList: ToDoItem[] = [];
    if (storedToDoList) {
      toDoList = JSON.parse(storedToDoList);
    }
    toDoList.push(toDoItem);

    try {
      await DefaultPreference.set('toDoList', JSON.stringify(toDoList));
    } catch (error) {
      throw new Error('Failed to save ToDo item');
    }
  };

  scheduleReminder = async (reminderTime: Date, toDo: ToDoItem) => {
    await notifee.requestPermission();
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTime.getTime(),
    };

    try {
      await notifee.createTriggerNotification(
        {
          id: toDo.id,
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
    const { title, description, date, hasReminder, selectedTime, showDatePicker, showTimePicker } = this.state;
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
        <View style={styles.dateTimeContainer}>
          <Text style={styles.label}>Select Date:</Text>
          <Button title="Pick Date" onPress={() => this.setState({ showDatePicker: true })} />
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={this.handleDateChange}
            />
          )}
        </View>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.label}>Select Time:</Text>
          <Button title="Pick Time" onPress={() => this.setState({ showTimePicker: true })} />
          {showTimePicker && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={this.handleTimeChange}
            />
          )}
        </View>
        <View style={styles.reminderContainer}>
          <Text>Set Reminder:</Text>
          <Switch value={hasReminder} onValueChange={this.handleReminderChange} />
        </View>
        <Button title="Add ToDo" onPress={this.handleAddToDo} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#123',
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
  label: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default AddToDoScreen;
