import React, { Component } from 'react';
import { View, Text, FlatList, Button, Alert, TextInput, Platform, Switch } from 'react-native';
import DefaultPreference from 'react-native-default-preference';
import notifee, { EventType, TriggerType, TimestampTrigger } from '@notifee/react-native';
import { PERMISSIONS, check, request } from 'react-native-permissions';
import uuid from 'react-native-uuid';

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
}

class ToDoListScreen extends Component<{}, ToDoListScreenState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      toDoList: [],
      newTitle: '',
      newDescription: '',
      editingItemId: null,
    };
  }

  async componentDidMount() {
    this.loadToDoList();
    this.setupNotificationChannel();
    this.props.navigation.addListener('focus', this.loadToDoList);
  }

  componentWillUnmount() {
    this.props.navigation.removeListener('focus', this.loadToDoList);
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
      Alert.alert('Σγαλμα', 'Η λιστα δεν μπορεσε να φορτωσει');
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
      Alert.alert('Ολα καλα', 'Διεγραψες ενα αντικειμενο μαγκα μου');
    } catch (error) {
      Alert.alert('Προβλημα', 'Δεν διεγραψες τιποτα μαγκα μου');
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
      Alert.alert('Τα καταφερατε', 'Προσθεσατε ενα  αντικειμενο στην λιστα');
    } catch (error) {
      Alert.alert('Σφαλμα', 'Παρουσιαστικε σφακμα');
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
    <View>
      <Text>{item.title}</Text>
      <Text>{item.description}</Text>
      <Button title="Edit" onPress={() => this.handleEdit(item.id)} />
      <Button title="Delete" onPress={() => this.handleDelete(item.id)} />
      {this.state.editingItemId === item.id && (
        <View>
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
      <View>
        <Text>To-Do List</Text>
        <FlatList
          data={this.state.toDoList}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.id}
        />
        {editingItemId && (
          <>
            <TextInput
              value={newTitle}
              onChangeText={(text) => this.setState({ newTitle: text })}
              placeholder="Επεξεργασια τιτλου"
            />
            <TextInput
              value={newDescription}
              onChangeText={(text) => this.setState({ newDescription: text })}
              placeholder="Επεξεργασια  περιγρασης"
            />
            <Button title="Επεξεργασια" onPress={this.handleUpdateToDo} />
          </>
        )}
      </View>
    );
  }
}

export default ToDoListScreen;
