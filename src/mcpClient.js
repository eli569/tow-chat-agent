const MCP_ENDPOINT = process.env.SHOPIFY_MCP_ENDPOINT || 'https://b4txwx-6t.myshopify.com/api/mcp';

let requestId = 0;

/**
 * Calls a tool on the Shopify Storefront MCP endpoint via JSON-RPC 2.0.
 */
async function callMcpTool(toolName, args) {
  requestId += 1;

  const body = {
    jsonrpc: '2.0',
    id: requestId,
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args || {},
    },
  };

  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`MCP endpoint responded with ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  if (payload.error) {
    throw new Error(payload.error.message || 'MCP tool call returned an error');
  }

  return payload.result;
}

module.exports = { callMcpTool };
