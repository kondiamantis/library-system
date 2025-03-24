import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookListComponent } from "./components/book-list/book-list.component";
import { ToastModule } from 'primeng/toast';
import { BorrowedBooksComponent } from './components/borrowed-books/borrowed-books/borrowed-books.component';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { WishlistComponent } from './components/wishlist/wishlist.component';

@Component({
  selector: 'app-root',
  imports: [BookListComponent, 
            ToastModule, 
            TabMenuModule,
            BorrowedBooksComponent, 
            CommonModule, 
            TabViewModule, 
            ButtonModule, 
          WishlistComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  activeTab = 'books';
  items: MenuItem[] = [];
  activeItem: MenuItem | undefined;
  isDarkMode= false;
  themeIcon = 'pi pi-moon';
  
  constructor() {
    console.log('App component initialized');
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

    // Set initial active item
    this.updateActiveItem();
  }

  private updateActiveItem() {
    // Find and set the active item based on activeTab
    const index = this.getActiveItemIndex();
    if (this.items && this.items.length > index) {
      this.activeItem = this.items[index];
    }
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

  toggleDarkMode() {
    const element = document.querySelector('html');
    if (element) {
      element.classList.toggle('my-app-dark');
      this.isDarkMode = element.classList.contains('my-app-dark');
      this.themeIcon = this.isDarkMode ? 'pi pi-sun' : 'pi pi-moon';
    }
  }
}

