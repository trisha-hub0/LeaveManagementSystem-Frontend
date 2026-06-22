import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user || !user.role) {
    router.navigate(['/login/admin']);
    return false;
  }

  const path = route.routeConfig?.path;

  if (path === 'admin' && user.role !== 'Admin') {
    router.navigate(['/employee']);
    return false;
  }

  if (path === 'employee' && user.role !== 'Employee') {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};