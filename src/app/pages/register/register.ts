import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  AuthService,
  RegisterRequest
} from '../../services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  showPassword = false;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  registerForm;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]
    });
  }

  get name() {
    return this.registerForm.controls.name;
  }

  get email() {
    return this.registerForm.controls.email;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get confirmPassword() {
    return this.registerForm.controls.confirmPassword;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  passwordsMatch(): boolean {
    return this.password.value === this.confirmPassword.value;
  }

  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.passwordsMatch()) {
      this.confirmPassword.markAsTouched();
      return;
    }

    this.isSubmitting = true;

    const request: RegisterRequest = {
      name: this.name.value ?? '',
      email: this.email.value ?? '',
      password: this.password.value ?? ''
    };

    this.authService.register(request).subscribe({

      next: (response) => {

        this.isSubmitting = false;

        this.successMessage =
          'Account created successfully. Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },

      error: (error) => {

        this.isSubmitting = false;

        if (error.status === 409) {

          this.errorMessage =
            'An account with this email already exists.';

        } else if (error.status === 400) {

          this.errorMessage =
            error.error?.message ||
            'Please check your information and try again.';

        } else if (error.status === 0) {

          this.errorMessage =
            'Unable to connect to the server. Make sure the Spring Boot backend is running.';

        } else {

          this.errorMessage =
            error.error?.message ||
            'Registration failed. Please try again.';
        }
      }

    });
  }
}