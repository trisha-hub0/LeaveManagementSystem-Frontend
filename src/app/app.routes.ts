import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { EmployeeComponent } from './employee/employee.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login/admin', pathMatch: 'full' },

  // login routes (same component, different role)
  { path: 'login/admin', component: LoginComponent },
  { path: 'login/employee', component: LoginComponent },

  // protected routes
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'employee', component: EmployeeComponent, canActivate: [authGuard] },

  // fallback
  { path: '**', redirectTo: 'login/admin' }
];