// src/app/services/borrowing.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Book, BorrowStatus } from '../interfaces/book';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class BorrowingService {
  private borrowedBooks = new BehaviorSubject<Book[]>([]);
  private apiUrl = 'http://localhost:3000/books'; // json-server URL 
  
  // Mock user ID (replace with actual user authentication)
  currentUserId = 1;

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.checkOverdueBooks();
  }

  getBorrowedBooks(): Observable<Book[]> {
    return this.borrowedBooks.asObservable();
  }

  borrowBook(book: Book): Observable<Book> {
    if (book.stock <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'This book is out of stock'
      });
      return of(book);
    }

    // Create borrow status
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks borrowing period
    
    const borrowStatus: BorrowStatus = {
      userId: this.currentUserId,
      borrowDate: new Date(),
      dueDate: dueDate,
      isOverdue: false
    };

    // Update book
    const updatedBook = {...book}; // Create a copy to avoid reference issues
    
    if (!updatedBook.borrowed) {
      updatedBook.borrowed = [];
    }
    
    updatedBook.borrowed.push(borrowStatus);
    updatedBook.stock--;

    // Update the book on json-server
    return this.http.put<Book>(`${this.apiUrl}/${updatedBook.id}`, updatedBook).pipe(
      tap(book => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `You have borrowed "${book.title}". Due date: ${dueDate.toLocaleDateString()}`
        });
        
        this.loadBorrowedBooks();
      }),
      catchError(error => {
        console.error('Error borrowing book:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Could not borrow book. Error: ${error.message}`
        });
        return of(book); // Return original book on error
      })
    );
  }

  returnBook(book: Book, borrowIndex: number): Observable<Book> {
    // Create a copy of the book to avoid reference issues
    const updatedBook = JSON.parse(JSON.stringify(book));
    
    // Mark as returned
    updatedBook.borrowed[borrowIndex].returned = new Date();
    updatedBook.stock++;

    // Update the book on json-server
    return this.http.put<Book>(`${this.apiUrl}/${updatedBook.id}`, updatedBook).pipe(
      tap(book => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `You have returned "${book.title}"`
        });
        
        this.loadBorrowedBooks();
      }),
      catchError(error => {
        console.error('Error returning book:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Could not return book. Error: ${error.message}`
        });
        return of(book); // Return original book on error
      })
    );
  }

  private loadBorrowedBooks(): void {
    this.http.get<Book[]>(this.apiUrl).pipe(
      map(books => books.filter(book => this.isBookBorrowedByUser(book))),
      catchError(error => {
        console.error('Error loading borrowed books:', error);
        return of([]);
      })
    ).subscribe(books => {
      this.borrowedBooks.next(books);
    });
  }

  isBookOverdue(book: Book): boolean {
    if (!book.borrowed) return false;
    
    const userBorrow = book.borrowed.find(status => 
      status.userId === this.currentUserId && !status.returned
    );
    
    if (!userBorrow) return false;
    
    return new Date(userBorrow.dueDate) < new Date();
  }

  getDueDate(book: Book): string {
    if (!book.borrowed) return '';
    
    const borrowStatus = book.borrowed.find(status => 
      status.userId === this.currentUserId && !status.returned
    );
    
    if (!borrowStatus) return '';
    
    return new Date(borrowStatus.dueDate).toLocaleDateString();
  }

isBookBorrowedByUser(book: Book): boolean {
  if (!book.borrowed) return false;
  
  return book.borrowed.some(status => 
    status.userId === this.currentUserId && !status.returned
  );
}


  // Check for overdue books and notify the user
  checkOverdueBooks(): void {
    // Get all books and check for overdue ones
    this.http.get<Book[]>(this.apiUrl).subscribe(books => {
      const overdueBooks = books.filter(book => 
        this.isBookBorrowedByUser(book) && this.isBookOverdue(book)
      );
      
      if (overdueBooks.length > 0) {
        // Show a notification for each overdue book
        overdueBooks.forEach(book => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Overdue Book',
            detail: `"${book.title}" is overdue! Please return it as soon as possible.`,
            sticky: true
          });
        });
        
        // Also show a summary if there are multiple overdue books
        if (overdueBooks.length > 1) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Overdue Books',
            detail: `You have ${overdueBooks.length} overdue books. Please return them soon.`,
            sticky: true
          });
        }
      }
    });
    
    // Set up periodic checks (e.g., once a day or once an hour)
    // For testing, we'll check every minute
    setInterval(() => {
      this.http.get<Book[]>(this.apiUrl).subscribe(books => {
        books.forEach(book => {
          // Check if book just became overdue
          if (book.borrowed && !this.hasNotifiedOverdue(book)) {
            book.borrowed.forEach((status, index) => {
              if (status.userId === this.currentUserId && 
                  !status.returned && 
                  new Date(status.dueDate) < new Date() && 
                  !status.isOverdue) {
                // Mark as overdue and update the book
                const updatedBook = JSON.parse(JSON.stringify(book));
                updatedBook.borrowed[index].isOverdue = true;
                
                this.http.put<Book>(`${this.apiUrl}/${updatedBook.id}`, updatedBook).subscribe(() => {
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Book Now Overdue',
                    detail: `"${book.title}" is now overdue! Please return it as soon as possible.`,
                    sticky: true
                  });
                });
              }
            });
          }
        });
      });
    }, 60000); // Check every minute for testing
  }

  // Helper method to check if we've already notified about an overdue book
  hasNotifiedOverdue(book: Book): boolean {
    if (!book.borrowed) return false;
    
    return book.borrowed.some(status => 
      status.userId === this.currentUserId && 
      !status.returned && 
      status.isOverdue
    );
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  // private checkBooksOnLoad(): void {
  //   const today = new Date();
    
  //   this.http.get<Book[]>(this.apiUrl).pipe(
  //     catchError(error => {
  //       console.error('Error checking overdue books:', error);
  //       return of([]);
  //     })
  //   ).subscribe(books => {
  //     books.forEach(book => {
  //       if (!book.borrowed) return;
        
  //       let updated = false;
  //       const updatedBook = {...book};
        
  //       updatedBook.borrowed.forEach(status => {
  //         if (!status.returned && new Date(status.dueDate) < today && !status.isOverdue) {
  //           status.isOverdue = true;
  //           updated = true;
            
  //           this.messageService.add({
  //             severity: 'warn',
  //             summary: 'Overdue Book',
  //             detail: `"${book.title}" is overdue! Please return it as soon as possible.`,
  //             sticky: true
  //           });
  //         }
  //       });
        
  //       if (updated) {
  //         this.http.put<Book>(`${this.apiUrl}/${updatedBook.id}`, updatedBook)
  //           .pipe(
  //             catchError(error => {
  //               console.error('Error updating overdue status:', error);
  //               return of(book);
  //             })
  //           )
  //           .subscribe();
  //       }
  //     });
  //   });
  // }
}
