const { Handler } = require('@netlify/functions');
const OpenAI = require('openai');

// Initialize OpenAI (optional - only if you want enhanced AI coaching)
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

// TDEE calculation formulas
class TDEECalculator {
    static calculateBMR(age, gender, weight, height) {
        // Mifflin-St Jeor Equation (most accurate)
        let bmr;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
        return Math.round(bmr);
    }

    static calculateTDEE(bmr, activityLevel) {
        const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'very': 1.725,
            'extreme': 1.9
        };
        
        return Math.round(bmr * activityMultipliers[activityLevel]);
    }

    static calculateMacros(tdee, goal, weight) {
        let targetCalories;
        
        // Adjust calories based on goal
        switch (goal) {
            case 'lose':
                targetCalories = tdee - 500; // 1 lb/week deficit
                break;
            case 'gain':
                targetCalories = tdee + 300; // Moderate surplus
                break;
            default:
                targetCalories = tdee;
        }

        // Macronutrient distribution
        const proteinPerKg = 2.2; // High protein for muscle preservation/growth
        const protein = Math.round(weight * proteinPerKg);
        const proteinCalories = protein * 4;
        
        const fatPercentage = 0.25; // 25% of calories from fat
        const fatCalories = targetCalories * fatPercentage;
        const fat = Math.round(fatCalories / 9);
        
        const carbCalories = targetCalories - proteinCalories - fatCalories;
        const carbs = Math.round(carbCalories / 4);

        return {
            calories: Math.max(targetCalories, 1200), // Minimum safe calories
            protein,
            carbs: Math.max(carbs, 50), // Minimum carbs
            fat: Math.max(fat, 30) // Minimum fat
        };
    }
}

// Enhanced AI Coaching with OpenAI
class EnhancedAICoaching {
    static async generateCoachingNotes(userData, tdee, macros) {
        const { age, gender, weight, height, activity, goal } = userData;
        const bmi = weight / Math.pow(height / 100, 2);
        
        // If OpenAI is available, use it for enhanced coaching
        if (openai) {
            try {
                const prompt = `You are an expert personal trainer and nutritionist. Create personalized coaching advice for a client with these details:
                
                Age: ${age}
                Gender: ${gender}
                Weight: ${weight}kg
                Height: ${height}cm
                BMI: ${bmi.toFixed(1)}
                Activity Level: ${activity}
                Goal: ${goal}
                TDEE: ${tdee} calories
                Target Calories: ${macros.calories}
                Protein Target: ${macros.protein}g
                Carb Target: ${macros.carbs}g
                Fat Target: ${macros.fat}g
                
                Provide:
                1. Personalized insights based on their stats
                2. Specific habit suggestions for their goal
                3. Risk flags or warnings if any
                4. A 7-day mini-plan template
                
                Format as HTML with proper headings and styling. Be encouraging but professional.`;

                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert personal trainer and nutritionist. Provide personalized, actionable advice in HTML format."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                });

                return completion.choices[0].message.content;
            } catch (error) {
                console.error('OpenAI API error:', error);
                // Fall back to basic coaching if OpenAI fails
            }
        }
        
        // Fallback to basic coaching logic
        return this.generateBasicCoaching(userData, tdee, macros, bmi);
    }

    static generateBasicCoaching(userData, tdee, macros, bmi) {
        const { age, gender, weight, height, activity, goal } = userData;
        
        let notes = [];
        
        // BMI-based insights
        if (bmi < 18.5) {
            notes.push("⚠️ <strong>Underweight Alert:</strong> Your BMI suggests you're underweight. Consider consulting a healthcare provider before making dietary changes.");
        } else if (bmi > 30) {
            notes.push("🎯 <strong>Weight Loss Focus:</strong> With your current BMI, a gradual weight loss approach will be most sustainable and healthy.");
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            notes.push("✅ <strong>Healthy Range:</strong> You're in a healthy weight range! Focus on body composition and strength gains.");
        }

        // Goal-specific coaching
        switch (goal) {
            case 'lose':
                notes.push("🔥 <strong>Weight Loss Strategy:</strong> Your 500-calorie deficit will help you lose ~1 lb per week. This is a sustainable rate that preserves muscle mass.");
                notes.push("💪 <strong>Protein Priority:</strong> Your high protein target will help preserve muscle during weight loss and keep you feeling full.");
                break;
            case 'gain':
                notes.push("📈 <strong>Weight Gain Strategy:</strong> Your 300-calorie surplus is perfect for lean muscle gains without excessive fat storage.");
                notes.push("🏋️ <strong>Training Focus:</strong> Combine this nutrition plan with progressive strength training for optimal muscle growth.");
                break;
            case 'maintain':
                notes.push("⚖️ <strong>Maintenance Mode:</strong> You're eating at maintenance calories. Focus on nutrient quality and consistent training.");
                break;
        }

        // Activity-based recommendations
        if (activity === 'sedentary') {
            notes.push("🚶 <strong>Movement Matters:</strong> Start with daily walks and gradually increase activity. Even small increases in daily movement can significantly impact your results.");
        } else if (activity === 'very' || activity === 'extreme') {
            notes.push("🏃 <strong>High Activity:</strong> With your high activity level, make sure to fuel properly and prioritize recovery. Consider adding more carbs around workouts.");
        }

        // Age-specific advice
        if (age > 40) {
            notes.push("👴 <strong>Age Considerations:</strong> As we age, protein needs increase and metabolism slows slightly. Your high protein target is perfect for maintaining muscle mass.");
        }

        // Risk flags
        if (macros.calories < 1200) {
            notes.push("🚨 <strong>Calorie Alert:</strong> Your target calories are very low. Consider a more moderate approach to avoid metabolic adaptation.");
        }

        if (macros.protein > weight * 3) {
            notes.push("⚠️ <strong>Protein Warning:</strong> Your protein target is very high. While not harmful, it may be unnecessary and could crowd out other nutrients.");
        }

        // Add habit suggestions
        notes.push("<br><h4>🎯 Habit Suggestions</h4>");
        notes.push("📱 <strong>Track Your Food:</strong> Use a food tracking app for the first 2-4 weeks to build awareness of portion sizes and food choices.");
        notes.push("💧 <strong>Hydration:</strong> Aim for 3-4 liters of water daily. Proper hydration supports metabolism and reduces false hunger cues.");
        notes.push("😴 <strong>Sleep Quality:</strong> Prioritize 7-9 hours of quality sleep. Poor sleep disrupts hunger hormones and recovery.");

        // Add mini-plan
        notes.push("<br><h4>📋 Your 7-Day Mini Plan</h4>");
        if (goal === 'lose') {
            notes.push("<p><strong>Week 1 Focus: Foundation Building</strong></p>");
            notes.push("<ul><li><strong>Days 1-2:</strong> Track everything you eat to establish baseline</li>");
            notes.push("<li><strong>Days 3-4:</strong> Hit your protein target consistently</li>");
            notes.push("<li><strong>Days 5-6:</strong> Focus on staying within calorie range</li>");
            notes.push("<li><strong>Day 7:</strong> Review and adjust for week 2</li></ul>");
        } else if (goal === 'gain') {
            notes.push("<p><strong>Week 1 Focus: Calorie Surplus</strong></p>");
            notes.push("<ul><li><strong>Days 1-2:</strong> Add one extra meal or snack daily</li>");
            notes.push("<li><strong>Days 3-4:</strong> Focus on hitting calorie target consistently</li>");
            notes.push("<li><strong>Days 5-6:</strong> Optimize meal timing around workouts</li>");
            notes.push("<li><strong>Day 7:</strong> Assess hunger and energy levels</li></ul>");
        } else {
            notes.push("<p><strong>Week 1 Focus: Consistency</strong></p>");
            notes.push("<ul><li><strong>Days 1-2:</strong> Establish regular meal times</li>");
            notes.push("<li><strong>Days 3-4:</strong> Focus on protein distribution throughout the day</li>");
            notes.push("<li><strong>Days 5-6:</strong> Optimize pre/post workout nutrition</li>");
            notes.push("<li><strong>Day 7:</strong> Plan and prep for week 2</li></ul>");
        }

        return notes.join('<br><br>');
    }
}

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const userData = JSON.parse(event.body);
        
        // Validate input
        const requiredFields = ['age', 'gender', 'weight', 'height', 'activity', 'goal'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: `Missing required field: ${field}` })
                };
            }
        }

        // Calculate TDEE
        const bmr = TDEECalculator.calculateBMR(
            parseInt(userData.age),
            userData.gender,
            parseFloat(userData.weight),
            parseFloat(userData.height)
        );

        const tdee = TDEECalculator.calculateTDEE(bmr, userData.activity);
        
        // Calculate macros
        const macros = TDEECalculator.calculateMacros(
            tdee,
            userData.goal,
            parseFloat(userData.weight)
        );

        // Generate enhanced AI coaching content
        const coachingNotes = await EnhancedAICoaching.generateCoachingNotes(userData, tdee, macros);

        const response = {
            tdee: tdee,
            bmr: bmr,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            calories: macros.calories,
            coaching_notes: coachingNotes,
            user_data: {
                age: userData.age,
                gender: userData.gender,
                weight: userData.weight,
                height: userData.height,
                activity: userData.activity,
                goal: userData.goal
            },
            enhanced_ai: !!openai // Indicates if enhanced AI was used
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('Error calculating TDEE:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
