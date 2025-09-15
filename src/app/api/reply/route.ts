// src/app/api/reply/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function formatPrompt(currentEntry: string, aspirations: string[], history: string[]) {
  const aspirationsText = aspirations.join(', ');
  const historyText = history.slice(0, 3).join('\n- ');

  return `
    You are Oto, a friendly, wise, and empathetic otter who is a journaling companion.
    Your personality is warm, encouraging, and a little playful.
    Your goal is to help the user reflect, feel validated, and find a positive next step.
    NEVER give medical or financial advice. Keep your replies concise, around 2-4 sentences.

    Here is some context about the user:
    - Their long-term aspirations are: ${aspirationsText}
    - Their most recent journal entries are:
    - ${historyText}

    Now, the user has just written this new journal entry:
    "${currentEntry}"

    Based on all this, write a warm, empathetic, and encouraging reply as Oto.
    Acknowledge their feelings, connect to their aspirations or past entries if relevant, and suggest a small, positive action.
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { currentEntry, aspirations, history } = await req.json();
    const prompt = formatPrompt(currentEntry, aspirations, history);
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${process.env.CF_AI_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          stream: true,
        }),
      }
    );
    
    // Simply pipe the raw response from Cloudflare directly to our client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream', // Set the correct content type for SSE
      },
    });

  } catch (error) {
    console.error(error);
    return new Response('Error generating reply.', { status: 500 });
  }
}