// src/app/api/reply/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function formatPrompt(currentEntry: string, aspirations: string[], history: string[]) {
  const aspirationsText = aspirations.join(', ');
  const historyText = history.slice(0, 3).join('\n- ');

  // Updated prompt to ask for a JSON object
  return `
    You are Oto, a friendly, wise, and empathetic otter who is a journaling companion.
    Your personality is warm and encouraging. Your goal is to help the user reflect.
    NEVER give medical or financial advice.

    CONTEXT:
    - User's aspirations: ${aspirationsText}
    - Recent entries:
    - ${historyText}

    USER'S NEW ENTRY:
    "${currentEntry}"

    TASK:
    Based on the user's new entry and the context, perform the following two actions:
    1.  Create a short, creative, and evocative title for the journal entry (3-5 words).
    2.  Write a warm, empathetic, and concise reply to the user (2-4 sentences).

    Your final output MUST be a single, valid JSON object with two keys: "title" and "reply".
    For example: { "title": "A Moment of Doubt", "reply": "It sounds like today was really challenging..." }
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { currentEntry, aspirations, history } = await req.json();
    const prompt = formatPrompt(currentEntry, aspirations, history);
    
    // The Cloudflare AI API call is now simpler
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${process.env.CF_AI_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        // We removed 'stream: true'
        body: JSON.stringify({ prompt }),
      }
    );

    const result = await response.json();
    // Assuming the AI follows instructions, its response will be a string containing JSON
    // We need to parse this string to get the actual object
    const aiJson = JSON.parse(result.result.response);

    // We send the parsed JSON object back to our app
    return NextResponse.json(aiJson);

  } catch (error) {
    console.error("Error in AI reply API:", error);
    return new Response('Error generating reply.', { status: 500 });
  }
}