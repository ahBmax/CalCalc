// Advanced TDEE Calculation Engine
// The most sophisticated TDEE calculator with multiple formulas and AI enhancements

import { CompleteUserProfile, AIAnalysis, MacroTargets, TimingRecommendations } from '../types/user-profile';

export class AdvancedTDEECalculator {
  
  /**
   * Calculate BMR using the most appropriate formula
   */
  static calculateBMR(profile: CompleteUserProfile): { bmr: number; method: string } {
    const { age, gender, weight, height, body_fat_percent } = profile;
    
    // Use Katch-McArdle if body fat percentage is available (most accurate)
    if (body_fat_percent && body_fat_percent > 0 && body_fat_percent < 50) {
      const leanBodyMass = weight * (1 - body_fat_percent / 100);
      const bmr = 370 + (21.6 * leanBodyMass);
      return { bmr: Math.round(bmr), method: 'katch_mcardle' };
    }
    
    // Use Cunningham if we have good muscle mass estimation
    if (profile.training.training_types.includes('powerlifting') || 
        profile.training.training_types.includes('bodybuilding') ||
        profile.training.training_experience_years > 3) {
      // Estimate lean body mass for experienced lifters
      const estimatedBodyFat = gender === 'male' ? 15 : 25; // Conservative estimate
      const leanBodyMass = weight * (1 - estimatedBodyFat / 100);
      const bmr = 500 + (22 * leanBodyMass);
      return { bmr: Math.round(bmr), method: 'cunningham' };
    }
    
    // Default to Mifflin-St Jeor (most validated)
    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    return { bmr: Math.round(bmr), method: 'mifflin_st_jeor' };
  }
  
  /**
   * Calculate advanced activity factor with AI enhancements
   */
  static calculateActivityFactor(profile: CompleteUserProfile, aiAnalysis?: AIAnalysis): number {
    const { lifestyle, training, health } = profile;
    
    // Base activity multipliers
    const baseMultipliers: Record<string, number> = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    };
    
    // Start with base activity level
    let activityFactor = baseMultipliers[lifestyle.job_activity_level] || 1.55;
    
    // Training adjustments
    const trainingAdjustment = this.calculateTrainingAdjustment(training);
    activityFactor += trainingAdjustment;
    
    // NEAT (Non-Exercise Activity Thermogenesis) adjustments
    const neatAdjustment = this.calculateNEATAdjustment(lifestyle);
    activityFactor += neatAdjustment;
    
    // Health factor adjustments
    const healthAdjustment = this.calculateHealthAdjustment(health);
    activityFactor += healthAdjustment;
    
    // Age adjustment
    const ageAdjustment = this.calculateAgeAdjustment(profile.age);
    activityFactor += ageAdjustment;
    
    // AI enhancement (if available)
    if (aiAnalysis?.activity_factor_adjustment) {
      activityFactor += aiAnalysis.activity_factor_adjustment;
    }
    
    // Ensure reasonable bounds
    return Math.max(1.1, Math.min(2.2, activityFactor));
  }
  
  /**
   * Calculate training-specific activity adjustments
   */
  private static calculateTrainingAdjustment(training: any): number {
    let adjustment = 0;
    
    // Training frequency adjustment
    const frequencyMultiplier = training.training_frequency_per_week * 0.05;
    adjustment += frequencyMultiplier;
    
    // Training intensity adjustment
    const intensityMultipliers: Record<string, number> = {
      'low': 0.02,
      'moderate': 0.05,
      'high': 0.08,
      'very_high': 0.12
    };
    adjustment += intensityMultipliers[String(training.training_intensity)] || 0.05;
    
    // Training type adjustments
    const typeAdjustments: Record<string, number> = {
      'powerlifting': 0.03,
      'bodybuilding': 0.02,
      'crossfit': 0.08,
      'running': 0.06,
      'cycling': 0.05,
      'swimming': 0.04,
      'yoga': 0.01,
      'pilates': 0.01,
      'martial_arts': 0.06,
      'team_sports': 0.05,
      'hiking': 0.04,
      'dancing': 0.03,
      'climbing': 0.05
    };
    
    // Add adjustment for primary training type
    if (training.training_types.length > 0) {
      const primaryType = String(training.training_types[0]);
      adjustment += typeAdjustments[primaryType] || 0.03;
    }
    
    // Training experience adjustment (more experienced = more efficient)
    if (training.training_experience_years > 5) {
      adjustment -= 0.02; // Slightly more efficient
    }
    
    return adjustment;
  }
  
  /**
   * Calculate NEAT (Non-Exercise Activity Thermogenesis) adjustments
   */
  private static calculateNEATAdjustment(lifestyle: any): number {
    let adjustment = 0;
    
    // Job type adjustments
    const jobAdjustments: Record<string, number> = {
      'desk_job': -0.05,
      'standing_job': 0.02,
      'physical_job': 0.08,
      'mixed': 0.03,
      'unemployed': -0.02,
      'student': 0.01
    };
    adjustment += jobAdjustments[String(lifestyle.job_type)] || 0;
    
    // Commute adjustments
    const commuteAdjustments: Record<string, number> = {
      'car': -0.02,
      'public_transport': 0.01,
      'walking': 0.03,
      'cycling': 0.05,
      'remote': -0.01
    };
    adjustment += commuteAdjustments[String(lifestyle.commute_type)] || 0;
    
    // Household activity adjustments
    const householdAdjustments: Record<string, number> = {
      'minimal': -0.02,
      'light': 0.01,
      'moderate': 0.03,
      'active': 0.05
    };
    adjustment += householdAdjustments[String(lifestyle.household_activity_level)] || 0;
    
    // Fidgeting adjustments
    const fidgetingAdjustments: Record<string, number> = {
      'very_still': -0.03,
      'some_fidgeting': 0.01,
      'moderate_fidgeting': 0.03,
      'lots_of_fidgeting': 0.05
    };
    adjustment += fidgetingAdjustments[String(lifestyle.fidgeting_level)] || 0;
    
    // Standing vs sitting
    const standingAdjustments: Record<string, number> = {
      'mostly_sitting': -0.03,
      'mixed': 0.01,
      'mostly_standing': 0.03,
      'always_moving': 0.05
    };
    adjustment += standingAdjustments[String(lifestyle.standing_vs_sitting)] || 0;
    
    return adjustment;
  }
  
  /**
   * Calculate health-related adjustments
   */
  private static calculateHealthAdjustment(health: any): number {
    let adjustment = 0;
    
    // Sleep quality adjustments
    const sleepAdjustments: Record<string, number> = {
      'poor': -0.05,
      'fair': -0.02,
      'good': 0,
      'excellent': 0.02
    };
    adjustment += sleepAdjustments[String(health.sleep_quality)] || 0;
    
    // Sleep duration adjustments
    if (health.sleep_hours_per_night < 6) {
      adjustment -= 0.03;
    } else if (health.sleep_hours_per_night > 8) {
      adjustment += 0.01;
    }
    
    // Stress adjustments
    const stressAdjustments: Record<string, number> = {
      'very_low': 0.02,
      'low': 0.01,
      'moderate': 0,
      'high': -0.02,
      'very_high': -0.05
    };
    adjustment += stressAdjustments[String(health.stress_level)] || 0;
    
    // Medical condition adjustments
    if (health.thyroid_issues) {
      adjustment -= 0.05; // Hypothyroidism reduces metabolism
    }
    if (health.diabetes) {
      adjustment -= 0.03; // Diabetes can affect metabolism
    }
    
    return adjustment;
  }
  
  /**
   * Calculate age-related adjustments
   */
  private static calculateAgeAdjustment(age: number): number {
    if (age < 25) {
      return 0.02; // Higher metabolism in youth
    } else if (age > 50) {
      return -0.03; // Lower metabolism with age
    } else if (age > 65) {
      return -0.05; // Further reduction in elderly
    }
    return 0;
  }
  
  /**
   * Calculate TDEE with all adjustments
   */
  static calculateTDEE(profile: CompleteUserProfile, aiAnalysis?: AIAnalysis): number {
    const { bmr } = this.calculateBMR(profile);
    const activityFactor = this.calculateActivityFactor(profile, aiAnalysis);
    return Math.round(bmr * activityFactor);
  }
  
  /**
   * Calculate advanced macro targets
   */
  static calculateMacroTargets(
    tdee: number, 
    profile: CompleteUserProfile, 
    goal: 'maintenance' | 'fat_loss' | 'muscle_gain' | 'recomposition'
  ): MacroTargets {
    const { weight, gender } = profile;
    const { training } = profile;
    
    // Calculate target calories based on goal
    let targetCalories: number;
    switch (goal) {
      case 'fat_loss':
        targetCalories = Math.round(tdee * 0.8); // 20% deficit
        break;
      case 'muscle_gain':
        targetCalories = Math.round(tdee * 1.12); // 12% surplus
        break;
      case 'recomposition':
        targetCalories = tdee; // Maintenance calories
        break;
      default:
        targetCalories = tdee;
    }
    
    // Calculate protein based on training type and goal
    const protein = this.calculateProtein(weight, training, goal, gender);
    
    // Calculate fat (25% of calories, minimum 0.5g/kg)
    const fatCalories = Math.max(targetCalories * 0.25, weight * 0.5 * 9);
    const fat = Math.round(fatCalories / 9);
    
    // Calculate carbs (remainder)
    const proteinCalories = protein * 4;
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbs = Math.round(carbCalories / 4);
    
    // Calculate percentages
    const proteinPercent = Math.round((proteinCalories / targetCalories) * 100);
    const fatPercent = Math.round((fatCalories / targetCalories) * 100);
    const carbPercent = Math.round((carbCalories / targetCalories) * 100);
    
    return {
      calories: targetCalories,
      protein_g: protein,
      fat_g: fat,
      carb_g: carbs,
      protein_percent: proteinPercent,
      fat_percent: fatPercent,
      carb_percent: carbPercent
    };
  }
  
  /**
   * Calculate protein requirements based on training type and goal
   */
  private static calculateProtein(
    weight: number, 
    training: any, 
    goal: 'maintenance' | 'fat_loss' | 'muscle_gain' | 'recomposition', 
    gender: string
  ): number {
    let proteinPerKg: number;
    
    // Base protein by goal
    const baseProtein: Record<'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance', number> = {
      'fat_loss': 2.2,
      'muscle_gain': 2.2,
      'recomposition': 2.4,
      'maintenance': 2.0
    };
    
    proteinPerKg = baseProtein[goal] || 2.0;
    
    // Training type adjustments
    const trainingAdjustments: Record<string, number> = {
      'powerlifting': 0.2,
      'bodybuilding': 0.3,
      'crossfit': 0.2,
      'running': -0.2,
      'cycling': -0.1,
      'swimming': 0.1,
      'yoga': -0.3,
      'pilates': -0.3,
      'martial_arts': 0.1,
      'team_sports': 0.1,
      'hiking': -0.1,
      'dancing': 0,
      'climbing': 0.1
    };
    
    // Add training type adjustment
    if (training.training_types.length > 0) {
      const primaryType = String(training.training_types[0]);
      proteinPerKg += trainingAdjustments[primaryType] || 0;
    }
    
    // Gender adjustment (males typically need slightly more)
    if (gender === 'male') {
      proteinPerKg += 0.1;
    }
    
    // Training experience adjustment
    if (training.training_experience_years > 5) {
      proteinPerKg += 0.1; // More experienced athletes may need more
    }
    
    // Ensure minimum protein
    proteinPerKg = Math.max(1.6, proteinPerKg);
    
    return Math.round(weight * proteinPerKg);
  }
  
  /**
   * Calculate timing recommendations
   */
  static calculateTimingRecommendations(profile: CompleteUserProfile): TimingRecommendations {
    const { training } = profile;
    
    // Pre-workout recommendations
    let preWorkout = "Eat a small meal 1-2 hours before training with carbs and protein.";
    if (training.training_types.includes('powerlifting')) {
      preWorkout = "Eat a light meal 2-3 hours before with carbs and protein. Consider caffeine 30-60 minutes before.";
    } else if (training.training_types.includes('running')) {
      preWorkout = "Eat easily digestible carbs 1-2 hours before. Consider a banana or toast with honey.";
    } else if (training.training_types.includes('yoga')) {
      preWorkout = "Eat a light meal 2-3 hours before. Avoid heavy foods that might cause discomfort.";
    }
    
    // Post-workout recommendations
    let postWorkout = "Eat protein and carbs within 30-60 minutes after training.";
    if (training.training_types.includes('powerlifting')) {
      postWorkout = "Eat a meal with protein and carbs within 30 minutes. Consider a protein shake if meal is delayed.";
    } else if (training.training_types.includes('running')) {
      postWorkout = "Eat carbs and protein within 30 minutes. Focus on replenishing glycogen stores.";
    } else if (training.training_types.includes('yoga')) {
      postWorkout = "Eat a balanced meal within 1-2 hours. Focus on whole foods and hydration.";
    }
    
    // Meal timing recommendations
    let mealTiming = "Eat 3-4 meals per day with consistent timing.";
    if (profile.behavioral.meal_frequency === '6+_meals') {
      mealTiming = "Eat 6+ smaller meals throughout the day to maintain energy levels.";
    } else if (profile.behavioral.meal_timing_preference === 'night_owl') {
      mealTiming = "Eat your largest meal in the evening when you're most active and hungry.";
    }
    
    // Hydration recommendations
    const hydration = "Drink 3-4 liters of water daily. Add electrolytes during intense training.";
    
    // Sleep optimization
    const sleepOptimization = "Avoid large meals 2-3 hours before bed. Consider a small protein snack if needed.";
    
    return {
      pre_workout: preWorkout,
      post_workout: postWorkout,
      meal_timing: mealTiming,
      hydration: hydration,
      sleep_optimization: sleepOptimization
    };
  }
}
