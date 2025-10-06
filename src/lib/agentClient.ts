export interface AgentMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface AgentResponseChoice {
	message: { role: 'assistant'; content: string };
}

export interface AgentResponse {
	choices: AgentResponseChoice[];
}

const DEFAULT_AGENT_URL = 'http://127.0.0.1:8000/virtual-assistant/v1/chat/completions';

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

	const data: AgentResponse = await response.json();
	const content = data?.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error('Agent returned no content');
	}
	return content;
}
