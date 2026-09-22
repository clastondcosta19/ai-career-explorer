import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: UserResponse;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly apiUrl =
        'https://ai-career-explorer-backend-production.up.railway.app/api/auth';

    constructor(
        private http: HttpClient
    ) {}

    register(
        request: RegisterRequest
    ): Observable<any> {

        return this.http.post(
            `${this.apiUrl}/register`,
            request
        );
    }

    login(
        request: LoginRequest
    ): Observable<any> {

        return this.http.post(
            `${this.apiUrl}/login`,
            request
        );
    }

    saveToken(token: string): void {

        localStorage.setItem(
            'token',
            token
        );
    }

    saveUser(user: UserResponse): void {

        localStorage.setItem(
            'user',
            JSON.stringify(user)
        );
    }

    getUser(): UserResponse | null {

        const storedUser =
            localStorage.getItem('user');

        if (!storedUser) {
            return null;
        }

        try {

            return JSON.parse(
                storedUser
            ) as UserResponse;

        } catch {

            return null;
        }
    }

    getToken(): string | null {

        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {

        const token =
            this.getToken();

        const user =
            this.getUser();

        return !!token && !!user;
    }

    logout(): void {

        localStorage.removeItem('token');

        localStorage.removeItem('user');
    }
}