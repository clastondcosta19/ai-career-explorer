import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Career {
    id: number;
    title: string;
    description: string;
    domain: string;
    careerFamily: string;
    role: string;
    requiredEducation: string;
    subjects: string;
    skills: string;
    interests: string;
    strengths: string;
    careerPaths: string;

    educationPrograms?: EducationProgram[];
    requiredSkills?: Skill[];
}

export interface EducationProgram {
    id: number;
    name: string;
    level: string;
    field: string;
    description: string;
    entryLevel: string;
    eligibility: string;
    subjects: string;
    typicalDuration: string;
}

export interface Skill {
    id: number;
    name: string;
    description: string;
    category: string;
}

@Injectable({
    providedIn: 'root'
})
export class CareerService {

    private readonly apiUrl =
        'http://localhost:8080/api/careers';

    constructor(
        private http: HttpClient
    ) { }

    getAllCareers(): Observable<Career[]> {
        return this.http.get<Career[]>(
            this.apiUrl
        );
    }

    getCareerById(id: number): Observable<Career> {
        return this.http.get<Career>(
            `${this.apiUrl}/${id}`
        );
    }

    searchCareers(
        title: string
    ): Observable<Career[]> {

        return this.http.get<Career[]>(
            `${this.apiUrl}/search`,
            {
                params: {
                    title
                }
            }
        );
    }

    getCareersByDomain(
        domain: string
    ): Observable<Career[]> {

        return this.http.get<Career[]>(
            `${this.apiUrl}/domain/${encodeURIComponent(domain)}`
        );
    }

    getCareersByFamily(
        careerFamily: string
    ): Observable<Career[]> {

        return this.http.get<Career[]>(
            `${this.apiUrl}/family/${encodeURIComponent(careerFamily)}`
        );
    }

    getCareersByRole(
        role: string
    ): Observable<Career[]> {

        return this.http.get<Career[]>(
            `${this.apiUrl}/role/${encodeURIComponent(role)}`
        );
    }


    getCareersByDomainAndFamily(
        domain: string,
        careerFamily: string
    ): Observable<Career[]> {

        return this.http.get<Career[]>(
            `${this.apiUrl}/domain/${encodeURIComponent(domain)}/family/${encodeURIComponent(careerFamily)}`
        );
    }
}