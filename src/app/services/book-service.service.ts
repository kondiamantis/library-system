import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../interfaces/book';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'http://localhost:3000/books';

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  updateBookStock(id: number, stock: number): Observable<Book> {
    return this.http.patch<Book>(`${this.apiUrl}/${id}`, { stock });
  }

  // src/app/services/book-service.service.ts
  // Add these methods to your existing BookService

updateBook(book: Book): Observable<Book> {
  return this.http.put<Book>(`${this.apiUrl}/${book.id}`, book);
}

isBookBorrowedByUser(book: Book, userId: number): boolean {
  if (!book.borrowed) return false;
  
  return book.borrowed.some(status => 
    status.userId === userId && !status.returned
  );
}

isBookOverdue(book: Book, userId: number): boolean {
  if (!book.borrowed) return false;
  
  const userBorrow = book.borrowed.find(status => 
    status.userId === userId && !status.returned
  );
  
  if (!userBorrow) return false;
  
  return new Date(userBorrow.dueDate) < new Date();
}

}
