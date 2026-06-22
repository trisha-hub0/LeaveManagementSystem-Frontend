import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  employees: any[] = [];
  filteredEmployees: any[] = [];
  leaves: any[] = [];

  username = '';
  password = '';
  role = 'Employee';

  searchText = '';
  selectedRole = '';

  fromDateFilter = '';
  toDateFilter = '';

  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  message = '';
  loading = false;

  // 🔥 Charts
  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie'> = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{ data: [0, 0, 0] }]
  };

  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Leaves' }]
  };

  constructor(private api: ApiService, private router: Router) {
    Chart.register(...registerables); // ✅ FIX 1 (IMPORTANT)
  }

  ngOnInit() {
    this.loadEmployees();
    this.loadLeaves();
  }

  loadEmployees() {
    this.api.getEmployees().subscribe(res => {
      this.employees = res;
      this.filteredEmployees = res;
    });
  }

  loadLeaves() {
    this.api.getLeaves().subscribe(res => {
      this.leaves = res;

      this.pendingCount = this.leaves.filter(l => l.status === 'Pending').length;
      this.approvedCount = this.leaves.filter(l => l.status === 'Approved').length;
      this.rejectedCount = this.leaves.filter(l => l.status === 'Rejected').length;

      // ✅ FIX 2 (avoid Angular error)
      setTimeout(() => {
        this.updateCharts();
      });
    });
  }

  // 🔥 FIX 3 (IMPORTANT - reassign object)
  updateCharts() {
    this.pieChartData = {
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [{
        data: [
          this.pendingCount,
          this.approvedCount,
          this.rejectedCount
        ]
      }]
    };

    const countMap: any = {};
    this.leaves.forEach(l => {
      countMap[l.employeeName] = (countMap[l.employeeName] || 0) + 1;
    });

    this.barChartData = {
      labels: Object.keys(countMap),
      datasets: [{
        data: Object.values(countMap),
        label: 'Leaves'
      }]
    };
  }

  filterEmployees() {
    this.filteredEmployees = this.employees.filter(emp =>
      emp.username.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.selectedRole === '' || emp.role === this.selectedRole)
    );
  }

  filterLeavesByDate() {
    this.loadLeaves();

    this.leaves = this.leaves.filter(l =>
      (!this.fromDateFilter || l.fromDate >= this.fromDateFilter) &&
      (!this.toDateFilter || l.toDate <= this.toDateFilter)
    );
  }

  addEmployee() {
    if (!this.username || !this.password) {
      this.message = 'Fill all fields';
      return;
    }

    this.loading = true;

    this.api.addEmployee({
      username: this.username,
      password: this.password,
      role: this.role
    }).subscribe(() => {
      this.loading = false;
      this.message = 'Employee added';
      this.loadEmployees();
      this.username = '';
      this.password = '';
    });
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure?')) {
      this.api.deleteEmployee(id).subscribe(() => {
        this.message = 'Deleted';
        this.loadEmployees();
      });
    }
  }

  approve(id: number) {
    this.api.approveLeave(id).subscribe(() => this.loadLeaves());
  }

  reject(id: number) {
    this.api.rejectLeave(id).subscribe(() => this.loadLeaves());
  }

  exportAllExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.leaves);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'all_leaves.xlsx');
  }

  exportAllPDF() {
    const doc = new jsPDF();

    const data = this.leaves.map(l => [
      l.id,
      l.employeeName,
      l.leaveType,
      l.fromDate,
      l.toDate,
      l.status
    ]);

    autoTable(doc, {
      head: [['ID', 'Employee', 'Type', 'From', 'To', 'Status']],
      body: data
    });

    doc.save('all_leaves.pdf');
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login/admin']);
  }
}