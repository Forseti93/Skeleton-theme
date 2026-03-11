Shopify Dev MCP — setup for this workspace

Prerequisites

- Node.js 18+

Quick start (Windows)

1. From your theme root, run:

```powershell
npx -y @shopify/dev-mcp@latest
```

2. In VSCode, add the MCP server to your MCP configuration (Command Palette → MCP: Open User Configuration) or place a workspace example at `.vscode/mcp.json`.

Workspace example (`.vscode/mcp.json`):

```json
{
  "servers": {
    "shopify-dev-mcp": {
      "command": "npx",
      "args": ["-y", "@shopify/dev-mcp@latest"]
    }
  }
}
```

Windows alternative (if simple `npx` fails):

```json
{
  "servers": {
    "shopify-dev-mcp": {
      "command": "cmd",
      "args": ["/k", "npx", "-y", "@shopify/dev-mcp@latest"]
    }
  }
}
```

Disable instrumentation or change validation mode

- To opt out of instrumentation, set `OPT_OUT_INSTRUMENTATION=true` in the `env` block of your MCP config.
- To control theme validation, set `LIQUID_VALIDATION_MODE` to `full` (default) or `partial`.

Notes and next steps

- After the MCP server is running and connected to your assistant, call the `learn_shopify_api` tool once so the assistant loads Shopify API context for Liquid/themes.
- If you'd like, I can also:
  - add the `.vscode/mcp.json` to this repo (done)
  - add small run scripts for Windows (done)
  - start the MCP here (I can't run it in your environment without permission)

Examples

- Start via command line (PowerShell or CMD):

```powershell
npx -y @shopify/dev-mcp@latest
```

- Run the provided Windows script:

```powershell
.\scripts\run-dev-mcp.ps1
```
