import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit, OnDestroy {

  leaveType = 'PL';
  fromDate = '';
  toDate = '';
  reason = '';

  myLeaves: any[] = [];
  balance: any = { PL: 0, SL: 0, CL: 0 };

  message = '';
  loading = false;

  intervalId: any;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.refreshData();

    // 🔥 Auto refresh (optional but useful)
    this.intervalId = setInterval(() => {
      this.refreshData();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // 🔥 COMMON REFRESH METHOD
  refreshData() {
    this.loadMyLeaves();
    this.loadBalance();
  }

  loadMyLeaves() {
    this.api.getMyLeaves().subscribe({
      next: (res) => {
        console.log('MY LEAVES:', res); // 🔥 DEBUG
        this.myLeaves = res || [];
      },
      error: (err) => {
        console.error('Error loading leaves:', err);
        this.myLeaves = [];
      }
    });
  }

  loadBalance() {
    this.api.getLeaveBalance().subscribe({
      next: (res) => {
        console.log('BALANCE:', res); // 🔥 DEBUG
        this.balance = res || { PL: 0, SL: 0, CL: 0 };
      },
      error: (err) => {
        console.error('Error loading balance:', err);
        this.balance = { PL: 0, SL: 0, CL: 0 };
      }
    });
  }

  getDays(): number {
    if (!this.fromDate || !this.toDate) return 0;

    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);

    const diff = (to.getTime() - from.getTime()) / (1000 * 3600 * 24);
    return diff >= 0 ? diff + 1 : 0;
  }

  applyLeave() {

    this.message = '';

    if (!this.fromDate || !this.toDate || !this.reason) {
      this.message = 'Fill all fields';
      return;
    }

    if (this.fromDate > this.toDate) {
      this.message = 'Invalid date range';
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (this.fromDate < today) {
      this.message = 'Cannot apply for past dates';
      return;
    }

    const days = this.getDays();

    if (this.leaveType === 'PL' && days > this.balance.PL) {
      this.message = 'Not enough PL balance';
      return;
    }

    if (this.leaveType === 'SL' && days > this.balance.SL) {
      this.message = 'Not enough SL balance';
      return;
    }

    if (this.leaveType === 'CL' && days > this.balance.CL) {
      this.message = 'Not enough CL balance';
      return;
    }

    this.loading = true;

    const data = {
      leaveType: this.leaveType,
      fromDate: this.fromDate,
      toDate: this.toDate,
      reason: this.reason
    };

    this.api.applyLeave(data).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Leave applied successfully';

        // 🔥 instant refresh
        this.refreshData();

        // reset form
        this.fromDate = '';
        this.toDate = '';
        this.reason = '';
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.message = err?.error?.message || 'Error applying leave';
      }
    });
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login/employee']);
  }
}