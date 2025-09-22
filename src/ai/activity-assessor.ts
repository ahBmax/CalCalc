// AI-Powered Activity and Lifestyle Assessment
// Advanced natural language processing for user profiling

import OpenAI from 'openai';
import { CompleteUserProfile, AIAnalysis } from '../types/user-profile';

export class AIActivityAssessor {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }
  
  /**
   * Analyze user's daily routine description using AI
   */
  async analyzeDailyRoutine(description: string): Promise<{
    activity_score: number;
    neat_estimate: number;
    job_activity_level: string;
    lifestyle_insights: string[];
  }> {
    const prompt = `Analyze this daily routine description and provide insights:

User Description: "${description}"

Provide analysis in JSON format with:
1. activity_score: 1-10 scale (1=very sedentary, 10=very active)
2. neat_estimate: estimated NEAT calories per day (100-800 range)
3. job_activity_level: "sedentary", "light", "moderate", "active", or "very_active"
4. lifestyle_insights: array of 3-5 key insights about their activity patterns

Consider:
- Sitting vs standing time
- Walking and movement patterns
- Job type and physical demands
- Commute and transportation
- Household activities
- Leisure and hobbies
- Fidgeting and restlessness

Be specific and accurate in your assessment.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert in human activity assessment and metabolism. Analyze daily routines to determine activity levels and NEAT (Non-Exercise Activity Thermogenesis)."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI routine analysis failed:', error);
      return {
        activity_score: 5,
        neat_estimate: 300,
        job_activity_level: 'moderate',
        lifestyle_insights: ['Unable to analyze routine description']
      };
    }
  }
  
  /**
   * Analyze training description using AI
   */
  async analyzeTrainingDescription(description: string): Promise<{
    training_types: string[];
    intensity_score: number;
    volume_score: number;
    recovery_needs: string;
    training_insights: string[];
  }> {
    const prompt = `Analyze this training description and provide insights:

User Description: "${description}"

Provide analysis in JSON format with:
1. training_types: array of training types from this list: ["powerlifting", "bodybuilding", "crossfit", "running", "cycling", "swimming", "yoga", "pilates", "martial_arts", "team_sports", "hiking", "dancing", "climbing", "other"]
2. intensity_score: 1-10 scale (1=very low, 10=very high)
3. volume_score: 1-10 scale (1=very low, 10=very high)
4. recovery_needs: "low", "moderate", "high", or "very_high"
5. training_insights: array of 3-5 key insights about their training

Consider:
- Training frequency and duration
- Exercise selection and intensity
- Training experience and skill level
- Equipment and environment
- Sport-specific requirements
- Recovery patterns and needs

Be specific about training type identification and intensity assessment.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert in exercise science and training analysis. Identify training types, assess intensity and volume, and determine recovery needs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI training analysis failed:', error);
      return {
        training_types: ['other'],
        intensity_score: 5,
        volume_score: 5,
        recovery_needs: 'moderate',
        training_insights: ['Unable to analyze training description']
      };
    }
  }
  
  /**
   * Generate comprehensive AI analysis of user profile
   */
  async generateAIAnalysis(profile: CompleteUserProfile): Promise<AIAnalysis> {
    const prompt = `Analyze this complete user profile and provide comprehensive insights:

USER PROFILE:
- Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight}kg, Height: ${profile.height}cm
- Body Fat: ${profile.body_fat_percent || 'Not provided'}%
- Goal: ${profile.goal}

LIFESTYLE:
- Daily Routine: "${profile.lifestyle.daily_routine_description}"
- Job: ${profile.lifestyle.job_type} (${profile.lifestyle.job_activity_level})
- Commute: ${profile.lifestyle.commute_type}
- Household: ${profile.lifestyle.household_activity_level}
- Fidgeting: ${profile.lifestyle.fidgeting_level}
- Standing vs Sitting: ${profile.lifestyle.standing_vs_sitting}

TRAINING:
- Training Description: "${profile.training.training_description}"
- Types: ${profile.training.training_types.join(', ')}
- Frequency: ${profile.training.training_frequency_per_week}x/week
- Duration: ${profile.training.training_duration_minutes} minutes
- Intensity: ${profile.training.training_intensity}
- Experience: ${profile.training.training_experience_years} years

HEALTH:
- Sleep: ${profile.health.sleep_hours_per_night} hours (${profile.health.sleep_quality} quality)
- Stress: ${profile.health.stress_level}
- Medical: ${profile.health.medical_conditions.join(', ') || 'None'}

BEHAVIORAL:
- Meal Frequency: ${profile.behavioral.meal_frequency}
- Adherence Risks: ${profile.behavioral.adherence_risks.join(', ')}
- Motivation: ${profile.behavioral.motivation_level}

Provide comprehensive analysis in JSON format:
{
  "estimated_neat": number (100-800),
  "activity_factor_adjustment": number (-0.2 to +0.2),
  "lifestyle_activity_score": number (1-10),
  "training_intensity_score": number (1-10),
  "training_volume_score": number (1-10),
  "recovery_needs": "low" | "moderate" | "high" | "very_high",
  "estimated_metabolic_rate": number (estimated BMR),
  "metabolic_efficiency": "low" | "normal" | "high",
  "adaptation_risk": "low" | "moderate" | "high",
  "adherence_score": number (1-10),
  "risk_factors": string[],
  "success_factors": string[],
  "recommended_approach": string,
  "key_focus_areas": string[],
  "potential_challenges": string[]
}

Be thorough and accurate in your analysis.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert in human metabolism, exercise science, and behavioral psychology. Provide comprehensive analysis of user profiles for nutrition and training optimization."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.4
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackAnalysis(profile);
    }
  }
  
  /**
   * Generate fallback analysis when AI fails
   */
  private getFallbackAnalysis(profile: CompleteUserProfile): AIAnalysis {
    const { age, gender, weight, height } = profile;
    
    // Basic BMR estimation
    let estimatedBMR: number;
    if (gender === 'male') {
      estimatedBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      estimatedBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // Basic activity assessment
    const lifestyleScore = this.assessLifestyleScore(profile.lifestyle);
    const trainingScore = this.assessTrainingScore(profile.training);
    const adherenceScore = this.assessAdherenceScore(profile.behavioral);
    
    return {
      estimated_neat: 300,
      activity_factor_adjustment: 0,
      lifestyle_activity_score: lifestyleScore,
      training_intensity_score: trainingScore,
      training_volume_score: trainingScore,
      recovery_needs: 'moderate',
      estimated_metabolic_rate: estimatedBMR,
      metabolic_efficiency: 'normal',
      adaptation_risk: 'moderate',
      adherence_score: adherenceScore,
      risk_factors: profile.behavioral.adherence_risks,
      success_factors: ['Consistent tracking', 'Regular training', 'Adequate sleep'],
      recommended_approach: 'Gradual implementation with focus on consistency',
      key_focus_areas: ['Protein intake', 'Training consistency', 'Sleep quality'],
      potential_challenges: profile.behavioral.adherence_risks
    };
  }
  
  /**
   * Assess lifestyle activity score
   */
  private assessLifestyleScore(lifestyle: any): number {
    let score = 5; // Base score
    
    // Job activity
    const jobScores = {
      'desk_job': 3,
      'standing_job': 5,
      'physical_job': 8,
      'mixed': 6,
      'unemployed': 4,
      'student': 5
    };
    score = (score + jobScores[lifestyle.job_type]) / 2;
    
    // Commute
    const commuteScores = {
      'car': 0,
      'public_transport': 1,
      'walking': 3,
      'cycling': 4,
      'remote': 0
    };
    score += commuteScores[lifestyle.commute_type] || 0;
    
    // Household activities
    const householdScores = {
      'minimal': 0,
      'light': 1,
      'moderate': 2,
      'active': 3
    };
    score += householdScores[lifestyle.household_activity_level] || 0;
    
    // Fidgeting
    const fidgetingScores = {
      'very_still': -1,
      'some_fidgeting': 0,
      'moderate_fidgeting': 1,
      'lots_of_fidgeting': 2
    };
    score += fidgetingScores[lifestyle.fidgeting_level] || 0;
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }
  
  /**
   * Assess training score
   */
  private assessTrainingScore(training: any): number {
    let score = 5; // Base score
    
    // Training frequency
    score += training.training_frequency_per_week * 0.5;
    
    // Training intensity
    const intensityScores = {
      'low': 2,
      'moderate': 5,
      'high': 8,
      'very_high': 10
    };
    score = (score + intensityScores[training.training_intensity]) / 2;
    
    // Training experience
    if (training.training_experience_years > 5) {
      score += 1;
    }
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }
  
  /**
   * Assess adherence score
   */
  private assessAdherenceScore(behavioral: any): number {
    let score = 7; // Base score
    
    // Motivation level
    const motivationScores = {
      'very_low': 2,
      'low': 4,
      'moderate': 6,
      'high': 8,
      'very_high': 10
    };
    score = (score + motivationScores[behavioral.motivation_level]) / 2;
    
    // Adherence risks
    score -= behavioral.adherence_risks.length * 0.5;
    
    // Support system
    const supportScores = {
      'none': 0,
      'minimal': 1,
      'moderate': 2,
      'strong': 3
    };
    score += supportScores[behavioral.support_system] || 0;
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }
}
