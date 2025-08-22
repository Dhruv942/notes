const supabase = require('../config/supabase');
const DataValidator = require('../utils/dataValidator');

// Mock user ID for bypassing authentication
const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

class QuizModel {
  async createQuiz(quizData) {
    try {
      const validatedData = DataValidator.validateQuiz(quizData);

      const { data, error } = await supabase
        .from('quizzes')
        .insert([validatedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error creating quiz:', error);
      throw error;
    }
  }

  async getQuizzesByNote(noteId) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching quizzes:', error);
      throw error;
    }
  }

  async getAllQuizzes() {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching all quizzes:', error);
      throw error;
    }
  }

  async getQuizById(id) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching quiz:', error);
      throw error;
    }
  }

  async updateQuiz(id, updates) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error updating quiz:', error);
      throw error;
    }
  }

  async deleteQuiz(id) {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      throw error;
    }
  }

  async deleteQuizzesByNote(noteId) {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('note_id', noteId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting quizzes by note:', error);
      throw error;
    }
  }
}

module.exports = new QuizModel();
