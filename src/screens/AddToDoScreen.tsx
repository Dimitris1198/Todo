import React, { Component } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import uuid from 'react-native-uuid';

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

  handleAddToDo = () => {
    const newToDo = {
      id: uuid.v4(),
      title: this.state.title,
      description: this.state.description,
    };
    // Add logic to save the new To-Do item
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
