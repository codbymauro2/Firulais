package ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun PrimaryButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Button(onClick = onClick, modifier = modifier) { Text(text) }
}

@Composable
fun SocialButtons(
    onApple: () -> Unit,
    onGoogle: () -> Unit,
    onFacebook: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedButton(onClick = onApple, modifier = Modifier.fillMaxWidth()) { Text("Continuar con Apple") }
        OutlinedButton(onClick = onGoogle, modifier = Modifier.fillMaxWidth()) { Text("Continuar con Google") }
        OutlinedButton(onClick = onFacebook, modifier = Modifier.fillMaxWidth()) { Text("Continuar con Facebook") }
    }
}