# Financial Questionnaire Bot

A Hebrew-language conversational AI bot for financial questionnaires, built with Next.js, TypeScript, and OpenAI.

## Features

- WhatsApp-style chat interface
- 10 financial questions with multiple choice and text input options
- Progress tracking
- Automated financial profile determination using OpenAI Assistant API
- Personalized transition messages based on determined profile
- Email collection for follow-up
- Mobile-first, responsive design
- All text in Hebrew

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Google Sheets API key (for questions data)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_SHEETS_ID=your_google_sheets_id_here
   GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
   OPENAI_ASSISTANT_ID=your_openai_assistant_id_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **S1 Questions**: User answers initial questions to determine financial profile
2. **Profile Determination**: OpenAI Assistant analyzes s1 answers and determines user's financial profile (תכנן, המהמר, המאוזן, המחושב)
3. **Transition Message**: System displays personalized message with determined profile
4. **S2 Questions**: User continues with investment goal questions
5. **Final Profile**: Complete analysis and email collection

## Deployment

### Deploy to Vercel (Recommended)

This project is optimized for Vercel deployment. Follow these steps:

1. **Push to GitHub**: Make sure your code is pushed to a GitHub repository

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add the following variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `GOOGLE_SHEETS_ID`: Your Google Sheets ID
     - `GOOGLE_SHEETS_API_KEY`: Your Google Sheets API key
     - `OPENAI_ASSISTANT_ID`: Your OpenAI Assistant ID

4. **Deploy**:
   - Vercel will automatically detect Next.js and deploy your app
   - Your app will be available at `https://your-app-name.vercel.app`

### Alternative Deployment Options

- **Netlify**: Supports Next.js but with some limitations for API routes
- **Railway**: Good for full-stack applications
- **DigitalOcean App Platform**: Enterprise-grade deployment

## Project Structure

```
financial-bot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── financial-profile/    # Profile determination endpoint
│   │   │   └── questions/            # Questions loading endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── progress.tsx
│   ├── lib/
│   │   ├── types.ts                  # TypeScript interfaces
│   │   ├── constants.ts              # App constants
│   │   ├── utils.ts                  # Utility functions
│   │   ├── docx-utils.ts             # DOCX processing
│   │   └── google-sheets.ts          # Google Sheets integration
│   ├── services/
│   │   └── openai.ts                 # OpenAI Assistant integration
│   └── data/
│       ├── plans/
│       ├── profiles/
│       └── questions/
└── public/
    └── (various SVG assets)
```

## Technologies Used

- Next.js 15
- TypeScript
- Tailwind CSS
- Radix UI
- OpenAI Assistant API
- Google Sheets API
- React Query (TanStack Query)
- Zustand
- Framer Motion
- React Hook Form
- Zod

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
