// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { BookDetailComponent } from './components/book-detail/book-detail.component';

export const routes: Routes = [
  { path: 'books/:id', component: BookDetailComponent },
  { path: '**', redirectTo: '' }
];
