const supabase = require('../config/supabase');
const DataValidator = require('../utils/dataValidator');

// Mock user ID for bypassing authentication
const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

class FlashcardModel {
  async createFlashcard(flashcardData) {
    try {
      const validatedData = DataValidator.validateFlashcard(flashcardData);

      const { data, error } = await supabase
        .from('flashcards')
        .insert([validatedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error creating flashcard:', error);
      throw error;
    }
  }

  async getFlashcardsByNote(noteId) {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching flashcards:', error);
      throw error;
    }
  }

  async getAllFlashcards() {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching all flashcards:', error);
      throw error;
    }
  }

  async getFlashcardById(id) {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching flashcard:', error);
      throw error;
    }
  }

  async updateFlashcard(id, updates) {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error updating flashcard:', error);
      throw error;
    }
  }

  async deleteFlashcard(id) {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting flashcard:', error);
      throw error;
    }
  }

  async deleteFlashcardsByNote(noteId) {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('note_id', noteId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting flashcards by note:', error);
      throw error;
    }
  }
}

module.exports = new FlashcardModel();
