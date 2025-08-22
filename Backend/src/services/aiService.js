const { aiClient, langChainClient, geminiClient, PromptTemplate, outputParser } = require('../config/aiClient');

class AIService {
  constructor() {
    this.useLangChain = process.env.USE_LANGCHAIN === 'true';
    this.useGeminiBackup = true; // Always enable Gemini backup
    console.log(`🤖 AI Service initialized with ${this.useLangChain ? 'LangChain' : 'OpenAI'} mode`);
    console.log('🤖 Gemini backup always enabled');
  }

  // Helper method to clean JSON response
  cleanJsonResponse(response) {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    return cleaned;
  }

  // Helper method to choose between AI providers with smart fallback
  async generateWithAI(prompt, options = {}) {
    let openaiError = null;
    
    // Try OpenAI first
    if (aiClient || langChainClient) {
      try {
        if (this.useLangChain) {
          return await this.generateWithLangChain(prompt, options);
        } else {
          return await this.generateWithOpenAI(prompt, options);
        }
      } catch (error) {
        console.log('❌ OpenAI failed:', error.message);
        openaiError = error;
      }
    }
    
    // Always try Gemini as backup - even if client is not configured, try to create it
    console.log('🤖 Trying Gemini backup...');
    try {
      return await this.generateWithGemini(prompt, options);
    } catch (geminiError) {
      console.log('❌ Gemini failed:', geminiError.message);
      
      // If both failed, throw a comprehensive error
      if (openaiError) {
        throw new Error(`All AI providers failed. OpenAI: ${openaiError.message}, Gemini: ${geminiError.message}`);
      } else {
        throw new Error(`Gemini failed: ${geminiError.message}`);
      }
    }
  }

  // OpenAI implementation
  async generateWithOpenAI(prompt, options = {}) {
    try {
      if (!aiClient) {
        throw new Error('OpenAI API key not configured');
      }
      
      const completion = await aiClient.chat.completions.create({
        model: options.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: options.systemPrompt || 'You are a helpful AI assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  }

  // LangChain implementation
  async generateWithLangChain(prompt, options = {}) {
    try {
      if (!langChainClient) {
        throw new Error('OpenAI API key not configured');
      }
      
      const template = PromptTemplate.fromTemplate(prompt);
      const chain = template.pipe(langChainClient).pipe(outputParser);
      
      const result = await chain.invoke({});
      return result;
    } catch (error) {
      console.error('❌ LangChain Error:', error);
      throw new Error(`LangChain Error: ${error.message}`);
    }
  }

  // Gemini implementation (direct API - no LangChain)
  async generateWithGemini(prompt, options = {}) {
    try {
      let client = geminiClient;
      
      // If geminiClient is not configured, try to create it
      if (!client) {
        console.log('🤖 Creating Gemini client dynamically...');
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        
        // Use environment variable
        const geminiApiKey = process.env.GEMINI_API_KEY;
        
        if (!geminiApiKey) {
          throw new Error('GEMINI_API_KEY environment variable not set');
        }
        
        client = new GoogleGenerativeAI(geminiApiKey);
      }
      
      console.log('🤖 Using Gemini 2.0 Flash for AI generation...');
      
      // Get the Gemini model
      const model = client.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2048,
        }
      });
      
      // Create the full prompt with system message
      const fullPrompt = options.systemPrompt 
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt;
      
      // Generate content
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('❌ Gemini Error:', error);
      throw new Error(`Gemini Error: ${error.message}`);
    }
  }

  // Generate summary
  async generateSummary(content, maxLength = 500) {
    const prompt = `Please provide a concise summary of the following content in ${maxLength} characters or less:

${content}

Summary:`;

    return this.generateWithAI(prompt, {
      systemPrompt: 'You are an expert at summarizing content concisely and accurately.',
      temperature: 0.3
    });
  }

  // Generate key points
  async generateKeyPoints(content) {
    const prompt = `Extract the main key points from the following content. Return them as a JSON array of strings:

${content}

Key Points:`;

    const response = await this.generateWithAI(prompt, {
      systemPrompt: 'You are an expert at extracting key points from content. Return only valid JSON.',
      temperature: 0.3
    });

    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ Failed to parse key points JSON:', error);
      // Fallback: split by lines and clean up
      return response.split('\n').filter(line => line.trim().length > 0);
    }
  }

  // Generate headings
  async generateHeadings(content) {
    const prompt = `Generate appropriate headings for the following content. Return them as a JSON array of strings:

${content}

Headings:`;

    const response = await this.generateWithAI(prompt, {
      systemPrompt: 'You are an expert at creating clear, descriptive headings for content. Return only valid JSON.',
      temperature: 0.4
    });

    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ Failed to parse headings JSON:', error);
      return response.split('\n').filter(line => line.trim().length > 0);
    }
  }

  // Generate flashcards
  async generateFlashcards(content) {
    const prompt = `Create flashcards from the following content. Return them as a JSON array with "question" and "answer" fields:

${content}

Flashcards:`;

    const response = await this.generateWithAI(prompt, {
      systemPrompt: 'You are an expert at creating educational flashcards. Return only valid JSON.',
      temperature: 0.5
    });

    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ Failed to parse flashcards JSON:', error);
      throw new Error('Failed to generate flashcards');
    }
  }

  // Generate quiz questions
  async generateQuizQuestions(content) {
    const prompt = `Create multiple choice quiz questions from the following content. Return them as a JSON array with "question", "options" (array of 4 choices), and "correct_answer" (index of correct option) fields:

${content}

Quiz Questions:`;

    const response = await this.generateWithAI(prompt, {
      systemPrompt: 'You are an expert at creating educational quiz questions. Return only valid JSON with correct_answer field (not correctAnswer).',
      temperature: 0.5
    });

    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      // Ensure correct_answer field exists and is properly formatted
      return parsed.map(quiz => ({
        ...quiz,
        correct_answer: quiz.correct_answer || quiz.correctAnswer || 0
      }));
    } catch (error) {
      console.error('❌ Failed to parse quiz JSON:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  // Generate mind map
    async generateMindMap(content) {
    console.log('🤖 Starting mind map generation for content length:', content?.length || 0);
    
    const prompt = `Create a mind map structure from the following content. Return it as a JSON object with "topic" and "subtopics" fields. Each subtopic must be an object with a "name" field and optional "children" array. Example structure:
\\{
  "topic": "Main Topic",
  "subtopics": [
    \\{
      "name": "Subtopic 1",
      "children": [
        \\{"name": "Child 1"\\},
        \\{"name": "Child 2"\\}
      ]
    \\},
    \\{
      "name": "Subtopic 2",
      "children": []
    \\}
  ]
\\}

Content: ${content}

Mind Map:`;

    const response = await this.generateWithAI(prompt, {
      systemPrompt: 'You are an expert at creating mind map structures. Return only valid JSON. Each subtopic must be an object with a "name" field.',
      temperature: 0.4
    });

    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ Failed to parse mind map JSON:', error);
      console.error('❌ Raw response:', response);
      throw new Error('Failed to generate mind map');
    }
  }

  // Compare content
  async compareContent(content1, content2) {
    const prompt = `Compare the following two pieces of content and provide a detailed analysis. Return the result as a JSON object with "similarities", "differences", and "similarityScore" (0-100) fields:

Content 1:
${content1}

Content 2:
${content2}

Comparison:`;

    const response = await this.generateWithAI(prompt, {
      systemPrompt: 'You are an expert at comparing and analyzing content. Return only valid JSON.',
      temperature: 0.3
    });

    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ Failed to parse comparison JSON:', error);
      throw new Error('Failed to compare content');
    }
  }

  // Generate highlights
  async generateHighlights(content) {
    const prompt = `Extract important highlights from the following content. Return them as a JSON array with "text" and "importance" (1-5) fields:

${content}

Highlights:`;

    const response = await this.generateWithAI(prompt, {
      systemPrompt: 'You are an expert at identifying important highlights in content. Return only valid JSON.',
      temperature: 0.4
    });

    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ Failed to parse highlights JSON:', error);
      throw new Error('Failed to generate highlights');
    }
  }
}

module.exports = new AIService();

