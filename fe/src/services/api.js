// Real API service for AI Study Notes app
// Matches the backend endpoints and data structure

// Using IP address for mobile testing - replace with your computer's IP
const API_BASE_URL = 'http://192.168.1.7:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
       
       // Add success property if not present (for backward compatibility)
       if (data.success === undefined) {
         data.success = true;
       }
       
       return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('❌ API Error message:', error.message);
      throw error;
    }
  }

  // File upload request method
  async uploadFileRequest(endpoint, formData) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('📁 Making upload request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log('📁 Upload response status:', response.status);
      const data = await response.json();
      console.log('📁 Upload response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Upload Error:', error);
      throw error;
    }
  }

  // Notes API
  async createNote(noteData) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getNotes(limit = 50, offset = 0, search = '', tags = '') {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(search && { search }),
      ...(tags && { tags }),
    });
    return this.request(`/notes?${params}`);
  }

  async getNoteById(noteId) {
    return this.request(`/notes/${noteId}`);
  }

  async updateNote(noteId, updateData) {
    return this.request(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteNote(noteId) {
    return this.request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  async uploadFile(file, title = '', tags = '', isPublic = false) {
    console.log('📁 Frontend uploadFile called with:', { file, title, tags, isPublic });
    
    // Handle expo-document-picker file object
    const fileToUpload = {
      uri: file.uri,
      type: file.mimeType || 'application/octet-stream',
      name: file.name || 'uploaded-file',
    };
    
    console.log('📁 Processed file object:', fileToUpload);
    
    const formData = new FormData();
    formData.append('file', fileToUpload);
    if (title) formData.append('title', title);
    if (tags) formData.append('tags', tags);
    formData.append('is_public', isPublic.toString());

    console.log('📁 FormData created:', formData);
    return this.uploadFileRequest('/notes/upload', formData);
  }

  // Flashcards API
  async generateFlashcardsFromNote(noteId) {
    return this.request(`/flashcards/generate/${noteId}`);
  }

  async generateCustomFlashcards(content) {
    return this.request('/flashcards/generate', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getFlashcardsByNote(noteId) {
    return this.request(`/flashcards/note/${noteId}`);
  }

  async getUserFlashcards(limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request(`/flashcards/user?${params}`);
  }

  // Quiz API
  async generateQuizFromNote(noteId) {
    return this.request(`/flashcards/quiz/generate/${noteId}`);
  }

  async generateCustomQuiz(content) {
    return this.request('/flashcards/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getQuizzesByNote(noteId) {
    return this.request(`/flashcards/quiz/note/${noteId}`);
  }

  async getUserQuizzes(limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request(`/flashcards/quiz/user?${params}`);
  }

  // Website API
  async summarizeWebsite(url, saveAsNote = false, title = '') {
    return this.request('/website/summarize', {
      method: 'POST',
      body: JSON.stringify({ url, saveAsNote, title }),
    });
  }

  async extractKeyPoints(url) {
    return this.request('/website/key-points', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async generateHeadings(url) {
    return this.request('/website/headings', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Compare API
  async compareConcepts(concept1, concept2) {
    return this.request('/compare/concepts', {
      method: 'POST',
      body: JSON.stringify({ concept1, concept2 }),
    });
  }

  // Highlights API
  async createHighlight(highlightData) {
    return this.request('/highlights/create', {
      method: 'POST',
      body: JSON.stringify(highlightData),
    });
  }

  async getHighlights(limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request(`/highlights/user?${params}`);
  }

  async getHighlightsByNote(noteId) {
    return this.request(`/highlights/note/${noteId}`);
  }

  async updateHighlight(highlightId, updateData) {
    return this.request(`/highlights/${highlightId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteHighlight(highlightId) {
    return this.request(`/highlights/${highlightId}`, {
      method: 'DELETE',
    });
  }

  async searchHighlights(query, limit = 20) {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
    });
    return this.request(`/highlights/search?${params}`);
  }

  // News API
  async getDailyNews(date = null) {
    const params = date ? new URLSearchParams({ date }) : '';
    return this.request(`/news/daily-news${params ? `?${params}` : ''}`);
  }

  async getNewsByCategory(category) {
    return this.request(`/news/category/${encodeURIComponent(category)}`);
  }

  async getNewsStats() {
    return this.request('/news/stats');
  }

  async processNews() {
    return this.request('/news/process', {
      method: 'POST',
    });
  }

  async cleanupNews() {
    return this.request('/news/cleanup', {
      method: 'DELETE',
    });
  }

  async getNewsCategories() {
    return this.request('/news/categories');
  }

  // Chat API
  async sendChatMessage(noteId, message) {
    // For now, return a mock response since backend doesn't have chat yet
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            response: `This is an AI response to your question about the note. I can help you understand the content better. Your question was: "${message}"`
          }
        });
      }, 1000);
    });
  }

  // Mindmap API
  async generateMindMapForNote(noteId) {
    return this.request(`/notes/${noteId}/mindmap`);
  }

  async generateCustomMindMap(content) {
    return this.request('/notes/mindmap/custom', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
