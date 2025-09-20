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

  // Don't show floating chat for admin/operator users
  if (user && (user.role === 'admin' || user.role === 'operator')) {
    return null;
  }
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
  const [existingRooms, setExistingRooms] = useState<ChatRoom[]>([]);
  const [showRoomsList, setShowRoomsList] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch existing chat rooms for current customer
  const fetchExistingRooms = async () => {
    try {
      const response = await fetch('/api/chat/my-rooms');
      if (response.ok) {
        const rooms = await response.json();
        setExistingRooms(rooms);
      }
    } catch (error) {
      console.error('Error fetching existing rooms:', error);
    }
  };

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
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
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
      scrollToBottom();
    }
  }, [currentRoom]);

  // Load existing rooms when chat widget opens
  useEffect(() => {
    if (isOpen && !currentRoom) {
      fetchExistingRooms();
    }
  }, [isOpen, currentRoom]);

  // Join existing chat room
  const joinExistingRoom = (room: ChatRoom) => {
    setCurrentRoom(room);
    setShowRoomsList(false);
    
    // Connect to WebSocket and join the room
    connectWebSocket();
    setTimeout(() => joinRoom(room.id), 1000);
  };

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
    setShowRoomsList(false);
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
                    <ScrollArea className="flex-1 pr-3 h-60">
                      <div className="space-y-3 p-1">
                        {messages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8 text-sm">
                            Mulai percakapan dengan mengirim pesan
                          </div>
                        ) : (
                          <>
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={cn(
                                  "flex gap-2",
                                  message.senderType === 'customer' ? 'justify-end' : 'justify-start'
                                )}
                              >
                                {message.senderType === 'admin' && (
                                  <Avatar className="h-6 w-6 flex-shrink-0">
                                    <AvatarFallback className="text-xs bg-primary">
                                      <Bot className="h-3 w-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className={cn(
                                  "rounded-lg px-3 py-2 max-w-[70%] text-sm break-words",
                                  message.senderType === 'customer'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                )}>
                                  <p className="whitespace-pre-wrap">{message.message}</p>
                                  <p className={cn(
                                    "text-xs mt-1 opacity-70",
                                    message.senderType === 'customer' 
                                      ? "text-primary-foreground/70" 
                                      : "text-muted-foreground"
                                  )}>
                                    {new Date(message.createdAt).toLocaleString([], {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                
                                {message.senderType === 'customer' && (
                                  <Avatar className="h-6 w-6 flex-shrink-0">
                                    <AvatarFallback className="text-xs">
                                      <User className="h-3 w-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </>
                        )}
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
                ) : showRoomsList ? (
                  <>
                    {/* Existing Rooms List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Your Chat History</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRoomsList(false)}
                        >
                          New Chat
                        </Button>
                      </div>
                      
                      {existingRooms.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          Belum ada riwayat chat sebelumnya
                        </div>
                      ) : (
                        <ScrollArea className="max-h-52">
                          <div className="space-y-2 pr-2">
                            {existingRooms
                              .sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime())
                              .map((room) => (
                                <Card key={room.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => joinExistingRoom(room)}>
                                  <CardContent className="p-3">
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="font-medium text-sm truncate flex-1">{room.subject}</div>
                                        <Badge variant={room.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
                                          {room.status}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                                        <span>
                                          {new Date(room.lastMessageAt || room.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                        <MessageCircle className="h-3 w-3" />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => setShowRoomsList(false)}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      Start New Chat
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Show existing rooms or new chat form */}
                    {existingRooms.length > 0 && (
                      <div className="mb-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowRoomsList(true)}
                          className="w-full text-sm"
                        >
                          View Previous Chats ({existingRooms.length})
                        </Button>
                      </div>
                    )}

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
                      {isCreatingRoom ? 'Memulai Chat...' : 'Mulai Chat'}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Chat akan tersimpan dan bisa diakses kembali
                    </p>
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