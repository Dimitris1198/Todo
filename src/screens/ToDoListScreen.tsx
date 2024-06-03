import React, { Component } from 'react';
import { View, Text, FlatList, Button, Alert, TextInput, Platform, Switch, StyleSheet } from 'react-native';
import DefaultPreference from 'react-native-default-preference';
import notifee, { EventType } from '@notifee/react-native';

interface ToDoItem {
  id: string;
  title: string;
  description: string;
  reminderEnabled: boolean;
}

interface ToDoListScreenState {
  toDoList: ToDoItem[];
  newTitle: string;
  newDescription: string;
  editingItemId: string | null;
  isFirstLoad: boolean;
}

class ToDoListScreen extends Component<{}, ToDoListScreenState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      toDoList: [],
      newTitle: '',
      newDescription: '',
      editingItemId: null,
      isFirstLoad: true,
    };
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', this.handleFocus);
    this.setupNotificationChannel();
  }

  componentWillUnmount() {
    this.props.navigation.removeListener('focus', this.handleFocus);
  }

  handleFocus = async () => {
    if (this.state.isFirstLoad) {
      await this.fetchInitialToDoList();
      this.setState({ isFirstLoad: false });
    }
    this.loadToDoList();
  };

  async fetchInitialToDoList() {
    try {
      const response = await fetch('https://api.npoint.io/3dbe9481cd6175f6ffd8');
      const data = await response.json();

      const initialToDoList: ToDoItem[] = data.map((item: any) => ({
        id: item.task_id,
        title: item.title,
        description: '', // Assuming description is not provided by the endpoint
        reminderEnabled: item.has_reminder,
      }));

      this.setState({ toDoList: initialToDoList });
      await DefaultPreference.set('toDoList', JSON.stringify(initialToDoList));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch initial To-Do list');
    }
  }

  async setupNotificationChannel() {
    // Create a channel (required for Android)
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Setup notification event handler
    notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('Notification dismissed', detail.notification);
          break;
        case EventType.PRESS:
          console.log('Notification pressed', detail.notification);
          break;
      }
    });
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

  handleEdit = (id: string) => {
    const { toDoList } = this.state;
    const itemToEdit = toDoList.find(item => item.id === id);
    if (itemToEdit) {
      this.setState({
        newTitle: itemToEdit.title,
        newDescription: itemToEdit.description,
        editingItemId: id,
      });
    }
  };

  handleDelete = async (id: string) => {
    const { toDoList } = this.state;
    const updatedToDoList = toDoList.filter(item => item.id !== id);
    this.setState({ toDoList: updatedToDoList });

    try {
      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      await notifee.cancelTriggerNotification(id);
      Alert.alert('Success', 'To-Do item deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete To-Do item');
    }
  };

  handleUpdateToDo = async () => {
    const { toDoList, newTitle, newDescription, editingItemId } = this.state;

    const updatedToDoList = toDoList.map(item =>
      item.id === editingItemId
        ? { ...item, title: newTitle, description: newDescription }
        : item
    );
    this.setState({ toDoList: updatedToDoList, newTitle: '', newDescription: '', editingItemId: null });
    try {
      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      Alert.alert('Success', 'To-Do item updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update To-Do item');
    }
  };

  handleToggleReminder = (id: string, reminderEnabled: boolean) => {
    const { toDoList } = this.state;
    const updatedToDoList = toDoList.map(item =>
      item.id === id ? { ...item, reminderEnabled } : item
    );
    this.setState({ toDoList: updatedToDoList });
  };

  renderItem = ({ item }: { item: ToDoItem }) => (
    <View style={styles.todoItemContainer}>
      <Text style={styles.todoItemTitle}>{item.title}</Text>
      <Text style={styles.todoItemDescription}>{item.description}</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Edit" onPress={() => this.handleEdit(item.id)} />
        </View>
        <View style={styles.button}>
          <Button title="Delete" onPress={() => this.handleDelete(item.id)} color="#841584" />
        </View>
      </View>
      {this.state.editingItemId === item.id && (
        <View style={styles.toggleReminderContainer}>
          <Text>Enable Reminder:</Text>
          <Switch
            value={item.reminderEnabled}
            onValueChange={(value) => this.handleToggleReminder(item.id, value)}
          />
        </View>
      )}
    </View>
  );

  render() {
    const { newTitle, newDescription, editingItemId } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>To-Do List</Text>
        <FlatList
          data={this.state.toDoList}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
        />
        {editingItemId && (
          <View style={styles.editContainer}>
            <TextInput
              value={newTitle}
              onChangeText={(text) => this.setState({ newTitle: text })}
              placeholder="Edit To-Do Title"
              style={styles.input}
            />
            <TextInput
              value={newDescription}
              onChangeText={(text) => this.setState({ newDescription: text })}
              placeholder="Edit To-Do Description"
              style={styles.input}
            />
            <Button title="Update To-Do" onPress={this.handleUpdateToDo} />
          </View>
        )}
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
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  flatListContent: {
    flexGrow: 1,
  },
  todoItemContainer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#430e75',
    padding: 10,
    borderRadius: 5,
  },
  todoItemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  todoItemDescription: {
    fontSize: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginHorizontal: 20,
  },
  button: {
    width: "40%",
    margin: 10,
  },
  toggleReminderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  editContainer: {
    marginTop: 10,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
});

export default ToDoListScreen;
