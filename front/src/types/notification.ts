export interface Notification {
  id: number;
  type: string; // CARD_APPROVED | CARD_REJECTED | ADMIN_MESSAGE
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}
