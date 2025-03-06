import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookList } from "./components/book-list/book-list.component";

@Component({
  selector: 'app-root',
  imports: [BookList],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'library-system';
}
