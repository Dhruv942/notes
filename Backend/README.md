# AI Note Taking Backend

A powerful backend service for AI-powered note-taking with LangChain integration, featuring mind maps, flashcards, quizzes, and content comparison.

## Features

- 🤖 **AI-Powered Content Processing**: Generate summaries, key points, headings, and mind maps
- 🧠 **Mind Map Generation**: Create hierarchical mind maps from content
- 📚 **Flashcards & Quizzes**: Generate educational flashcards and quiz questions
- 🔍 **Content Comparison**: Compare content with existing notes
- 📄 **File Upload Support**: PDF, DOC, DOCX, and TXT file processing
- 🌐 **Website Content Processing**: Extract and process web content
- 📰 **News Summarization**: Generate summaries and key points from news content
- 🔄 **LangChain Integration**: Flexible AI processing with LangChain support

## Tech Stack

- **Node.js** & **Express.js** - Backend framework
- **Supabase** - Database and authentication
- **OpenAI API** - AI content generation
- **LangChain** - AI framework integration
- **Multer** - File upload handling
- **PDF-Parse** & **Mammoth** - Document processing

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Server Configuration
   PORT=3000
   
   # AI Service Configuration
   USE_LANGCHAIN=false
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get note by ID
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/search/:query` - Search notes
- `POST /api/notes/upload` - Upload file and create note

### AI Features
- `GET /api/notes/:id/mindmap` - Generate mind map for note
- `POST /api/notes/mindmap/custom` - Generate custom mind map
- `POST /api/notes/compare-with-existing` - Compare with existing notes
- `POST /api/notes/:id/compare-with-content` - Compare note with content

### Flashcards & Quizzes
- `GET /api/flashcards/generate/:noteId` - Generate flashcards for note
- `POST /api/flashcards/generate` - Generate flashcards from content
- `GET /api/flashcards/quiz/generate/:noteId` - Generate quiz for note
- `POST /api/flashcards/quiz/generate` - Generate quiz from content

### Highlights
- `GET /api/highlights/generate/:noteId` - Generate highlights for note
- `POST /api/highlights/generate` - Generate highlights from content

### News
- `POST /api/news/summarize` - Generate news summary
- `POST /api/news/key-points` - Generate news key points

### Website
- `POST /api/website/extract` - Process website content

### Compare
- `POST /api/compare/content` - Compare two pieces of content

## LangChain Integration

The backend supports both OpenAI SDK and LangChain for AI processing. You can switch between them using the `USE_LANGCHAIN` environment variable:

- `USE_LANGCHAIN=false` (default) - Uses OpenAI SDK directly
- `USE_LANGCHAIN=true` - Uses LangChain framework

### LangChain Features
- **Prompt Templates**: Structured prompt management
- **Output Parsers**: Consistent response formatting
- **Chain Composition**: Modular AI processing
- **Error Handling**: Robust error management

## Testing

Run the LangChain integration test:
```bash
node test-langchain.js
```

## File Upload Support

Supported file types:
- **PDF** (.pdf) - Text extraction using pdf-parse
- **Word Documents** (.doc, .docx) - Text extraction using mammoth
- **Text Files** (.txt) - Direct text processing

## Database Schema

The backend expects a `notes` table in Supabase with the following structure:

```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  summary TEXT,
  key_points JSONB,
  headings JSONB,
  mind_map JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Error Handling

The backend includes comprehensive error handling:
- API rate limiting
- Network errors
- Data parsing errors
- File processing errors
- Database errors

## Development

### Project Structure
```
src/
├── config/
│   ├── aiClient.js      # AI client configuration
│   └── supabase.js      # Database configuration
├── models/
│   └── notesModel.js    # Database operations
├── routes/
│   ├── notes.js         # Notes endpoints
│   ├── flashcards.js    # Flashcards endpoints
│   ├── highlights.js    # Highlights endpoints
│   ├── news.js          # News endpoints
│   ├── website.js       # Website endpoints
│   └── compare.js       # Compare endpoints
├── services/
│   └── aiService.js     # AI processing logic
└── index.js             # Main server file
```

### Adding New Features

1. **Create a new route file** in `src/routes/`
2. **Add AI methods** in `src/services/aiService.js`
3. **Update the main server** in `src/index.js`
4. **Test the integration**

## License

This project is licensed under the ISC License.

