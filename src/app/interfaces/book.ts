export interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    coverImage?: string;
    description?: string;
    genre: string;
    borrowed?: BorrowStatus[];
    favorited?: number[]; // Array of user IDs who favorited this book
    publishedYear: number;
    stock: number;
    status?: 'available' | 'borrowed';
    
}

export interface BorrowStatus {
  userId: number;
  borrowDate: string; // ISO string format
  dueDate: string; // ISO string format
  returned: boolean;
  returnDate?: string; // Optional ISO String format
  isOverdue?: boolean;
}
  