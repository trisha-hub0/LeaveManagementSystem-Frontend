import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  username: string = '';
  password: string = '';
  loginType: string = 'admin';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.router.url.includes('employee')) {
      this.loginType = 'employee';
    } else {
      this.loginType = 'admin';
    }
  }

  login(): void {
    const data = {
      username: this.username,
      password: this.password
    };

    this.api.login(data).subscribe({
      next: (res: any) => {

        // role validation
        if (this.loginType === 'admin' && res.role !== 'Admin') {
          alert('Not an Admin account');
          return;
        }

        if (this.loginType === 'employee' && res.role !== 'Employee') {
          alert('Not an Employee account');
          return;
        }

        // store user
        localStorage.setItem('user', JSON.stringify(res));

        // navigation
        if (res.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/employee']);
        }
      },
      error: () => {
        alert('Login failed');
      }
    });
  }

  goAdmin(): void {
    this.router.navigate(['/login/admin']);
  }

  goEmployee(): void {
    this.router.navigate(['/login/employee']);
  }
}