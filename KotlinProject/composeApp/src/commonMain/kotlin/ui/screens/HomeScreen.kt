package ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.tab.*
import cafe.adriel.voyager.navigator.tab.Tab
import ui.components.PetCard

object HomeScreen : Screen {
    @Composable
    override fun Content() { BottomBarScreen() }
}

object HomeTab : Tab {
    override val options: TabOptions
    @Composable get() = TabOptions(0u, "Encontrar")
    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    override fun Content() {
        val items = listOf(
            Triple("Luna", "Palermo", "hace 15 min"),
            Triple("Rocky", "Belgrano", "hace 1 h"),
            Triple("Milo", "Caballito", "ayer"),
            Triple("Bruna", "San Cristobal", "Ahora")
        )
        Scaffold(topBar = { TopAppBar(title = { Text("Firulais") }) }) { inner ->
            LazyColumn(Modifier.padding(inner).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(items) { (n,l,t) -> PetCard(n,l,t, Modifier.fillParentMaxWidth()) }
            }
        }
    }
}

object ReportTab : Tab {
    override val options: TabOptions
        @Composable get() = TabOptions(1u, "Reportar")
    @Composable override fun Content() { CenteredText("Formulario de reporte") }
}
object ProfileTab : Tab {
    override val options: TabOptions
        @Composable get() = TabOptions(2u, "Perfil")
    @Composable override fun Content() { CenteredText("Mi perfil") }
}

@Composable private fun CenteredText(t: String) {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(t) }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BottomBarScreen() {
    TabNavigator(HomeTab) { tabNavigator ->
        val tabs: List<Tab> = listOf(HomeTab, ReportTab, ProfileTab)
        Scaffold(
            bottomBar = {
                NavigationBar {
                    tabs.forEach { tab ->
                        NavigationBarItem(
                            selected = tabNavigator.current == tab,
                            onClick = { tabNavigator.current = tab },
                            icon = { /* TODO icons */ },
                            label = { Text(tab.options.title) }
                        )
                    }
                }
            }
        ) { inner -> Box(Modifier.padding(inner)) { CurrentTab() } }
    }
}