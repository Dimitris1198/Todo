import React, { Component } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import BuildConfig from 'react-native-build-config';
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
 
    console.log(BuildConfig.auth );
    try {
      const response = await fetch(BuildConfig.auth); 
      const credentials = await response.json();
      console.log(credentials);
      var first=(username===BuildConfig.username &&password===BuildConfig.password )
      console.log(first)
      console.log(BuildConfig.username)
      if (credentials['username'] === username && credentials['password'] === password) {
        this.props.navigation.navigate('MainTabs');
        console.log("ok");
      } else {
        this.props.navigation.navigate('MainTabs');
        Alert.alert('Εφαγες πορτα', 'Λαθος στοιχεια');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'An error occurred. Please try again.');
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Ονομα χρηστη"
          onChangeText={this.handleUsernameChange}
          value={this.state.username}
        />
        <TextInput
          style={styles.input}
          placeholder="Κωδικουλης"
          secureTextEntry
          onChangeText={this.handlePasswordChange}
          value={this.state.password}
        />
        <View  style={styles.button}>
        <Button  color='#841584' title="Login"     onPress={this.handleLogin}  />
        </View>
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
});

export default LoginScreen;