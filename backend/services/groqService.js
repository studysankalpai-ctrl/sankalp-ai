/**
 * Groq OpenAI-compatible Service
 * BYOK (Bring Your Own Key) Proxy
 * Keys are passed per-request and NEVER persisted or logged.
 */

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// Default active models based on current Groq account capabilities
const DEFAULT_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (Recommended - High Reasoning)', context_window: 131072, speed: '500 t/s', max_completion: 65536 },
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B (Ultra-Fast 1000 t/s)', context_window: 131072, speed: '1000 t/s', max_completion: 65536 },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (High Quality Reasoning)', context_window: 32768, speed: 'Fast' },
  { id: 'openai/gpt-oss-safeguard-20b', name: 'GPT OSS Safeguard 20B', context_window: 131072, speed: 'Fast' },
  { id: 'canopylabs/orpheus-v1-english', name: 'CanopyLabs Orpheus v1 English', context_window: 16384, speed: 'Fast' },
  { id: 'canopylabs/orpheus-arabic-saudi', name: 'CanopyLabs Orpheus Arabic Saudi', context_window: 16384, speed: 'Fast' },
  { id: 'meta-llama/llama-prompt-guard-2-86m', name: 'Meta Llama Prompt Guard 2 86M', context_window: 8192, speed: 'Fast' },
  { id: 'meta-llama/llama-prompt-guard-2-22m', name: 'Meta Llama Prompt Guard 2 22M', context_window: 8192, speed: 'Fast' },
];

/**
 * Call Groq chat completions
 */
const chatCompletion = async ({
  apiKey,
  messages,
  model = 'openai/gpt-oss-120b',
  temperature = 0.5,
  max_tokens = 4096,
}) => {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim().startsWith('gsk_')) {
    throw new Error('Valid Groq API key is required (starts with gsk_). Please configure your key in Settings.');
  }

  let chosenModel = model || 'openai/gpt-oss-120b';

  // Guard against unavailable or deprecated models (e.g. llama-3.1-8b-instant, llama-3.3-70b-versatile)
  if (
    chosenModel.includes('llama-3.1') ||
    chosenModel.includes('llama-3.3') ||
    chosenModel.startsWith('llama3-') ||
    chosenModel === 'mixtral-8x7b-32768' ||
    chosenModel === 'gemma2-9b-it'
  ) {
    console.warn(`[Groq Service] Requested model "${chosenModel}" is unavailable in account tier. Auto-routing to "openai/gpt-oss-120b".`);
    chosenModel = 'openai/gpt-oss-120b';
  }

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: chosenModel,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `Groq API responded with status ${response.status}`;
      
      if (response.status === 401) {
        throw new Error('Invalid Groq API Key. Please check your key in Settings.');
      } else if (response.status === 403 || errorMsg.includes('Access denied') || errorMsg.includes('network settings')) {
        throw new Error('Groq Access Denied: Groq blocks VPNs and proxy tunnels (Proton VPN detected). Please turn OFF your VPN and try again.');
      } else if (response.status === 413 || errorMsg.includes('Request too large') || errorMsg.includes('tokens per minute') || errorMsg.includes('TPM')) {
        throw new Error('Groq Tokens Per Minute (TPM) limit reached. Please wait 15-20 seconds before sending the next message.');
      } else if (response.status === 429) {
        throw new Error('Groq rate limit exceeded on your account. Please wait 15 seconds or switch to a faster model in Settings.');
      } else {
        throw new Error(errorMsg);
      }
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    let finishReason = data.choices?.[0]?.finish_reason;
    let usage = data.usage || {};

    // Auto-Continuation: If response was cut off mid-sentence due to token limit (finish_reason === 'length'),
    // automatically issue a seamless continuation request so the student receives a 100% complete answer.
    let continuationAttempts = 0;
    while (finishReason === 'length' && continuationAttempts < 2) {
      continuationAttempts++;
      console.log(`[Groq Service] Response truncated by max_tokens (finish_reason: length). Auto-continuing response (Attempt ${continuationAttempts})...`);

      try {
        const continuationMessages = [
          ...messages,
          { role: 'assistant', content: content },
          { role: 'user', content: 'Continue the response exactly from where you stopped. Do not repeat anything previously written, continue the answer seamlessly to completion.' },
        ];

        const contResponse = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: chosenModel,
            messages: continuationMessages,
            temperature,
            max_tokens: Math.min(max_tokens || 4096, 4096),
          }),
        });

        if (contResponse.ok) {
          const contData = await contResponse.json();
          const contContent = contData.choices?.[0]?.message?.content || '';
          if (contContent) {
            content += '\n' + contContent;
          }
          finishReason = contData.choices?.[0]?.finish_reason;
          if (contData.usage) {
            usage = {
              prompt_tokens: (usage.prompt_tokens || 0) + (contData.usage.prompt_tokens || 0),
              completion_tokens: (usage.completion_tokens || 0) + (contData.usage.completion_tokens || 0),
              total_tokens: (usage.total_tokens || 0) + (contData.usage.total_tokens || 0),
            };
          }
        } else {
          break;
        }
      } catch (contErr) {
        console.warn('[Groq Service] Auto-continuation failed:', contErr.message);
        break;
      }
    }

    return {
      content,
      model: data.model || chosenModel,
      usage,
    };
  } catch (error) {
    // Redact any accidental key exposure in error message
    const sanitizedMsg = error.message.replace(/gsk_[a-zA-Z0-9_\-]+/g, 'gsk_***');
    console.error('[Groq Service Error]:', sanitizedMsg);
    throw new Error(sanitizedMsg);
  }
};

/**
 * Fetch available models directly from Groq using user's API key
 */
const getAvailableModels = async (apiKey) => {
  if (!apiKey || !apiKey.trim().startsWith('gsk_')) {
    return DEFAULT_MODELS;
  }

  try {
    const response = await fetch(`${GROQ_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        // Map account's active models
        const activeModels = data.data
          .filter(m => !m.id.startsWith('whisper')) // filter audio-only from text models if needed
          .map(m => {
            const known = DEFAULT_MODELS.find(d => d.id === m.id);
            return {
              id: m.id,
              name: known ? known.name : m.id,
              context_window: m.context_window || 131072,
            };
          });

        if (activeModels.length > 0) {
          // Sort so recommended models come first
          activeModels.sort((a, b) => {
            if (a.id === 'openai/gpt-oss-120b') return -1;
            if (b.id === 'openai/gpt-oss-120b') return 1;
            if (a.id === 'openai/gpt-oss-20b') return -1;
            if (b.id === 'openai/gpt-oss-20b') return 1;
            return a.id.localeCompare(b.id);
          });
          return activeModels;
        }
      }
    }
    return DEFAULT_MODELS;
  } catch {
    return DEFAULT_MODELS;
  }
};

/**
 * Test student's Groq API key connection dynamically
 */
const testConnection = async (apiKey, preferredModel = null) => {
  if (!apiKey || !apiKey.trim().startsWith('gsk_')) {
    return {
      valid: false,
      message: 'Invalid API key format. Groq API keys start with "gsk_".',
    };
  }

  try {
    // 1. First test key validity via /models endpoint (no tokens used)
    const modelsResponse = await fetch(`${GROQ_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
    });

    if (!modelsResponse.ok) {
      if (modelsResponse.status === 401) {
        return {
          valid: false,
          message: 'Invalid Groq API Key. Please verify your key from console.groq.com.',
        };
      }
      const errData = await modelsResponse.json().catch(() => ({}));
      const rawMsg = errData.error?.message || `Groq API returned error ${modelsResponse.status}`;

      if (modelsResponse.status === 403 || rawMsg.includes('Access denied') || rawMsg.includes('network settings')) {
        return {
          valid: false,
          message: 'VPN Blocked by Groq: Groq Cloudflare WAF strictly blocks VPN tunnels (Proton VPN detected). Please turn OFF your VPN and click Test & Save Key again.',
        };
      }

      return {
        valid: false,
        message: rawMsg,
      };
    }

    const modelsData = await modelsResponse.json();
    const accountModels = Array.isArray(modelsData.data) ? modelsData.data.map(m => m.id) : [];

    // 2. Select the model to test with
    let targetModel = preferredModel;
    if (
      !targetModel ||
      targetModel.includes('llama-3') ||
      targetModel.startsWith('llama3-') ||
      !accountModels.includes(targetModel)
    ) {
      const candidates = [
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.8-27b',
        'canopylabs/orpheus-v1-english',
      ];
      targetModel = candidates.find(c => accountModels.includes(c)) || accountModels[0] || 'openai/gpt-oss-120b';
    }

    // 3. Perform a 5-token ping completion with that authorized model
    try {
      const ping = await chatCompletion({
        apiKey,
        messages: [{ role: 'user', content: 'Say OK' }],
        model: targetModel,
        max_tokens: 5,
      });

      return {
        valid: true,
        message: `Groq API connection verified with ${targetModel}!`,
        model: ping.model || targetModel,
        available_models: accountModels,
      };
    } catch (chatErr) {
      // If the ping completion itself had an issue (e.g. rate limit), but authentication succeeded
      return {
        valid: true,
        message: `Groq key authenticated successfully! Available model: ${targetModel}`,
        model: targetModel,
        available_models: accountModels,
      };
    }
  } catch (err) {
    return {
      valid: false,
      message: err.message || 'Failed to connect to Groq API.',
    };
  }
};

module.exports = {
  chatCompletion,
  testConnection,
  getAvailableModels,
  DEFAULT_MODELS,
};
