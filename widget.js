/**
 * Business FAQ Chatbot Widget
 * A lightweight, embeddable chat widget for business websites
 */

class BusinessChatWidget {
  constructor(config = {}) {
    // Default configuration
    this.config = {
      apiKey: null,
      apiEndpoint: 'https://your-lambda-api-endpoint.amazonaws.com/prod/chat',
      widgetTitle: 'Business Assistant',
      primaryColor: '#4a90e2',
      position: 'right', // 'right' or 'left'
      initialMessage: 'Hello! How can I help you today?',
      placeholder: 'Type your question here...',
      ...config
    };

    // Validate required config
    if (!this.config.apiKey) {
      console.error('API key is required for the Business Chat Widget');
      return;
    }

    // Widget state
    this.messages = [];
    this.isOpen = false;
    this.isLoading = false;

    // Initialize only if autoLoad is not explicitly false
    if (this.config.autoLoad !== false) {
      this.init();
    }
  } // ← THIS CLOSING BRACE WAS MISSING


  /**
   * Initialize the widget
   */
  init() {
    // Create widget elements
    this.createWidgetElements();
    
    // Add event listeners
    this.addEventListeners();
    
    // Add initial message
    if (this.config.initialMessage) {
      this.addMessage('assistant', this.config.initialMessage);
    }
  }

  /**
   * Create widget DOM elements
   */
  createWidgetElements() {
    // Create styles
    const styleEl = document.createElement('style');
    styleEl.innerHTML = this.getStyles();
    document.head.appendChild(styleEl);

    // Create widget container
    this.widgetContainer = document.createElement('div');
    this.widgetContainer.className = 'business-chat-widget';
    this.widgetContainer.dataset.position = this.config.position;
    document.body.appendChild(this.widgetContainer);

    // Create toggle button
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'widget-toggle-btn';
    this.toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    this.widgetContainer.appendChild(this.toggleButton);

    // Create chat container
    this.chatContainer = document.createElement('div');
    this.chatContainer.className = 'widget-chat-container';
    this.chatContainer.style.display = 'none';
    this.widgetContainer.appendChild(this.chatContainer);

    // Create chat header
    const chatHeader = document.createElement('div');
    chatHeader.className = 'widget-chat-header';
    chatHeader.innerHTML = `
      <h3>${this.config.widgetTitle}</h3>
      <button class="widget-close-btn">&times;</button>
    `;
    this.chatContainer.appendChild(chatHeader);

    // Create chat messages container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.className = 'widget-messages';
    this.chatContainer.appendChild(this.messagesContainer);

    // Create chat input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'widget-input-container';
    this.chatContainer.appendChild(inputContainer);

    // Create chat input
    this.chatInput = document.createElement('input');
    this.chatInput.type = 'text';
    this.chatInput.placeholder = this.config.placeholder;
    this.chatInput.className = 'widget-input';
    inputContainer.appendChild(this.chatInput);

    // Create send button
    this.sendButton = document.createElement('button');
    this.sendButton.className = 'widget-send-btn';
    this.sendButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    inputContainer.appendChild(this.sendButton);
  }

  /**
   * Add event listeners to widget elements
   */
  addEventListeners() {
    // Toggle widget open/close
    this.toggleButton.addEventListener('click', () => this.toggleWidget());
    
    // Close button
    const closeBtn = this.chatContainer.querySelector('.widget-close-btn');
    closeBtn.addEventListener('click', () => this.toggleWidget(false));
    
    // Send message on button click
    this.sendButton.addEventListener('click', () => this.sendMessage());
    
    // Send message on Enter key
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  /**
   * Toggle widget open/close
   * @param {boolean} [force] - Force open or closed state
   */
  toggleWidget(force = null) {
    this.isOpen = force !== null ? force : !this.isOpen;
    this.chatContainer.style.display = this.isOpen ? 'flex' : 'none';
    this.toggleButton.style.display = this.isOpen ? 'none' : 'flex';
    
    if (this.isOpen) {
      this.chatInput.focus();
    }
  }

    /**
   * Programmatically open the widget
   */
  open() {
    this.toggleWidget(true);
  }


  /**
   * Send user message to API
   */
  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message || this.isLoading) return;
    
    // Clear input
    this.chatInput.value = '';
    
    // Add user message to chat
    this.addMessage('user', message);
    
    // Set loading state
    this.isLoading = true;
    this.addLoadingIndicator();
    
    try {
      // Prepare previous messages for context (last 5)
      const previousMessages = this.messages
        .slice(-10) // Get last 10 messages
        .filter(msg => msg.type !== 'loading') // Filter out loading messages
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Remove the message we just added (it will be sent as the question)
      previousMessages.pop();
      
      // Call API
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey
        },
        body: JSON.stringify({
          question: message,
          previousMessages
        })
      });
      
      // Remove loading indicator
      this.removeLoadingIndicator();
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      this.addMessage('assistant', data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      this.removeLoadingIndicator();
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again later.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Add a message to the chat
   * @param {string} type - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addMessage(type, content) {
    // Create message object
    const message = { type, content, timestamp: new Date() };
    this.messages.push(message);
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `widget-message ${type}-message`;
    messageEl.innerHTML = `<div class="message-content">${content}</div>`;
    
    // Add to DOM
    this.messagesContainer.appendChild(messageEl);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Add loading indicator
   */
  addLoadingIndicator() {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'widget-message assistant-message loading-message';
    loadingEl.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    this.messagesContainer.appendChild(loadingEl);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Remove loading indicator
   */
  removeLoadingIndicator() {
    const loadingEl = this.messagesContainer.querySelector('.loading-message');
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  /**
   * Get widget styles
   * @returns {string} CSS styles
   */
  getStyles() {
    return `
      .business-chat-widget {
        position: fixed;
        bottom: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      
      .business-chat-widget[data-position="right"] {
        right: 20px;
      }
      
      .business-chat-widget[data-position="left"] {
        left: 20px;
      }
      
      .widget-toggle-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${this.config.primaryColor};
        color: white;
        border: none;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
      }
      
      .widget-toggle-btn:hover {
        transform: scale(1.05);
      }
      
      .widget-chat-container {
        position: absolute;
        bottom: 0;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .business-chat-widget[data-position="right"] .widget-chat-container {
        right: 0;
      }
      
      .business-chat-widget[data-position="left"] .widget-chat-container {
        left: 0;
      }
      
      .widget-chat-header {
        background-color: ${this.config.primaryColor};
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .widget-chat-header h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .widget-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }
      
      .widget-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      
      .widget-message {
        max-width: 80%;
        margin-bottom: 10px;
        padding: 10px 15px;
        border-radius: 18px;
        line-height: 1.4;
        font-size: 14px;
        word-wrap: break-word;
      }
      
      .user-message {
        align-self: flex-end;
        background-color: ${this.config.primaryColor};
        color: white;
        border-bottom-right-radius: 5px;
      }
      
      .assistant-message {
        align-self: flex-start;
        background-color: #f1f1f1;
        color: #333;
        border-bottom-left-radius: 5px;
      }
      
      .widget-input-container {
        display: flex;
        padding: 10px;
        border-top: 1px solid #eee;
      }
      
      .widget-input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
      }
      
      .widget-send-btn {
        background-color: transparent;
        border: none;
        margin-left: 10px;
        color: ${this.config.primaryColor};
        cursor: pointer;
      }
      
      .loading-dots {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .loading-dots span {
        width: 8px;
        height: 8px;
        margin: 0 2px;
        background-color: #888;
        border-radius: 50%;
        display: inline-block;
        animation: loading 1.4s infinite ease-in-out both;
      }
      
      .loading-dots span:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      .loading-dots span:nth-child(2) {
        animation-delay: -0.16s;
      }
      
      @keyframes loading {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `;
  }
}

// Export the widget
if (typeof window !== 'undefined') {
  window.BusinessChatWidget = BusinessChatWidget;
}

// For module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BusinessChatWidget;
}

// Optional: Global init trigger
if (typeof window !== 'undefined') {
  window.BusinessChatWidget = BusinessChatWidget;
  window.initBusinessChat = (config) => {
    if (!window.myChatWidget) {
      window.myChatWidget = new BusinessChatWidget(config);
    }
    return window.myChatWidget;
  };
}
