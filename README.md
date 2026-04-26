# AI Assistant Platform

A full-stack AI SaaS application built with Next.js + TypeScript + PostgreSQL + Prisma + OpenAI API.

## Features

### 📝 AI Writing Assistant
- Support multiple content types: Blog posts, Emails, Social media, Essays, Stories, Marketing copy, Technical documentation
- Adjustable tone styles: Professional, Casual, Friendly, Formal, Humorous, Persuasive
- Customizable word count target
- Save and manage writing history

### 📚 Intelligent Document Q&A
- Upload and create documents
- AI-powered question answering based on document content
- Q&A history tracking

### 💻 AI Code Review
- Support 15+ programming languages
- Code quality scoring (0-100)
- Automatic issue detection
- Optimization suggestions

### 🔐 User Authentication
- Complete login/registration system based on NextAuth.js
- Session management
- Protected routes

## Tech Stack

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS 3
- **Database**: PostgreSQL
- **ORM**: Prisma 5
- **Authentication**: NextAuth.js 4
- **AI**: OpenAI GPT-4 API
- **UI Components**: Radix UI + Lucide Icons

## Database Configuration

```
Host: 8.155.53.159
Database: pgsql
User: admin
Password: admin123
```

## Quick Start

### 1. Install Dependencies

```bash
cd ai-assistant-platform/my-app
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file:

```env
# Database Configuration (already configured)
DATABASE_URL="postgresql://admin:admin123@8.155.53.159:5432/pgsql"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# OpenAI API Key (required for AI features)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# App Configuration
NEXT_PUBLIC_APP_NAME="AI Assistant Platform"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

The database migration has already been applied. If you need to reset:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (if needed)
npm run db:migrate

# Open Prisma Studio to view database
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
my-app/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication API
│   │   │   └── ai/            # AI feature APIs
│   │   │       ├── writing/   # Writing assistant API
│   │   │       ├── document/  # Document Q&A API
│   │   │       └── code-review/ # Code review API
│   │   ├── dashboard/         # Dashboard page
│   │   ├── writing/           # AI writing assistant page
│   │   ├── documents/         # Document Q&A page
│   │   ├── code-review/       # Code review page
│   │   └── login/             # Login/Register page
│   ├── components/
│   │   ├── ui/                # UI components
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── ToastProvider.tsx  # Toast notifications
│   │   └── SessionProvider.tsx # Session management
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── openai.ts          # OpenAI client
│   │   └── utils.ts           # Utility functions
│   └── middleware.ts          # Authentication middleware
├── .env                       # Environment variables
├── .env.local                 # Local environment variables
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies
├── Dockerfile                 # Docker configuration
└── README.md                  # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - Login/Logout

### AI Writing Assistant
- `GET /api/ai/writing` - Get writing tasks list
- `POST /api/ai/writing` - Create new writing task
- `DELETE /api/ai/writing?id={id}` - Delete writing task

### Intelligent Document Q&A
- `GET /api/ai/document` - Get documents list
- `POST /api/ai/document` - Create document / Ask question
- `DELETE /api/ai/document?id={id}` - Delete document

### AI Code Review
- `GET /api/ai/code-review` - Get code review list
- `POST /api/ai/code-review` - Create code review
- `DELETE /api/ai/code-review?id={id}` - Delete code review

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:migrate       # Run database migrations
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio
npm run db:push          # Push schema to database

# Linting
npm run lint             # Run ESLint
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t ai-assistant-platform .

# Run container
docker run -p 3000:3000 --env-file .env ai-assistant-platform
```

### Server Deployment

1. Upload code to server
2. Install dependencies: `npm install --production`
3. Build: `npm run build`
4. Start: `npm start`

### Environment Variables for Production

```env
# Required
DATABASE_URL="postgresql://admin:admin123@8.155.53.159:5432/pgsql"
NEXTAUTH_SECRET="your-production-secret-key"
OPENAI_API_KEY="sk-your-openai-api-key"

# Optional
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Supported Programming Languages for Code Review

- JavaScript / TypeScript
- Python
- Java
- Go
- Rust
- C / C++
- C#
- PHP
- Ruby
- Swift
- Kotlin
- SQL
- HTML / CSS
- Shell / Bash

## Screenshots

### Dashboard
Features overview with quick access to all AI tools.

### AI Writing Assistant
Create various types of content with customizable tone and length.

### Document Q&A
Upload documents and ask questions based on their content.

### Code Review
Get AI-powered code analysis with quality scores and suggestions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions:

1. Check the documentation in this README
2. Review the code comments in the source files
3. Open an issue on the project repository

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
