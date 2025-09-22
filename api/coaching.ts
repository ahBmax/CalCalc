// AI-Powered Coaching API
// Generates personalized coaching notes and mini-plans

declare const process: any;
import { AICoachingSystem } from '../src/ai/coaching-ai';
import { CompleteUserProfile, AIAnalysis } from '../src/types/user-profile';

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
    const { profile, analysis, tdee, targets, coaching_type = 'full' } = req.body;

    if (!profile || !analysis || !tdee || !targets) {
      return res.status(400).json({ 
        error: 'Profile, analysis, tdee, and targets are required' 
      });
    }

    const apiKey = process && process.env ? process.env.OPENAI_API_KEY : undefined;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured' 
      });
    }

    const coachingSystem = new AICoachingSystem(apiKey);
    const results: any = {};

    // Generate coaching note
    if (coaching_type === 'note' || coaching_type === 'full') {
      results.coaching_note = await coachingSystem.generateCoachingNote(
        profile as CompleteUserProfile,
        analysis as AIAnalysis,
        tdee,
        targets
      );
    }

    // Generate mini-plan
    if (coaching_type === 'mini_plan' || coaching_type === 'full') {
      results.mini_plan = await coachingSystem.generateMiniPlan(
        profile as CompleteUserProfile,
        analysis as AIAnalysis
      );
    }

    // Generate risk flags
    if (coaching_type === 'risks' || coaching_type === 'full') {
      results.risk_flags = await coachingSystem.generateRiskFlags(
        profile as CompleteUserProfile,
        analysis as AIAnalysis
      );
    }

    // Generate success strategies
    if (coaching_type === 'strategies' || coaching_type === 'full') {
      results.success_strategies = await coachingSystem.generateSuccessStrategies(
        profile as CompleteUserProfile,
        analysis as AIAnalysis
      );
    }

    return res.status(200).json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Coaching generation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
