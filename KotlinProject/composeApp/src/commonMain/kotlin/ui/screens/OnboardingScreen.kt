package ui.screens

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.jetbrains.compose.resources.ExperimentalResourceApi
import org.jetbrains.compose.resources.painterResource
import kotlinproject.composeapp.generated.resources.Res
import kotlinproject.composeapp.generated.resources.prelogin_1
import kotlinproject.composeapp.generated.resources.prelogin_2
import kotlinx.coroutines.launch

object OnboardingScreen : Screen {

    @OptIn(ExperimentalFoundationApi::class, ExperimentalResourceApi::class)
    @Composable
    override fun Content() {
        val nav = LocalNavigator.currentOrThrow
        val pageCount = 2
        val pagerState = rememberPagerState(pageCount = { pageCount })
        val scope = rememberCoroutineScope()   // 👈 debe estar DENTRO de Content(), antes del Button

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            HorizontalPager(
                state = pagerState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) { page ->
                PageContent(page)
            }

            Spacer(Modifier.height(12.dp))

            DotsIndicator(
                totalDots = pageCount,
                selectedIndex = pagerState.currentPage
            )

            Spacer(Modifier.height(24.dp))

            val isLast = pagerState.currentPage == pageCount - 1
            Button(
                onClick = {
                    if (isLast) {
                        nav.replace(HomeScreen)
                    } else {
                        // ✅ ahora sí reconoce el scope
                        scope.launch {
                            pagerState.animateScrollToPage(pagerState.currentPage + 1)
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Text(if (isLast) "Comenzar" else "Siguiente")
            }
        }
    }

    @OptIn(ExperimentalResourceApi::class)
    @Composable
    private fun PageContent(page: Int) {
        val (title, image) = when (page) {
            0 -> "Encontrá a tu mejor amigo" to Res.drawable.prelogin_1
            else -> "Empezá ahora" to Res.drawable.prelogin_2
        }

        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(Modifier.height(8.dp))

            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground
            )

            Image(
                painter = painterResource(image),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp)
                    .weight(1f, fill = false)
            )

            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun DotsIndicator(
    totalDots: Int,
    selectedIndex: Int,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        repeat(totalDots) { index ->
            val size = if (index == selectedIndex) 10.dp else 8.dp
            val alpha = if (index == selectedIndex) 1f else 0.35f
            Box(
                modifier = Modifier
                    .size(size)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = alpha))
            )
        }
    }
}
