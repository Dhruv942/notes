const OpenAI = require('openai');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

// OpenAI API Key
const openaiApiKey = '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';

if (!openaiApiKey) {
  console.warn('⚠️  Missing OpenAI API key - AI features will be disabled');
} else {
  console.log('✅ OpenAI API key configured successfully');
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

// LangChain output parser
const outputParser = new StringOutputParser();

module.exports = {
  aiClient,
  langChainClient,
  PromptTemplate,
  outputParser
};

