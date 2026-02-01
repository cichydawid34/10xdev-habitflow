// Environment configuration template
// Copy this file to environment.ts and environment.prod.ts and fill in your values

export const environment = {
    production: false,
    supabaseUrl: 'YOUR_SUPABASE_URL',
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
    openaiApiKey: 'YOUR_OPENAI_API_KEY' // Optional - only needed for AI Digest feature
};
