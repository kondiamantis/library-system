export interface Book {
    id: number;
    title: string;
    author: string;
    genre: string;
    publishedYear: number;
    description: string;
    stock: number;
    isbn: string;
    // New properties for borrowing system
    borrowed: BorrowStatus[];
}

export interface BorrowStatus {
  userId: number;
  borrowDate: Date;
  dueDate: Date;
  returned?: Date;
  isOverdue?: boolean;
}
  