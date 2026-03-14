package com.firulais.ar

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import cafe.adriel.voyager.navigator.Navigator
import ui.screens.SplashScreen

@Composable
fun App() {
    MaterialTheme {
        Navigator(SplashScreen)
    }
}