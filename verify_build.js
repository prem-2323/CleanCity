const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'navigation/AppNavigator.js',
    'screens/SplashScreen.js',
    'screens/LoginScreen.js',
    'screens/NewReportScreen.js',
    'screens/HomeScreen.js',
    'screens/MapScreen.js',
    'screens/WalletScreen.js',
    'screens/MyReportsScreen.js',
    'screens/MyAssignmentsScreen.js',
    'screens/AdminDashboardScreen.js',
    'screens/TaskDetailsScreen.js',
    'screens/ManageReportsScreen.js',
    'screens/ProfileScreen.js',
    'components/Button.js',
    'components/Input.js',
    'constants/theme.js',
    'App.js'
];

console.log('Verifying project structure...');

let allExists = true;

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        allExists = false;
    }
});

if (allExists) {
    console.log('\nProject structure verification PASSED.');
} else {
    console.log('\nProject structure verification FAILED.');
    process.exit(1);
}
