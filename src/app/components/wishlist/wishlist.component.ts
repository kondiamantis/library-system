// src/app/components/wishlist/wishlist.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Book } from '../../interfaces/book';
import { WishlistService } from '../../services/wishlist.service';
import { BorrowingService } from '../../services/borrowing.service';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book-service.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    CardModule,
    ButtonModule,
    ToastModule,
    RatingModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {



  favoriteBooks: Book[] = [];
  loading = true;
  
  constructor(
    private wishlistService: WishlistService,
    private borrowingService: BorrowingService,
    private messageService: MessageService,
    private bookService: BookService
  ) {}
  
  ngOnInit(): void {
    this.loadFavoriteBooks();
  }
  
  rateBook(book: Book, newRating: number): void {
    this.bookService.updateBookRating(book.id, newRating).subscribe({
      next: (updatedBook) => {
        // Update the book in the local list
        book.rating = updatedBook.rating;
        book.ratingCount = updatedBook.ratingCount;
        // console.log(`Rating for "${book.title}" updated to ${book.rating}`);
      },
      error: (err) => {
        console.error('Failed to update rating:', err);
      },
    });
  }
  
  loadFavoriteBooks(): void {
    this.loading = true;
    this.wishlistService.getFavoriteBooks().subscribe({
      next: (books) => {
        this.favoriteBooks = books;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading favorite books', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load favorite books'
        });
        this.loading = false;
      }
    });
  }
  
  removeFromFavorites(book: Book): void {
    this.wishlistService.toggleFavorite(book).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Removed from Wishlist',
          detail: `"${book.title}" has been removed from your wishlist`
        });
        this.loadFavoriteBooks();
      },
      error: (error) => {
        console.error('Error removing from wishlist', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove book from wishlist'
        });
      }
    });
  }
  
  borrowBook(book: Book): void {
    if (this.borrowingService.isBookBorrowedByUser(book)) {
      this.messageService.add({
        severity: 'info',
        summary: 'Already Borrowed',
        detail: 'You have already borrowed this book'
      });
      return;
    }
    
    this.borrowingService.borrowBook(book).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Book Borrowed',
          detail: `You have borrowed "${book.title}"`
        });
        this.loadFavoriteBooks();
      },
      error: (error) => {
        console.error('Error borrowing book', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to borrow book'
        });
      }
    });
  }

  // wishlist.component.ts
  returnBook(book: Book): void {
    console.log('Returning book from wishlist:', book.title, 'Current stock:', book.stock);
    
    this.borrowingService.returnBook(book).subscribe({
      next: (updatedBook) => {
        console.log('Book returned from wishlist, new stock:', updatedBook.stock);
        
        // Update the book in the wishlistBooks array
        const index = this.favoriteBooks.findIndex(b => b.id === updatedBook.id);
        if (index !== -1) {
          this.favoriteBooks[index] = updatedBook;
        }
        
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Book Returned',
          detail: `"${updatedBook.title}" has been returned successfully.`
        });
        
      },
      error: (error) => {
        console.error('Error returning book from wishlist', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to return the book. Please try again.'
        });
      }
    });
  }

  
  isBookBorrowed(book: Book): boolean {
    return this.borrowingService.isBookBorrowedByUser(book);
  }

  
}
