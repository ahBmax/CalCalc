const { Handler } = require('@netlify/functions');

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
        const leadData = JSON.parse(event.body);
        
        // Validate required fields
        if (!leadData.email || !leadData.name) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email and name are required' })
            };
        }

        // Here you would integrate with your preferred service:
        // - Email service (ConvertKit, Mailchimp, etc.)
        // - CRM (HubSpot, Pipedrive, etc.)
        // - Database (Airtable, Google Sheets, etc.)
        // - Webhook to your existing system
        
        // Example: Log the lead data (replace with actual integration)
        console.log('New lead captured:', {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone || 'Not provided',
            goal: leadData.goal || 'Not specified',
            tdee: leadData.tdee || 'Not calculated',
            timestamp: new Date().toISOString(),
            source: 'TDEE Calculator',
            userAgent: event.headers['user-agent'] || 'Unknown',
            ip: event.headers['x-forwarded-for'] || 'Unknown'
        });

        // Example webhook integration (uncomment and modify as needed)
        /*
        const webhookUrl = process.env.LEAD_WEBHOOK_URL; // Set this in Netlify environment variables
        if (webhookUrl) {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: leadData.name,
                    email: leadData.email,
                    phone: leadData.phone,
                    goal: leadData.goal,
                    tdee: leadData.tdee,
                    source: 'TDEE Calculator',
                    timestamp: new Date().toISOString()
                })
            });
        }
        */

        // Example ConvertKit integration (uncomment and modify as needed)
        /*
        const convertKitApiKey = process.env.CONVERTKIT_API_KEY;
        const convertKitFormId = process.env.CONVERTKIT_FORM_ID;
        
        if (convertKitApiKey && convertKitFormId) {
            await fetch(`https://api.convertkit.com/v3/forms/${convertKitFormId}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: convertKitApiKey,
                    email: leadData.email,
                    first_name: leadData.name.split(' ')[0],
                    fields: {
                        goal: leadData.goal,
                        tdee: leadData.tdee,
                        phone: leadData.phone
                    }
                })
            });
        }
        */

        // Return success response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Lead captured successfully!',
                redirect_url: process.env.SUCCESS_REDIRECT_URL || '/thank-you'
            })
        };

    } catch (error) {
        console.error('Error capturing lead:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to capture lead' })
        };
    }
};
