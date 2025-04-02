// src/app/app.routes.ts
import { Routes, RouterModule } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list.component';
import { BorrowedBooksComponent } from './components/borrowed-books/borrowed-books/borrowed-books.component';
import { AddBookComponent } from './components/add-book/add-book.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', 
    redirectTo: 'books', 
    pathMatch: 'full' 
  },
  { path: 'books', 
    component: BookListComponent,
    canActivate: [AuthGuard] // Protect this route
  },
  { path: 'borrowed', 
    component: BorrowedBooksComponent, 
    canActivate: [AuthGuard] // Protect this route
  },
  { path: 'wishlist', 
    component: WishlistComponent,
    canActivate: [AuthGuard] // Protect this route
  },
  { path: 'add-book', 
    component: AddBookComponent,
    canActivate: [AuthGuard] // Protect this route
  },
  // Add a catch-all route that redirects to books
  { path: '**',
    redirectTo: 'books' 
  }
]

export class AppRoutingModule { }