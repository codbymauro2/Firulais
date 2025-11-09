package bottombar

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.tab.TabNavigator
import androidx.compose.material3.*
import cafe.adriel.voyager.navigator.tab.CurrentTab


class BottomBarScreen : Screen {

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    override fun Content() {
        TabNavigator(HomeTab) { tabNavigator ->
            val tabs = listOf(HomeTab, ProfileTab, FavTab) // ✅ lista de tabs

            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text(tabNavigator.current.options.title) }
                    )
                },
                bottomBar = {
                    NavigationBar {
                        tabs.forEach { tab ->
                            NavigationBarItem(
                                label = { Text(tab.options.title) },
                                selected = tabNavigator.current == tab,
                                onClick = { tabNavigator.current = tab },
                                icon = { /* icono de cada tab */ }
                            )
                        }
                    }
                }
            ) {
                CurrentTab()
            }
        }
    }
}