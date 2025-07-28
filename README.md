# ZDChat

A Tampermonkey userscript that integrates Shopify's AI chat with Zendesk tickets for developer support.

## Features

- **Quick Access**: Press `Option+C` or `¸` to copy ticket information and open Shopify Chat
- **Smart Ticket Detection**: Automatically extracts ticket numbers and user emails from Zendesk
- **Structured Prompts**: Creates comprehensive prompts with ticket context for AI assistance
- **Chat Integration**: Embeds Shopify Chat iframe with pre-filled context
- **Toggle Control**: Hide/show chat window with a floating button

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Create a new script in Tampermonkey
3. Copy and paste the contents of `zdchat.user.js`
4. Save the script

## Usage

1. Navigate to a Zendesk ticket page
2. Press `Option+C` (or `¸` on some keyboards)
3. The script will:
   - Copy ticket information to clipboard
   - Open Shopify Chat with pre-filled context
   - Display a toggle button to hide/show the chat

## Prompt Structure

The script generates structured prompts including:
- Main issue summary
- Internal links and shop URLs
- Merchant description of the issue
- Relevant product names and screenshots
- Additional context
- Solution guidance

## Requirements

- Tampermonkey browser extension
- Access to Zendesk tickets
- Access to Shopify Chat

## License

MIT License 