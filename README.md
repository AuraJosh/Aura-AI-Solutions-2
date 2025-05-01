# Business FAQ Chatbot Widget

A lightweight, embeddable chat widget for business websites that connects to the Lambda backend API.

## Installation

### Option 1: Direct Script Include

Add the following code to your HTML page:

```html
<!-- Add the CSS -->
<link rel="stylesheet" href="path/to/widget.css">

<!-- Add the widget script -->
<script src="path/to/widget.js"></script>

<!-- Initialize the widget -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const chatWidget = new BusinessChatWidget({
      apiKey: 'your-api-key-here',
      apiEndpoint: 'https://your-lambda-api-endpoint.amazonaws.com/prod/chat',
      widgetTitle: 'Business Assistant',
      primaryColor: '#4a90e2'
    });
  });
</script>
```

### Option 2: NPM Installation

```bash
npm install business-faq-chatbot-widget
```

Then import and use in your JavaScript:

```javascript
import BusinessChatWidget from 'business-faq-chatbot-widget';
import 'business-faq-chatbot-widget/widget.css';

const chatWidget = new BusinessChatWidget({
  apiKey: 'your-api-key-here',
  apiEndpoint: 'https://your-lambda-api-endpoint.amazonaws.com/prod/chat'
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiKey | String | null | **Required**. Your API key for authentication |
| apiEndpoint | String | 'https://your-lambda-api-endpoint.amazonaws.com/prod/chat' | The endpoint URL for the Lambda backend |
| widgetTitle | String | 'Business Assistant' | The title displayed in the widget header |
| primaryColor | String | '#4a90e2' | The primary color for the widget theme |
| position | String | 'right' | Position of the widget ('right' or 'left') |
| initialMessage | String | 'Hello! How can I help you today?' | Initial message displayed in the chat |
| placeholder | String | 'Type your question here...' | Placeholder text for the input field |

## Methods

- `open()` - Opens the chat widget
- `close()` - Closes the chat widget
- `toggle()` - Toggles the widget open/closed state
- `addMessage(role, content)` - Adds a message to the chat

## Example

See `sample.html` for a complete implementation example.