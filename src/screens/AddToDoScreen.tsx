import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import uuid from 'react-native-uuid';
import DefaultPreference from 'react-native-default-preference';

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
      id: uuid.v4().toString(),  // Ensure the ID is cast to a string
      title,
      description,
    };

    const updatedToDoList = [...toDoList, newToDo];
    this.setState({ toDoList: updatedToDoList, title: '', description: '' });

    // Store the updated To-Do list using DefaultPreference
    try {
      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      Alert.alert('Success', 'To-Do item added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add To-Do item');
    }
  };

  render() {
    return (
      <View>
        <Text>Add New To-Do</Text>
        <TextInput
          placeholder="Title"
          onChangeText={this.handleTitleChange}
          value={this.state.title}
        />
        <TextInput
          placeholder="Description"
          onChangeText={this.handleDescriptionChange}
          value={this.state.description}
        />
        <Button title="Add To-Do" onPress={this.handleAddToDo} />
      </View>
    );
  }
}

export default AddToDoScreen;
