from app.schemas.inventory import InventoryRiskRequest, InventoryRiskResponse

class InventoryService:
    @staticmethod
    def check_inventory(req: InventoryRiskRequest) -> InventoryRiskResponse:
        total_available = req.current_quantity + req.incoming_quantity
        shortage = req.minimum_required - total_available
        
        days_rem = None
        if req.average_consumption_per_day and req.average_consumption_per_day > 0:
            days_rem = round(total_available / req.average_consumption_per_day, 1)

        is_short = shortage > 0
        
        risk_level = "LOW"
        reasons = []
        if is_short:
            risk_level = "HIGH" if (req.current_quantity == 0) else "MEDIUM"
            action = f"Restock {shortage} units immediately."
        else:
            if days_rem is not None and days_rem < 3:
                risk_level = "MEDIUM"
                action = "Plan restock; less than 3 days remaining."
            else:
                action = "Inventory levels adequate."

        return InventoryRiskResponse(
            shortage_detected=is_short,
            shortage_quantity=shortage if is_short else 0.0,
            days_remaining=days_rem,
            risk_level=risk_level,
            restock_recommendation=action
        )