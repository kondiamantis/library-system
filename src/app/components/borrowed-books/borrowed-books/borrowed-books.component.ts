// src/app/components/borrowed-books/borrowed-books.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Book } from '../../../interfaces/book';
import { BorrowingService } from '../../../services/borrowing.service';
import { BookList } from '../../book-list/book-list.component';

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

  constructor(public borrowingService: BorrowingService) {}

  ngOnInit(): void {
    console.log('BorrowedBooksComponent initialized');
    this.loadBorrowedBooks();
  }

  loadBorrowedBooks(): void {
    this.loading = true;
    console.log('Loading borrowed books...');
    
    this.borrowingService.getBooks().subscribe({
      next: (books) => {
        console.log('Received books from API:', books.length);
        
        this.borrowedBooks = books.filter(book => 
          this.borrowingService.isBookBorrowedByUser(book)
        );
        
        console.log('Filtered borrowed books count:', this.borrowedBooks.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading borrowed books', error);
        this.loading = false;
      }
    });
  }

  returnBook(book: Book): void {
    if (!book.borrowed) return;
    
    const borrowIndex = book.borrowed.findIndex(status => 
      status.userId === this.borrowingService.currentUserId && !status.returned
    );
    
    if (borrowIndex === -1) return;
    
    this.borrowingService.returnBook(book, borrowIndex).subscribe({
      next: () => {
        this.loadBorrowedBooks(); // Refresh the list
      },
      error: (error) => {
        console.error('Error returning book', error);
      }
    });
  }
}
