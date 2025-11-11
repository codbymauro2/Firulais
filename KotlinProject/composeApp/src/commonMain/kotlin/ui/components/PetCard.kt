// ui/components/PetCard.kt
package ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.ExperimentalResourceApi
import kotlinproject.composeapp.generated.resources.Res
import kotlinproject.composeapp.generated.resources.compose_multiplatform

@OptIn(ExperimentalResourceApi::class)
@Composable
fun PetCard(
    name: String,
    location: String,
    time: String,
    modifier: Modifier = Modifier
) {
    Card(modifier, shape = MaterialTheme.shapes.large) {
        Column(Modifier.fillMaxWidth()) {
            Image(painterResource(Res.drawable.compose_multiplatform), null, Modifier.fillMaxWidth().height(160.dp))
            Column(Modifier.padding(12.dp)) {
                Text(name, style = MaterialTheme.typography.titleMedium)
                Text("$location • $time", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .7f))
            }
        }
    }
}