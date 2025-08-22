const OpenAI = require('openai');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// OpenAI API Key from environment variable
const openaiApiKey = process.env.OPENAI_API_KEY;

// OpenAI API Key
const openaiApiKey = '';

if (!openaiApiKey) {
  console.warn('⚠️  Missing OPENAI_API_KEY environment variable - will use Gemini as primary');
} else {
  console.log('✅ OpenAI API key configured successfully');
}

if (!geminiApiKey) {
  console.warn('⚠️  Missing GEMINI_API_KEY environment variable - Gemini fallback will be disabled');
} else {
  console.log('✅ Gemini API key configured successfully');
}

// Standard OpenAI client for direct API calls
const aiClient = openaiApiKey ? new OpenAI({ 
  apiKey: openaiApiKey 
}) : null;

// LangChain OpenAI client
const langChainClient = openaiApiKey ? new ChatOpenAI({
  openAIApiKey: openaiApiKey,
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
}) : null;

// Gemini client
const geminiClient = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// LangChain output parser
const outputParser = new StringOutputParser();

module.exports = {
  aiClient,
  langChainClient,
  geminiClient,
  PromptTemplate,
  outputParser
};


