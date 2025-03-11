import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book-service.service';
import { Book } from '../../interfaces/book';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { BorrowingService } from '../../services/borrowing.service';
import { BorrowStatus } from '../../interfaces/book';
import { MessageService } from 'primeng/api';
import {ToastModule} from 'primeng/toast';

@Component({
  selector: 'app-book-list',
  standalone: true,
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    FormsModule, 
    AutoCompleteModule, 
    CheckboxModule, 
    DialogModule,
    InputTextModule,
    ToastModule
  ],
})

export class BookList implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  searchText: string = '';
  
  // Simple string array for genres
  genres: string[] = [
    'Classic Fiction', 
    'Dystopian', 
    'Historical Fiction', 
    'Romance', 
    'Adventure', 
    'Fantasy',
    'Literary Fiction', 
    'Mystery Thriller', 
    'Philosophical Fiction'
  ];
  
  genreItems: string[] = [];
  selectedGenre: string = '';
  selectedStock: boolean = false;
  selectedBook: Book | null = null;
  displayModal: boolean = false;
  isDarkMode: boolean = false;
  themeIcon: string = 'pi pi-moon';

  constructor(private bookService: BookService,
              private borrowingService: BorrowingService,
              private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe((data) => {
      this.books = data;
      this.filteredBooks = this.books;
    });
  }

  search(event: any): void {
    // Filter genres based on user input
    const query = event.query.toLowerCase();
    this.genreItems = this.genres.filter(genre => 
      genre.toLowerCase().includes(query)
    );
  }

  filterBooks(): void {
    console.log('Selected genre:', this.selectedGenre); // Debug log
    
    this.filteredBooks = this.books.filter((book) => {
      // Search in title and author
      const matchesSearch = this.searchText ? 
        book.title.toLowerCase().includes(this.searchText.toLowerCase()) || 
        book.author.toLowerCase().includes(this.searchText.toLowerCase()) : 
        true;
      
      // Match on genre - make sure to compare case-insensitive
      const matchesGenre = this.selectedGenre ? 
        book.genre.toLowerCase() === this.selectedGenre.toLowerCase() : 
        true;
      
      // Match on stock status
      const matchesStock = this.selectedStock ? 
        book.stock > 0 : 
        true;

      return matchesSearch && matchesGenre && matchesStock;
    });
  }

  clearGenre(): void {
    this.selectedGenre = '';
    this.filterBooks();
  }

  resetFilters(): void {
    this.selectedGenre = ''; 
    this.selectedStock = false;
    this.searchText = '';
    this.genreItems = [];
    this.filteredBooks = this.books; // Reset to all books
  }
  
  getBookCover(isbn: string): string {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  }

  showBookDetails(book: Book): void {
    this.selectedBook = book;
    this.displayModal = true;
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    if (element) {
      element.classList.toggle('my-app-dark');
      this.isDarkMode = element.classList.contains('my-app-dark');
      this.themeIcon = this.isDarkMode ? 'pi pi-sun' : 'pi pi-moon';
    }
  }

  bookNow(): void {
    if (this.selectedBook) {
      this.borrowingService.borrowBook(this.selectedBook).subscribe(
        (updatedBook) => {
          // Update the book in the list
          const index = this.books.findIndex(b => b.id === updatedBook.id);
          if (index !== -1) {
            this.books[index] = updatedBook;
            this.filteredBooks = [...this.filteredBooks]; // Force refresh
          }
          this.displayModal = false;
        }
      );
    }
  }
  
  isBookBorrowed(book: Book): boolean {
    // Assuming currentUserId is 1 for now
    const currentUserId = 1;
    return this.bookService.isBookBorrowedByUser(book, currentUserId);
  }
  
  isBookOverdue(book: Book): boolean {
    // Assuming currentUserId is 1 for now
    const currentUserId = 1;
    return this.bookService.isBookOverdue(book, currentUserId);
  }
  
  getDueDate(book: Book): string {
    if (!book.borrowed) return '';
    
    // Assuming currentUserId is 1 for now
    const currentUserId = 1;
    
    const borrowStatus = book.borrowed.find(status => 
      status.userId === currentUserId && !status.returned
    );
    
    if (!borrowStatus) return '';
    
    return new Date(borrowStatus.dueDate).toLocaleDateString();
  }
  
  returnBook(book: Book, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent row click if clicked on button
    }
    
    if (!book.borrowed) return;
    
    const borrowIndex = book.borrowed.findIndex(status => 
      status.userId === 1 && !status.returned
    );
    
    if (borrowIndex === -1) return;
    
    this.borrowingService.returnBook(book, borrowIndex).subscribe(
      (updatedBook) => {
        console.log('Book returned successfully:', updatedBook);
        
        // Update the book in the list
        const index = this.books.findIndex(b => b.id === updatedBook.id);
        if (index !== -1) {
          this.books[index] = updatedBook;
          
          // Also update the filteredBooks array if it exists
          if (this.filteredBooks) {
            const filteredIndex = this.filteredBooks.findIndex(b => b.id === updatedBook.id);
            if (filteredIndex !== -1) {
              this.filteredBooks[filteredIndex] = updatedBook;
            }
          }
        }
        
        // Update selected book if it's the same one
        if (this.selectedBook && this.selectedBook.id === updatedBook.id) {
          this.selectedBook = updatedBook;
        }
      },
      error => {
        console.error('Error returning book:', error);
      }
    );
  }

}
