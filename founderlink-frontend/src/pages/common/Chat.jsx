import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Send, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getConversationMessages, sendMessage } from '../../api/messagingApi';
import { getAuthUserById } from '../../api/userApi';

const MESSAGING_WS_URL = 'http://localhost:8086/ws';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const otherUserId = state?.otherUserId;
  const { userId } = useAuth();

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [resolvedOtherUserId, setResolvedOtherUserId] = useState(otherUserId || null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);

  const bottomRef = useRef(null);
  const stompClientRef = useRef(null);

  // Load existing messages on open; derive otherUserId from messages if state was lost (e.g. page refresh)
  useEffect(() => {
    getConversationMessages(conversationId)
      .then(res => {
        const loaded = res.data?.data || [];
        setMessages(loaded);
        if (!otherUserId && loaded.length > 0) {
          const derivedId = loaded.find(m => m.senderId !== userId)?.senderId;
          if (derivedId) setResolvedOtherUserId(derivedId);
        }
      })
      .catch(() => toast.error('Failed to load messages'));
  }, [conversationId, otherUserId, userId]);

  // Fetch the other user's name from auth-service (always has name/email)
  useEffect(() => {
    if (!resolvedOtherUserId) return;
    getAuthUserById(resolvedOtherUserId)
      .then(res => setOtherUser(res.data))
      .catch(() => {});
  }, [resolvedOtherUserId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket connection — connect once per conversation
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(MESSAGING_WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        // Subscribe to this conversation's topic
        client.subscribe(`/topic/conversation/${conversationId}`, (frame) => {
          const newMessage = JSON.parse(frame.body);
          setMessages(prev => {
            // Avoid duplicates (our own send comes back from WS too)
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
      setConnected(false);
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const content = text;
    setText(''); // Clear immediately for snappy UX
    try {
      await sendMessage({ receiverId: resolvedOtherUserId, content });
      // Message will appear via WebSocket broadcast — no need to reload
    } catch {
      toast.error('Failed to send');
      setText(content); // Restore on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {otherUser?.name || otherUser?.email || (otherUserId ? `User #${otherUserId}` : `Conversation #${conversationId}`)}
              </h1>
            </div>
          </div>
          {/* Live connection indicator */}
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
            connected ? 'bg-green-500/15 text-green-400' : 'bg-dark-600 text-gray-500'
          }`}>
            {connected
              ? <><Wifi size={12} /> Live</>
              : <><WifiOff size={12} /> Connecting...</>
            }
          </div>
        </div>

        {/* Messages */}
        <div className="card flex-1 overflow-y-auto p-4 space-y-3 mb-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex ${m.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.senderId === userId
                      ? 'bg-accent text-white rounded-br-md'
                      : 'bg-dark-600 text-gray-200 border border-dark-400 rounded-bl-md'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="btn-primary px-4 flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
