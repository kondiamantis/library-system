import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasStoredToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  
  // Store admin credentials (in a real app, this would be on the server)
  private readonly ADMIN_USERNAME = 'admin';
  private readonly ADMIN_PASSWORD = 'admin';
  
  constructor(private router: Router) {}
  
  login(username: string, password: string): Observable<boolean> {
    // Check if credentials match
    const isValid = username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD;
    
    // Simulate an API call with a small delay
    return of(isValid).pipe(
      delay(800),
      tap(valid => {
        if (valid) {
          // Store authentication token
          localStorage.setItem('auth_token', 'admin-token-' + new Date().getTime());
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }
  
  logout(): void {
    // Remove token and update login state
    localStorage.removeItem('auth_token');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }
  
  private hasStoredToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }
  
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
