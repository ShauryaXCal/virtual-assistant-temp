export interface AgentMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface AgentResponseChoice {
	message: { role: 'assistant'; content: unknown };
	// Some providers return text directly on the choice
	text?: string;
}

export interface AgentResponse {
	choices: AgentResponseChoice[];
}

const DEFAULT_AGENT_URL = 'https://dev-ray-serve.xcaliberhealth.io/virtual-assistant/v1/chat/completions';

export async function callAgent(
	messages: AgentMessage[],
	options?: { endpoint?: string; signal?: AbortSignal }
): Promise<string> {
	const endpoint = options?.endpoint || DEFAULT_AGENT_URL;
	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ messages }),
		signal: options?.signal
	});

	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(`Agent error ${response.status}: ${text}`);
	}

	const data: AgentResponse | Record<string, unknown> = await response.json();

	// Normalize content across different providers and formats
	const firstChoice: any = (data as any)?.choices?.[0];
	const rawContent: unknown =
		firstChoice?.message?.content ??
		firstChoice?.text ??
		(data as any)?.message?.content ??
		(data as any)?.content;

	const content = normalizeContent(rawContent);
	if (!content || typeof content !== 'string' || content.trim().length === 0) {
		throw new Error('Agent returned no content');
	}
	return content;
}

function normalizeContent(input: unknown): string {
	// If it's already a string, return as-is to preserve Markdown formatting
	if (typeof input === 'string') return input;

	// OpenAI-style content parts array or mixed arrays
	if (Array.isArray(input)) {
		return input
			.map((part) => {
				if (typeof part === 'string') return part;
				if (part && typeof part === 'object') {
					const anyPart = part as any;
					// Common cases: { type: 'text', text: '...' } or { text: '...' }
					if (typeof anyPart.text === 'string') return anyPart.text;
					if (anyPart.type === 'text' && typeof anyPart.text === 'string') return anyPart.text;
				}
				return '';
			})
			.join('');
	}

	// Unknown shape
	return '';
}
