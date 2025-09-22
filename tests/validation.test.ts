// Validation Tests
// Test the accuracy and reliability of TDEE calculations

import { AccuracyValidator } from '../src/validation/accuracy-validator';
import { CompleteUserProfile } from '../src/types/user-profile';

describe('AccuracyValidator', () => {
  
  describe('validateTDEEAccuracy', () => {
    it('should validate a standard male profile correctly', () => {
      const profile: CompleteUserProfile = {
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
      };

      const mockResponse = {
        bmr: 1800,
        tdee: 2200,
        method_used: 'mifflin_st_jeor',
        targets: {
          maintenance: {
            calories: 2200,
            protein_g: 160,
            fat_g: 61,
            carb_g: 275,
            protein_percent: 29,
            fat_percent: 25,
            carb_percent: 50
          },
          fat_loss: {
            calories: 1760,
            protein_g: 176,
            fat_g: 49,
            carb_g: 176,
            protein_percent: 40,
            fat_percent: 25,
            carb_percent: 40
          },
          muscle_gain: {
            calories: 2464,
            protein_g: 176,
            fat_g: 68,
            carb_g: 308,
            protein_percent: 29,
            fat_percent: 25,
            carb_percent: 50
          },
          recomposition: {
            calories: 2200,
            protein_g: 192,
            fat_g: 61,
            carb_g: 275,
            protein_percent: 35,
            fat_percent: 25,
            carb_percent: 50
          }
        },
        confidence_score: 8,
        calculation_timestamp: new Date().toISOString(),
        version: '2.0.0'
      };

      const result = AccuracyValidator.validateTDEEAccuracy(profile, mockResponse);

      expect(result.overall_score).toBeGreaterThan(6);
      expect(result.bmr_accuracy).toBeGreaterThan(7);
      expect(result.tdee_accuracy).toBeGreaterThan(6);
      expect(result.macro_accuracy).toBeGreaterThan(6);
    });

    it('should identify warnings for extreme values', () => {
      const profile: CompleteUserProfile = {
        name: 'Test Female',
        email: 'test@example.com',
        age: 25,
        gender: 'female',
        height: 165,
        weight: 50, // Very low weight
        goal: 'fat_loss',
        lifestyle: {
          daily_routine_description: 'Student, mostly sedentary',
          job_type: 'student',
          job_activity_level: 'sedentary',
          commute_type: 'walking',
          household_activities: [],
          household_activity_level: 'minimal',
          hobbies: ['reading'],
          leisure_activity_level: 'sedentary',
          fidgeting_level: 'very_still',
          standing_vs_sitting: 'mostly_sitting'
        },
        training: {
          training_description: 'No regular training',
          training_types: [],
          training_frequency_per_week: 0,
          training_duration_minutes: 0,
          training_intensity: 'low',
          equipment_access: {
            home_gym: false,
            commercial_gym: false,
            cardio_equipment: false,
            free_weights: false,
            machines: false,
            resistance_bands: false,
            bodyweight_only: true
          },
          training_environment: 'home',
          training_experience_years: 0
        },
        health: {
          sleep_hours_per_night: 5, // Low sleep
          sleep_quality: 'poor',
          sleep_schedule_consistency: 'very_inconsistent',
          stress_level: 'very_high',
          stress_sources: ['school', 'work'],
          stress_management: [],
          medical_conditions: ['anxiety'],
          medications: [],
          injuries: [],
          limitations: [],
          previous_dieting_experience: 'extensive'
        },
        behavioral: {
          meal_frequency: '1-2_meals',
          meal_timing_preference: 'irregular',
          cooking_ability: 'beginner',
          meal_prep_frequency: 'never',
          dietary_restrictions: [],
          food_preferences: [],
          disliked_foods: [],
          allergies: [],
          adherence_risks: ['stress_eating', 'all_or_nothing'],
          motivation_level: 'very_low',
          support_system: 'none',
          previous_diet_success: 'none',
          previous_diet_failures: ['multiple attempts'],
          biggest_challenges: ['consistency', 'motivation']
        },
        extended: {
          step_count_band: 'under_5k',
          wearable_device: false,
          tracking_experience: 'none',
          timeline: '1_month',
          priority: 'weight_loss',
          preferred_communication: 'email',
          feedback_frequency: 'daily'
        }
      };

      const mockResponse = {
        bmr: 1200,
        tdee: 1440,
        method_used: 'mifflin_st_jeor',
        targets: {
          maintenance: {
            calories: 1440,
            protein_g: 100,
            fat_g: 40,
            carb_g: 180,
            protein_percent: 28,
            fat_percent: 25,
            carb_percent: 50
          },
          fat_loss: {
            calories: 1152, // Very low calories
            protein_g: 110,
            fat_g: 32,
            carb_g: 144,
            protein_percent: 38,
            fat_percent: 25,
            carb_percent: 50
          },
          muscle_gain: {
            calories: 1613,
            protein_g: 110,
            fat_g: 45,
            carb_g: 202,
            protein_percent: 27,
            fat_percent: 25,
            carb_percent: 50
          },
          recomposition: {
            calories: 1440,
            protein_g: 120,
            fat_g: 40,
            carb_g: 180,
            protein_percent: 33,
            fat_percent: 25,
            carb_percent: 50
          }
        },
        confidence_score: 4,
        calculation_timestamp: new Date().toISOString(),
        version: '2.0.0'
      };

      const result = AccuracyValidator.validateTDEEAccuracy(profile, mockResponse);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('Fat loss calories are very low - may not be sustainable');
      expect(result.warnings).toContain('Medical conditions present - consult healthcare provider');
    });
  });

  describe('runValidationSuite', () => {
    it('should run comprehensive validation tests', () => {
      const suite = AccuracyValidator.runValidationSuite();

      expect(suite.total_tests).toBeGreaterThan(0);
      expect(suite.passed_tests).toBeGreaterThan(0);
      expect(suite.average_score).toBeGreaterThan(7);
      expect(suite.results.length).toBe(suite.total_tests);
    });
  });
});
