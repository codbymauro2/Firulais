package ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Primary = Color(0xFF0D86C6)
private val OnPrimary = Color(0xFFFFFFFF)
private val Background = Color(0xFF0E7CD4)
private val OnBackground = Color(0xFF0E7CD4)

private val LightColors = lightColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    background = Background,
    onBackground = OnBackground
)

@Composable
fun FirulaisTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = Typography(),
        content = content
    )
}