const { callMcpTool } = require('./mcpClient');

// Tool definitions passed to Claude. Each one maps 1:1 to a Shopify Storefront
// MCP tool, called via JSON-RPC through mcpClient.callMcpTool.
const TOOLS = [
  {
    name: 'search_shop_catalog',
    description:
      "Search The Organizing Warehouse product catalogue using a natural language query. Use this before recommending, describing, or comparing any specific product, and before adding anything to a customer's cart. Returns matching products with details such as title, price, dimensions, and variants.",
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: "The natural language search query, e.g. 'stackable storage bins for a garage' or 'over-door shoe organiser'.",
        },
        context: {
          type: 'string',
          description: 'Optional extra context about the customer\'s needs to help refine results, e.g. "professional organiser looking for bulk-friendly options".',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_cart',
    description:
      "Retrieve the current contents of the customer's cart, including line items, quantities, and totals.",
    input_schema: {
      type: 'object',
      properties: {
        cart_id: {
          type: 'string',
          description: 'The ID of the cart to retrieve, if known from earlier in the conversation. Omit if no cart has been created yet.',
        },
      },
      required: [],
    },
  },
  {
    name: 'update_cart',
    description:
      "Add, remove, or update line items in the customer's cart. Always search the catalogue first to find the correct product/variant ID before calling this.",
    input_schema: {
      type: 'object',
      properties: {
        cart_id: {
          type: 'string',
          description: 'The ID of the cart to update. Omit to create a new cart.',
        },
        lines: {
          type: 'array',
          description: 'The cart line changes to apply.',
          items: {
            type: 'object',
            properties: {
              variant_id: {
                type: 'string',
                description: 'The product variant ID to add, update, or remove.',
              },
              quantity: {
                type: 'integer',
                description: 'The new quantity for this line. Use 0 to remove the line entirely.',
              },
            },
            required: ['variant_id', 'quantity'],
          },
        },
      },
      required: ['lines'],
    },
  },
  {
    name: 'search_shop_policies_and_faqs',
    description:
      "Search The Organizing Warehouse's shipping, returns, and other store policies and FAQs to answer a customer's question. Use this for any question about delivery times, returns, exchanges, warranties, or the trade pricing programme — never guess at policy details.",
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: "The customer's policy or FAQ question, e.g. 'how long does UK delivery take' or 'what is your returns policy'.",
        },
      },
      required: ['query'],
    },
  },
];

const TOOL_NAMES = new Set(TOOLS.map((t) => t.name));

/**
 * Executes a Claude tool_use request by calling the matching Shopify MCP tool.
 */
async function executeTool(name, input) {
  if (!TOOL_NAMES.has(name)) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return callMcpTool(name, input);
}

module.exports = { TOOLS, executeTool };
