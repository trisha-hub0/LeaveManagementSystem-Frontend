import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:5063/api';

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Auth/login`, data);
  }

  // 👥 EMPLOYEES
  getEmployees(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Employee`);
  }

  addEmployee(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Employee`, data);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Employee/${id}`);
  }

  // 📋 ALL LEAVES (ADMIN)
  getLeaves(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Leave`);
  }

  approveLeave(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/Leave/approve/${id}`, {});
  }

  rejectLeave(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/Leave/reject/${id}`, {});
  }

  // 🔥 GET USER (SAFE METHOD)
  private getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // 📝 APPLY LEAVE
  applyLeave(data: any): Observable<any> {
    const user = this.getUser();

    if (!user || !user.id) {
      throw new Error('User not logged in properly');
    }

    const payload = {
      ...data,
      employeeId: user.id
    };

    return this.http.post(`${this.baseUrl}/Leave/apply`, payload);
  }

  // 👤 MY LEAVES
  getMyLeaves(): Observable<any> {
    const user = this.getUser();

    if (!user || !user.id) {
      throw new Error('User not found');
    }

    return this.http.get(`${this.baseUrl}/Leave/history/${user.id}`);
  }

  // 🔥 LEAVE BALANCE
  getLeaveBalance(): Observable<any> {
    const user = this.getUser();

    if (!user || !user.id) {
      throw new Error('User not found');
    }

    return this.http.get(`${this.baseUrl}/Leave/balance/${user.id}`);
  }
}