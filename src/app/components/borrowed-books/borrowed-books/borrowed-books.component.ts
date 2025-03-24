// src/app/components/borrowed-books/borrowed-books.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Book } from '../../../interfaces/book';
import { BorrowingService } from '../../../services/borrowing.service';
import { BookList } from '../../book-list/book-list.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-borrowed-books',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './borrowed-books.component.html',
  styleUrls: ['./borrowed-books.component.css']
})
export class BorrowedBooksComponent implements OnInit {
  borrowedBooks: Book[] = [];
  loading = true;

  constructor(public borrowingService: BorrowingService,
              private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // console.log('BorrowedBooksComponent initialized');
    this.loadBorrowedBooks();
  }

  loadBorrowedBooks(): void {
    this.loading = true;
    // console.log('Loading borrowed books...');
    
    this.borrowingService.getBooks().subscribe({
      next: (books) => {
        // console.log('Received books from API:', books.length);
        
        this.borrowedBooks = books.filter(book => 
          this.borrowingService.isBookBorrowedByUser(book)
        );
        
        // console.log('Filtered borrowed books count:', this.borrowedBooks.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading borrowed books', error);
        this.loading = false;
      }
    });
  }

  // borrowed-books.component.ts
returnBook(book: Book): void {
  console.log('Returning book from borrowed list:', book.title, 'Current stock:', book.stock);
  
  this.borrowingService.returnBook(book).subscribe({
    next: (updatedBook) => {
      console.log('Book returned from borrowed list, new stock:', updatedBook.stock);
      
      // Remove the book from the borrowed books list
      this.borrowedBooks = this.borrowedBooks.filter(b => b.id !== updatedBook.id);
      
      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Book Returned',
        detail: `"${updatedBook.title}" has been returned successfully.`
      });
    },
    error: (error) => {
      console.error('Error returning book from borrowed list', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to return the book. Please try again.'
      });
    }
  });
}

}
