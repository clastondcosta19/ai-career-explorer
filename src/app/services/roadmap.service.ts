import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  StudentRoadmap
} from '../models/roadmap.model';

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {

  private readonly apiUrl =
    'https://ai-career-explorer-backend-production.up.railway.app/api/roadmaps';

  constructor(
    private http: HttpClient
  ) {}

  private getAuthHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  generateRoadmap(
    userId: number,
    careerId: number
  ): Observable<StudentRoadmap> {

    return this.http.post<StudentRoadmap>(
      `${this.apiUrl}/${userId}/career/${careerId}`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getStudentRoadmaps(
    userId: number
  ): Observable<StudentRoadmap[]> {

    return this.http.get<StudentRoadmap[]>(
      `${this.apiUrl}/${userId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getCareerRoadmap(
    userId: number,
    careerId: number
  ): Observable<StudentRoadmap> {

    return this.http.get<StudentRoadmap>(
      `${this.apiUrl}/${userId}/career/${careerId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  updateStepStatus(
    userId: number,
    careerId: number,
    stepNumber: number,
    status: string
  ): Observable<StudentRoadmap> {

    return this.http.patch<StudentRoadmap>(
      `${this.apiUrl}/${userId}/career/${careerId}/step/${stepNumber}?status=${status}`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    );
  }
}