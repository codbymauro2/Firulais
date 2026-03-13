package ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import kotlinx.coroutines.delay
import org.jetbrains.compose.resources.painterResource
import androidx.compose.foundation.Image
import kotlinproject.composeapp.generated.resources.Res
import kotlinproject.composeapp.generated.resources.splash_icon

val FirulaisBlue = Color(0xFF1565C0)
val FirulaisLightBlue = Color(0xFF1976D2)

object SplashScreen : Screen {

    @Composable
    override fun Content() {
        val navigator = LocalNavigator.currentOrThrow

        // Animación de escala para el logo
        val scale by rememberInfiniteTransition(label = "pulse").animateFloat(
            initialValue = 1f,
            targetValue = 1.08f,
            animationSpec = infiniteRepeatable(
                animation = tween(900, easing = EaseInOutSine),
                repeatMode = RepeatMode.Reverse
            ),
            label = "scale"
        )

        LaunchedEffect(Unit) {
            delay(2000)
            navigator.replace(OnboardingScreen)
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(FirulaisBlue),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Image(
                    painter = painterResource(Res.drawable.splash_icon),
                    contentDescription = "Logo Firulais",
                    modifier = Modifier
                        .size(100.dp)
                        .scale(scale)
                )

                Spacer(Modifier.height(24.dp))

                Text(
                    text = "FIRULAIS",
                    color = Color.White,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 4.sp
                )

                Spacer(Modifier.height(12.dp))

                Text(
                    text = "Ayudamos a que todos\nlos perros vuelvan a casa",
                    color = Color.White.copy(alpha = 0.85f),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Normal,
                    textAlign = TextAlign.Center,
                    lineHeight = 20.sp
                )
            }
        }
    }
}