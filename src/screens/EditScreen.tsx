import React, { Component } from 'react';
import { View, Text, TextInput, Switch, Button, StyleSheet } from 'react-native';
import DefaultPreference from 'react-native-default-preference';
import ToDo, { ToDoItem } from '../objects/Todo'; // Import ToDoItem type
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
interface EditScreenState {
  id: string;
  newTitle: string;
  newDescription: string;
  hasReminder: boolean;
  selectedTime: Date | null;
  showDateTimePicker: boolean; // New state variable to control the visibility of DateTimePicker
  todoItem: ToDoItem | null; // Updated the ToDoItem type
}

class EditScreen extends Component<{ navigation: any, route: any }, EditScreenState> {
  constructor(props: any) {
    super(props);
    this.state = {
      id: '',
      newTitle: '',
      newDescription: '',
      hasReminder: false,
      selectedTime: null,
      showDateTimePicker: false, // Initialize it to false
      todoItem: null,
    };
  }

  fetchToDoItem = async (item: ToDo) => {
    console.log(item);
    // Set the initial state values from the fetched ToDo item
    this.setState({
      todoItem: item,
      newTitle: item.title,
      newDescription: item.description,
      hasReminder: item.hasReminder,
      selectedTime: item.selectedTime,
      showDateTimePicker: false, // Initialize it to false regardless of hasReminder
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
    if (!this.state.hasReminder && value) {
      this.setState({ hasReminder: value, showDateTimePicker: true });
    } else {
      this.setState({ hasReminder: value });
    }
  };

  handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (selectedTime) {
      this.setState({ selectedTime });
      if(this.state.todoItem)
        {
      this.updateNotification(this.state.todoItem)
    }
    }
  };

  handleUpdate = async () => {
    const { id, newTitle, newDescription, hasReminder, selectedTime } = this.state;

    // Construct updated ToDo item
    const updatedToDoItem: ToDoItem = {
      id,
      title: newTitle,
      description: newDescription,
      date: '', // Update date if needed
      hasReminder,
      selectedTime,
    };

    try {
      // Retrieve the stored ToDo list from DefaultPreference
      const storedToDoList = await DefaultPreference.get('toDoList');
      let toDoList: ToDoItem[] = [];

      if (storedToDoList) {
        toDoList = JSON.parse(storedToDoList);

        // Find the index of the item to update in the toDoList array
        const index = toDoList.findIndex(item => item.id === id);

        if (index !== -1) {
          // Update the item in the toDoList array
          toDoList[index] = updatedToDoItem;

          // Save the updated toDoList back to DefaultPreference
          await DefaultPreference.set('toDoList', JSON.stringify(toDoList));
          this.updateNotification(updatedToDoItem)
          // Optionally, navigate back to previous screen after successful update
          this.props.navigation.goBack();
        } else {
          console.error('ToDo item not found with ID:', id);
        }
      }
    } catch (error) {
      console.error('Failed to update ToDo item:', error);
      // Handle error updating ToDo item
    }
  };
  updateNotification = async (toDo: ToDoItem) => {
    // Cancel the existing notification
    await notifee.cancelNotification(toDo.id);
  
    // Schedule the new reminder
    if (toDo.hasReminder && toDo.selectedTime) {
      const reminderTime = new Date(toDo.selectedTime.getTime() - 1 * 60000); // 5 minutes before
      await this.scheduleReminder(reminderTime, toDo);
    }
  };
  scheduleReminder = async (reminderTime: Date, toDo: ToDoItem) => {
    console.log("egine");
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTime.getTime(),
    };
    await notifee.createTriggerNotification(
      {
        title: 'Reminder',
        body: `Don't forget: ${toDo.title}`,
        android: {
          channelId: 'default',
        },
      },
      trigger,
    );
  }
  
  
  render() {
    const { newTitle, newDescription, hasReminder, showDateTimePicker, todoItem } = this.state;
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
      
        {showDateTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={this.handleTimeChange}
          />
        )}

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
