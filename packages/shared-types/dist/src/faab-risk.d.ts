export interface FaabCandidate {
    player_id: string;
    name: string;
    team: string;
    position: string;
    suggested_min: number;
    suggested_mid: number;
    suggested_max: number;
    reason: string;
    confidence: number;
}
export interface ProjectionItem {
    player_id: string;
    name?: string;
    team?: string;
    position?: string;
    projection?: number;
    sources_used?: number;
    confidence?: number;
    method?: string;
    reasons?: string[];
}
export interface UsageItem {
    player_id: string;
    target_share?: number;
    snap_percentage?: number;
    opportunity_score?: number;
}
export interface InjuryItem {
    player_id: string;
    status?: 'out' | 'doubtful' | 'questionable' | 'probable' | 'active';
    return_risk?: number;
}
export interface EnrichmentFlags {
    nflv_oppty_on: boolean;
    ngs_sep_on: boolean;
    ngs_speed_on: boolean;
}
export interface EnrichmentMetadata {
    _vendor_enriched?: boolean;
    _vendor_adjustment?: number;
    _vendor_opp_score?: number;
}
export interface ProjectionForRisk {
    player_id: string;
    confidence?: number;
}
export interface VendorDataForRisk {
    fresh_at?: string;
    players?: Array<{
        player_id: string;
    }>;
}
export interface RiskFactor {
    name: string;
    score: number;
    weight: number;
}
export interface RiskCalculation {
    overall_confidence: number;
    risk_level: 'low' | 'moderate' | 'high';
    factors: RiskFactor[];
    recommendation: string;
}
//# sourceMappingURL=faab-risk.d.ts.map