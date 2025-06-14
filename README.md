# Financial Questionnaire Bot

A Hebrew-language conversational AI bot for financial questionnaires, built with Next.js, TypeScript, and OpenAI.

## Features

- WhatsApp-style chat interface
- 10 financial questions with multiple choice and text input options
- Progress tracking
- Personalized financial profile generation using OpenAI
- Email collection for follow-up
- Mobile-first, responsive design
- All text in Hebrew

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
financial-bot/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── ui/
│   │       └── button.tsx
│   ├── lib/
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── services/
│       ├── openai.ts
│       └── sheets.ts
└── public/
    └── locales/
        └── he.json
```

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Radix UI
- OpenAI API
- React Query
- Zustand

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
