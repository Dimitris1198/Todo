import React, { Component } from 'react';
import { View, Text, TextInput, Switch, Button, StyleSheet } from 'react-native';
import DefaultPreference from 'react-native-default-preference';
import ToDo, { ToDoItem } from '../objects/Todo'; // Import ToDoItem type
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';

interface EditScreenState {
  id: string;
  newTitle: string;
  newDescription: string;
  hasReminder: boolean;
  selectedDate: Date | null;
  selectedTime: Date | null;
  showDatePicker: boolean;
  showTimePicker: boolean;
  todoItem: ToDoItem | null;
}

class EditScreen extends Component<{ navigation: any, route: any }, EditScreenState> {
  constructor(props: any) {
    super(props);
    this.state = {
      id: '',
      newTitle: '',
      newDescription: '',
      hasReminder: false,
      selectedDate: null,
      selectedTime: null,
      showDatePicker: false,
      showTimePicker: false,
      todoItem: null,
    };
  }

  fetchToDoItem = async (item: ToDo) => {
    this.setState({
      todoItem: item,
      newTitle: item.title,
      newDescription: item.description,
      hasReminder: item.hasReminder,
      selectedDate: item.selectedTime ? new Date(item.selectedTime) : null,
      selectedTime: item.selectedTime ? new Date(item.selectedTime) : null,
      showDatePicker: false,
      showTimePicker: false,
    });
  }

  componentDidMount() {
    const { id, item } = this.props.route.params;
    this.setState({ id }, () => {
      this.fetchToDoItem(item);
    });
  }

  handleTitleChange = (text: string) => {
    this.setState({ newTitle: text });
  };

  handleDescriptionChange = (text: string) => {
    this.setState({ newDescription: text });
  };

  handleReminderChange = (value: boolean) => {
    this.setState({ hasReminder: value, showDatePicker: value, showTimePicker: value });
  };

  handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      this.setState({ selectedDate, showDatePicker: false });
    }
  };

  handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (selectedTime) {
      this.setState({ selectedTime, showTimePicker: false });
    }
  };

  handleUpdate = async () => {
    const { id, newTitle, newDescription, hasReminder, selectedDate, selectedTime } = this.state;

    const combinedDateTime = new Date(
      selectedDate!.getFullYear(),
      selectedDate!.getMonth(),
      selectedDate!.getDate(),
      selectedTime!.getHours(),
      selectedTime!.getMinutes()
    );

    const updatedToDoItem: ToDoItem = {
      id,
      title: newTitle,
      description: newDescription,
      date: moment(combinedDateTime).format('YYYY-MM-DD HH:mm'), // Formatting date and time
      hasReminder,
      selectedTime: combinedDateTime,
    };

    try {
      const storedToDoList = await DefaultPreference.get('toDoList');
      let toDoList: ToDoItem[] = [];

      if (storedToDoList) {
        toDoList = JSON.parse(storedToDoList);

        const index = toDoList.findIndex(item => item.id === id);

        if (index !== -1) {
          toDoList[index] = updatedToDoItem;

          await DefaultPreference.set('toDoList', JSON.stringify(toDoList));
          this.updateNotification(updatedToDoItem);
          this.props.navigation.goBack();
        } else {
          console.error('ToDo item not found with ID:', id);
        }
      }
    } catch (error) {
      console.error('Failed to update ToDo item:', error);
    }
  };

  updateNotification = async (toDo: ToDoItem) => {
    await notifee.cancelNotification(toDo.id);

    if (toDo.hasReminder && toDo.selectedTime) {
      const reminderTime = new Date(toDo.selectedTime.getTime() - 1 * 60000); // 5 minutes before
      await this.scheduleReminder(reminderTime, toDo);
    }
  };

  scheduleReminder = async (reminderTime: Date, toDo: ToDoItem) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTime.getTime(),
    };
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
  };

  render() {
    const { newTitle, newDescription, hasReminder, showDatePicker, showTimePicker, selectedDate, selectedTime } = this.state;
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={newTitle}
          onChangeText={this.handleTitleChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={newDescription}
          onChangeText={this.handleDescriptionChange}
        />
        <View style={styles.reminderContainer}>
          <Text>Set Reminder:</Text>
          <Switch value={hasReminder} onValueChange={this.handleReminderChange} />
        </View>

        <View style={styles.dateTimeContainer}>
          <Text style={styles.label}>Select Date:</Text>
          <Button title="Pick Date" onPress={() => this.setState({ showDatePicker: true })} />
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
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
              display="spinner"
              onChange={this.handleTimeChange}
            />
          )}
        </View>

        <Button title="Update" onPress={this.handleUpdate} />
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

export default EditScreen;
