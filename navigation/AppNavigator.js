import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/citizen/RegisterScreen';

// Citizen Screens
import HomeScreen from '../screens/citizen/HomeScreen';
import CitizenMap from '../screens/citizen/MapScreen';
import CitizenProfile from '../screens/citizen/ProfileScreen';
import NewReportScreen from '../screens/citizen/NewReportScreen';
import MyReportsScreen from '../screens/citizen/MyReportsScreen';
import WalletScreen from '../screens/citizen/WalletScreen';
import EditProfileScreen from '../screens/citizen/EditProfileScreen';
import SettingsScreen from '../screens/citizen/SettingsScreen';
import LanguageScreen from '../screens/citizen/LanguageScreen';
import HelpSupportScreen from '../screens/citizen/HelpSupportScreen';

// Cleaner Screens
import CleanerHomeScreen from '../screens/cleaner/CleanerHomeScreen';
import MyAssignmentsScreen from '../screens/cleaner/MyAssignmentsScreen';
import CleanerMap from '../screens/cleaner/MapScreen';
import CleanerProfile from '../screens/cleaner/ProfileScreen';
import TaskDetailsScreen from '../screens/cleaner/TaskDetailsScreen';
import PerformanceAnalysisScreen from '../screens/cleaner/PerformanceAnalysisScreen';
import PayoutHistoryScreen from '../screens/cleaner/PayoutHistoryScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageReportsScreen from '../screens/admin/ManageReportsScreen';
import CleanerManagementScreen from '../screens/admin/CleanerManagementScreen';
import AdminMap from '../screens/admin/MapScreen';
import AdminProfile from '../screens/admin/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Shared Tab Screen Options
const tabScreenOptions = {
    headerShown: false,
    tabBarShowLabel: true,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: '#64748B',
    tabBarStyle: {
        height: 100,
        paddingBottom: 40,
        paddingTop: 15,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
    },
};

// Citizen Tabs
const CitizenTabs = () => {
    return (
        <Tab.Navigator screenOptions={tabScreenOptions}>
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> }} />
            <Tab.Screen name="Map" component={CitizenMap} options={{ tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} /> }} />
            <Tab.Screen name="Tasks" component={MyReportsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="clipboard-outline" size={24} color={color} /> }} />
            <Tab.Screen name="Profile" component={CitizenProfile} options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> }} />
        </Tab.Navigator>
    );
}

// Cleaner Tabs
const CleanerTabs = () => {
    return (
        <Tab.Navigator screenOptions={tabScreenOptions}>
            <Tab.Screen name="Home" component={CleanerHomeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> }} />
            <Tab.Screen name="Map" component={CleanerMap} options={{ tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} /> }} />
            <Tab.Screen name="Tasks" component={MyAssignmentsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="clipboard-outline" size={24} color={color} /> }} />
            <Tab.Screen name="Profile" component={CleanerProfile} options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> }} />
        </Tab.Navigator>
    );
}

// Admin Tabs
const AdminTabs = () => {
    return (
        <Tab.Navigator screenOptions={tabScreenOptions}>
            <Tab.Screen name="Home" component={AdminDashboardScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> }} />
            <Tab.Screen name="Map" component={AdminMap} options={{ tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} /> }} />
            <Tab.Screen name="Tasks" component={ManageReportsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="clipboard-outline" size={24} color={color} /> }} />
            <Tab.Screen name="Profile" component={AdminProfile} options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> }} />
        </Tab.Navigator>
    );
}

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />

                {/* Role based navigation Stacks */}
                <Stack.Screen name="CitizenHome" component={CitizenTabs} />
                <Stack.Screen name="CleanerHome" component={CleanerTabs} />
                <Stack.Screen name="AdminHome" component={AdminTabs} />

                {/* Shared Screens */}
                <Stack.Screen name="NewReport" component={NewReportScreen} />
                <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
                <Stack.Screen name="PerformanceAnalysis" component={PerformanceAnalysisScreen} />
                <Stack.Screen name="PayoutHistory" component={PayoutHistoryScreen} />
                <Stack.Screen name="ManageReports" component={ManageReportsScreen} />
                <Stack.Screen name="CleanerManagement" component={CleanerManagementScreen} />
                <Stack.Screen name="Wallet" component={WalletScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Language" component={LanguageScreen} />
                <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
