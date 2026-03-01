import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from './src/types';
import { Colors } from './src/constants';
import { cartService } from './src/services/cartService';
import {
  SplashScreen,
  LoginScreen,
  ForgotPasswordScreen,
  RegisterScreen,
  VerificationScreen,
  HomeScreen,
  ProductDetailScreen,
  CartScreen,
  PaymentScreen,
  OrderConfirmedScreen,
  NotificationsScreen,
  MessagesListScreen,
  ChatScreen,
  SellScreen,
  FavoritesScreen,
  ProfileScreen,
  SearchScreen,
  ReviewsScreen,
  MyArticlesScreen,
} from './src/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Bottom Tab Navigator — 5 onglets Figma
 * Vendre/Louer | Boutique | Favoris | Panier | Profil
 */
function MainTabNavigator() {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    const count = await cartService.getCount();
    setCartCount(count);
  }, []);

  // Rafraîchir le badge quand on revient d'un écran stack (ex: ProductDetail)
  useFocusEffect(
    useCallback(() => {
      refreshCartCount();
    }, [refreshCartCount])
  );

  return (
    <Tab.Navigator
      screenListeners={{
        state: () => {
          // Rafraîchir le badge à chaque changement d'onglet
          refreshCartCount();
        },
        focus: () => {
          refreshCartCount();
        },
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.backgroundWhite,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';
          switch (route.name) {
            case 'Sell':
              iconName = 'clipboard-outline';
              break;
            case 'Boutique':
              iconName = 'storefront-outline';
              break;
            case 'Favorites':
              iconName = 'heart-outline';
              break;
            case 'Cart':
              iconName = 'bag-outline';
              break;
            case 'ProfileTab':
              iconName = 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Sell" component={SellScreen} options={{ tabBarLabel: 'Vendre/Louer' }} />
      <Tab.Screen name="Boutique" component={HomeScreen} options={{ tabBarLabel: 'Boutique' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: 'Favoris' }} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Panier',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.primary,
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            lineHeight: 14,
          },
        }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

/**
 * Point d'entrée de SOLUL
 * Splash → Auth flow → MainTabs + stack screens
 */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.backgroundWhite },
            animation: 'slide_from_right',
          }}
        >
          {/* Auth screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />

          {/* Main app (tab navigator) */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />

          {/* Stack screens over tabs */}
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Messages" component={MessagesListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} />
          <Stack.Screen name="MyArticles" component={MyArticlesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
