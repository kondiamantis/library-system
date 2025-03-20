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



  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  getBorrowedBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl).pipe(
      map(books => books.filter(book => this.isBookBorrowedByUser(book)))
    );
  }

  borrowBook(book: Book): Observable<Book> {
    // Create a deep copy of the book to avoid mutation
    const updatedBook = JSON.parse(JSON.stringify(book)) as Book;
    
    if (!updatedBook.borrowed) {
      updatedBook.borrowed = [];
    }
    
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan period

    //Decrease stock by 1
    const stock = updatedBook.stock;
    updatedBook.stock -= 1;
    
    // Create a properly typed borrow status object
    const borrowStatus: BorrowStatus = {
      userId: this.currentUserId,
      borrowDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      returned: false,
    };
    
    updatedBook.borrowed.push(borrowStatus);
    
    return this.http.put<Book>(`${this.apiUrl}/${book.id}`, updatedBook);
  }

  
returnBook(book: Book): Observable<Book> {
  
  console.log('Return book called with book:', book);

  // Create a deep copy of the book to modify
  const updatedBook = JSON.parse(JSON.stringify(book)) as Book;
  console.log('Created deep copy:', updatedBook);
  
  // Get current user ID
  const userId = this.currentUserId;
  console.log('Current user ID:', userId);

  // Check if the book has borrowedBy array
  if (!updatedBook.borrowed || updatedBook.borrowed.length === 0) {
    console.warn('Book is not borrowed by anyone');
    return of(book); // Return original book if not borrowed
  }
  
  // Find the user's borrow record
  const userBorrowIndex = updatedBook.borrowed.findIndex(
    record => record.userId === this.currentUserId
  );
  
  if (userBorrowIndex === -1) {
    console.warn('Book is not borrowed by current user');
    return of(book); // Return original book if not borrowed by current user
  }
  
  // Remove the user's borrow record
  updatedBook.borrowed.splice(userBorrowIndex, 1);
  
  // Increase stock by 1
  console.log('Old stock:', updatedBook.stock);
  updatedBook.stock += 1;
  console.log('New stock:', updatedBook.stock);
  
  console.log('Sending PUT request to:', `${this.apiUrl}/books/${book.id}`);
  console.log('With data:', updatedBook);

  console.log('Returning book, new stock:', updatedBook.stock);
  
  // Update the book in the database
  return this.http.put<Book>(`${this.apiUrl}/${book.id}`, updatedBook);
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
