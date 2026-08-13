"""
domain.py - Shared business vocabulary
======================================
Disease labels, display names, scientific names and recommendation copy,
used by both the API responses and the PDF report generator.
"""

HEALTHY = "healthy"
GREEN_MOLD = "green_mold"
BLACK_MOLD = "black_mold"

DISEASE_CLASSES = (HEALTHY, GREEN_MOLD, BLACK_MOLD)

DISPLAY_NAME = {
    HEALTHY: "Healthy",
    GREEN_MOLD: "Green Mold",
    BLACK_MOLD: "Black Mold",
}

SCIENTIFIC_NAME = {
    HEALTHY: None,
    GREEN_MOLD: "Trichoderma",
    BLACK_MOLD: "Aspergillus",
}

RECOMMENDATION = {
    HEALTHY: "No disease detected. Continue routine monitoring.",
    GREEN_MOLD: (
        "Green mold (Trichoderma) detected. Immediate isolation is recommended "
        "to prevent spread to neighbouring bags."
    ),
    BLACK_MOLD: (
        "Black mold (Aspergillus) detected. Remove and dispose of the bag safely, "
        "then sanitize the surrounding area."
    ),
}


def recommendation_for(prediction: str) -> str:
    return RECOMMENDATION.get(prediction, RECOMMENDATION[HEALTHY])


def is_infected(prediction: str) -> bool:
    return prediction in (GREEN_MOLD, BLACK_MOLD)
