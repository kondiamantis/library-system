// src/app/components/app-shell/app-shell.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookList } from '../book-list/book-list.component';
import { BorrowedBooksComponent } from '../borrowed-books/borrowed-books/borrowed-books.component';
import { WishlistComponent } from '../wishlist/wishlist.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BookList,
    BorrowedBooksComponent,
    WishlistComponent,
    TabMenuModule,
    ToastModule,
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.css']
})
export class AppShellComponent implements OnInit {
  activeTab = 'books';
  items: MenuItem[] = [];
  isDarkMode = false;
  
  constructor(private messageService: MessageService) {
    // Check system preference for dark mode
    this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme();
  }
  
  ngOnInit() {
    this.items = [
      {
        label: 'Books',
        icon: 'pi pi-book',
        command: () => this.showTab('books')
      },
      {
        label: 'My Borrowed Books',
        icon: 'pi pi-shopping-bag',
        command: () => this.showTab('borrowed')
      },
      {
        label: 'My Wishlist',
        icon: 'pi pi-heart',
        command: () => this.showTab('wishlist')
      }
    ];
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.isDarkMode = e.matches;
      this.applyTheme();
    });
  }
  
  showTab(tabName: string) {
    this.activeTab = tabName;
  }
  
  getActiveItemIndex(): number {
    switch (this.activeTab) {
      case 'books': return 0;
      case 'borrowed': return 1;
      case 'wishlist': return 2;
      default: return 0;
    }
  }
  
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }
  
  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
