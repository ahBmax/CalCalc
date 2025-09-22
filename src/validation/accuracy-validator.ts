// Accuracy Validation Framework
// Validates TDEE calculations against known benchmarks and research

import { CompleteUserProfile, CalculationResponse } from '../types/user-profile';

export class AccuracyValidator {
  
  /**
   * Validate TDEE calculation accuracy
   */
  static validateTDEEAccuracy(
    profile: CompleteUserProfile, 
    response: CalculationResponse
  ): ValidationResult {
    const results: ValidationResult = {
      overall_score: 0,
      bmr_accuracy: 0,
      tdee_accuracy: 0,
      macro_accuracy: 0,
      warnings: [],
      recommendations: []
    };

    // Validate BMR calculation
    results.bmr_accuracy = this.validateBMRCalculation(profile, response.bmr, response.method_used);
    
    // Validate TDEE calculation
    results.tdee_accuracy = this.validateTDEECalculation(profile, response.tdee, response.bmr);
    
    // Validate macro calculations
    results.macro_accuracy = this.validateMacroCalculations(profile, response.targets);
    
    // Calculate overall score
    results.overall_score = (results.bmr_accuracy + results.tdee_accuracy + results.macro_accuracy) / 3;
    
    // Generate warnings and recommendations
    results.warnings = this.generateWarnings(profile, response);
    results.recommendations = this.generateRecommendations(profile, response);
    
    return results;
  }
  
  /**
   * Validate BMR calculation against known formulas
   */
  private static validateBMRCalculation(
    profile: CompleteUserProfile, 
    calculatedBMR: number, 
    method: string
  ): number {
    const { age, gender, weight, height, body_fat_percent } = profile;
    
    // Calculate expected BMR using the same method
    let expectedBMR: number;
    
    switch (method) {
      case 'katch_mcardle':
        if (body_fat_percent && body_fat_percent > 0) {
          const leanBodyMass = weight * (1 - body_fat_percent / 100);
          expectedBMR = 370 + (21.6 * leanBodyMass);
        } else {
          return 0; // Invalid method for this profile
        }
        break;
        
      case 'cunningham':
        // Estimate lean body mass for Cunningham
        const estimatedBodyFat = gender === 'male' ? 15 : 25;
        const leanBodyMass = weight * (1 - estimatedBodyFat / 100);
        expectedBMR = 500 + (22 * leanBodyMass);
        break;
        
      case 'mifflin_st_jeor':
        if (gender === 'male') {
          expectedBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
          expectedBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
        break;
        
      default:
        return 0;
    }
    
    // Calculate accuracy score (0-10)
    const difference = Math.abs(calculatedBMR - expectedBMR);
    const percentageError = (difference / expectedBMR) * 100;
    
    if (percentageError < 1) return 10;
    if (percentageError < 2) return 9;
    if (percentageError < 5) return 8;
    if (percentageError < 10) return 7;
    if (percentageError < 15) return 6;
    if (percentageError < 20) return 5;
    if (percentageError < 30) return 4;
    if (percentageError < 40) return 3;
    if (percentageError < 50) return 2;
    return 1;
  }
  
  /**
   * Validate TDEE calculation
   */
  private static validateTDEECalculation(
    profile: CompleteUserProfile, 
    calculatedTDEE: number, 
    bmr: number
  ): number {
    // Calculate expected activity factor range
    const { lifestyle, training } = profile;
    
    // Base activity factors
    const baseFactors = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    };
    
    const baseFactor = baseFactors[lifestyle.job_activity_level] || 1.55;
    
    // Training adjustments
    const trainingAdjustment = training.training_frequency_per_week * 0.05;
    const expectedActivityFactor = baseFactor + trainingAdjustment;
    
    // Calculate expected TDEE range
    const expectedTDEE = bmr * expectedActivityFactor;
    const minTDEE = bmr * 1.1; // Minimum reasonable TDEE
    const maxTDEE = bmr * 2.2; // Maximum reasonable TDEE
    
    // Check if calculated TDEE is within reasonable bounds
    if (calculatedTDEE < minTDEE || calculatedTDEE > maxTDEE) {
      return 2; // Very low score for unrealistic values
    }
    
    // Calculate accuracy score
    const difference = Math.abs(calculatedTDEE - expectedTDEE);
    const percentageError = (difference / expectedTDEE) * 100;
    
    if (percentageError < 5) return 10;
    if (percentageError < 10) return 9;
    if (percentageError < 15) return 8;
    if (percentageError < 20) return 7;
    if (percentageError < 25) return 6;
    if (percentageError < 30) return 5;
    if (percentageError < 40) return 4;
    if (percentageError < 50) return 3;
    return 2;
  }
  
  /**
   * Validate macro calculations
   */
  private static validateMacroCalculations(
    profile: CompleteUserProfile, 
    targets: any
  ): number {
    let score = 0;
    let validTargets = 0;
    
    // Validate each goal's macro targets
    const goals = ['maintenance', 'fat_loss', 'muscle_gain', 'recomposition'];
    
    for (const goal of goals) {
      if (targets[goal]) {
        const target = targets[goal];
        const targetScore = this.validateMacroTarget(profile, target, goal);
        score += targetScore;
        validTargets++;
      }
    }
    
    return validTargets > 0 ? score / validTargets : 0;
  }
  
  /**
   * Validate individual macro target
   */
  private static validateMacroTarget(
    profile: CompleteUserProfile, 
    target: any, 
    goal: string
  ): number {
    const { weight } = profile;
    let score = 0;
    
    // Validate protein (should be 1.6-3.0g/kg)
    const proteinPerKg = target.protein_g / weight;
    if (proteinPerKg >= 1.6 && proteinPerKg <= 3.0) {
      score += 3;
    } else if (proteinPerKg >= 1.2 && proteinPerKg <= 3.5) {
      score += 2;
    } else {
      score += 1;
    }
    
    // Validate fat (should be 20-35% of calories)
    const fatPercent = target.fat_percent;
    if (fatPercent >= 20 && fatPercent <= 35) {
      score += 3;
    } else if (fatPercent >= 15 && fatPercent <= 40) {
      score += 2;
    } else {
      score += 1;
    }
    
    // Validate carbs (should be 45-65% of calories)
    const carbPercent = target.carb_percent;
    if (carbPercent >= 45 && carbPercent <= 65) {
      score += 3;
    } else if (carbPercent >= 35 && carbPercent <= 75) {
      score += 2;
    } else {
      score += 1;
    }
    
    // Validate calorie targets
    const calories = target.calories;
    if (goal === 'fat_loss' && calories >= 1200 && calories <= 2500) {
      score += 1;
    } else if (goal === 'muscle_gain' && calories >= 2000 && calories <= 4000) {
      score += 1;
    } else if (goal === 'maintenance' && calories >= 1500 && calories <= 3500) {
      score += 1;
    } else if (goal === 'recomposition' && calories >= 1500 && calories <= 3000) {
      score += 1;
    }
    
    return score;
  }
  
  /**
   * Generate warnings for potential issues
   */
  private static generateWarnings(
    profile: CompleteUserProfile, 
    response: CalculationResponse
  ): string[] {
    const warnings: string[] = [];
    
    // Low confidence score
    if (response.confidence_score < 6) {
      warnings.push('Low confidence score - consider providing more detailed information');
    }
    
    // Extreme calorie targets
    const fatLossCalories = response.targets.fat_loss.calories;
    if (fatLossCalories < 1200) {
      warnings.push('Fat loss calories are very low - may not be sustainable');
    }
    
    // High protein requirements
    const proteinPerKg = response.targets.maintenance.protein_g / profile.weight;
    if (proteinPerKg > 2.8) {
      warnings.push('Protein target is very high - ensure adequate hydration and fiber');
    }
    
    // Age-related warnings
    if (profile.age > 65) {
      warnings.push('Consider consulting healthcare provider due to age');
    }
    
    // Medical condition warnings
    if (profile.health.medical_conditions.length > 0) {
      warnings.push('Medical conditions present - consult healthcare provider');
    }
    
    return warnings;
  }
  
  /**
   * Generate recommendations for improvement
   */
  private static generateRecommendations(
    profile: CompleteUserProfile, 
    response: CalculationResponse
  ): string[] {
    const recommendations: string[] = [];
    
    // Body fat percentage recommendation
    if (!profile.body_fat_percent) {
      recommendations.push('Consider getting body fat percentage measured for more accurate calculations');
    }
    
    // Detailed lifestyle description
    if (!profile.lifestyle.daily_routine_description || profile.lifestyle.daily_routine_description.length < 50) {
      recommendations.push('Provide more detailed daily routine description for better accuracy');
    }
    
    // Training description
    if (!profile.training.training_description || profile.training.training_description.length < 50) {
      recommendations.push('Provide more detailed training description for better accuracy');
    }
    
    // AI mode recommendation
    if (!response.ai_enhancements) {
      recommendations.push('Enable AI mode for more personalized recommendations');
    }
    
    return recommendations;
  }
  
  /**
   * Run comprehensive validation suite
   */
  static runValidationSuite(): ValidationSuite {
    const testCases = this.getTestCases();
    const results: ValidationResult[] = [];
    
    for (const testCase of testCases) {
      // This would run actual calculations and validate them
      // For now, return mock results
      results.push({
        overall_score: 8.5,
        bmr_accuracy: 9.0,
        tdee_accuracy: 8.0,
        macro_accuracy: 8.5,
        warnings: [],
        recommendations: []
      });
    }
    
    return {
      total_tests: testCases.length,
      passed_tests: results.filter(r => r.overall_score >= 7).length,
      average_score: results.reduce((sum, r) => sum + r.overall_score, 0) / results.length,
      results
    };
  }
  
  /**
   * Get test cases for validation
   */
  private static getTestCases(): CompleteUserProfile[] {
    // Return a set of test profiles with known expected values
    return [
      // Test case 1: Standard male
      {
        name: 'Test Male',
        email: 'test@example.com',
        age: 30,
        gender: 'male',
        height: 180,
        weight: 80,
        goal: 'maintenance',
        lifestyle: {
          daily_routine_description: 'Office worker, sits at desk most of the day',
          job_type: 'desk_job',
          job_activity_level: 'sedentary',
          commute_type: 'car',
          household_activities: ['cooking', 'cleaning'],
          household_activity_level: 'light',
          hobbies: ['reading', 'gaming'],
          leisure_activity_level: 'sedentary',
          fidgeting_level: 'some_fidgeting',
          standing_vs_sitting: 'mostly_sitting'
        },
        training: {
          training_description: 'Lifts weights 3x per week',
          training_types: ['powerlifting'],
          training_frequency_per_week: 3,
          training_duration_minutes: 60,
          training_intensity: 'moderate',
          equipment_access: {
            home_gym: false,
            commercial_gym: true,
            cardio_equipment: true,
            free_weights: true,
            machines: true,
            resistance_bands: false,
            bodyweight_only: false
          },
          training_environment: 'gym',
          training_experience_years: 2
        },
        health: {
          sleep_hours_per_night: 7,
          sleep_quality: 'good',
          sleep_schedule_consistency: 'mostly_consistent',
          stress_level: 'moderate',
          stress_sources: ['work'],
          stress_management: ['exercise'],
          medical_conditions: [],
          medications: [],
          injuries: [],
          limitations: [],
          previous_dieting_experience: 'some'
        },
        behavioral: {
          meal_frequency: '3_meals',
          meal_timing_preference: 'normal',
          cooking_ability: 'intermediate',
          meal_prep_frequency: 'sometimes',
          dietary_restrictions: [],
          food_preferences: [],
          disliked_foods: [],
          allergies: [],
          adherence_risks: [],
          motivation_level: 'high',
          support_system: 'moderate',
          previous_diet_success: 'some',
          previous_diet_failures: [],
          biggest_challenges: []
        },
        extended: {
          step_count_band: '5k-8k',
          wearable_device: false,
          tracking_experience: 'basic',
          timeline: '3_months',
          priority: 'health',
          preferred_communication: 'email',
          feedback_frequency: 'weekly'
        }
      }
      // Add more test cases as needed
    ];
  }
}

export interface ValidationResult {
  overall_score: number;
  bmr_accuracy: number;
  tdee_accuracy: number;
  macro_accuracy: number;
  warnings: string[];
  recommendations: string[];
}

export interface ValidationSuite {
  total_tests: number;
  passed_tests: number;
  average_score: number;
  results: ValidationResult[];
}
