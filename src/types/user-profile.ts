// Advanced User Profile Types for AI TDEE Calculator

export interface BasicMetrics {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  body_fat_percent?: number; // Optional, enables Katch-McArdle
  goal: 'fat_loss' | 'muscle_gain' | 'maintenance' | 'recomposition' | 'performance';
}

export interface LifestyleProfile {
  // Daily routine assessment
  daily_routine_description: string; // "How do you usually spend your days?"
  
  // Occupational activity
  job_type: 'desk_job' | 'standing_job' | 'physical_job' | 'mixed' | 'unemployed' | 'student';
  job_activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  commute_type: 'car' | 'public_transport' | 'walking' | 'cycling' | 'remote';
  commute_duration_minutes?: number;
  
  // Household activities
  household_activities: string[]; // ['cooking', 'cleaning', 'gardening', 'childcare']
  household_activity_level: 'minimal' | 'light' | 'moderate' | 'active';
  
  // Leisure and hobbies
  hobbies: string[];
  leisure_activity_level: 'sedentary' | 'light' | 'moderate' | 'active';
  
  // Movement patterns
  fidgeting_level: 'very_still' | 'some_fidgeting' | 'moderate_fidgeting' | 'lots_of_fidgeting';
  standing_vs_sitting: 'mostly_sitting' | 'mixed' | 'mostly_standing' | 'always_moving';
}

export interface TrainingProfile {
  // Training type assessment
  training_description: string; // "What type of training do you do?"
  
  // Training specifics
  training_types: TrainingType[];
  training_frequency_per_week: number;
  training_duration_minutes: number;
  training_intensity: 'low' | 'moderate' | 'high' | 'very_high';
  
  // Sport-specific
  primary_sport?: string;
  competition_level?: 'recreational' | 'amateur' | 'semi_pro' | 'professional';
  training_season?: 'off_season' | 'pre_season' | 'in_season' | 'post_season';
  
  // Equipment and environment
  equipment_access: EquipmentAccess;
  training_environment: 'home' | 'gym' | 'outdoor' | 'studio' | 'mixed';
  
  // Training experience
  training_experience_years: number;
  current_program_type?: string;
  previous_injuries?: string[];
}

export type TrainingType = 
  | 'powerlifting' 
  | 'bodybuilding' 
  | 'crossfit' 
  | 'running' 
  | 'cycling' 
  | 'swimming' 
  | 'yoga' 
  | 'pilates' 
  | 'martial_arts' 
  | 'team_sports' 
  | 'hiking' 
  | 'dancing' 
  | 'climbing' 
  | 'other';

export interface EquipmentAccess {
  home_gym: boolean;
  commercial_gym: boolean;
  cardio_equipment: boolean;
  free_weights: boolean;
  machines: boolean;
  resistance_bands: boolean;
  bodyweight_only: boolean;
}

export interface HealthProfile {
  // Sleep
  sleep_hours_per_night: number;
  sleep_quality: 'poor' | 'fair' | 'good' | 'excellent';
  sleep_schedule_consistency: 'very_inconsistent' | 'somewhat_inconsistent' | 'mostly_consistent' | 'very_consistent';
  
  // Stress
  stress_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  stress_sources: string[];
  stress_management: string[];
  
  // Health conditions
  medical_conditions: string[];
  medications: string[];
  injuries: string[];
  limitations: string[];
  
  // Metabolic factors
  thyroid_issues?: boolean;
  diabetes?: boolean;
  metabolic_syndrome?: boolean;
  previous_dieting_experience: 'none' | 'some' | 'extensive';
  metabolic_adaptation_concerns?: boolean;
}

export interface BehavioralProfile {
  // Eating patterns
  meal_frequency: '1-2_meals' | '3_meals' | '4-5_meals' | '6+_meals';
  meal_timing_preference: 'early_bird' | 'normal' | 'night_owl' | 'irregular';
  cooking_ability: 'beginner' | 'intermediate' | 'advanced';
  meal_prep_frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'always';
  
  // Dietary preferences
  dietary_restrictions: string[];
  food_preferences: string[];
  disliked_foods: string[];
  allergies: string[];
  
  // Adherence factors
  adherence_risks: AdherenceRisk[];
  motivation_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  support_system: 'none' | 'minimal' | 'moderate' | 'strong';
  
  // Previous experience
  previous_diet_success: 'none' | 'some' | 'moderate' | 'high';
  previous_diet_failures: string[];
  biggest_challenges: string[];
}

export type AdherenceRisk = 
  | 'weekend_binges' 
  | 'social_eating' 
  | 'stress_eating' 
  | 'travel' 
  | 'work_schedule' 
  | 'family_obligations' 
  | 'lack_of_time' 
  | 'lack_of_motivation' 
  | 'perfectionism' 
  | 'all_or_nothing' 
  | 'emotional_eating' 
  | 'boredom_eating';

export interface ExtendedProfile {
  // Additional context
  step_count_band: 'under_5k' | '5k-8k' | '8k-12k' | '12k-15k' | 'over_15k';
  wearable_device?: boolean;
  tracking_experience: 'none' | 'basic' | 'intermediate' | 'advanced';
  
  // Goals and timeline
  timeline: '1_month' | '3_months' | '6_months' | '1_year' | 'long_term';
  priority: 'weight_loss' | 'muscle_gain' | 'performance' | 'health' | 'aesthetics';
  
  // Communication preferences
  preferred_communication: 'email' | 'sms' | 'app' | 'phone' | 'video';
  feedback_frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
}

export interface CompleteUserProfile extends BasicMetrics {
  lifestyle: LifestyleProfile;
  training: TrainingProfile;
  health: HealthProfile;
  behavioral: BehavioralProfile;
  extended: ExtendedProfile;
  
  // AI analysis results
  ai_analysis?: AIAnalysis;
}

export interface AIAnalysis {
  // Activity assessment
  estimated_neat: number; // Non-exercise activity thermogenesis
  activity_factor_adjustment: number;
  lifestyle_activity_score: number; // 1-10 scale
  
  // Training analysis
  training_intensity_score: number; // 1-10 scale
  training_volume_score: number; // 1-10 scale
  recovery_needs: 'low' | 'moderate' | 'high' | 'very_high';
  
  // Metabolic factors
  estimated_metabolic_rate: number;
  metabolic_efficiency: 'low' | 'normal' | 'high';
  adaptation_risk: 'low' | 'moderate' | 'high';
  
  // Behavioral insights
  adherence_score: number; // 1-10 scale
  risk_factors: string[];
  success_factors: string[];
  
  // Recommendations
  recommended_approach: string;
  key_focus_areas: string[];
  potential_challenges: string[];
}

export interface CalculationRequest {
  profile: CompleteUserProfile;
  ai_mode: boolean;
  include_coaching: boolean;
  include_mini_plan: boolean;
}

export interface CalculationResponse {
  // Core calculations
  bmr: number;
  tdee: number;
  method_used: 'katch_mcardle' | 'cunningham' | 'mifflin_st_jeor' | 'harris_benedict';
  
  // Macro targets
  targets: {
    maintenance: MacroTargets;
    fat_loss: MacroTargets;
    muscle_gain: MacroTargets;
    recomposition: MacroTargets;
  };
  
  // AI enhancements
  ai_enhancements?: {
    adjusted_tdee: number;
    activity_factor_adjustment: number;
    recommended_deficit_percent: number;
    macro_profile_hint: string;
    timing_recommendations: TimingRecommendations;
  };
  
  // Coaching
  coaching: {
    coach_note: string;
    ai_coach_note?: string;
    mini_plan?: MiniPlan;
    risk_flags: string[];
    success_strategies: string[];
  };
  
  // Metadata
  confidence_score: number; // 1-10 scale
  calculation_timestamp: string;
  version: string;
}

export interface MacroTargets {
  calories: number;
  protein_g: number;
  fat_g: number;
  carb_g: number;
  protein_percent: number;
  fat_percent: number;
  carb_percent: number;
}

export interface TimingRecommendations {
  pre_workout: string;
  post_workout: string;
  meal_timing: string;
  hydration: string;
  sleep_optimization: string;
}

export interface MiniPlan {
  weekly_sessions: number;
  training_template: string;
  step_target: string;
  protein_minimum_g: number;
  habits: string[];
  weekly_focus: string;
  success_metrics: string[];
}
