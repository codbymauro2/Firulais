package com.firulais.ar
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*

@Composable
fun App() {
    MaterialTheme {
        cafe.adriel.voyager.navigator.Navigator(ui.screens.SplashScreen)
    }
}
