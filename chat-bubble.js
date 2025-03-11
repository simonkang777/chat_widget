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
            assistantName: 'Vivian', // Name of the assistant
            assistantTitle: 'Watch Advisor', // Title/role of the assistant
            assistantAvatarUrl: 'https://i.pravatar.cc/150?img=45', // Default avatar URL (woman)
            welcomeMessage: 'Estou a sua disposição!', // Welcome message
            ...options
        };
        
        // Generate or retrieve session ID
        this.sessionId = this.getSessionId();
        
        // Initialize the widget
        this.init();
    }
    
    /**
     * Generate a unique session ID or retrieve existing one from cookies
     * Using cookies instead of localStorage for better persistence
     */
    getSessionId() {
        // Try to get session ID from cookies
        const cookies = document.cookie.split(';');
        let storedSessionId = null;
        
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('chat_bubble_session_id=')) {
                storedSessionId = cookie.substring('chat_bubble_session_id='.length);
                break;
            }
        }
        
        // If found in cookies, return it
        if (storedSessionId) {
            return storedSessionId;
        }
        
        // Check localStorage as fallback (for backward compatibility)
        const localStorageSessionId = localStorage.getItem('chat_bubble_session_id');
        if (localStorageSessionId) {
            // If found in localStorage, also set it as a cookie for future use
            this.setSessionCookie(localStorageSessionId);
            return localStorageSessionId;
        }
        
        // Generate new session ID (timestamp + random string) - same format as before
        const newSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        
        // Store in both cookie and localStorage for backward compatibility
        this.setSessionCookie(newSessionId);
        localStorage.setItem('chat_bubble_session_id', newSessionId);
        
        return newSessionId;
    }
    
    /**
     * Helper method to set the session ID cookie with a long expiration
     * @param {string} sessionId - The session ID to store
     */
    setSessionCookie(sessionId) {
        // Set cookie to expire in 1 year
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        
        // Set the cookie with path=/ to make it available across the site
        document.cookie = `chat_bubble_session_id=${sessionId}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
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
        
        // Fixed positioning for the container
        this.container.style[this.options.position] = '20px';
        
        this.container.style.zIndex = '9999';
        
        // Create the chat bubble button
        this.bubbleButton = document.createElement('div');
        this.bubbleButton.className = 'chat-bubble-button';
        this.bubbleButton.style.width = '65px';
        this.bubbleButton.style.height = '65px';
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
        
        // Basic responsive dimensions for the chat window
        // Use a function to set appropriate width based on screen size
        const setChatWindowSize = () => {
            // For very narrow screens, make the chat window smaller
            // but ensure it's never less than 280px (unless screen is smaller)
            const screenWidth = window.innerWidth;
            if (screenWidth < 350) {
                // On very narrow screens, make it fit with small margins
                const newWidth = Math.max(280, screenWidth - 20);
                this.chatWindow.style.width = `${newWidth}px`;
            } else {
                // Default size for normal screens
                this.chatWindow.style.width = '350px';
            }
            this.chatWindow.style.height = '500px';
        };
        
        // Set initial size
        setChatWindowSize();
        
        // Update on window resize
        window.addEventListener('resize', setChatWindowSize);
        
        this.chatWindow.style.backgroundColor = '#ffffff';
        this.chatWindow.style.borderRadius = '16px';
        this.chatWindow.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        this.chatWindow.style.display = 'none';
        this.chatWindow.style.flexDirection = 'column';
        this.chatWindow.style.overflow = 'hidden';
        this.chatWindow.style.border = '1px solid rgba(0, 0, 0, 0.08)';
        
        // Create chat header
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header';
        chatHeader.style.padding = '15px';
        chatHeader.style.backgroundColor = this.options.bubbleColor;
        chatHeader.style.color = this.options.textColor;
        chatHeader.style.display = 'flex';
        chatHeader.style.justifyContent = 'space-between';
        chatHeader.style.alignItems = 'center';
        
        // Create header with assistant info
        const headerInfo = document.createElement('div');
        headerInfo.style.display = 'flex';
        headerInfo.style.alignItems = 'center';
        
        // Add avatar to header
        const headerAvatar = document.createElement('img');
        headerAvatar.src = this.options.assistantAvatarUrl;
        headerAvatar.alt = this.options.assistantName;
        headerAvatar.style.width = '32px';
        headerAvatar.style.height = '32px';
        headerAvatar.style.borderRadius = '50%';
        headerAvatar.style.marginRight = '10px';
        headerAvatar.style.border = '2px solid white';
        
        // Add assistant info text
        const headerText = document.createElement('div');
        headerText.style.display = 'flex';
        headerText.style.flexDirection = 'column';
        
        const headerTitle = document.createElement('div');
        headerTitle.textContent = `🟢 ONLINE: ${this.options.assistantName}`;
        headerTitle.style.fontWeight = 'bold';
        headerTitle.style.fontSize = '16px';
        
        const headerSubtitle = document.createElement('div');
        headerSubtitle.textContent = 'Nós respondemos em minutos';
        headerSubtitle.style.fontSize = '12px';
        headerSubtitle.style.opacity = '0.9';
        
        headerText.appendChild(headerTitle);
        headerText.appendChild(headerSubtitle);
        
        headerInfo.appendChild(headerAvatar);
        headerInfo.appendChild(headerText);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'chat-close-button';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = this.options.textColor;
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.style.padding = '0';
        closeButton.style.lineHeight = '1';
        closeButton.innerHTML = '&times;';
        
        chatHeader.appendChild(headerInfo);
        chatHeader.appendChild(closeButton);
        
        // Create chat messages container
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'chat-messages';
        this.messagesContainer.style.flex = '1';
        this.messagesContainer.style.padding = '15px';
        this.messagesContainer.style.overflowY = 'auto';
        this.messagesContainer.style.backgroundColor = '#f8f9fa';
        
        // Create chat input area
        const inputArea = document.createElement('div');
        inputArea.className = 'chat-input-area';
        inputArea.style.padding = '15px';
        inputArea.style.borderTop = '1px solid #e0e0e0';
        inputArea.style.display = 'flex';
        inputArea.style.backgroundColor = '#ffffff';
        inputArea.style.position = 'relative';
        
        // Fixed padding for input area
        inputArea.style.padding = '15px';
        
        // Create message input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.style.display = 'flex';
        inputWrapper.style.width = '100%';
        inputWrapper.style.position = 'relative';
        inputWrapper.style.alignItems = 'center';
        inputWrapper.style.border = '1px solid #e0e0e0';
        inputWrapper.style.borderRadius = '24px';
        inputWrapper.style.overflow = 'hidden';
        inputWrapper.style.backgroundColor = '#ffffff';
        
        this.messageInput = document.createElement('input');
        this.messageInput.className = 'chat-input';
        this.messageInput.type = 'text';
        this.messageInput.placeholder = 'Escreva sua mensagem aqui...';
        this.messageInput.style.flex = '1';
        this.messageInput.style.padding = '12px 15px';
        this.messageInput.style.border = 'none';
        this.messageInput.style.outline = 'none';
        this.messageInput.style.fontSize = '16px'; // Increased font size to prevent zoom on mobile
        
        // Prevent zoom on mobile devices when focusing on the input
        // This is done by preventing the default behavior of the focus event
        this.messageInput.addEventListener('focus', function(e) {
            // Add a slight delay to ensure the input is properly focused
            setTimeout(function() {
                // Prevent zoom by setting font size temporarily larger and then back
                document.activeElement.style.fontSize = '16px';
            }, 100);
        });
        
        const sendButton = document.createElement('button');
        sendButton.className = 'chat-send-button';
        sendButton.style.backgroundColor = 'transparent';
        sendButton.style.border = 'none';
        sendButton.style.cursor = 'pointer';
        sendButton.style.padding = '8px 15px 8px 0';
        sendButton.style.display = 'flex';
        sendButton.style.alignItems = 'center';
        sendButton.style.justifyContent = 'center';
        
        // Add send icon (paper airplane)
        sendButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="${this.options.bubbleColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="${this.options.bubbleColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        inputWrapper.appendChild(this.messageInput);
        inputWrapper.appendChild(sendButton);
        inputArea.appendChild(inputWrapper);
        
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
        
        // No mobile-specific behavior
        
        // Add welcome message with assistant avatar
        this.addMessage(this.options.welcomeMessage, 'bot');
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
        
        // Scroll to bottom when opening chat
        if (this.chatWindow.style.display === 'flex') {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 100);
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
        
        const messageContainer = document.createElement('div');
        messageContainer.className = `chat-message-container ${sender}-container`;
        messageContainer.style.display = 'flex';
        messageContainer.style.marginBottom = '16px';
        messageContainer.style.position = 'relative';
        
        // For bot messages, add avatar only if it's not a consecutive bot message
        if (sender === 'bot') {
            // Check if the previous message was also from the bot
            const previousMessageContainer = this.messagesContainer.lastElementChild;
            const isConsecutiveBot = previousMessageContainer && 
                                    previousMessageContainer.classList.contains('bot-container') &&
                                    !previousMessageContainer.classList.contains('chat-loading-container');
            
            // Only add avatar if it's not a consecutive bot message
            if (!isConsecutiveBot) {
                const avatarElement = document.createElement('img');
                avatarElement.src = this.options.assistantAvatarUrl;
                avatarElement.alt = this.options.assistantName;
                avatarElement.style.width = '36px';
                avatarElement.style.height = '36px';
                avatarElement.style.borderRadius = '50%';
                avatarElement.style.marginRight = '10px';
                avatarElement.style.alignSelf = 'flex-start';
                messageContainer.appendChild(avatarElement);
            } else {
                // Add spacing to align with avatar width for consecutive messages
                const spacerElement = document.createElement('div');
                spacerElement.style.width = '46px'; // 36px avatar + 10px margin
                spacerElement.style.flexShrink = '0';
                messageContainer.appendChild(spacerElement);
            }
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}-message`;
        messageElement.style.padding = '12px 16px';
        messageElement.style.borderRadius = '18px';
        messageElement.style.maxWidth = sender === 'user' ? '85%' : '80%';
        messageElement.style.wordBreak = 'break-word';
        messageElement.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        messageElement.style.lineHeight = '1.4';
        messageElement.style.fontSize = '14px';
        
        if (sender === 'user') {
            messageElement.style.backgroundColor = this.options.bubbleColor;
            messageElement.style.color = this.options.textColor;
            messageElement.style.marginLeft = 'auto';
            messageElement.style.borderBottomRightRadius = '4px';
        } else {
            messageElement.style.backgroundColor = '#ffffff';
            messageElement.style.color = '#333333';
            messageElement.style.marginRight = 'auto';
            messageElement.style.borderBottomLeftRadius = '4px';
            messageElement.style.border = '1px solid rgba(0, 0, 0, 0.05)';
        }
        
        messageElement.textContent = text;
        messageContainer.appendChild(messageElement);
        this.messagesContainer.appendChild(messageContainer);
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    /**
     * Helper method to remove all loading indicators from the chat
     */
    removeLoadingIndicators() {
        // Remove the entire loading container instead of just the loading element
        const loadingContainers = this.messagesContainer.querySelectorAll('.chat-loading-container');
        loadingContainers.forEach(container => container.remove());
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
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'chat-message-container bot-container chat-loading-container';
        loadingContainer.style.display = 'flex';
        loadingContainer.style.marginBottom = '16px';
        
        // Check if the previous message was from the bot
        const previousMessageContainer = this.messagesContainer.lastElementChild;
        const isConsecutiveBot = previousMessageContainer && previousMessageContainer.classList.contains('bot-container');
        
        // Only add avatar if it's not a consecutive bot message
        if (!isConsecutiveBot) {
            const avatarElement = document.createElement('img');
            avatarElement.src = this.options.assistantAvatarUrl;
            avatarElement.alt = this.options.assistantName;
            avatarElement.style.width = '36px';
            avatarElement.style.height = '36px';
            avatarElement.style.borderRadius = '50%';
            avatarElement.style.marginRight = '10px';
            avatarElement.style.alignSelf = 'flex-start';
            loadingContainer.appendChild(avatarElement);
        } else {
            // Add spacing to align with avatar width for consecutive messages
            const spacerElement = document.createElement('div');
            spacerElement.style.width = '46px'; // 36px avatar + 10px margin
            spacerElement.style.flexShrink = '0';
            loadingContainer.appendChild(spacerElement);
        }
        
        const loadingElement = document.createElement('div');
        loadingElement.className = 'chat-loading';
        loadingElement.style.display = 'flex';
        loadingElement.style.padding = '12px 16px';
        loadingElement.style.backgroundColor = '#ffffff';
        loadingElement.style.borderRadius = '18px';
        loadingElement.style.borderBottomLeftRadius = '4px';
        loadingElement.style.alignItems = 'center';
        loadingElement.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        loadingElement.style.border = '1px solid rgba(0, 0, 0, 0.05)';
        loadingElement.innerHTML = '<div style="width: 10px; height: 10px; background-color: #ccc; border-radius: 50%; margin-right: 5px; animation: pulse 1.5s infinite"></div><div style="width: 10px; height: 10px; background-color: #ccc; border-radius: 50%; margin-right: 5px; animation: pulse 1.5s infinite 0.3s"></div><div style="width: 10px; height: 10px; background-color: #ccc; border-radius: 50%; animation: pulse 1.5s infinite 0.6s"></div>';
        
        loadingContainer.appendChild(loadingElement);
        this.messagesContainer.appendChild(loadingContainer);
        
        // Prepare request payload
        const payload = {
            message: message,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            pageUrl: window.location.href,
            source: 'website' // Adding fixed source value as requested
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

// Add CSS animation for loading indicator and basic responsive styles
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 0.3; }
        50% { opacity: 1; }
        100% { opacity: 0.3; }
    }
    
    /* Basic responsive adjustments for very narrow screens */
    @media (max-width: 350px) {
        .chat-message {
            font-size: 14px !important;
            padding: 8px 12px !important;
        }
        
        .chat-header {
            padding: 10px !important;
        }
    }
`;
document.head.appendChild(style);

// Export the widget for use
if (typeof window !== 'undefined') {
    window.ChatBubbleWidget = ChatBubbleWidget;
}
