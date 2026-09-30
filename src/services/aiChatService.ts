import { ChatMessage } from '../types/recipe';

export interface SendMessageOptions {
  message: string;
  history?: ChatMessage[];
}

export interface SendMessageResponse {
  reply: string;
  error?: string;
}

export async function sendChatMessage({
  message,
  history = [],
}: SendMessageOptions): Promise<SendMessageResponse> {
  try {
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: formattedHistory,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server responded with ${response.status}`);
    }

    return { reply: data.reply };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unable to connect to RecipeLoop AI';
    return {
      reply: `Sorry, I ran into an issue: ${errorMessage}. Please check your connection or server configuration and try again.`,
      error: errorMessage,
    };
  }
}
