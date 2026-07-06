require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const { SYSTEM_PROMPT } = require('./systemPrompt');
const { TOOLS, executeTool } = require('./tools');

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1024;
const MAX_TOOL_ITERATIONS = 5;

const ALLOWED_ORIGINS = new Set([
  'https://theorganizingwarehouse.co.uk',
  'https://b4txwx-6t.myshopify.com',
]);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const app = express();
app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (no Origin header) and the two configured origins.
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  }),
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/chat', async (req, res) => {
  const { message, conversationHistory } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A "message" string is required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const messages = Array.isArray(conversationHistory)
    ? conversationHistory.map((m) => ({ role: m.role, content: m.content }))
    : [];
  messages.push({ role: 'user', content: message });

  try {
    let iterations = 0;
    let finished = false;

    while (!finished && iterations < MAX_TOOL_ITERATIONS) {
      iterations += 1;

      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        tools: TOOLS,
        messages,
      });

      stream.on('text', (delta) => {
        sendEvent('token', { text: delta });
      });

      const finalMessage = await stream.finalMessage();
      messages.push({ role: 'assistant', content: finalMessage.content });

      if (finalMessage.stop_reason !== 'tool_use') {
        sendEvent('done', { stopReason: finalMessage.stop_reason });
        finished = true;
        break;
      }

      const toolUseBlocks = finalMessage.content.filter((b) => b.type === 'tool_use');
      const toolResults = [];

      for (const block of toolUseBlocks) {
        sendEvent('tool_use', { name: block.name, input: block.input });
        try {
          const result = await executeTool(block.name, block.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result ?? {}),
          });
        } catch (toolError) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: toolError.message || 'Tool call failed.',
            is_error: true,
          });
        }
      }

      messages.push({ role: 'user', content: toolResults });
    }

    if (!finished) {
      sendEvent('done', { stopReason: 'max_tool_iterations' });
    }
  } catch (err) {
    console.error('Chat error:', err);
    sendEvent('error', { message: 'Sorry, something went wrong on our end. Please try again in a moment.' });
  } finally {
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`tow-chat-agent listening on port ${PORT}`);
});
