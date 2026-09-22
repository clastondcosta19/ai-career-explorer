import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CareerMatch,
  SkillGapAnalysis,
  CareerAnalysisResult
} from '../models/analysis.model';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  private readonly apiUrl =
    'http://localhost:8080/api/analysis';

  private readonly careerAnalysisUrl =
    'http://localhost:8080/api/career-analysis';

  private readonly aiGuidanceUrl =
    'http://localhost:8080/api/ai-guidance';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getCareerMatches(
    userId: number
  ): Observable<CareerMatch[]> {

    return this.http.get<CareerMatch[]>(
      `${this.apiUrl}/${userId}`
    );
  }

  getSkillGap(
    userId: number,
    careerId: number
  ): Observable<SkillGapAnalysis> {

    return this.http.get<SkillGapAnalysis>(
      `${this.apiUrl}/${userId}/career/${careerId}/skills`
    );
  }

  getCareerAnalysis(
    userId: number,
    careerId: number
  ): Observable<CareerAnalysisResult> {

    return this.http.get<CareerAnalysisResult>(
      `${this.careerAnalysisUrl}/${userId}/career/${careerId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  askAiGuidance(
    userId: number,
    careerId: number,
    question: string
  ): Observable<string> {

    return this.http.post(
      `${this.aiGuidanceUrl}/ask`,
      {
        userId: userId,
        careerId: careerId,
        question: question
      },
      {
        headers: this.getAuthHeaders(),
        responseType: 'text'
      }
    );
  }
}