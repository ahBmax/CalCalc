// AI-Powered Personalized Coaching System
// Advanced coaching recommendations and mini-plan generation

import OpenAI from 'openai';
import { CompleteUserProfile, AIAnalysis, MiniPlan, TimingRecommendations } from '../types/user-profile';

export class AICoachingSystem {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }
  
  /**
   * Generate personalized coaching note
   */
  async generateCoachingNote(
    profile: CompleteUserProfile, 
    analysis: AIAnalysis, 
    tdee: number, 
    targets: any
  ): Promise<string> {
    const prompt = `Generate a personalized coaching note for this user:

USER PROFILE:
- Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight}kg, Height: ${profile.height}cm
- Goal: ${profile.goal}
- TDEE: ${tdee} calories

TARGETS:
- Maintenance: ${targets.maintenance.calories} calories
- Fat Loss: ${targets.fat_loss.calories} calories
- Muscle Gain: ${targets.muscle_gain.calories} calories

AI ANALYSIS:
- Lifestyle Score: ${analysis.lifestyle_activity_score}/10
- Training Score: ${analysis.training_intensity_score}/10
- Adherence Score: ${analysis.adherence_score}/10
- Risk Factors: ${analysis.risk_factors.join(', ')}
- Success Factors: ${analysis.success_factors.join(', ')}

LIFESTYLE INSIGHTS:
- Daily Routine: "${profile.lifestyle.daily_routine_description}"
- Training: "${profile.training.training_description}"
- Sleep: ${profile.health.sleep_hours_per_night} hours (${profile.health.sleep_quality})
- Stress: ${profile.health.stress_level}
- Adherence Risks: ${profile.behavioral.adherence_risks.join(', ')}

Write a personalized coaching note (3-5 sentences) that:
1. Acknowledges their specific situation and goals
2. Provides targeted advice based on their profile
3. Addresses their main challenges
4. Offers encouragement and motivation
5. Sets realistic expectations

Be specific, actionable, and encouraging. Use their name if provided.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert personal trainer and nutritionist. Write personalized, encouraging coaching notes that are specific, actionable, and motivating."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return completion.choices[0].message.content || this.getFallbackCoachingNote(profile, tdee);
    } catch (error) {
      console.error('AI coaching note generation failed:', error);
      return this.getFallbackCoachingNote(profile, tdee);
    }
  }
  
  /**
   * Generate personalized mini-plan
   */
  async generateMiniPlan(
    profile: CompleteUserProfile, 
    analysis: AIAnalysis
  ): Promise<MiniPlan> {
    const prompt = `Generate a personalized 7-day mini-plan for this user:

USER PROFILE:
- Goal: ${profile.goal}
- Training: ${profile.training.training_types.join(', ')}
- Frequency: ${profile.training.training_frequency_per_week}x/week
- Experience: ${profile.training.training_experience_years} years
- Adherence Score: ${analysis.adherence_score}/10
- Risk Factors: ${analysis.risk_factors.join(', ')}

LIFESTYLE:
- Job: ${profile.lifestyle.job_type}
- Sleep: ${profile.health.sleep_hours_per_night} hours
- Meal Frequency: ${profile.behavioral.meal_frequency}
- Cooking Ability: ${profile.behavioral.cooking_ability}

Generate a mini-plan in JSON format:
{
  "weekly_sessions": number,
  "training_template": string,
  "step_target": string,
  "protein_minimum_g": number,
  "habits": [string, string, string],
  "weekly_focus": string,
  "success_metrics": [string, string, string]
}

Consider:
- Their training type and experience level
- Their adherence risks and challenges
- Their lifestyle and schedule
- Realistic and achievable goals
- Progressive implementation

Make it specific to their situation and goals.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert personal trainer. Create realistic, achievable mini-plans that consider the user's lifestyle, experience, and challenges."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.6
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('AI mini-plan generation failed:', error);
      return this.getFallbackMiniPlan(profile);
    }
  }
  
  /**
   * Generate risk flags and warnings
   */
  async generateRiskFlags(profile: CompleteUserProfile, analysis: AIAnalysis): Promise<string[]> {
    const riskFlags: string[] = [];
    
    // Low adherence score
    if (analysis.adherence_score < 5) {
      riskFlags.push('Low adherence risk - focus on building sustainable habits');
    }
    
    // High stress
    if (profile.health.stress_level === 'high' || profile.health.stress_level === 'very_high') {
      riskFlags.push('High stress levels may impact recovery and adherence');
    }
    
    // Poor sleep
    if (profile.health.sleep_hours_per_night < 6 || profile.health.sleep_quality === 'poor') {
      riskFlags.push('Inadequate sleep may affect metabolism and recovery');
    }
    
    // Extreme goals
    if (profile.goal === 'fat_loss' && profile.weight < 60) {
      riskFlags.push('Low body weight - ensure adequate calorie intake');
    }
    
    // High training volume
    if (profile.training.training_frequency_per_week > 6) {
      riskFlags.push('High training volume - prioritize recovery and nutrition');
    }
    
    // Medical conditions
    if (profile.health.medical_conditions.length > 0) {
      riskFlags.push('Medical conditions present - consult healthcare provider');
    }
    
    // Adherence risks
    if (profile.behavioral.adherence_risks.includes('weekend_binges')) {
      riskFlags.push('Weekend eating patterns may impact progress');
    }
    
    if (profile.behavioral.adherence_risks.includes('stress_eating')) {
      riskFlags.push('Stress eating may interfere with goals');
    }
    
    return riskFlags;
  }
  
  /**
   * Generate success strategies
   */
  async generateSuccessStrategies(profile: CompleteUserProfile, analysis: AIAnalysis): Promise<string[]> {
    const strategies: string[] = [];
    
    // High adherence score
    if (analysis.adherence_score >= 8) {
      strategies.push('Strong adherence potential - focus on optimization and progression');
    }
    
    // Good sleep
    if (profile.health.sleep_hours_per_night >= 7 && profile.health.sleep_quality === 'good') {
      strategies.push('Excellent sleep foundation - leverage for recovery and metabolism');
    }
    
    // Low stress
    if (profile.health.stress_level === 'low' || profile.health.stress_level === 'very_low') {
      strategies.push('Low stress environment - ideal for consistent progress');
    }
    
    // Experience
    if (profile.training.training_experience_years > 3) {
      strategies.push('Training experience - focus on advanced techniques and optimization');
    }
    
    // Support system
    if (profile.behavioral.support_system === 'strong') {
      strategies.push('Strong support system - leverage for accountability and motivation');
    }
    
    // Meal prep
    if (profile.behavioral.meal_prep_frequency === 'often' || profile.behavioral.meal_prep_frequency === 'always') {
      strategies.push('Meal prep experience - optimize for consistency and adherence');
    }
    
    return strategies;
  }
  
  /**
   * Get fallback coaching note
   */
  private getFallbackCoachingNote(profile: CompleteUserProfile, tdee: number): string {
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
   * Get fallback mini-plan
   */
  private getFallbackMiniPlan(profile: CompleteUserProfile): MiniPlan {
    const goal = profile.goal;
    const trainingFreq = profile.training.training_frequency_per_week;
    
    let weeklySessions = Math.min(trainingFreq, 4);
    let template = 'Full body x2-3';
    let stepTarget = '8-10k';
    let proteinMin = Math.round(profile.weight * 2.0);
    
    if (goal === 'fat_loss') {
      template = 'Upper/Lower x2 + Cardio x2';
      stepTarget = '10-12k';
      proteinMin = Math.round(profile.weight * 2.2);
    } else if (goal === 'muscle_gain') {
      template = 'Push/Pull/Legs x2';
      stepTarget = '6-8k';
      proteinMin = Math.round(profile.weight * 2.2);
    }
    
    return {
      weekly_sessions: weeklySessions,
      training_template: template,
      step_target: stepTarget,
      protein_minimum_g: proteinMin,
      habits: [
        'Track food intake for 5 days',
        'Hit protein target daily',
        'Get 7+ hours of sleep'
      ],
      weekly_focus: 'Build consistency with tracking and training',
      success_metrics: [
        'Hit protein target 5/7 days',
        'Complete all planned workouts',
        'Maintain sleep schedule'
      ]
    };
  }
}
