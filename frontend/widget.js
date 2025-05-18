/**
 * Business FAQ Chatbot Widget
 * A lightweight, embeddable chat widget for business websites
 */

class BusinessChatWidget {
  constructor(config = {}) {
    // Default configuration
    this.config = {
      apiEndpoint: 'https://api.versatileai.solutions/chat',
      widgetTitle: 'Aura AI Assistant',  // EDIT HERE: Change the header title
      primaryColor: '#4a90e2',
      position: 'right', // 'right' or 'left'
      initialMessage: "Hello! I'm Aura's AI assistant. How can I help you today?",  // EDIT HERE: Change the initial greeting message
      placeholder: 'Type your question here...',
      maxContextMessages: 5,
      ...config
    };

    // Widget state
    this.messages = [];
    this.isOpen = false;
    this.isLoading = false;

    // Initialize the widget
    this.init();
  }

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
    this.toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
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
    
    // Footer container removed
    
    // Create disclaimer container
    const disclaimerContainer = document.createElement('div');
    disclaimerContainer.className = 'widget-disclaimer';
    disclaimerContainer.innerHTML = `
      <div class="footer-content">
        <img class="footer-logo" src="frontend/media/logo-no-bg.png" alt="Aura Logo" style="cursor:pointer; margin-right: 10px; height: 36px; max-height: 36px; width: auto; float: left; display: inline-block;" />
        <div class="footer-text">
          <p style="color: #fff; text-align: left; margin: 4px 0 0 0; font-size: 12px; line-height: 1.05;">By chatting, you agree to this <a href=\"#\" class=\"disclaimer-link\" style=\"color: #fff; text-decoration: underline;\">disclaimer</a>.</p>
          <p class="powered-by" style="text-align: left; margin: 2px 0 0 0; font-size: 13px; line-height: 1.05; color: #fff;">Powered by <span class="aura-brand" style="cursor:pointer; color: #fff; background: none; -webkit-background-clip: initial; -webkit-text-fill-color: initial;">Aura</span></p>
        </div>
      </div>
    `;
    this.chatContainer.appendChild(disclaimerContainer);
    
    // Add event listener for disclaimer link
    const disclaimerLink = disclaimerContainer.querySelector('.disclaimer-link');
    disclaimerLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('DISCLAIMER: All responses are generated by AI. We are not liable for any inaccuracies or misinterpretations in the responses provided. This chatbot is for informational purposes only and does not constitute professional advice.');
    });

    // Add sparkle animation on logo click
    setTimeout(() => {
      const logo = disclaimerContainer.querySelector('.footer-logo');
      const aura = disclaimerContainer.querySelector('.aura-brand');
      if (logo) {
        logo.addEventListener('click', () => {
          window.open('https://auraai.uk/', '_blank');
        });
      }
      if (aura) {
        aura.addEventListener('click', () => {
          window.open('https://auraai.uk/', '_blank');
        });
      }
    }, 0);
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
   * Send user message to API
   */
  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message || this.isLoading) return;
    
    // No API key check for HTTP API
    
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
        .slice(-this.config.maxContextMessages)
        .filter(msg => msg.type !== 'loading')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Remove the message we just added (it will be sent as the question)
      previousMessages.pop();
      
      // Call API
      const headers = {
        'Content-Type': 'application/json'
      };
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userMessage: message,
          messageHistory: previousMessages
        })
      });
      
      // Remove loading indicator
      this.removeLoadingIndicator();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      this.addMessage('assistant', data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      this.removeLoadingIndicator();
      this.addMessage('assistant', error.message || 'Sorry, I encountered an error. Please try again later.');
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
        background: linear-gradient(90deg,
          #060d1f 0%,
          #3a4a7a 25%,
          #060d1f 50%,
          #3a4a7a 75%,
          #060d1f 100%
        );
        background-size: 200% 100%;
        animation: wave-bg-horizontal 16s linear infinite;
        border: none;
        margin-left: 10px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        transition: transform 0.1s;
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
        background: linear-gradient(90deg,
          #060d1f 0%,
          #3a4a7a 25%,
          #060d1f 50%,
          #3a4a7a 75%,
          #060d1f 100%
        );
        background-size: 200% 100%;
        animation: wave-bg-horizontal 16s linear infinite;
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
        padding-bottom: 10px;
        margin-bottom: 0;
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
        background: #060d1f;
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
        background: none;
        border: none;
        margin-left: 10px;
        color: #060d1f;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        transition: background 0.2s, color 0.2s, transform 0.1s;
      }
      .widget-send-btn:hover {
        transform: scale(1.18);
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
      
      /* Footer styles removed */
      
      .widget-disclaimer {
        padding: 0 15px;
        border-top: 1px solid #eee;
        font-size: 15px;
        color: #fff;
        text-align: left;
        background: linear-gradient(90deg,
          #060d1f 0%,
          #3a4a7a 25%,
          #060d1f 50%,
          #3a4a7a 75%,
          #060d1f 100%
        );
        background-size: 200% 100%;
        animation: wave-bg-horizontal 16s linear infinite;
        display: flex;
        align-items: stretch;
        justify-content: space-between;
        min-height: 60px;
        height: 60px;
        box-sizing: border-box;
      }
      .footer-content {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: flex-start;
        height: 100%;
      }
      .footer-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 10px;
      }
      .footer-logo {
        height: 36px;
        max-height: 36px;
        width: auto;
        align-self: center;
        margin-left: 0;
        margin-right: 10px;
        display: inline-block;
      }
      .powered-by {
        font-size: 13px;
        color: #fff;
        text-align: left;
        margin: 0;
        padding: 0;
        line-height: 1.05;
      }
      .aura-brand {
        font-weight: bold;
        color: #fff !important;
        background: none !important;
        -webkit-background-clip: initial !important;
        -webkit-text-fill-color: initial !important;
        text-shadow: none;
        letter-spacing: 1px;
      }
      .shiny-gold {
        background: linear-gradient(90deg, #ffe066 0%, #ffe066 20%, #fffbe6 40%, #ffe066 60%, #fffbe6 80%, #ffe066 100%);
        background-size: 200% auto;
        color: #fff;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shine-gold 2s linear infinite;
        text-shadow: 0 1px 2px #bfae4e;
      }
      @keyframes shine-gold {
        0% {
          background-position: 200% center;
        }
        100% {
          background-position: 0% center;
        }
      }
      
      @keyframes loading {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      
      @keyframes wave-bg-horizontal {
        0% {
          background-position: 0% 50%;
        }
        100% {
          background-position: 200% 50%;
        }
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
