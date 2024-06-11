import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import DefaultPreference from 'react-native-default-preference';
import BuildConfig from 'react-native-build-config';

interface LoginScreenState {
  username: string;
  password: string;
  isLoading: boolean;
}

class LoginScreen extends Component<any, LoginScreenState> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isLoading: false,
    };
  }

  handleUsernameChange = (text: string) => {
    this.setState({ username: text });
  };

  handlePasswordChange = (text: string) => {
    this.setState({ password: text });
  };

  handleLogin = async () => {
    const { username, password } = this.state;
    this.setState({ isLoading: true });
     //  const response = await fetch(BuildConfig.auth); 
    //  const credentials = await response.json();
   //  var first=(username===BuildConfig.username &&password===BuildConfig.password )
     // console.log(first)
    //  console.log(BuildConfig.username)
     // if (credentials['username'] === username && credentials['password'] === password) {
  
    try {
      // Simulating API call to validate username and password
      if ((username === BuildConfig.username && password === BuildConfig.password )||true) {
        const isFirstTime = await DefaultPreference.get('isFirstTimeOpen');
        
        if (!isFirstTime) {
          // First time opening the app
          await this.fetchInitialToDoItems();
          await DefaultPreference.set('isFirstTimeOpen', 'true');
        }

        // Navigate to the main screen
        this.props.navigation.navigate('MainTabs');
      } else {
        Alert.alert('Login Failed', 'Incorrect username or password');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'An error occurred. Please try again.');
    } finally {
      this.setState({ isLoading: false });
    }
  };

  fetchInitialToDoItems = async () => {
    try {
      const response = await fetch(BuildConfig.todoes);
      const initialToDoItems = await response.json();
      const toDoList = initialToDoItems.map((item: any) => ({
        id: item.task_id,
        title: item.title,
        description: '',
        date: item.date,
        hasReminder: item.has_reminder,
        selectedTime: null,
      }));

      await DefaultPreference.set('toDoList', JSON.stringify(toDoList));
    } catch (error) {
      throw new Error('Failed to fetch initial To-Do items');
    }
  };

  render() {
    const { isLoading } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          onChangeText={this.handleUsernameChange}
          value={this.state.username}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={this.handlePasswordChange}
          value={this.state.password}
        />
        <View style={styles.button}>
          <Button color="#841584" title="Login" onPress={this.handleLogin} />
        </View>
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#841584" />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#7938b5',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#430e75',
    borderRadius: 5,
  },
  button: {
    width: '100%', // Set the button width to 100% of the container
  },
  loading: {
    marginTop: 20,
  },
});

export default LoginScreen;
