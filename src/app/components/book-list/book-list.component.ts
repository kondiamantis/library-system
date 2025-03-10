import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book-service.service';
import { Book } from '../../interfaces/book';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PrimeIcons } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';

// interface AutoCompleteCompleteEvent {
//   originalEvent: Event;
//   query: string;
// }

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  imports: [CommonModule, TableModule, ButtonModule, FormsModule, DropdownModule, CheckboxModule, AutoCompleteModule, DialogModule],
})
export class BookList implements OnInit {

  books: Book[] = [];
  filteredBooks: any[] = [];
  searchText: string = '';
  genres: string[] = ['Classic Fiction', 'Dystopian', 'Historical Fiction', 'Romance', 'Adventure', 'Fantasy','Literary Fiction', '	Mystery Thriller', 'Philosophical Fiction' ];  // Add more genres as needed
  selectedGenre: any; // Initialize as any
  selectedStock: boolean = false;  // true for "in stock" and false for "out of stock"
  genreItems: any[] = [];
  selectedBook: Book | null = null; // To store the selected book for the modal
  displayModal: boolean = false; // To control modal visibility



  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe((data) => {
      this.books = data;
      this.filteredBooks = this.books;
    });
  }

  //filtering books based in title, author, genre
  filterBooks(): void {
    this.filteredBooks = this.books.filter((book) => {
      const matchesGenre = this.selectedGenre ? book.genre === this.selectedGenre : true;
      const matchesStock = this.selectedStock ? book.stock > 0 : true;
      const matchesSearch = book.title.toLowerCase().includes(this.searchText.toLowerCase()) ;
                            // book.author.toLowerCase().includes(this.searchText.toLowerCase()) ||
                            // book.genre.toLowerCase().includes(this.searchText.toLowerCase());
  
      return matchesGenre && matchesStock && matchesSearch;
    });
  }

  resetFilters(): void {
    this.selectedGenre = ''; // Reset the genre selection
    this.selectedStock = false; // Reset the stock checkbox if you want
    this.searchText = ''; // Optionally reset the search text
    this.genreItems = []; // Clear the autocomplete suggestions
    this.filterBooks(); // Re-apply the filter
  }
  
  search(event: AutoCompleteCompleteEvent) {
    // Filter genres based on user input
    this.genreItems = this.genres.filter(genre =>
      genre.toLowerCase().includes(event.query.toLowerCase()) // Case-insensitive search
    );
  }

  getBookCover(isbn: string): string {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  }

  showBookDetails(book: Book): void {
    this.selectedBook = book; // Set the selected book
    this.displayModal = true; // Show the modal
  }

  openModal(book: Book): void {
    this.selectedBook = book;
    this.displayModal = true;
  }
  
  bookNow(): void {
    if (this.selectedBook) {
      console.log(`Booking the book: ${this.selectedBook.title}`);
      // Handle booking logic here (e.g., update stock or save booking)
      this.selectedBook.stock--;
      this.displayModal = false;
    }
  }
}
