import React, { Component } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet, Switch, TextInput } from 'react-native';
import DefaultPreference from 'react-native-default-preference';
import notifee, { EventType } from '@notifee/react-native';
import { PERMISSIONS, check, request } from 'react-native-permissions';
import uuid from 'react-native-uuid';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ToDoItem {
  id: string;
  title: string;
  description: string;
  date: string;
  hasReminder: boolean; // Update this line
  selectedTime: Date | null; // Add this line
}



interface ToDoListScreenState {
  toDoList: ToDoItem[];
  newTitle: string;
  newDescription: string;
  editingItemId: string | null;
  hasReminder: boolean;
  selectedTime: Date | null;

}

class ToDoListScreen extends Component<{}, ToDoListScreenState> {
  isInitialLoad: boolean = true;
  hasReminder: boolean | undefined;


  constructor(props: {}) {
    super(props);
    this.state = {
      toDoList: [],
      newTitle: '',
      newDescription: '',
      editingItemId: null,
      hasReminder: false,
      selectedTime: new Date(),
    };
    console.log('i construict list')
  }

  async componentDidMount() {
    this.loadToDoList();
    this.setupNotificationChannel();
    this.props.navigation.addListener('focus', this.handleFocus);
  }

  componentWillUnmount() {
    this.props.navigation.removeListener('focus', this.handleFocus);
  }

  handleFocus = async () => {
    if (this.isInitialLoad) {
      await this.fetchInitialToDoItems();
      this.isInitialLoad = false;
    } else {
      this.loadToDoList();
    }
  };

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

  fetchInitialToDoItems = async () => {
    try {
      const response = await fetch('https://api.npoint.io/3dbe9481cd6175f6ffd8');
      const initialToDoItems = await response.json();

      const toDoList = initialToDoItems.map((item: any) => ({
        id: item.task_id,
        title: item.title,
        description: '',
        selectedTime: item.date,

        hasReminder: item.has_reminder,
      }));

      this.setState({ toDoList });
      await DefaultPreference.set('toDoList', JSON.stringify(toDoList));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch initial To-Do items');
    }
  };

  generateUniqueId = (): string => {
    return uuid.v4(); // Generate a UUID
  };

  handleEdit = (id: string) => {
    const { toDoList } = this.state;
    const itemToEdit = toDoList.find(item => item.id === id);
    console.log(itemToEdit)
    if (itemToEdit) {
      this.setState({
        newTitle: itemToEdit.title,
        newDescription: itemToEdit.description,
        editingItemId: id,
        hasReminder: itemToEdit.hasReminder,
        selectedTime: itemToEdit.selectedTime,
      });
    }
  };




  handleTitleChange = (text: string) => {
    this.setState({ newTitle: text });
  };

  handleDescriptionChange = (text: string) => {
    this.setState({ newDescription: text });
  };

  handleReminderChange = (value: boolean) => {
    console.log(value)
    this.setState({ hasReminder: value });


  };
  handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (selectedTime) {
      this.setState({ selectedTime });
    }
  };

  handleUpdate = async () => {
    const { newTitle, newDescription, editingItemId, toDoList } = this.state;
    const updatedToDoList = toDoList.map(item => {
      if (item.id === editingItemId) {
        return { ...item, title: newTitle, description: newDescription };
      }
      return item;
    });
    this.setState({ toDoList: updatedToDoList, editingItemId: null });

    try {
      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      Alert.alert('Success', 'To-Do item updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update To-Do item');
    }
  };

  handleCancel = () => {
    this.setState({ newTitle: '', newDescription: '', editingItemId: null });
  };

  handleDelete = async (id: string) => {
    const { toDoList } = this.state;
    const updatedToDoList = toDoList.filter(item => item.id !== id);
    this.setState({ toDoList: updatedToDoList });

    try {
      await DefaultPreference.set('toDoList', JSON.stringify(updatedToDoList));
      await notifee.cancelNotification(id);
      Alert.alert('Success', 'To-Do item deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete To-Do item');
    }
  };

  renderItem = ({ item }: { item: ToDoItem }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.buttonContainer}>
          <Button title="Edit" onPress={() => this.handleEdit(item.id)} />
          <Button title="Delete" onPress={() => this.handleDelete(item.id)} />
        </View>
      </View>
    );
  };

  render() {
    const { newTitle, newDescription, editingItemId } = this.state;
    return (
      <View style={styles.container}>
        {editingItemId !== null && (
        <View style={styles.editForm}>
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

            <View style={styles.reminderContainer}>
              <Text>Set Reminder:</Text>
              <Switch value={this.state.hasReminder} onValueChange={this.handleReminderChange} />
            </View>
            {this.hasReminder && (
              <DateTimePicker

                value={this.state.selectedTime || new Date()}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={this.handleTimeChange}
              />
            )}

          </View>
          <View style={styles.buttonContainer}>
            <Button title="Update" onPress={this.handleUpdate} />
            <Button title="Cancel" onPress={this.handleCancel} />
          </View>
        </View>
        )}
        <FlatList
          data={this.state.toDoList}
          renderItem={this.renderItem}
          keyExtractor={item => item.id} // Ensure each item has a unique key
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 16,
    color: '#666',
  },
  itemDescription: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editForm: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default ToDoListScreen;

