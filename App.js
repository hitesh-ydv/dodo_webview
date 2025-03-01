import React, { useState, useEffect, useRef, use } from 'react';
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
  Linking,
  ActivityIndicator,
  Platform // Import Platform
} from 'react-native';
import WebView from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import FadeInView from 'react-native-fade-in-view';

const HomeScreen = ({ navigation }) => {
  const [isHeaderEnabled, setHeaderEnabled] = useState(true);
  const [isAutoRotationEnabled, setAutoRotationEnabled] = useState(false);
  const [isHttpsRequired, setHttpsRequired] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [urlParams, setUrlParams] = useState('');
  const [theme, setTheme] = useState('light');
  const [isLoadingWebView, setLoadingWebView] = useState(false);
  const [isLoadingSafari, setLoadingSafari] = useState(false);

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify({ baseUrl, urlParams }));
      console.log('Settings saved:', { baseUrl, urlParams });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        const { baseUrl: savedBaseUrl, urlParams: savedUrlParams } = JSON.parse(savedSettings);
        setBaseUrl(savedBaseUrl || '');
        setUrlParams(savedUrlParams || '');
        console.log('Loaded settings:', { savedBaseUrl, savedUrlParams });
      } else {
        console.log('No saved settings found.');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    loadSettings(); // Load settings when the app starts
  }
    , []);

  useEffect(() => {
    saveSettings(); // Save settings when baseUrl or urlParams change
  }, [baseUrl, urlParams]);


  const handleOpenWebView = async () => {
    setLoadingWebView(true);
    const fullUrl = `${baseUrl}${urlParams}`;
    console.log(fullUrl)


    // Check if Auto Rotation is enabled and show alert
    if (isAutoRotationEnabled) {
      Alert.alert(
        'Orientation Lock Check',
        'For Auto Rotation to work, please disable your device\'s orientation lock (via Control Center).',
        [
          {
            text: 'Cancel',
            onPress: () => setLoadingWebView(false),
            style: 'cancel',
          },
          {
            text: 'Proceed Anyway',
            onPress: async () => {
              try {
                const formData = new FormData();
                formData.append('url', baseUrl);
                formData.append('https', isHttpsRequired ? 'true' : 'false');
                formData.append('perameter', urlParams);

                const response = await axios.post(
                  'https://mobiledetects.com/valid-url',
                  formData,
                  {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                  }
                );

                const httpCheck = response.data.https;

                const validUrl = response.data.valid_url;
                if (validUrl) {
                  if (isHttpsRequired && httpCheck) {
                    console.log(httpCheck)
                    navigation.navigate('WebView', {
                      url: `${validUrl}${urlParams}`,
                      showHeader: !isHeaderEnabled,
                      isAutoRotationEnabled: isAutoRotationEnabled,
                    });
                  } else if (!isHttpsRequired && httpCheck) {
                    navigation.navigate('WebView', {
                      url: `${validUrl}${urlParams}`,
                      showHeader: !isHeaderEnabled,
                      isAutoRotationEnabled: isAutoRotationEnabled,
                    });
                  } else if(isHttpsRequired && !httpCheck){
                    Alert.alert('Error', 'The URL is not valid.');

                  }

                } else {
                  Alert.alert('Error', 'The URL is not valid.');
                }
              } catch (error) {
                console.error('Error during API call:', error.response || error);
                Alert.alert('Error', 'Failed to validate the URL.');
              } finally {
                setLoadingWebView(false);
              }
            },
          },
        ]
      );
      return;
    }

    // Proceed if Auto Rotation is disabled
    try {
      const formData = new FormData();
      formData.append('url', baseUrl);
      formData.append('https', isHttpsRequired ? 'true' : 'false');
      formData.append('perameter', urlParams);

      const response = await axios.post(
        'https://mobiledetects.com/valid-url',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const validUrl = response.data.valid_url;
      if (validUrl) {
        navigation.navigate('WebView', {
          url: `${validUrl}${urlParams}`,
          showHeader: !isHeaderEnabled,
          isAutoRotationEnabled: isAutoRotationEnabled,
        });
      } else {
        Alert.alert('Error', 'The URL is not valid.');
      }
    } catch (error) {
      console.error('Error during API call:', error.response || error);
      Alert.alert('Error', 'Failed to validate the URL.');
    } finally {
      setLoadingWebView(false);
    }
  };


  const handleOpenInSafari = async () => {
    setLoadingSafari(true);
    const fullUrl = `${baseUrl}${urlParams}`;
    try {
      await Linking.openURL(fullUrl);
    } catch (err) {
      Alert.alert('Error', 'Failed to open URL in Safari.');
    } finally {
      setLoadingSafari(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
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
        <FadeInView duration={350}>
          <Icon
            name={isDarkTheme ? 'sunny' : 'moon'}
            size={24}
            color={isDarkTheme ? '#ffcc00' : '#000'}
          />
        </FadeInView>
      </TouchableOpacity>

      {/* Dodo Logo Image */}
      <FadeInView duration={350}>
        <Image
          source={require('./assets/2025_Transparant-15.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </FadeInView>

      <FadeInView duration={350}>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkTheme ? '#202020' : '#fff',
                color: isDarkTheme ? '#fff' : '#000',
              },
            ]}
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="Enter Base URL"
            placeholderTextColor={isDarkTheme ? '#aaa' : '#888'}
          />
        </View>
      </FadeInView>

      <FadeInView duration={350}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkTheme ? '#202020' : '#fff',
                color: isDarkTheme ? '#fff' : '#000',
              },
            ]}
            value={urlParams}
            onChangeText={setUrlParams}
            placeholder="Enter URL Parameters"
            placeholderTextColor={isDarkTheme ? '#aaa' : '#888'}
          />
        </View>
      </FadeInView>

      <FadeInView duration={350}>

        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <Text style={{ color: isDarkTheme ? '#fff' : '#000' }}>
              Full Screen
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
      </FadeInView>


      <FadeInView duration={350}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleOpenWebView}
          disabled={isLoadingWebView}
        >
          {isLoadingWebView ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text
              style={[
                styles.buttonText,
                { color: isDarkTheme ? '#000' : '#000' },
              ]}
            >
              Open WebView
            </Text>
          )}
        </TouchableOpacity>
      </FadeInView>

      <FadeInView duration={350}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleOpenInSafari}
          disabled={isLoadingSafari}
        >
          {isLoadingSafari ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.buttonText}>Open in Safari</Text>
          )}
        </TouchableOpacity>
      </FadeInView>

    </View>
  );
};

const WebViewScreen = ({ route, navigation }) => {
  const { url, showHeader, isAutoRotationEnabled } = route.params;
  const [isAdPage, setIsAdPage] = useState(false);

  useEffect(() => {
    if (showHeader) {
      StatusBar.setHidden(false);
    } else {
      StatusBar.setHidden(true);
    }

    if (isAutoRotationEnabled) {
      ScreenOrientation.unlockAsync();
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }

    return () => {
      StatusBar.setHidden(false);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
  }, [showHeader, isAutoRotationEnabled]);

  const handleNavigationStateChange = (navState) => {
    // Check if the URL matches the specific ad link
    if (navState.url.includes('https://userverify.netmirror.app')) {
      // Open the URL externally (Safari/Chrome)
      Linking.openURL(navState.url).catch((err) => console.error('Error opening URL:', err));

      // Simulate waiting for 20 seconds after the ad is opened
      setTimeout(() => {
        // After 20 seconds, navigate back to the app
        Alert.alert('Ad Complete', 'Returning to the home page now.');
        navigation.goBack();  // You can use navigation.navigate('Home') to go directly to the home screen
      }, 20000); // 20 seconds
    }
  };


  return (
    <View style={{ flex: 1 }}>
      {showHeader && (
        <SafeAreaView style={styles.header}>
        </SafeAreaView>
      )}
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        originWhitelist={['*']}
        mediaPlaybackRequiresUserAction={false}  // Automatically play media
        allowsInlineMediaPlayback={true}         // Allow inline playback for videos
        javaScriptEnabled={true}                  // Enable JavaScript for interactive content
        domStorageEnabled={true}                  // Enable DOM storage
        prefersHomeIndicatorAutoHidden={true}     // Hide the home indicator
        contentInsetAdjustmentBehavior="never"    // Prevent safe area adjustment
        allowUniversalAccessFromFileURLs={true}   // Allow file URLs to access data
        useWebKit={true}
        onNavigationStateChange={handleNavigationStateChange}
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
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  header: {
    height: 50,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
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