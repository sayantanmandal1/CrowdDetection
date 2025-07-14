def generate_alert(location_id: str, people_count: int, fire: bool, stampede: bool):
    severity = "LOW"
    reason = []

    if people_count > 500:
        severity = "MEDIUM"
        reason.append("High crowd density")

    if people_count > 1000:
        severity = "HIGH"
        reason.append("Critical crowd overload")

    if fire:
        severity = "HIGH"
        reason.append("Fire detected")

    if stampede:
        severity = "HIGH"
        reason.append("Stampede risk")

    return {
        "location_id": location_id,
        "alert_level": severity,
        "trigger_reasons": reason,
        "recommended_action": {
            "LOW": "Monitor area",
            "MEDIUM": "Divert traffic and notify officials",
            "HIGH": "Evacuate area and deploy emergency response"
        }[severity]
    } 