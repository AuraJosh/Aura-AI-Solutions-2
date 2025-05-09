class BusinessChatWidget {
  constructor(config = {}) {
    this.config = {
      apiKey: null,
      apiEndpoint: 'https://your-lambda-api-endpoint.amazonaws.com/prod/chat',
      widgetTitle: 'Business Assistant',
      primaryColor: '#4a90e2',
      position: 'right',
      initialMessage: 'Hello! How can I help you today?',
      placeholder: 'Type your question here...',
      ...config
    };

        // Only log a warning, don’t block initialization
    if (!this.config.apiKey) {
      console.warn('No API key provided. Continuing without authentication.');
    }


    this.messages = [];
    this.isOpen = false;
    this.isLoading = false;

    if (this.config.autoLoad !== false) {
      this.init();
    }
  }

  init() {
    this.createWidgetElements();
    this.addEventListeners();
    if (this.config.initialMessage) {
      this.addMessage('assistant', this.config.initialMessage);
    }
  }

  createWidgetElements() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .widget-chat-header { background-color: ${this.config.primaryColor}; }
      .user-message { background-color: ${this.config.primaryColor}; }
      .widget-send-btn { color: ${this.config.primaryColor}; }
    `;
    document.head.appendChild(styleEl);

    this.widgetContainer = document.createElement('div');
    this.widgetContainer.className = 'business-chat-widget';
    this.widgetContainer.dataset.position = this.config.position;
    document.body.appendChild(this.widgetContainer);

    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'widget-toggle-btn';
    this.toggleButton.innerHTML = `💬`;
    this.widgetContainer.appendChild(this.toggleButton);

    this.chatContainer = document.createElement('div');
    this.chatContainer.className = 'widget-chat-container';
    this.chatContainer.style.display = 'none';
    this.widgetContainer.appendChild(this.chatContainer);

    const chatHeader = document.createElement('div');
    chatHeader.className = 'widget-chat-header';
    chatHeader.innerHTML = `<h3>${this.config.widgetTitle}</h3><button class="widget-close-btn">&times;</button>`;
    this.chatContainer.appendChild(chatHeader);

    this.messagesContainer = document.createElement('div');
    this.messagesContainer.className = 'widget-messages';
    this.chatContainer.appendChild(this.messagesContainer);

    const inputContainer = document.createElement('div');
    inputContainer.className = 'widget-input-container';
    this.chatContainer.appendChild(inputContainer);

    this.chatInput = document.createElement('input');
    this.chatInput.type = 'text';
    this.chatInput.placeholder = this.config.placeholder;
    this.chatInput.className = 'widget-input';
    inputContainer.appendChild(this.chatInput);

    this.sendButton = document.createElement('button');
    this.sendButton.className = 'widget-send-btn';
    this.sendButton.innerHTML = `➤`;
    inputContainer.appendChild(this.sendButton);
  }

  addEventListeners() {
    this.toggleButton.addEventListener('click', () => this.toggleWidget());
    const closeBtn = this.chatContainer.querySelector('.widget-close-btn');
    closeBtn.addEventListener('click', () => this.toggleWidget(false));
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggleWidget(force = null) {
    this.isOpen = force !== null ? force : !this.isOpen;
    this.chatContainer.style.display = this.isOpen ? 'flex' : 'none';
    this.toggleButton.style.display = this.isOpen ? 'none' : 'flex';
    if (this.isOpen) this.chatInput.focus();
  }

  open() {
    this.toggleWidget(true);
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message || this.isLoading) return;

    this.chatInput.value = '';
    this.addMessage('user', message);
    this.isLoading = true;
    this.addLoadingIndicator();

    try {
      const previousMessages = this.messages
        .slice(-10)
        .filter(msg => msg.type !== 'loading')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      previousMessages.pop();

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey
        },
        body: JSON.stringify({ question: message, previousMessages })
      });

      this.removeLoadingIndicator();

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      this.addMessage('assistant', data.response);
    } catch (error) {
      console.error(error);
      this.removeLoadingIndicator();
      this.addMessage('assistant', 'Sorry, something went wrong.');
    } finally {
      this.isLoading = false;
    }
  }

  addMessage(type, content) {
    const message = { type, content, timestamp: new Date() };
    this.messages.push(message);

    const messageEl = document.createElement('div');
    messageEl.className = `widget-message ${type}-message`;
    messageEl.innerHTML = `<div class="message-content">${content}</div>`;
    this.messagesContainer.appendChild(messageEl);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  addLoadingIndicator() {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'widget-message assistant-message loading-message';
    loadingEl.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    this.messagesContainer.appendChild(loadingEl);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  removeLoadingIndicator() {
    const loadingEl = this.messagesContainer.querySelector('.loading-message');
    if (loadingEl) loadingEl.remove();
  }
}

if (typeof window !== 'undefined') {
  window.BusinessChatWidget = BusinessChatWidget;
  window.initBusinessChat = (config) => {
    if (!window.myChatWidget) {
      window.myChatWidget = new BusinessChatWidget(config);
    }
    return window.myChatWidget;
  };
}
