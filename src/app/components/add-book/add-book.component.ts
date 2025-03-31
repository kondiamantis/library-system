import { Component } from '@angular/core';
import { BookService } from '../../services/book-service.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css'],
  imports: [FormsModule, ButtonModule]
})
export class AddBookComponent {
  newBook = {
    title: '',
    author: '',
    genre: '',
    publishedYear: null,
    stock: null,
    isbn: '',
    coverImage: 'https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg',
    favorited: [],
    borrowed: [],
    rating: 0,
    ratingCount: 0,
  };

  constructor(private bookService: BookService, private router: Router) {}

  onSubmit(): void {
    this.bookService.addBook(this.newBook).subscribe({
      next: () => {
        alert('Book added successfully!');
        this.router.navigate(['/']); // Redirect to the home page or book list
      },
      error: (err) => {
        console.error('Failed to add book:', err);
      },
    });
  }
}