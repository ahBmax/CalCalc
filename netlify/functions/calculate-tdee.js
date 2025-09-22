const { Handler } = require('@netlify/functions');

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

// AI Coaching Logic
class AICoaching {
    static generateCoachingNotes(userData, tdee, macros) {
        const { age, gender, weight, height, activity, goal } = userData;
        const bmi = weight / Math.pow(height / 100, 2);
        
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

        return notes.join('<br><br>');
    }

    static generateHabitSuggestions(userData, goal) {
        const suggestions = [];
        
        // Universal habits
        suggestions.push("📱 <strong>Track Your Food:</strong> Use a food tracking app for the first 2-4 weeks to build awareness of portion sizes and food choices.");
        suggestions.push("💧 <strong>Hydration:</strong> Aim for 3-4 liters of water daily. Proper hydration supports metabolism and reduces false hunger cues.");
        suggestions.push("😴 <strong>Sleep Quality:</strong> Prioritize 7-9 hours of quality sleep. Poor sleep disrupts hunger hormones and recovery.");

        // Goal-specific habits
        switch (goal) {
            case 'lose':
                suggestions.push("🍽️ <strong>Meal Timing:</strong> Consider intermittent fasting or eating your largest meal earlier in the day to optimize fat burning.");
                suggestions.push("🥗 <strong>Volume Eating:</strong> Fill half your plate with vegetables to increase satiety while keeping calories low.");
                break;
            case 'gain':
                suggestions.push("⏰ <strong>Frequent Eating:</strong> Eat every 3-4 hours to meet your calorie targets without feeling overly full.");
                suggestions.push("🥤 <strong>Calorie-Dense Foods:</strong> Include nuts, oils, and dried fruits to boost calories without excessive volume.");
                break;
            case 'maintain':
                suggestions.push("🎯 <strong>Flexible Approach:</strong> Use the 80/20 rule - eat according to your plan 80% of the time, allow flexibility 20% of the time.");
                break;
        }

        return suggestions.join('<br><br>');
    }

    static generateMiniPlan(userData, macros) {
        const { goal } = userData;
        
        let plan = "<h4>📋 Your 7-Day Mini Plan</h4>";
        
        if (goal === 'lose') {
            plan += `
                <p><strong>Week 1 Focus: Foundation Building</strong></p>
                <ul>
                    <li><strong>Days 1-2:</strong> Track everything you eat to establish baseline</li>
                    <li><strong>Days 3-4:</strong> Hit your protein target consistently</li>
                    <li><strong>Days 5-6:</strong> Focus on staying within calorie range</li>
                    <li><strong>Day 7:</strong> Review and adjust for week 2</li>
                </ul>
                <p><strong>Success Metrics:</strong> Hit protein target 6/7 days, stay within 100 calories of target 5/7 days</p>
            `;
        } else if (goal === 'gain') {
            plan += `
                <p><strong>Week 1 Focus: Calorie Surplus</strong></p>
                <ul>
                    <li><strong>Days 1-2:</strong> Add one extra meal or snack daily</li>
                    <li><strong>Days 3-4:</strong> Focus on hitting calorie target consistently</li>
                    <li><strong>Days 5-6:</strong> Optimize meal timing around workouts</li>
                    <li><strong>Day 7:</strong> Assess hunger and energy levels</li>
                </ul>
                <p><strong>Success Metrics:</strong> Hit calorie target 6/7 days, maintain or increase training performance</p>
            `;
        } else {
            plan += `
                <p><strong>Week 1 Focus: Consistency</strong></p>
                <ul>
                    <li><strong>Days 1-2:</strong> Establish regular meal times</li>
                    <li><strong>Days 3-4:</strong> Focus on protein distribution throughout the day</li>
                    <li><strong>Days 5-6:</strong> Optimize pre/post workout nutrition</li>
                    <li><strong>Day 7:</strong> Plan and prep for week 2</li>
                </ul>
                <p><strong>Success Metrics:</strong> Maintain weight within 1-2 lbs, consistent energy levels</p>
            `;
        }
        
        return plan;
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

        // Generate AI coaching content
        const coachingNotes = AICoaching.generateCoachingNotes(userData, tdee, macros);
        const habitSuggestions = AICoaching.generateHabitSuggestions(userData, userData.goal);
        const miniPlan = AICoaching.generateMiniPlan(userData, macros);

        // Combine all coaching content
        const fullCoachingContent = `
            ${coachingNotes}
            <br><br>
            <h4>🎯 Habit Suggestions</h4>
            ${habitSuggestions}
            <br><br>
            ${miniPlan}
        `;

        const response = {
            tdee: tdee,
            bmr: bmr,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            calories: macros.calories,
            coaching_notes: fullCoachingContent,
            user_data: {
                age: userData.age,
                gender: userData.gender,
                weight: userData.weight,
                height: userData.height,
                activity: userData.activity,
                goal: userData.goal
            }
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
