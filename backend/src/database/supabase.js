const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let client = null;
let isConfigured = false;

// Mock database for local testing and demos when Supabase is not connected
const mockDb = {
  users: [
    {
      id: 'a2b9b5f5-4673-45bb-b3b4-4b533e4f71a0',
      email: 'academic.tester@example.com',
      password_hash: '$2b$10$tMh4zHl0GvHw3lFfC4Rz.e8w93W2uXq1e0U2q4Q8gKkK6yV6lW5Wq',
      created_at: new Date().toISOString()
    }
  ],
  download_requests: [],
  download_history: [],
  system_logs: []
};

// Check if credentials are valid and not placeholders
const hasCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your_supabase') && 
  !supabaseAnonKey.includes('your_supabase');

if (hasCredentials) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
    isConfigured = true;
    console.log('Supabase client successfully initialized.');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
  }
} else {
  console.warn('WARNING: Supabase URL and/or Anon Key not configured in .env. System will fall back to local in-memory records.');
}

// Database helper functions abstraction
const db = {
  isConfigured: () => isConfigured,

  // Insert a download request
  async insertRequest({ userId = null, sourceUrl, platform, status }) {
    const newRequest = {
      id: require('crypto').randomUUID(),
      user_id: userId,
      source_url: sourceUrl,
      platform,
      status,
      created_at: new Date().toISOString(),
      completed_at: null,
      error_message: null
    };

    if (isConfigured) {
      const { data, error } = await client
        .from('download_requests')
        .insert([newRequest])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      mockDb.download_requests.push(newRequest);
      return newRequest;
    }
  },

  // Update a download request
  async updateRequest(id, updates) {
    if (isConfigured) {
      const { data, error } = await client
        .from('download_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const reqIndex = mockDb.download_requests.findIndex(r => r.id === id);
      if (reqIndex !== -1) {
        mockDb.download_requests[reqIndex] = {
          ...mockDb.download_requests[reqIndex],
          ...updates
        };
        return mockDb.download_requests[reqIndex];
      }
      return null;
    }
  },

  // Insert download history entry
  async insertHistory({ userId = null, requestId = null, platform, fileName }) {
    const historyEntry = {
      id: require('crypto').randomUUID(),
      user_id: userId,
      request_id: requestId,
      platform,
      file_name: fileName,
      created_at: new Date().toISOString()
    };

    if (isConfigured) {
      const { data, error } = await client
        .from('download_history')
        .insert([historyEntry])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      mockDb.download_history.push(historyEntry);
      return historyEntry;
    }
  },

  // Get download history
  async getHistory() {
    if (isConfigured) {
      const { data, error } = await client
        .from('download_history')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      // Return copy of list reversed to show newest first
      return [...mockDb.download_history].reverse();
    }
  },

  // Log system logs
  async insertLog(level, message, context = {}) {
    const newLog = {
      id: require('crypto').randomUUID(),
      level,
      message,
      context,
      created_at: new Date().toISOString()
    };

    if (isConfigured) {
      // Non-blocking log insert
      client
        .from('system_logs')
        .insert([newLog])
        .then(({ error }) => {
          if (error) console.error('Failed to save log to Supabase:', error.message);
        })
        .catch(err => console.error('Error logging to Supabase:', err));
    } else {
      mockDb.system_logs.push(newLog);
    }
    return newLog;
  }
};

module.exports = db;
