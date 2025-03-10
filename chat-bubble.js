/**
 * Website Chat Bubble Widget
 * 
 * This widget creates an embeddable chat bubble that sends messages to a webhook
 * and displays responses. It generates and maintains a session ID across interactions.
 */

class ChatBubbleWidget {
    constructor(options = {}) {
        // Configuration options with defaults
        this.options = {
            webhookUrl: 'https://n8napp.tapblink.shop/webhook/72398806-8e59-4727-ba46-826d411920ab_website_chat',
            position: 'right', // 'right' or 'left'
            bubbleColor: '#4a86e8',
            textColor: '#ffffff',
            ...options
        };
        
        // Generate or retrieve session ID
        this.sessionId = this.getSessionId();
        
        // Initialize the widget
        this.init();
    }
    
    /**
     * Generate a unique session ID or retrieve existing one from localStorage
     */
    getSessionId() {
        const storedSessionId = localStorage.getItem('chat_bubble_session_id');
        if (storedSessionId) {
            return storedSessionId;
        }
        
        // Generate new session ID (timestamp + random string)
        const newSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        localStorage.setItem('chat_bubble_session_id', newSessionId);
        return newSessionId;
    }
    
    /**
     * Initialize the widget by creating necessary DOM elements
     */
    init() {
        // Create the widget container
        this.container = document.createElement('div');
        this.container.className = 'chat-bubble-widget';
        this.container.style.position = 'fixed';
        this.container.style.bottom = '20px';
        this.container.style[this.options.position] = '20px';
        this.container.style.zIndex = '9999';
        
        // Create the chat bubble button
        this.bubbleButton = document.createElement('div');
        this.bubbleButton.className = 'chat-bubble-button';
        this.bubbleButton.style.width = '60px';
        this.bubbleButton.style.height = '60px';
        this.bubbleButton.style.borderRadius = '50%';
        this.bubbleButton.style.backgroundColor = this.options.bubbleColor;
        this.bubbleButton.style.cursor = 'pointer';
        this.bubbleButton.style.display = 'flex';
        this.bubbleButton.style.justifyContent = 'center';
        this.bubbleButton.style.alignItems = 'center';
        this.bubbleButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        
        // Add chat icon to button
        this.bubbleButton.innerHTML = `
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" 
                      fill="${this.options.textColor}"/>
            </svg>
        `;
        
        // Create the chat window (initially hidden)
        this.chatWindow = document.createElement('div');
        this.chatWindow.className = 'chat-window';
        this.chatWindow.style.position = 'absolute';
        this.chatWindow.style.bottom = '70px';
        this.chatWindow.style[this.options.position] = '0';
        this.chatWindow.style.width = '300px';
        this.chatWindow.style.height = '400px';
        this.chatWindow.style.backgroundColor = '#ffffff';
        this.chatWindow.style.borderRadius = '10px';
        this.chatWindow.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        this.chatWindow.style.display = 'none';
        this.chatWindow.style.flexDirection = 'column';
        this.chatWindow.style.overflow = 'hidden';
        
        // Create chat header
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header';
        chatHeader.style.padding = '10px';
        chatHeader.style.backgroundColor = this.options.bubbleColor;
        chatHeader.style.color = this.options.textColor;
        chatHeader.style.display = 'flex';
        chatHeader.style.justifyContent = 'space-between';
        chatHeader.style.alignItems = 'center';
        
        const headerTitle = document.createElement('div');
        headerTitle.textContent = 'Chat Support';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'chat-close-button';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = this.options.textColor;
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '16px';
        closeButton.innerHTML = '&times;';
        
        chatHeader.appendChild(headerTitle);
        chatHeader.appendChild(closeButton);
        
        // Create chat messages container
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'chat-messages';
        this.messagesContainer.style.flex = '1';
        this.messagesContainer.style.padding = '10px';
        this.messagesContainer.style.overflowY = 'auto';
        
        // Create chat input area
        const inputArea = document.createElement('div');
        inputArea.className = 'chat-input-area';
        inputArea.style.padding = '10px';
        inputArea.style.borderTop = '1px solid #e0e0e0';
        inputArea.style.display = 'flex';
        
        this.messageInput = document.createElement('input');
        this.messageInput.className = 'chat-input';
        this.messageInput.type = 'text';
        this.messageInput.placeholder = 'Type your message...';
        this.messageInput.style.flex = '1';
        this.messageInput.style.padding = '8px';
        this.messageInput.style.border = '1px solid #e0e0e0';
        this.messageInput.style.borderRadius = '4px';
        this.messageInput.style.marginRight = '8px';
        
        const sendButton = document.createElement('button');
        sendButton.className = 'chat-send-button';
        sendButton.textContent = 'Send';
        sendButton.style.padding = '8px 16px';
        sendButton.style.backgroundColor = this.options.bubbleColor;
        sendButton.style.color = this.options.textColor;
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '4px';
        sendButton.style.cursor = 'pointer';
        
        inputArea.appendChild(this.messageInput);
        inputArea.appendChild(sendButton);
        
        // Assemble the chat window
        this.chatWindow.appendChild(chatHeader);
        this.chatWindow.appendChild(this.messagesContainer);
        this.chatWindow.appendChild(inputArea);
        
        // Add elements to the container
        this.container.appendChild(this.chatWindow);
        this.container.appendChild(this.bubbleButton);
        
        // Add the container to the document
        document.body.appendChild(this.container);
        
        // Add event listeners
        this.bubbleButton.addEventListener('click', () => this.toggleChat());
        closeButton.addEventListener('click', () => this.toggleChat());
        sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Add welcome message
        this.addMessage('Hello! How can I help you today?', 'bot');
    }
    
    /**
     * Toggle the chat window visibility
     */
    toggleChat() {
        if (this.chatWindow.style.display === 'none') {
            this.chatWindow.style.display = 'flex';
        } else {
            this.chatWindow.style.display = 'none';
        }
    }
    
    /**
     * Add a message to the chat window
     * @param {string} text - Message text
     * @param {string} sender - 'user' or 'bot'
     */
    addMessage(text, sender) {
        // Remove any loading indicators first when adding a bot message
        if (sender === 'bot') {
            this.removeLoadingIndicators();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}-message`;
        messageElement.style.marginBottom = '10px';
        messageElement.style.padding = '8px 12px';
        messageElement.style.borderRadius = '4px';
        messageElement.style.maxWidth = '80%';
        messageElement.style.wordBreak = 'break-word';
        
        if (sender === 'user') {
            messageElement.style.backgroundColor = '#e6f2ff';
            messageElement.style.marginLeft = 'auto';
        } else {
            messageElement.style.backgroundColor = '#f0f0f0';
            messageElement.style.marginRight = 'auto';
        }
        
        messageElement.textContent = text;
        this.messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    /**
     * Helper method to remove all loading indicators from the chat
     */
    removeLoadingIndicators() {
        const loadingElements = this.messagesContainer.querySelectorAll('.chat-loading');
        loadingElements.forEach(el => el.remove());
    }
    
    /**
     * Send user message to webhook and process response
     */
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Clear input
        this.messageInput.value = '';
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Remove any existing loading indicators first
        this.removeLoadingIndicators();
        
        // Show loading indicator after the last message
        const loadingElement = document.createElement('div');
        loadingElement.className = 'chat-loading';
        loadingElement.style.display = 'flex';
        loadingElement.style.margin = '10px 0';
        loadingElement.style.alignItems = 'center';
        loadingElement.innerHTML = '<div style="width: 12px; height: 12px; background-color: #ccc; border-radius: 50%; margin-right: 5px; animation: pulse 1.5s infinite"></div><div style="width: 12px; height: 12px; background-color: #ccc; border-radius: 50%; margin-right: 5px; animation: pulse 1.5s infinite 0.3s"></div><div style="width: 12px; height: 12px; background-color: #ccc; border-radius: 50%; animation: pulse 1.5s infinite 0.6s"></div>';
        this.messagesContainer.appendChild(loadingElement);
        
        // Prepare request payload
        const payload = {
            message: message,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            pageUrl: window.location.href
        };
        
        console.log('Sending message to webhook:', {
            url: this.options.webhookUrl,
            payload: payload
        });
        
        try {
            // Send message to webhook
            const response = await fetch(this.options.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            // Remove any loading indicators
            this.removeLoadingIndicators();
            
            console.log('Webhook response status:', response.status);
            console.log('Webhook response headers:', [...response.headers.entries()]);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText.substring(0, 100)}`);
            }
            
            // Try to parse the response as JSON
            let data;
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            // Update debug panel if it exists
            const statusEl = document.getElementById('request-status');
            if (statusEl) {
                statusEl.textContent = `Success: ${response.status}, Response received`;
                statusEl.style.color = 'green';
            }
            
            try {
                data = JSON.parse(responseText);
                console.log('Parsed response data:', data);
                
                // Display the entire response in console for debugging
                console.table(data);
                
                // Display response from webhook
                if (data && data.response) {
                    // Found expected response field
                    this.addMessage(data.response, 'bot');
                } else if (data && typeof data === 'object') {
                    // Try to find any usable text in the response
                    const possibleResponseFields = ['message', 'text', 'content', 'reply', 'answer', 'result'];
                    let foundResponse = false;
                    
                    for (const field of possibleResponseFields) {
                        if (data[field] && typeof data[field] === 'string') {
                            console.log(`Found alternative response field: ${field}`);
                            this.addMessage(data[field], 'bot');
                            foundResponse = true;
                            break;
                        }
                    }
                    
                    if (!foundResponse) {
                        // If no usable field found, display the whole response
                        console.warn('Response missing expected "response" field:', data);
                        const responseStr = JSON.stringify(data, null, 2);
                        this.addMessage(`Received response: ${responseStr.substring(0, 150)}${responseStr.length > 150 ? '...' : ''}`, 'bot');
                    }
                } else {
                    // Fallback message
                    console.warn('Unexpected response format:', data);
                    this.addMessage('I received your message. Thank you!', 'bot');
                }
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                // Display the raw response if it's not too long
                if (responseText.length < 200) {
                    this.addMessage(`Received non-JSON response: ${responseText}`, 'bot');
                } else {
                    this.addMessage(`Received non-JSON response: ${responseText.substring(0, 150)}...`, 'bot');
                }
            }
        } catch (error) {
            // Remove any loading indicators
            this.removeLoadingIndicators();
            
            console.error('Error sending message:', error);
            
            // Update debug panel if it exists
            const statusEl = document.getElementById('request-status');
            if (statusEl) {
                statusEl.textContent = `Error: ${error.message}`;
                statusEl.style.color = 'red';
            }
            
            this.addMessage(`Sorry, there was an error sending your message: ${error.message}. Please check the console for more details.`, 'bot');
        }
    }
}

// Add CSS animation for loading indicator
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 0.3; }
        50% { opacity: 1; }
        100% { opacity: 0.3; }
    }
`;
document.head.appendChild(style);

// Export the widget for use
if (typeof window !== 'undefined') {
    window.ChatBubbleWidget = ChatBubbleWidget;
}
