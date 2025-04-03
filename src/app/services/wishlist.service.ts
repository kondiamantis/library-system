// src/app/services/wishlist.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, tap } from 'rxjs';
import { Book } from '../interfaces/book';
import { BorrowingService } from './borrowing.service';
import { environment } from '../../../environments/environment-dev';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = `${environment.apiUrl}/books`;
  // private apiUrl = 'http://localhost:3000/books';
  currentUserId = 1; // Hardcoded for demo

  constructor(
    private http: HttpClient,
    private borrowingService: BorrowingService
  ) {}
  
  toggleFavorite(book: Book): Observable<Book> {
    // Create a deep copy
    const updatedBook = JSON.parse(JSON.stringify(book)) as Book;
    
    // Initialize favorited array if needed
    if (!updatedBook.favorited) {
      updatedBook.favorited = [];
    }
    
    // Check if book is already favorited
    const index = updatedBook.favorited.indexOf(this.currentUserId);
    
    if (index === -1) {
      // Add to favorites
      updatedBook.favorited.push(this.currentUserId);
    } else {
      // Remove from favorites
      updatedBook.favorited.splice(index, 1);
    }
    
    // Update the book
    return this.http.put<Book>(`${this.apiUrl}/${book.id}`, updatedBook).pipe(
      catchError(error => {
        console.error('Error toggling favorite status', error);
        return of(book); // Return original on error
      })
    );
  }
  
  isBookFavorited(book: Book): boolean {
    if (!book.favorited) return false;
    return book.favorited.includes(this.currentUserId);
  }
  
  getFavoriteBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl).pipe(
      map(books => books.filter(book => this.isBookFavorited(book)))
    );
  }

  
}
