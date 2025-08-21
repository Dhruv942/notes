const supabase = require('../config/supabase');
const DataValidator = require('../utils/dataValidator');

// Mock user ID for bypassing authentication
const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

class NotesModel {
  async createNote(noteData) {
    try {
      const validatedData = DataValidator.validateNote(noteData);
      validatedData.user_id = MOCK_USER_ID;

      const { data, error } = await supabase
        .from('notes')
        .insert([validatedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error creating note:', error);
      throw error;
    }
  }

  async getAllNotes() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', MOCK_USER_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching notes:', error);
      throw error;
    }
  }

  async getNoteById(id) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching note:', error);
      throw error;
    }
  }

  async updateNote(id, updates) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(id) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      throw error;
    }
  }

  async searchNotes(query) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', MOCK_USER_ID)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error searching notes:', error);
      throw error;
    }
  }
}

module.exports = new NotesModel();

