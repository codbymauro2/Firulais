package ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import kotlinproject.composeapp.generated.resources.Res
import kotlinproject.composeapp.generated.resources.splash_icon
import org.jetbrains.compose.resources.ExperimentalResourceApi
import org.jetbrains.compose.resources.painterResource
import ui.theme.FirulaisBlue

object LoginScreen : Screen {

    @OptIn(ExperimentalResourceApi::class)
    @Composable
    override fun Content() {
        val nav = LocalNavigator.currentOrThrow
        var email by remember { mutableStateOf("") }
        var password by remember { mutableStateOf("") }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .safeDrawingPadding()  // ← respeta barras del sistema
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 32.dp)
                    .padding(top = 56.dp, bottom = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Image(
                    painter = painterResource(Res.drawable.splash_icon),
                    contentDescription = "Firulais Logo",
                    modifier = Modifier.size(72.dp)
                )

                Spacer(Modifier.height(8.dp))

                Text(
                    text = "FIRULAIS",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = FirulaisBlue,
                    letterSpacing = 3.sp
                )

                Spacer(Modifier.height(40.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    placeholder = { Text("Email", color = Color(0xFFAAAAAA)) },
                    leadingIcon = {
                        Text(
                            text = "✉",
                            fontSize = 18.sp,
                            color = Color(0xFFAAAAAA),
                            modifier = Modifier.padding(start = 4.dp)
                        )
                    },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = FirulaisBlue,
                        unfocusedBorderColor = Color(0xFFDDDDDD),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )

                Spacer(Modifier.height(12.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    placeholder = { Text("Contraseña", color = Color(0xFFAAAAAA)) },
                    leadingIcon = {
                        Text(
                            text = "🔒",
                            fontSize = 16.sp,
                            color = Color(0xFFAAAAAA),
                            modifier = Modifier.padding(start = 4.dp)
                        )
                    },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = FirulaisBlue,
                        unfocusedBorderColor = Color(0xFFDDDDDD),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )

                Spacer(Modifier.height(24.dp))

                Button(
                    onClick = { nav.replace(HomeScreen) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = FirulaisBlue)
                ) {
                    Text(
                        "Iniciar sesión",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                }

                Spacer(Modifier.height(20.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFEEEEEE))
                    Text(
                        "  o iniciar sesión con  ",
                        fontSize = 12.sp,
                        color = Color(0xFFAAAAAA)
                    )
                    HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFEEEEEE))
                }

                Spacer(Modifier.height(20.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = { },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF1877F2))
                    ) {
                        Text("f  Facebook", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1877F2))
                    }

                    OutlinedButton(
                        onClick = { },
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFDB4437))
                    ) {
                        Text("G  Google", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFFDB4437))
                    }
                }

                Spacer(Modifier.weight(1f))

                Text(
                    text = buildAnnotatedString {
                        withStyle(SpanStyle(color = Color(0xFF888888), fontSize = 13.sp)) {
                            append("¿No tenés una cuenta? ")
                        }
                        withStyle(SpanStyle(color = FirulaisBlue, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)) {
                            append("Registrate")
                        }
                    },
                    modifier = Modifier.clickable { },
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}