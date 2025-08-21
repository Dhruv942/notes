const { aiClient, langChainClient, PromptTemplate, outputParser } = require('../config/aiClient');

class AIService {
  constructor() {
    this.useLangChain = process.env.USE_LANGCHAIN === 'true';
    console.log(`🤖 AI Service initialized with ${this.useLangChain ? 'LangChain' : 'OpenAI'} mode`);
  }

  // Helper method to clean JSON response
  cleanJsonResponse(response) {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    return cleaned;
  }

  // Helper method to choose between OpenAI and LangChain
  async generateWithAI(prompt, options = {}) {
    if (this.useLangChain) {
      return this.generateWithLangChain(prompt, options);
    } else {
      return this.generateWithOpenAI(prompt, options);
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
    const prompt = `Create a mind map structure from the following content. Return it as a JSON object with "topic" and "subtopics" fields. Each subtopic must be an object with a "name" field and optional "children" array. Example structure:
{
  "topic": "Main Topic",
  "subtopics": [
    {
      "name": "Subtopic 1",
      "children": [
        {"name": "Child 1"},
        {"name": "Child 2"}
      ]
    },
    {
      "name": "Subtopic 2",
      "children": []
    }
  ]
}

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

