// Advanced AI TDEE & Macro Calculator API
// The most sophisticated nutrition calculator with AI-powered personalization

import { AdvancedTDEECalculator } from '../src/calculators/advanced-tdee';
import { AIActivityAssessor } from '../src/ai/activity-assessor';
import { AICoachingSystem } from '../src/ai/coaching-ai';
import { CompleteUserProfile, CalculationRequest, CalculationResponse } from '../src/types/user-profile';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requestData: CalculationRequest = req.body;
    const { profile, ai_mode = false, include_coaching = true, include_mini_plan = true } = requestData;

    // Validate required fields
    const validation = validateProfile(profile);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid profile data', 
        details: validation.errors 
      });
    }

    // Calculate BMR and TDEE
    const { bmr, method } = AdvancedTDEECalculator.calculateBMR(profile);
    
    // Initialize AI systems if enabled
    let aiAnalysis: any = undefined;
    let activityAssessor = null;
    let coachingSystem = null;
    
    if (ai_mode && process.env.OPENAI_API_KEY) {
      activityAssessor = new AIActivityAssessor(process.env.OPENAI_API_KEY);
      coachingSystem = new AICoachingSystem(process.env.OPENAI_API_KEY);
      
      // Generate AI analysis
      aiAnalysis = await activityAssessor.generateAIAnalysis(profile);
    }

    // Calculate TDEE with AI enhancements
    const tdee = AdvancedTDEECalculator.calculateTDEE(profile, aiAnalysis as any);

    // Calculate macro targets for all goals
    const targets = {
      maintenance: AdvancedTDEECalculator.calculateMacroTargets(tdee, profile, 'maintenance'),
      fat_loss: AdvancedTDEECalculator.calculateMacroTargets(tdee, profile, 'fat_loss'),
      muscle_gain: AdvancedTDEECalculator.calculateMacroTargets(tdee, profile, 'muscle_gain'),
      recomposition: AdvancedTDEECalculator.calculateMacroTargets(tdee, profile, 'recomposition')
    };

    // Calculate timing recommendations
    const timingRecommendations = AdvancedTDEECalculator.calculateTimingRecommendations(profile);

    // Generate coaching content
    let coaching: {
      coach_note: string;
      ai_coach_note?: string;
      mini_plan?: any;
      risk_flags: string[];
      success_strategies: string[];
    } = {
      coach_note: '',
      risk_flags: [],
      success_strategies: []
    };

    if (include_coaching) {
      // Generate basic coaching note
      coaching.coach_note = generateBasicCoachingNote(profile, tdee);
      
      // Generate AI coaching if enabled
      if (coachingSystem && aiAnalysis) {
        coaching.ai_coach_note = await coachingSystem.generateCoachingNote(profile, aiAnalysis as any, tdee, targets);
        coaching.risk_flags = await coachingSystem.generateRiskFlags(profile, aiAnalysis as any);
        coaching.success_strategies = await coachingSystem.generateSuccessStrategies(profile, aiAnalysis as any);
        
        // Generate mini-plan if requested
        if (include_mini_plan) {
          coaching.mini_plan = await coachingSystem.generateMiniPlan(profile, aiAnalysis as any);
        }
      }
    }

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(profile, aiAnalysis);

    // Build response
    const response: CalculationResponse = {
      bmr,
      tdee,
      method_used: method as any,
      targets,
      ai_enhancements: aiAnalysis ? {
        adjusted_tdee: tdee,
        activity_factor_adjustment: aiAnalysis.activity_factor_adjustment || 0,
        recommended_deficit_percent: 0.2, // Default 20% for fat loss
        macro_profile_hint: generateMacroProfileHint(profile),
        timing_recommendations: timingRecommendations
      } : undefined,
      coaching,
      confidence_score: confidenceScore,
      calculation_timestamp: new Date().toISOString(),
      version: '2.0.0'
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('TDEE calculation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Validate user profile data
 */
function validateProfile(profile: CompleteUserProfile): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required basic fields
  if (!profile.name || profile.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!profile.email || !isValidEmail(profile.email)) {
    errors.push('Valid email is required');
  }
  
  if (!profile.age || profile.age < 16 || profile.age > 100) {
    errors.push('Age must be between 16 and 100');
  }
  
  if (!profile.gender || !['male', 'female', 'other'].includes(profile.gender)) {
    errors.push('Gender must be male, female, or other');
  }
  
  if (!profile.height || profile.height < 100 || profile.height > 250) {
    errors.push('Height must be between 100 and 250 cm');
  }
  
  if (!profile.weight || profile.weight < 30 || profile.weight > 300) {
    errors.push('Weight must be between 30 and 300 kg');
  }
  
  if (!profile.goal || !['fat_loss', 'muscle_gain', 'maintenance', 'recomposition', 'performance'].includes(profile.goal)) {
    errors.push('Goal must be fat_loss, muscle_gain, maintenance, recomposition, or performance');
  }
  
  // Validate body fat percentage if provided
  if (profile.body_fat_percent && (profile.body_fat_percent < 3 || profile.body_fat_percent > 50)) {
    errors.push('Body fat percentage must be between 3 and 50');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate basic coaching note
 */
function generateBasicCoachingNote(profile: CompleteUserProfile, tdee: number): string {
  const goal = profile.goal;
  const name = profile.name || 'there';
  
  if (goal === 'fat_loss') {
    return `Hi ${name}! Your TDEE is ${tdee} calories, so for fat loss, aim for ${Math.round(tdee * 0.8)} calories daily. Focus on high protein (2.2g/kg), resistance training 3-4x/week, and consistent sleep. Track progress weekly and adjust as needed. You've got this!`;
  } else if (goal === 'muscle_gain') {
    return `Hi ${name}! Your TDEE is ${tdee} calories, so for muscle gain, aim for ${Math.round(tdee * 1.12)} calories daily. Prioritize protein (2.2g/kg), progressive overload, and adequate recovery. Expect 0.5-1lb gain per month. Let's build some muscle!`;
  } else if (goal === 'recomposition') {
    return `Hi ${name}! Your TDEE is ${tdee} calories for body recomposition. Focus on high protein (2.4g/kg), strength training, and patience. This takes time but yields amazing results. Stay consistent and trust the process!`;
  } else {
    return `Hi ${name}! Your TDEE is ${tdee} calories for maintenance. Focus on consistent protein intake (2g/kg), regular exercise, and sustainable habits. Monitor weight trends and adjust calories by 100-200 if needed. Keep up the great work!`;
  }
}

/**
 * Generate macro profile hint
 */
function generateMacroProfileHint(profile: CompleteUserProfile): string {
  const trainingTypes = profile.training.training_types;
  
  if (trainingTypes.includes('powerlifting') || trainingTypes.includes('bodybuilding')) {
    return 'higher_protein_strength_training';
  } else if (trainingTypes.includes('running') || trainingTypes.includes('cycling')) {
    return 'higher_carbs_endurance';
  } else if (trainingTypes.includes('crossfit')) {
    return 'balanced_high_intensity';
  } else if (trainingTypes.includes('yoga') || trainingTypes.includes('pilates')) {
    return 'moderate_protein_flexibility';
  } else {
    return 'balanced_general_fitness';
  }
}

/**
 * Calculate confidence score
 */
function calculateConfidenceScore(profile: CompleteUserProfile, aiAnalysis: any): number {
  let score = 7; // Base score
  
  // Body fat percentage available
  if (profile.body_fat_percent && profile.body_fat_percent > 0) {
    score += 1; // More accurate with body fat
  }
  
  // Detailed lifestyle description
  if (profile.lifestyle.daily_routine_description && profile.lifestyle.daily_routine_description.length > 50) {
    score += 1;
  }
  
  // Detailed training description
  if (profile.training.training_description && profile.training.training_description.length > 50) {
    score += 1;
  }
  
  // AI analysis available
  if (aiAnalysis) {
    score += 1;
  }
  
  // Training experience
  if (profile.training.training_experience_years > 2) {
    score += 0.5;
  }
  
  return Math.min(10, Math.max(1, score));
}
