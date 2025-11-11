package ui.navigation

import androidx.compose.runtime.Composable
import cafe.adriel.voyager.navigator.Navigator
import ui.screens.SplashScreen

@Composable
fun AppNavigator() {
    Navigator(SplashScreen)
}