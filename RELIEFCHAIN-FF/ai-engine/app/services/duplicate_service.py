from app.schemas.duplicate import DuplicateCheckRequest, DuplicateCheckResponse
from app.algorithms.similarity import calculate_similarity, numeric_similarity, jaccard_similarity

class DuplicateService:
    @staticmethod
    def check_duplicate(req: DuplicateCheckRequest) -> DuplicateCheckResponse:
        highest_sim = 0.0
        match_id = None
        reasons = []

        for comp in req.comparison_pool:
            loc_sim = calculate_similarity(req.target.location, comp.location)
            fam_sim = numeric_similarity(float(req.target.family_size), float(comp.family_size), 5.0)
            
            demo_sim = 0.0
            if req.target.demographics and comp.demographics:
                shared_keys = set(req.target.demographics.keys()) & set(comp.demographics.keys())
                if shared_keys:
                    matches = sum(1 for k in shared_keys if req.target.demographics[k] == comp.demographics[k])
                    demo_sim = matches / len(shared_keys)
                    
            hist_sim = jaccard_similarity(req.target.aid_history, comp.aid_history)
            
            final_sim = (loc_sim * 0.4) + (fam_sim * 0.2) + (demo_sim * 0.2) + (hist_sim * 0.2)
            
            if final_sim > highest_sim:
                highest_sim = final_sim
                match_id = comp.beneficiary_id

        is_dup = highest_sim > 0.85
        if is_dup:
            reasons.append(f"Strong metadata and locational similarity ({highest_sim * 100:.1f}%) detected with {match_id}.")
        else:
            reasons.append("No conclusive duplicates found in the comparison pool.")

        return DuplicateCheckResponse(
            beneficiary_id=req.target.beneficiary_id,
            possible_duplicate=is_dup,
            similarity_score=round(highest_sim * 100, 2),
            matched_beneficiary_id=match_id if is_dup else None,
            reasons=reasons
        )