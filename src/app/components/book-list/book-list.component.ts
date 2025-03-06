import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book-service.service';
import { Book } from '../../interfaces/book';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PrimeIcons } from 'primeng/api';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';



@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  imports: [CommonModule, TableModule, ButtonModule, FormsModule, DropdownModule, CheckboxModule],
})
export class BookList implements OnInit {

  books: Book[] = [];
  filteredBooks: any[] = [];
  searchText: string = '';
  genres: string[] = ['Classic Fiction', 'Dystopian', 'Historical Fiction', 'Romance', 'Adventure'];  // Add more genres as needed
  selectedGenre: string = ''; // Initialize as empty string
  selectedStock: boolean = false;  // true for "in stock" and false for "out of stock"

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
    this.filterBooks(); // Re-apply the filter
  }
  

}
