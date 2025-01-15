import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  Linking
} from 'react-native';
import WebView from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import axios from 'axios'; // Make sure to import axios

// Home Screen
const HomeScreen = ({ navigation }) => {
  const [isHeaderEnabled, setHeaderEnabled] = useState(false);
  const [isAutoRotationEnabled, setAutoRotationEnabled] = useState(false);
  const [isHttpsRequired, setHttpsRequired] = useState(true);
  const [baseUrl, setBaseUrl] = useState('https://iosmirror.cc/');
  const [urlParams, setUrlParams] = useState('');
  const [theme, setTheme] = useState('light'); // Theme state

  const handleOpenWebView = async () => {
    const fullUrl = `${baseUrl}${urlParams}`;

    // Check if HTTPS is required
    const isHttps = isHttpsRequired; // This should be a boolean value (true or false)

    // Validate the URL format
    if (isHttps && !fullUrl.startsWith('https://')) {
      Alert.alert('Error', 'HTTPS is required for the URL.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('url', baseUrl);
      formData.append('https', isHttps ? 'true' : 'false');
      formData.append('perameter', urlParams );

      const response = await axios.post(
        'https://mobiledetects.com/valid-url',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const validUrl = response.data.valid_url; // Assuming the response contains a valid_url field
      if (validUrl) {
        navigation.navigate('WebView', {
          url: validUrl+urlParams,
          showHeader: isHeaderEnabled,
          isAutoRotationEnabled: isAutoRotationEnabled,
        });
      } else {
        Alert.alert('Error', 'The URL is not valid.');
      }
    } catch (error) {
      console.error('Error during API call:', error.response || error); // Log the error if the API call fails
      Alert.alert('Error', 'Failed to validate the URL.');
    }
  };


  const handleOpenInSafari = (baseUrl, urlParams) => {
    const fullUrl = `${baseUrl}${urlParams}`;
    Linking.openURL(fullUrl).catch(err =>
      Alert.alert('Error', 'Failed to open URL in Safari.')
    );
  };

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Change the status bar style based on the new theme
      StatusBar.setBarStyle(newTheme === 'dark' ? 'light-content' : 'dark-content');
      return newTheme;
    });
  };

  const isDarkTheme = theme === 'dark';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkTheme ? '#121212' : '#fff' },
      ]}
    >
      {/* Theme Toggle Icon */}
      <TouchableOpacity
        style={styles.themeToggle}
        onPress={toggleTheme}
      >
        <Icon
          name={isDarkTheme ? 'sunny' : 'moon'}
          size={24}
          color={isDarkTheme ? '#ffcc00' : '#000'}
        />
      </TouchableOpacity>

      {/* Dodo Logo Image */}
      <Image
        source={require('./assets/2025_Transparant-15.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkTheme ? '#333' : '#fff',
              color: isDarkTheme ? '#fff' : '#000',
            },
          ]}
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="Enter Base URL"
          placeholderTextColor={isDarkTheme ? '#aaa' : '#888'}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkTheme ? '#333' : '#fff',
              color: isDarkTheme ? '#fff' : '#000',
            },
          ]}
          value={urlParams}
          onChangeText={setUrlParams}
          placeholder="Enter URL Parameters"
          placeholderTextColor={isDarkTheme ? '#aaa' : '#888'}
        />
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchRow}>
          <Text style={{ color: isDarkTheme ? '#fff' : '#000' }}>
            Show Header Bar
          </Text>
          <Switch
            value={isHeaderEnabled}
            onValueChange={setHeaderEnabled}
            trackColor={{ true: '#F15A29', false: 'gray' }}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={{ color: isDarkTheme ? '#fff' : '#000' }}>
            Auto Rotation
          </Text>
          <Switch
            value={isAutoRotationEnabled}
            onValueChange={setAutoRotationEnabled}
            trackColor={{ true: '#F15A29', false: 'gray' }}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={{ color: isDarkTheme ? '#fff' : '#000' }}>
            HTTPS Required
          </Text>
          <Switch
            value={isHttpsRequired}
            onValueChange={setHttpsRequired}
            trackColor={{ true: '#F15A29', false: 'gray' }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleOpenWebView}>
        <Text
          style={[
            styles.buttonText,
            { color: isDarkTheme ? '#000' : '#000' },
          ]}
        >
          Open WebView
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleOpenInSafari(baseUrl, urlParams)}
      >
        <Text style={styles.buttonText}>Open in Safari</Text>
      </TouchableOpacity>

    </View>
  );
};

const WebViewScreen = ({ route }) => {
  const { url, showHeader, isAutoRotationEnabled } = route.params;

  useEffect(() => {
    if (showHeader) {
      StatusBar.setHidden(false);
    } else {
      StatusBar.setHidden(true);
    }

    // Lock or unlock orientation based on auto-rotation setting
    if (isAutoRotationEnabled) {
      ScreenOrientation.unlockAsync(); // Allow rotation
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT); // Lock to portrait
    }

    return () => {
      StatusBar.setHidden(false);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT); // Reset to default when leaving
    };
  }, [showHeader, isAutoRotationEnabled]);

  return (
    <View style={{ flex: 1 }}>
      {showHeader && (
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerText}>Dodo Webview</Text>
        </SafeAreaView>
      )}
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        originWhitelist={['*']} // Optional, allows all origins
      />
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WebView"
          component={WebViewScreen}
          options={{ headerShown: false }} // Hide React Navigation header
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};




// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  header: {
    height: 50, // You can adjust this height as needed
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10, // Optional: Add some padding if needed
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 10,
    padding: 10,
  },
  logo: {
    width: 200,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  switchContainer: {
    marginBottom: 30,
    marginTop: 25,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
  },
  header: {
    height: 50,
    backgroundColor: '#F15A29',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
