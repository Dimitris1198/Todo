import React, { Component } from 'react';
import { View, Text, TextInput, Switch, Button, StyleSheet } from 'react-native';

interface ToDoItem {
  id: string;
  title: string;
  description: string;
  date: string;
  hasReminder: boolean;
  selectedTime: Date | null;
}

interface EditScreenState {
  newTitle: string;
  newDescription: string;
  hasReminder: boolean;
  selectedTime: Date | null;
}

class EditScreen extends Component<{ navigation: any, route: any }, EditScreenState> {
  constructor(props: any) {
    super(props);
    this.state = {
      newTitle: '',
      newDescription: '',
      hasReminder: false,
      selectedTime: null,
    };
  }

  handleTitleChange = (text: string) => {
    this.setState({ newTitle: text });
  };

  handleDescriptionChange = (text: string) => {
    this.setState({ newDescription: text });
  };

  handleReminderChange = (value: boolean) => {
    this.setState({ hasReminder: value });
  };

  handleUpdate = () => {
    // Implement logic to update ToDo item
  };

  render() {
    const { newTitle, newDescription, hasReminder, selectedTime } = this.state;
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
        {/* Add your DateTimePicker component here */}
        <Button title="Update" onPress={this.handleUpdate} />
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
