export interface Message {
  id: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  sender: { id: number; name: string };
  receiver: { id: number; name: string };
}

export interface Conversation {
  otherUser: { id: number; name: string };
  lastMessage: { content: string; timestamp: string };
  unreadCount: number;
}