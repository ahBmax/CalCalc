// AI-Powered Lifestyle Analysis API
// Analyzes user's daily routine and training descriptions

// Using generic req/res types to avoid external type deps
declare const process: any;
import { AIActivityAssessor } from '../src/ai/activity-assessor';

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
    const { daily_routine, training_description } = req.body;

    if (!daily_routine && !training_description) {
      return res.status(400).json({ 
        error: 'Either daily_routine or training_description is required' 
      });
    }

    const apiKey = process && process.env ? process.env.OPENAI_API_KEY : undefined;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured' 
      });
    }

    const assessor = new AIActivityAssessor(apiKey);
    const results: any = {};

    // Analyze daily routine if provided
    if (daily_routine) {
      results.lifestyle_analysis = await assessor.analyzeDailyRoutine(daily_routine);
    }

    // Analyze training description if provided
    if (training_description) {
      results.training_analysis = await assessor.analyzeTrainingDescription(training_description);
    }

    return res.status(200).json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Lifestyle analysis error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
