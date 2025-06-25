
        class TermuxClient {
            constructor() {
                this.socket = null;
                this.serverUrl = "ws://127.0.0.1:9000";
                this.autoReconnect = true;
                this.reconnectAttempts = 0;
                this.maxReconnectAttempts = 5;
                this.reconnectInterval = 3000; // 3 seconds
                this.reconnectTimer = null;
                this.lastConnectionTime = null;
                
                // DOM elements
                this.terminalOutput = document.getElementById('terminalOutput');
                this.statusIndicator = document.getElementById('statusIndicator');
                this.statusText = document.getElementById('statusText');
                this.serverUrlInput = document.getElementById('serverUrl');
                this.connectBtn = document.getElementById('connectBtn');
                this.disconnectBtn = document.getElementById('disconnectBtn');
                this.commandInput = document.getElementById('commandInput');
                this.sendBtn = document.getElementById('sendBtn');
                this.autoReconnectCheckbox = document.getElementById('autoReconnect');
                this.lastConnectionSpan = document.getElementById('lastConnection');
                this.reconnectAttemptsSpan = document.getElementById('reconnectAttempts');
                
                // Initialize event listeners
                this.initEventListeners();
                
                // Try to connect automatically
                this.connect();
            }
            
            initEventListeners() {
                this.connectBtn.addEventListener('click', () => this.connect());
                this.disconnectBtn.addEventListener('click', () => this.disconnect());
                this.sendBtn.addEventListener('click', () => this.sendCommand());
                this.commandInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendCommand();
                });
                
                this.autoReconnectCheckbox.addEventListener('change', (e) => {
                    this.autoReconnect = e.target.checked;
                });
                
                // Quick command buttons
                document.querySelectorAll('.quick-command').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.commandInput.value = e.target.dataset.command;
                        this.sendCommand();
                    });
                });
            }
            
            log(message, type = 'info') {
                const timestamp = new Date().toLocaleTimeString();
                const messageElement = document.createElement('div');
                
                switch(type) {
                    case 'error':
                        messageElement.className = 'text-red-400';
                        break;
                    case 'success':
                        messageElement.className = 'text-green-400';
                        break;
                    case 'warning':
                        messageElement.className = 'text-yellow-400';
                        break;
                    default:
                        messageElement.className = 'text-gray-300';
                }
                
                messageElement.innerHTML = `[${timestamp}] ${message}`;
                this.terminalOutput.appendChild(messageElement);
                this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
            }
            
            updateStatus(status) {
                this.statusIndicator.className = `inline-block w-3 h-3 rounded-full status-${status}`;
                this.statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            }
            
            connect() {
                try {
                    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
                        this.log('Already connected or connecting', 'warning');
                        return;
                    }
                    
                    this.serverUrl = this.serverUrlInput.value.trim();
                    
                    if (!this.serverUrl) {
                        this.log('Server URL is required', 'error');
                        return;
                    }
                    
                    this.updateStatus('connecting');
                    this.log(`Connecting to ${this.serverUrl}...`);
                    
                    this.socket = new WebSocket(this.serverUrl);
                    
                    this.socket.onopen = () => {
                        this.updateStatus('connected');
                        this.log('Connected to Termux server', 'success');
                        this.lastConnectionTime = new Date();
                        this.lastConnectionSpan.textContent = this.lastConnectionTime.toLocaleTimeString();
                        this.reconnectAttempts = 0;
                        this.reconnectAttemptsSpan.textContent = this.reconnectAttempts;
                        
                        if (this.reconnectTimer) {
                            clearTimeout(this.reconnectTimer);
                            this.reconnectTimer = null;
                        }
                    };
                    
                    this.socket.onmessage = (msg) => {
                        this.log(`Server: ${msg.data}`, 'info');
                    };
                    
                    this.socket.onclose = () => {
                        this.updateStatus('disconnected');
                        this.log('Disconnected from server', 'warning');
                        this.socket = null;
                        
                        if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                            this.reconnectAttempts++;
                            this.reconnectAttemptsSpan.textContent = this.reconnectAttempts;
                            this.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                            this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
                        }
                    };
                    
                    this.socket.onerror = (err) => {
                        this.updateStatus('disconnected');
                        this.log(`Connection error: ${err.message || 'Unknown error'}`, 'error');
                    };
                    
                } catch (error) {
                    this.updateStatus('disconnected');
                    this.log(`Error connecting: ${error.message}`, 'error');
                }
            }
            
            disconnect() {
                try {
                    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                        this.socket.close();
                        this.log('Disconnected from server', 'warning');
                    } else {
                        this.log('Not currently connected', 'warning');
                    }
                    
                    if (this.reconnectTimer) {
                        clearTimeout(this.reconnectTimer);
                        this.reconnectTimer = null;
                    }
                    
                    this.updateStatus('disconnected');
                } catch (error) {
                    this.log(`Error disconnecting: ${error.message}`, 'error');
                }
            }
            
            sendCommand() {
                try {
                    const command = this.commandInput.value.trim();
                    
                    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                        this.log('Not connected to server', 'error');
                        return false;
                    }
                    
                    if (!command) {
                        this.log('Please enter a command', 'warning');
                        return false;
                    }
                    
                    this.socket.send(command);
                    this.log(`You: ${command}`, 'info');
                    this.commandInput.value = '';
                    return true;
                    
                } catch (error) {
                    this.log(`Error sending command: ${error.message}`, 'error');
                    return false;
                }
            }
        }
        
        // Initialize the client when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new TermuxClient();
        });
    