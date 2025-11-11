package ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import ui.components.PrimaryButton
import ui.components.SocialButtons

object LoginScreen : Screen {
    @Composable
    override fun Content() {
        val nav = LocalNavigator.currentOrThrow
        Scaffold { inner ->
            Column(
                Modifier.fillMaxSize().padding(inner).padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                Text("Iniciar sesión", style = MaterialTheme.typography.headlineMedium)
                SocialButtons(onApple = {}, onGoogle = {}, onFacebook = {})
                Spacer(Modifier.weight(1f))
                PrimaryButton("Entrar", onClick = { nav.replace(HomeScreen) }, modifier = Modifier.fillMaxWidth())
            }
        }
    }
}
