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
import { TooltipModule } from 'primeng/tooltip';
import { WishlistService } from '../../services/wishlist.service';
import { Router } from '@angular/router';
import { RatingModule } from 'primeng/rating';

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
    ToastModule,
    TooltipModule,
    RatingModule
  ],
  providers: [MessageService]
})

export class BookList implements OnInit {
  books: Book[] = []
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

  constructor(
    private router: Router,
    private borrowingService: BorrowingService,
    private wishlistService: WishlistService,
    private messageService: MessageService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  rateBook(book: Book, newRating: number): void {
    this.bookService.updateBookRating(book.id, newRating).subscribe({
      next: (updatedBook) => {
        // Update the book in the local list
        book.rating = updatedBook.rating;
        book.ratingCount = updatedBook.ratingCount;
        console.log(`Rating for "${book.title}" updated to ${book.rating}`);
      },
      error: (err) => {
        console.error('Failed to update rating:', err);
      },
    });
  }


  viewBookDetails(book: Book) {
    this.router.navigate(['/books', book.id]);
    // Inform the parent component to show the details view
    // This can be a service method or event emitter
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
  
  getBookCover(book: Book): string {
    // Check if the book has a coverImage field in db.json
    if (book.coverImage) {
      return book.coverImage;
    }
    
    // Fallback to Open Library API if ISBN is available
    if (book.isbn) {
      return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
    }

    // Default image if no cover is available
    return 'assets/images/no-cover.png';
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
  
  
  // book-list.component.ts
returnBook(book: Book): void {
  console.log('Returning book:', book.title, 'Current stock:', book.stock);
  
  this.borrowingService.returnBook(book).subscribe({
    next: (updatedBook) => {
      console.log('Book returned, new stock:', updatedBook.stock);
      
      // Update the book in the books array
      const index = this.books.findIndex(b => b.id === updatedBook.id);
      if (index !== -1) {
        this.books[index] = updatedBook;
      }
      
      // Also update in filteredBooks if it exists there
      const filteredIndex = this.filteredBooks.findIndex(b => b.id === updatedBook.id);
      if (filteredIndex !== -1) {
        this.filteredBooks[filteredIndex] = updatedBook;
      }
      
      // If the book is currently selected in the modal, update that reference too
      if (this.selectedBook && this.selectedBook.id === updatedBook.id) {
        this.selectedBook = updatedBook;
      }
      
      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Book Returned',
        detail: `"${updatedBook.title}" has been returned successfully.`
      });
      
      // Force change detection if needed
      // this.changeDetectorRef.detectChanges();
    },
    error: (error) => {
      console.error('Error returning book', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to return the book. Please try again.'
      });
    }
  });
}



  toggleFavorite(book: Book): void {
    this.wishlistService.toggleFavorite(book).subscribe({
      next: (updatedBook) => {
        // Update the book in the list
        const indexInFiltered = this.filteredBooks.findIndex(b => b.id === updatedBook.id);
        if (indexInFiltered !== -1) {
          this.filteredBooks[indexInFiltered] = updatedBook;
        }
        
        const indexInAll = this.books.findIndex(b => b.id === updatedBook.id);
        if (indexInAll !== -1) {
          this.books[indexInAll] = updatedBook;
        }
        
        // If the book is currently selected in the modal, update that too
        if (this.selectedBook && this.selectedBook.id === updatedBook.id) {
          this.selectedBook = updatedBook;
        }
        
        // Show success message
        const isFavorited = this.wishlistService.isBookFavorited(updatedBook);
        this.messageService.add({
          severity: 'success',
          summary: isFavorited ? 'Added to Wishlist' : 'Removed from Wishlist',
          detail: isFavorited 
            ? `"${book.title}" has been added to your wishlist` 
            : `"${book.title}" has been removed from your wishlist`
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

  // Add new method to check if book is favorited
  isBookFavorited(book: Book): boolean {
    return this.wishlistService.isBookFavorited(book);
  }

}
