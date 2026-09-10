from app.schemas.resource import EmergencyRequest, ResourceMatchResponse
from app.utils.geo import haversine_distance

class ResourceService:
    @staticmethod
    def match_resources(req: EmergencyRequest) -> ResourceMatchResponse:
        valid_warehouses = [w for w in req.warehouses if w.available_inventory > 0]
        
        if not valid_warehouses:
            return ResourceMatchResponse(
                camp_id=req.camp_id,
                recommended_warehouse_id=None,
                distance_km=0.0,
                recommended_vehicle_id=None,
                fulfilled_quantity=0.0,
                status="FAILED",
                reasons=["No warehouses have available inventory."]
            )

        ranked_warehouses = []
        for w in valid_warehouses:
            dist = haversine_distance(
                req.camp_location.latitude, req.camp_location.longitude,
                w.location.latitude, w.location.longitude
            )
            if dist >= 0:
                ranked_warehouses.append({"warehouse": w, "distance": dist})
        
        if not ranked_warehouses:
             return ResourceMatchResponse(
                camp_id=req.camp_id, recommended_warehouse_id=None, distance_km=0.0,
                recommended_vehicle_id=None, fulfilled_quantity=0.0, status="FAILED",
                reasons=["Invalid geospatial coordinates provided for routing."]
            )

        ranked_warehouses.sort(key=lambda x: x["distance"])
        best_warehouse = ranked_warehouses[0]["warehouse"]
        best_distance = ranked_warehouses[0]["distance"]

        valid_vehicles = [v for v in req.vehicles if v.available and v.capacity >= req.requested_quantity]
        valid_vehicles.sort(key=lambda x: x.capacity)
        
        best_vehicle = valid_vehicles[0].vehicle_id if valid_vehicles else None
        fulfilled = min(req.requested_quantity, best_warehouse.available_inventory)
        
        reasons = [f"Selected closest warehouse ({best_distance:.1f}km) with {best_warehouse.available_inventory} units available."]
        if not best_vehicle:
            reasons.append("No single vehicle found with sufficient capacity to transport the load.")

        return ResourceMatchResponse(
            camp_id=req.camp_id,
            recommended_warehouse_id=best_warehouse.warehouse_id,
            distance_km=best_distance,
            recommended_vehicle_id=best_vehicle,
            fulfilled_quantity=fulfilled,
            status="SUCCESS" if best_vehicle else "PARTIAL",
            reasons=reasons
        )