import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ProfileRequest {
  educationLevel: string;
  currentClass: string;
  stream: string;
  subjects: string;
  interests: string;
  strengths: string;
  skills: string;
  careerGoals: string;
}

export interface AssessmentResponse {
  id: number;
  questionId: number;
  selectedOption: string;
}

interface BackendAssessmentResponse {
  id: number;
  selectedOption: string;
  question?: {
    id: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private readonly apiUrl =
    'http://localhost:8080/api/profile';

  private readonly assessmentApiUrl =
    'http://localhost:8080/api/assessment';

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


  saveProfile(
    userId: number,
    profile: ProfileRequest
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${userId}`,
      profile,
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  getProfile(
    userId: number
  ): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/${userId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  addStudentSkill(
    userId: number,
    skillId: number
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${userId}/skills/${skillId}`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  removeStudentSkill(
    userId: number,
    skillId: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${userId}/skills/${skillId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  saveAssessmentResponse(
    userId: number,
    questionId: number,
    selectedOption: string
  ): Observable<AssessmentResponse> {

    return this.http.post<AssessmentResponse>(
      `${this.assessmentApiUrl}/${userId}/questions/${questionId}/response`,
      {
        selectedOption: selectedOption
      },
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  getAssessmentResponses(
    userId: number
  ): Observable<AssessmentResponse[]> {

    return this.http
      .get<BackendAssessmentResponse[]>(
        `${this.assessmentApiUrl}/${userId}/responses`,
        {
          headers: this.getAuthHeaders()
        }
      )
      .pipe(
        map(responses =>
          responses
            .filter(
              response =>
                response.question?.id != null &&
                response.selectedOption != null
            )
            .map(response => ({
              id: response.id,
              questionId: response.question!.id,
              selectedOption: response.selectedOption
            }))
        )
      );
  }
}
