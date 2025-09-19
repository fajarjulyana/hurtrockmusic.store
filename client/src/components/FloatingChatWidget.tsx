import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, User, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLocalization } from "@/contexts/LocalizationContext";

interface ChatMessage {
  id: string;
  senderType: 'customer' | 'admin';
  senderName: string;
  message: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  customerName: string;
  customerEmail?: string;
  subject: string;
  status: string;
  lastMessageAt: string;
  createdAt: string;
}

export default function FloatingChatWidget() {
  const { user } = useAuth();
  const { translations } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [chatSubject, setChatSubject] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  const connectWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'joined_room':
          console.log('Successfully joined room:', data.payload.roomId);
          break;
          
        case 'new_message':
          const newMsg = data.payload;
          setMessages(prev => [...prev, newMsg]);
          
          // If chat is closed, increment unread count
          if (!isOpen || isMinimized) {
            setUnreadCount(prev => prev + 1);
          }
          break;
          
        case 'error':
          console.error('Chat error:', data.payload.message);
          break;
      }
    };
    
    ws.onclose = () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (currentRoom) {
          connectWebSocket();
        }
      }, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    wsRef.current = ws;
  };

  // Join a chat room
  const joinRoom = (roomId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const sessionId = document.cookie.split(';')
        .find(c => c.trim().startsWith('connect.sid='))
        ?.split('=')[1] || '';
        
      wsRef.current.send(JSON.stringify({
        type: 'join_room',
        payload: {
          roomId,
          sessionId,
          userType: user?.isAdmin ? 'admin' : 'customer'
        }
      }));
    }
  };

  // Send a message
  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || !currentRoom) return;
    
    const senderName = user?.isAdmin ? 'Admin' : customerName || 'Customer';
    
    wsRef.current.send(JSON.stringify({
      type: 'send_message',
      payload: {
        senderName,
        message: newMessage.trim()
      }
    }));
    
    setNewMessage('');
  };

  // Create a new chat room
  const createChatRoom = async () => {
    if (!customerName.trim() || !chatSubject.trim()) {
      alert('Please fill in your name and subject');
      return;
    }
    
    setIsCreatingRoom(true);
    
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || undefined,
          subject: chatSubject.trim(),
          productId: null // Can be set if chat is about a specific product
        }),
      });
      
      if (response.ok) {
        const room = await response.json();
        setCurrentRoom(room);
        
        // Connect to WebSocket and join the room
        connectWebSocket();
        setTimeout(() => joinRoom(room.id), 1000);
        
        // Clear the form
        setChatSubject('');
        // Keep customer info for future chats
      } else {
        const error = await response.json();
        alert(`Failed to create chat room: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('Failed to create chat room. Please try again.');
    }
    
    setIsCreatingRoom(false);
  };

  // Load messages for current room
  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
      if (response.ok) {
        const msgs = await response.json();
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear unread count when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Load messages when room is set
  useEffect(() => {
    if (currentRoom) {
      loadMessages(currentRoom.id);
    }
  }, [currentRoom]);

  // Close chat room
  const closeChatRoom = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'leave_room' }));
      wsRef.current.close();
    }
    
    setCurrentRoom(null);
    setMessages([]);
    setIsConnected(false);
    setUnreadCount(0);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentRoom) {
        sendMessage();
      } else {
        createChatRoom();
      }
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover-elevate"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <Card className={cn(
            "w-80 shadow-xl transition-all duration-300",
            isMinimized ? "h-14" : "h-96"
          )}>
            {/* Chat Header */}
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-red-500"
                  )} />
                  {currentRoom ? `Chat: ${currentRoom.subject}` : 'Start New Chat'}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Chat Content */}
            {!isMinimized && (
              <CardContent className="p-3 pt-0 h-80 flex flex-col">
                {currentRoom ? (
                  <>
                    {/* Chat Messages */}
                    <ScrollArea className="flex-1 pr-3">
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-2",
                              message.senderType === 'customer' ? 'justify-end' : 'justify-start'
                            )}
                          >
                            {message.senderType === 'admin' && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-primary">
                                  <Bot className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={cn(
                              "rounded-lg px-3 py-2 max-w-[70%] text-sm",
                              message.senderType === 'customer'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}>
                              <p>{message.message}</p>
                              <p className={cn(
                                "text-xs mt-1 opacity-70",
                                message.senderType === 'customer' 
                                  ? "text-primary-foreground/70" 
                                  : "text-muted-foreground"
                              )}>
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            
                            {message.senderType === 'customer' && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  <User className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={sendMessage}
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        disabled={!newMessage.trim() || !isConnected}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Close Chat Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={closeChatRoom}
                      className="w-full mt-2 text-xs"
                    >
                      End Chat
                    </Button>
                  </>
                ) : (
                  <>
                    {/* New Chat Form */}
                    <div className="space-y-3">
                      <div>
                        <Input
                          placeholder="Your Name *"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Email (optional)"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="What can we help you with? *"
                          value={chatSubject}
                          onChange={(e) => setChatSubject(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={createChatRoom}
                      disabled={isCreatingRoom || !customerName.trim() || !chatSubject.trim()}
                      className="w-full mt-4"
                    >
                      {isCreatingRoom ? 'Starting Chat...' : 'Start Chat'}
                    </Button>
                  </>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}