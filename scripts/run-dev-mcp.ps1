Param(
  [Parameter(ValueFromRemainingArguments=$true)]
  $args
)

npx -y @shopify/dev-mcp@latest $args
