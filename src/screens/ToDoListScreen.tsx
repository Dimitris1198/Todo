import React, { Component } from 'react';
import { View, Text, FlatList, Button, Alert, TextInput } from 'react-native';
import DefaultPreference from 'react-native-default-preference';

interface ToDoItem {
  id: string;
  title: string;
  description: string;
}

interface ToDoListScreenState {
  toDoList: ToDoItem[];
  editingItemId: string | null;
  editingTitle: string;
  editingDescription: string;
}

class ToDoListScreen extends Component<{}, ToDoListScreenState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      toDoList: [],
      editingItemId: null,
      editingTitle: '',
      editingDescription: '',
    };
  }

  componentDidMount() {
    this.loadToDoList();
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

  handleDelete = async (id: string) => {
    const updatedToDoList = this.state.toDoList.filter((item) => item.id !== id);
    this.setState({ toDoList: updatedToDoList });

    try {
      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      Alert.alert('Success', 'To-Do item deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete To-Do item');
    }
  };

  startEditing = (item: ToDoItem) => {
    this.setState({
      editingItemId: item.id,
      editingTitle: item.title,
      editingDescription: item.description,
    });
  };

  handleUpdate = async () => {
    const { toDoList, editingItemId, editingTitle, editingDescription } = this.state;
    const updatedToDoList = toDoList.map((item) =>
      item.id === editingItemId
        ? { ...item, title: editingTitle, description: editingDescription }
        : item
    );
    this.setState({
      toDoList: updatedToDoList,
      editingItemId: null,
      editingTitle: '',
      editingDescription: '',
    });

    try {
      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      Alert.alert('Success', 'To-Do item updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update To-Do item');
    }
  };

  renderItem = ({ item }: { item: ToDoItem }) => (
    <View>
      <Text>{item.title}</Text>
      <Text>{item.description}</Text>
      <Button title="Edit" onPress={() => this.startEditing(item)} />
      <Button title="Delete" onPress={() => this.handleDelete(item.id)} />
    </View>
  );

  render() {
    const { editingItemId, editingTitle, editingDescription } = this.state;
    return (
      <View>
        <Text>To-Do List</Text>
        {editingItemId ? (
          <View>
            <TextInput
              placeholder="Title"
              onChangeText={(text) => this.setState({ editingTitle: text })}
              value={editingTitle}
            />
            <TextInput
              placeholder="Description"
              onChangeText={(text) => this.setState({ editingDescription: text })}
              value={editingDescription}
            />
            <Button title="Update To-Do" onPress={this.handleUpdate} />
          </View>
        ) : (
          <FlatList
            data={this.state.toDoList}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>
    );
  }
}

export default ToDoListScreen;
