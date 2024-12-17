export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessage extends ContactFormData {
  id: number;
  created_at: Date;
  status: 'pending' | 'read' | 'replied';
}
