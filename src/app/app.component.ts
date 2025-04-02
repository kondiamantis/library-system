import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
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
import { AddBookComponent } from "./components/add-book/add-book.component";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [
    ToastModule,
    TabMenuModule,
    CommonModule,
    TabViewModule,
    ButtonModule,
    RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  activeTab = 'books';
  items: MenuItem[] = [];
  activeItem: MenuItem | undefined;
  isDarkMode= false;
  themeIcon = 'pi pi-moon';
  activeRoute = 'books';
  
  constructor(private router: Router) {
    // Listen to route changes to update active menu item
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.activeRoute = this.router.url.split('/')[1] || 'books';
      this.activeTab = this.activeRoute;
      this.updateActiveMenu();
    });
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Books',
        icon: 'pi pi-book',
        routerLink: '/books',
      },
      {
        label: 'My Borrowed Books',
        icon: 'pi pi-shopping-bag',
        routerLink: '/borrowed',
      },
      {
        label: 'My Wishlist',
        icon: 'pi pi-heart',
        routerLink: '/wishlist',
      },
      {
        label: 'Add Book',
        icon: 'pi pi-plus',
        routerLink: '/add-book',
      }
    ];

     
   // Navigate to books path on initialization if the path is empty
   if (this.router.url === '/') {
    this.router.navigate(['/books']);
  }

  // Update active menu based on current route
    this.updateActiveMenu();
  }

  updateActiveMenu() {
    // Update the active class for menu items
    this.items.forEach(item => {
      if (item.routerLink && item.routerLink.toString().includes(this.activeRoute)) {
        item.styleClass = 'active-menu-item';
      } else {
        item.styleClass = '';
      }
    });
  }
  
  // showTab(tabName: string) {
  //   this.activeTab = tabName;
  // }

  // getActiveItemIndex(): number {
  //   switch (this.activeTab) {
  //     case 'books': return 0;
  //     case 'borrowed': return 1;
  //     case 'wishlist': return 2;
  //     case 'add-book': return 3;
  //     default: return 0;
  //   }
  // }

  // toggleDarkMode() {
  //   const element = document.querySelector('html');
  //   if (element) {
  //     element.classList.toggle('my-app-dark');
  //     this.isDarkMode = element.classList.contains('my-app-dark');
  //     this.themeIcon = this.isDarkMode ? 'pi pi-sun' : 'pi pi-moon';
  //   }
  // }
}

