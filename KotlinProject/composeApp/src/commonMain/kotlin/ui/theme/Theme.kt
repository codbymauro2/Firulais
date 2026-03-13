package ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ── Paleta Firulais ──────────────────────────────────────────────
val FirulaisBlue        = Color(0xFF1565C0)
val FirulaisBlueDark    = Color(0xFF0D2D4C)
val FirulaisBlueLight   = Color(0xFF1976D2)
val FirulaisBackground  = Color(0xFFFFFFFF)
val FirulaisSurface     = Color(0xFFF5F7FA)
val FirulaisOnPrimary   = Color(0xFFFFFFFF)
val FirulaisTextPrimary = Color(0xFF1A1A2E)
val FirulaisTextSecondary = Color(0xFF888888)

private val FirulaisColorScheme = lightColorScheme(
    primary          = FirulaisBlue,
    onPrimary        = FirulaisOnPrimary,
    primaryContainer = FirulaisBlueLight,
    background       = FirulaisBackground,
    surface          = FirulaisSurface,
    onBackground     = FirulaisTextPrimary,
    onSurface        = FirulaisTextPrimary,
)

@Composable
fun FirulaisTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = FirulaisColorScheme,
        content = content
    )
}