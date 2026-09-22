import { Component } from '@angular/core';

import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import {
    Router,
    RouterLink
} from '@angular/router';

import {
    AuthService,
    LoginRequest,
    UserResponse
} from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink
    ],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {

    showPassword = false;

    isSubmitting = false;

    errorMessage = '';

    successMessage = '';

    loginForm;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {

        this.loginForm =
            this.formBuilder.group({

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
                        Validators.required
                    ]
                ]

            });
    }

    get email() {

        return this.loginForm.controls.email;
    }

    get password() {

        return this.loginForm.controls.password;
    }

    togglePassword(): void {

        this.showPassword =
            !this.showPassword;
    }

    submit(): void {

        this.errorMessage = '';

        this.successMessage = '';

        if (this.loginForm.invalid) {

            this.loginForm.markAllAsTouched();

            return;
        }

        this.isSubmitting = true;

        const request: LoginRequest = {

            email:
                this.email.value ?? '',

            password:
                this.password.value ?? ''

        };

        this.authService
            .login(request)
            .subscribe({

                next: (response) => {

                    if (response?.token) {

                        this.authService.saveToken(
                            response.token
                        );

                    } else {

                        this.isSubmitting = false;

                        this.errorMessage =
                            'Login succeeded but no authentication token was received.';

                        return;
                    }

                    let user: UserResponse | null =
                        null;


                    if (response?.user?.id) {

                        user = {

                            id:
                                Number(
                                    response.user.id
                                ),

                            name:
                                response.user.name ||
                                'Student',

                            email:
                                response.user.email ||
                                request.email,

                            createdAt:
                                response.user.createdAt ||
                                ''

                        };

                    } else if (response?.id) {

                        user = {

                            id:
                                Number(
                                    response.id
                                ),

                            name:
                                response.name ||
                                'Student',

                            email:
                                response.email ||
                                request.email,

                            createdAt:
                                response.createdAt ||
                                ''

                        };

                    }

                    if (!user) {

                        this.authService.logout();

                        this.isSubmitting = false;

                        this.errorMessage =
                            'Login succeeded but user information was not received.';

                        return;
                    }

                    this.authService.saveUser(
                        user
                    );


                    this.isSubmitting = false;

                    this.successMessage =
                        'Login successful. Opening your dashboard...';

                    setTimeout(() => {

                        this.router.navigate(
                            ['/dashboard']
                        );

                    }, 500);
                },

                error: (error) => {

                    this.isSubmitting = false;


                    if (error?.status === 401) {

                        this.errorMessage =
                            'Invalid email or password.';

                    } else if (
                        error?.status === 400
                    ) {

                        this.errorMessage =
                            error?.error?.message ||
                            'Please check your information and try again.';

                    } else if (
                        error?.status === 0
                    ) {

                        this.errorMessage =
                            'Unable to connect to the server. Make sure the Spring Boot backend is running.';

                    } else {

                        this.errorMessage =
                            error?.error?.message ||
                            'Login failed. Please try again.';
                    }
                }

            });
    }
}