import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

interface LoginScreenState {
  username: string;
  password: string;
}

class LoginScreen extends Component<any, LoginScreenState> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      password: '',
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

    try {
      const response = await fetch('https://api.npoint.io/f74e690311e2654a5f8f'); 
      const credentials = await response.json();
        console.log(credentials['password'],"aaaaaaaaa");
      if (credentials['user_name'] === username && credentials['password'] === password) {
        this.props.navigation.navigate('MainTabs');
      } else {
        Alert.alert('Εφαγες πορτα', 'Λαθος στοιχεια');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'An error occurred. Please try again.');
    }
  };

  render() {
    return (
      <View>
        <Text>Login</Text>
        <TextInput
          placeholder="Ονομα χρηστη"
          onChangeText={this.handleUsernameChange}
          value={this.state.username}
        />
        <TextInput
          placeholder="Κωδικουλης"
          secureTextEntry
          onChangeText={this.handlePasswordChange}
          value={this.state.password}
        />
        <Button title="Login" onPress={this.handleLogin} />
      </View>
    );
  }
}

export default LoginScreen;
