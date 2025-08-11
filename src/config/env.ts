import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  env: process.env.NODE_ENV || 'development',
  groqApiKey: process.env.GROQ_AI_API_KEY || '',
    isProduction: process.env.NODE_ENV === 'production',
    aiModel: process.env.AI_MODEL || '',
    MAX_TOOL_CALL_LOOPS : 10
};
