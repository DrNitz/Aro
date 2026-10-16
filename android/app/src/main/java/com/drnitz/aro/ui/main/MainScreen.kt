package com.drnitz.aro.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.drnitz.aro.data.DefaultDataRepository
import com.drnitz.aro.theme.AroTheme
import com.drnitz.aro.ui.components.ConcentricMacroRings

@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MainScreenViewModel = viewModel { MainScreenViewModel(DefaultDataRepository()) }
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    when (state) {
        MainScreenUiState.Loading -> {
            // Loading placeholder
        }
        is MainScreenUiState.Success -> {
            MainScreen(modifier = modifier)
        }
        is MainScreenUiState.Error -> {
            Text("Error loading data: ${(state as MainScreenUiState.Error).throwable.message}")
        }
    }
}

@Composable
internal fun MainScreen(modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // App Header
            Text(
                text = "ARO COMPANION",
                style = MaterialTheme.typography.labelLarge.copy(
                    letterSpacing = 2.sp,
                    fontWeight = FontWeight.Bold
                ),
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "Daily Nutrition & Energy Balance",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Concentric Macro Rings Card
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceContainer
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    ConcentricMacroRings(
                        caloriesEaten = 1420,
                        caloriesBurned = 320,
                        targetCalories = 2200,
                        proteinEatenG = 115.0,
                        targetProteinG = 160.0,
                        carbsEatenG = 140.0,
                        targetCarbsG = 220.0,
                        fatEatenG = 42.0,
                        targetFatG = 70.0,
                        size = 220.dp,
                        strokeWidth = 11.dp
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Macro Badges Legend
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        MacroBadge(
                            label = "Protein",
                            amount = "115g",
                            target = "160g",
                            color = AroTheme.macroColors.protein
                        )
                        MacroBadge(
                            label = "Carbs",
                            amount = "140g",
                            target = "220g",
                            color = AroTheme.macroColors.carbs
                        )
                        MacroBadge(
                            label = "Fat",
                            amount = "42g",
                            target = "70g",
                            color = AroTheme.macroColors.fat
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun MacroBadge(
    label: String,
    amount: String,
    target: String,
    color: Color
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(color, RoundedCornerShape(4.dp))
            )
            Text(
                text = " $label",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Text(
            text = amount,
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(
            text = "of $target",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
        )
    }
}

@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    AroTheme { MainScreen() }
}
