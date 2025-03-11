import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookList } from "./components/book-list/book-list.component";
import { ToastModule } from 'primeng/toast';
import { BorrowedBooksComponent } from './components/borrowed-books/borrowed-books/borrowed-books.component';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [BookList, ToastModule, TabMenuModule,BorrowedBooksComponent, CommonModule, TabViewModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  activeTab = 'books';
  items: MenuItem[] = [];
  bookListComponent: any;
  borrowedBooksComponent: any;
  themeIcon: string = 'pi pi-moon';
  isDarkMode: boolean = false;
  
  constructor() {
    console.log('App component initialized');
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Books',
        icon: 'pi pi-book',
        command: () => this.showBooksTab()
      },
      {
        label: 'My Borrowed Books',
        icon: 'pi pi-shopping-bag',
        command: () => this.showBorrowedTab()
      }
    ];
  }
  
  showBooksTab() {
    this.activeTab = 'books';
    // Wait for component to render, then refresh
    setTimeout(() => {
      if (this.bookListComponent) {
        this.bookListComponent.loadBooks();
      }
    }, 0);
  }

  showBorrowedTab() {
    this.activeTab = 'borrowed';
    // Wait for component to render, then refresh
    setTimeout(() => {
      if (this.borrowedBooksComponent) {
        this.borrowedBooksComponent.loadBorrowedBooks();
      }
    }, 0);
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    if (element) {
      element.classList.toggle('my-app-dark');
      this.isDarkMode = element.classList.contains('my-app-dark');
      this.themeIcon = this.isDarkMode ? 'pi pi-sun' : 'pi pi-moon';
    }
  }
}

