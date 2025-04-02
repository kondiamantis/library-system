// src/app/app.routes.ts
import { Routes, RouterModule } from '@angular/router';
import { BookDetailComponent } from './components/book-detail/book-detail.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { BorrowedBooksComponent } from './components/borrowed-books/borrowed-books/borrowed-books.component';
import { AddBookComponent } from './components/add-book/add-book.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: 'books', component: BookListComponent },
  { path: 'borrowed', component: BorrowedBooksComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'add-book', component: AddBookComponent },
  // Add a catch-all route that redirects to books
  { path: '**', redirectTo: 'books' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }