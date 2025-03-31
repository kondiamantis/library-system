// src/app/components/book-detail/book-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Book } from '../../interfaces/book';
import { BorrowingService } from '../../services/borrowing.service';
import { WishlistService } from '../../services/wishlist.service'; // Import WishlistService

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null;
  loading = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private borrowingService: BorrowingService,
    private wishlistService: WishlistService,
    private messageService: MessageService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const bookId = Number(params.get('id'));
      if (bookId) {
        this.loadBook(bookId);
      } else {
        this.router.navigate(['/']);
      }
    });
  }
  
  loadBook(id: number): void {
    this.loading = true;
    this.borrowingService.getBook(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading book', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load book details'
        });
        this.loading = false;
      }
    });
  }
  
  borrowBook(): void {
    if (!this.book) return;
    
    if (this.isBookBorrowed()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Already Borrowed',
        detail: 'You have already borrowed this book'
      });
      return;
    }
    
    this.borrowingService.borrowBook(this.book).subscribe({
      next: (updatedBook) => {
        this.book = updatedBook;
        this.messageService.add({
          severity: 'success',
          summary: 'Book Borrowed',
          detail: `You have borrowed "${this.book.title}"`
        });
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
  
  returnBook(): void {
    if (!this.book || !this.book.borrowed) return;
    
    const borrowIndex = this.book.borrowed.findIndex(status => 
      status.userId === this.borrowingService.currentUserId && !status.returned
    );
    
    if (borrowIndex === -1) return;
    
    this.borrowingService.returnBook(this.book).subscribe({
      next: (updatedBook) => {
        this.book = updatedBook;
        this.messageService.add({
          severity: 'success',
          summary: 'Book Returned',
          detail: `You have returned "${this.book.title}"`
        });
      },
      error: (error) => {
        console.error('Error returning book', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to return book'
        });
      }
    });
  }
  
  // Add method to toggle favorite status
  toggleFavorite(): void {
    if (!this.book) return;
    
    this.wishlistService.toggleFavorite(this.book).subscribe({
      next: (updatedBook) => {
        this.book = updatedBook;
        
        // Show success message
        const isFavorite = this.isBookFavorited();
        this.messageService.add({
          severity: 'success',
          summary: isFavorite ? 'Added to Wishlist' : 'Removed from Wishlist',
          detail: isFavorite 
            ? `"${this.book!.title}" has been added to your wishlist` 
            : `"${this.book!.title}" has been removed from your wishlist`
        });
      },
      error: (error) => {
        console.error('Error toggling favorite status', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update wishlist'
        });
      }
    });
  }
  
  isBookBorrowed(): boolean {
    return this.book ? this.borrowingService.isBookBorrowedByUser(this.book) : false;
  }
  
  isBookFavorited(): boolean {
    return this.book ? this.wishlistService.isBookFavorited(this.book) : false;
  }

  goBack() {
    // Instead of using router navigation, we'll communicate with the parent component
    window.history.back();
  }
}
