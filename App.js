import Colors from './components/const/color';
import { authentication } from './firebase/firebase-config';

import HomeScreen from './components/screens/HomeScreen';
import BookingScreen from './components/screens/BookingScreen';
import WishlistScreen from './components/screens/WishlistScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import HotelDetailScreen from './components/screens/HotelDetailScreen';
import AllHotels from './components/screens/AllHotels';

import LogInScreen from './components/Navigation/LogInScreen';
import SignUpScreen from './components/Navigation/SignUpScreen'; 
import ForgotPasswordScreen from './components/Navigation/ForgotPasswordScreen';
import ProfileLogedInScreen from './components/Navigation/ProfileLogedInScreen';

import BookNowScreen from './components/BookingNavigation/BookNowScreen';
import PaymentScreen from './components/BookingNavigation/PaymentScreen';
import CompletedBookingScreen from './components/BookingNavigation/CompletedBookingScreen';
import CancelBookingScreen from './components/BookingNavigation/CancelBookingScreen';
import UpdateBookingScreen from './components/BookingNavigation/UpdateBookingScreen';

import 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {Component, useState, useEffect} from 'react';
import { StatusBar, Text, Dimensions } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { onAuthStateChanged } from "firebase/auth";
import { LogBox } from 'react-native';
import { and } from 'react-native-reanimated';
import { openDatabase } from 'react-native-sqlite-storage';

LogBox.ignoreLogs (['EventEmitter.removeListener']);


const StackNav = createStackNavigator();
const Tab = createBottomTabNavigator();
const TopTabs = createMaterialTopTabNavigator();
const fullScreenWidth = Dimensions.get('window').width


function ProfileStackScreen(){
  return(
    <StackNav.Navigator screenOptions={{headerShown:false}} >
      <StackNav.Screen 
          name="ProfileStack" 
          component={ProfileScreen} 
      />
      <StackNav.Screen 
          name="LogIn" 
          component={LogInScreen} 
      />
      <StackNav.Screen 
          name="SignUp" 
          component={SignUpScreen} 
      />
      <StackNav.Screen 
          name="Forgot" 
          component={ForgotPasswordScreen} 
      />
      <StackNav.Screen 
          name="ProfileLogedIn" 
          component={ProfileLogedInScreen} 
      />
    </StackNav.Navigator>
  );
}

function HomeStackScreen(){
  return(
    <StackNav.Navigator >
      <StackNav.Screen 
          name="HomeStack" 
          component={HomeScreen} 
          options={{headerShown: false}}
      />
      <StackNav.Screen  
          name="HotelDetail" 
          component={HotelDetailScreen} 
          options={{headerShown: false}}
      />
      <StackNav.Screen  
          name="AllHotels" 
          component={AllHotels} 
          options={{headerShown: true, headerTitle: '', headerShadowVisible: false,}}
      />
      
      {/* Booking Navigation */}
      <StackNav.Screen 
          name="BookNow" 
          component={BookNowScreen} 
          options={{headerShown: false}}
      />
      <StackNav.Screen 
          name="Payment" 
          component={PaymentScreen} 
          options={{headerShown: false}}
      />
    </StackNav.Navigator>
  );
}


function TopTabsFunction(){
  return(
    <TopTabs.Navigator screenOptions={{headerShown:false}} >
      <TopTabs.Screen 
          name="Upcoming" 
          component={BookingScreen} 
      />
      <TopTabs.Screen 
          name="Completed" 
          component={CompletedBookingScreen} 
      />
      <TopTabs.Screen 
          name="Cancelled" 
          component={CancelBookingScreen} 
      />
    </TopTabs.Navigator>
  );
}

const db = openDatabase({
  name: "hotel_booking", 
  location: 'default'
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Listens to auth changes 
  useEffect(() => { 
    onAuthStateChanged(authentication, (user) => {
      if (user) 
        setIsLoggedIn(true);
      else
        setIsLoggedIn(false);
    });

    // Function to create favourites database table if does not exists
    const createTable = () => {
      db.transaction(tx => {
          tx.executeSql(
              'CREATE TABLE IF NOT EXISTS favourites (id INTEGER PRIMARY KEY AUTOINCREMENT, userID VARCHAR(20), hotelID VARCHAR(20))',
              [],
              (sqlTxn, res) => {
                console.log("Table created successfully");
              },
              error => {
                console.log("Error creating table: " + error.message);
              },
          );
      });
    };

    createTable();
  })

  return (
    <NavigationContainer >
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <Tab.Navigator
        initialRouteName={'HomeStack'}
        screenOptions={({route}) => ({
          tabBarActiveTintColor: "#1e9fe9",
          tabBarInactiveTintColor: "black",
          tabBarLabelStyle:{
            fontSize: 12,
            marginBottom: 19
          },
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle:{
            height:80,
          },
          tabBarIcon: ({focused, color, size, padding}) => {
            let iconName;
            if (route.name === 'Home'){
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Bookings') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Wishlists') {
              iconName = focused ? 'bookmarks' : 'bookmarks-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }
            
            return ( 
              <Ionicons 
                name={iconName}
                size={size}
                color={color}
                style={{paddingBottom: padding, marginBottom: 10, marginTop: 10}} 
              />
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStackScreen} options={({route}) => ({
            tabBarStyle: ((route) => {
              const routeName = getFocusedRouteNameFromRoute(route) ?? ""
              console.log(routeName)
              if (routeName === 'BookNow') {
                return { display: "none" }
              }else{
                return { height: 80}
              }
            })(route),
          })} 
        />
        <Tab.Screen name="Bookings" component={TopTabsFunction} />
        <Tab.Screen name="Wishlists" component={WishlistScreen} />
        <Tab.Screen name="Profile" component={ isLoggedIn ? ProfileLogedInScreen : ProfileStackScreen }
          options={({ route}) => ({
            tabBarStyle: ((route) => {
              const routeName = getFocusedRouteNameFromRoute(route) ?? ""
              console.log(routeName)
              if (routeName === 'LogIn' || routeName === 'SignUp' || routeName === 'Forgot') {
                return { display: "none" }
              }else{
                return { height: 80}
              }
            })(route),
          })}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}


export default App;