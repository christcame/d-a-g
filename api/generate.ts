import { initialDiceData } from '../constants';

const PROMPT_TEMPLATE = "A young woman, **descriptive adjective**, with **hair color** hair in a **hairstyle**, **build**, wearing **outfit** with **accessories** while **activity**.";

/**
 * This file represents a serverless API endpoint. It would typically be the
 * default export in a file-based routing system (e.g., in a /api directory on
 * Vercel or Netlify).
 *
 * It handles a GET request and returns a JSON response with a generated prompt.
 * It uses the default data from `constants.ts` and does not have access to
 * user customizations from the frontend's localStorage.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: { 'Allow': 'GET' } 
      });
    }

    const regex = /\*\*(.*?)\*\*/g;
    
    const generatedPrompt = PROMPT_TEMPLATE.replace(regex, (match, category) => {
        const key = category.trim();
        const values = initialDiceData[key];

        if (values && values.length > 0) {
            const randomIndex = Math.floor(Math.random() * values.length);
            // Remove apostrophes, mirroring the frontend logic
            return values[randomIndex].replace(/'/g, ''); 
        }

        // If a category has no values, return the placeholder to indicate an issue
        return `[${category}]`; 
    });

    const data = { prompt: generatedPrompt };

    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
        'Cache-Control': 'no-cache, no-store, must-revalidate' // Ensure fresh prompt on each request
      },
      status: 200,
    });
  },
};
