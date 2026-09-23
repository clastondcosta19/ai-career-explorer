import {
    Component,
    OnInit,
    ChangeDetectorRef,
    NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
    AssessmentQuestion as AssessmentQuestionComponent,
    AssessmentOption
} from '../../components/assessment-question/assessment-question';

import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

interface BackendAssessmentQuestion {
    id: number;
    question: string;
    category: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    active?: boolean;
    assessmentType?: string;
    careerFamily?: string | null;
    orderNumber?: number;
}

interface AssessmentQuestionData {
    id: number;
    question: string;
    description: string;
    options: AssessmentOption[];
}

@Component({
    selector: 'app-assessment',
    standalone: true,
    imports: [
        CommonModule,
        AssessmentQuestionComponent
    ],
    templateUrl: './assessment.html',
    styleUrl: './assessment.css'
})
export class Assessment implements OnInit {

    currentQuestionIndex = 0;

    answers: Record<number, string> = {};

    isCompleted = false;

    isLoading = true;

    isSaving = false;

    errorMessage = '';

    questions: AssessmentQuestionData[] = [];

    assessmentStage: 'CORE' | 'FAMILY' = 'CORE';

    currentCareerFamily = '';

    private readonly assessmentApiUrl =
        'https://ai-career-explorer-backend-production.up.railway.app/api/assessment';

    constructor(
        private router: Router,
        private http: HttpClient,
        private profileService: ProfileService,
        private authService: AuthService,
        private changeDetectorRef: ChangeDetectorRef,
        private ngZone: NgZone
    ) {}

    ngOnInit(): void {

        this.assessmentStage = 'CORE';

        this.currentCareerFamily = '';

        this.loadCoreQuestions();
    }

    private loadCoreQuestions(): void {

        this.isLoading = true;

        this.errorMessage = '';

        const token = this.authService.getToken();

        const user = this.authService.getUser();

        if (!token || !user) {

            this.isLoading = false;

            this.errorMessage =
                'Your session has expired. Please log in again.';

            this.changeDetectorRef.detectChanges();

            return;
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        this.http
            .get<BackendAssessmentQuestion[]>(
                `${this.assessmentApiUrl}/questions`,
                { headers }
            )
            .subscribe({

                next: (backendQuestions) => {

                    const mappedQuestions =
                        backendQuestions.map(
                            question =>
                                this.mapQuestion(question)
                        );

                    this.profileService
                        .getAssessmentResponses(user.id)
                        .subscribe({

                            next: (responses) => {

                                const restoredAnswers:
                                    Record<number, string> = {};

                                responses.forEach(response => {

                                    if (
                                        response.questionId &&
                                        response.selectedOption
                                    ) {

                                        restoredAnswers[
                                            response.questionId
                                        ] =
                                            response.selectedOption;
                                    }
                                });

                                this.ngZone.run(() => {

                                    this.questions =
                                        mappedQuestions;

                                    this.answers =
                                        restoredAnswers;

                                    this.currentQuestionIndex = 0;

                                    this.assessmentStage = 'CORE';

                                    this.isLoading = false;

                                    this.changeDetectorRef
                                        .detectChanges();
                                });
                            },

                            error: () => {

                                this.ngZone.run(() => {

                                    this.questions =
                                        mappedQuestions;

                                    this.answers = {};

                                    this.currentQuestionIndex = 0;

                                    this.assessmentStage = 'CORE';

                                    this.isLoading = false;

                                    this.errorMessage = '';

                                    this.changeDetectorRef
                                        .detectChanges();
                                });
                            }
                        });
                },

                error: (error) => {

                    this.ngZone.run(() => {

                        this.isLoading = false;

                        if (
                            error?.status === 401 ||
                            error?.status === 403
                        ) {

                            this.errorMessage =
                                'Your session has expired. Please log in again.';

                        } else {

                            this.errorMessage =
                                'Unable to load assessment questions.';
                        }

                        this.changeDetectorRef
                            .detectChanges();
                    });
                }
            });
    }

    private determineCareerFamily(): void {

        this.isLoading = true;

        this.errorMessage = '';

        const token = this.authService.getToken();

        const user = this.authService.getUser();

        if (!token || !user) {

            this.isLoading = false;

            this.errorMessage =
                'Your session has expired. Please log in again.';

            this.changeDetectorRef.detectChanges();

            return;
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        this.http
            .get(
                `${this.assessmentApiUrl}/${user.id}/career-family`,
                {
                    headers,
                    responseType: 'text'
                }
            )
            .subscribe({

                next: (careerFamily) => {

                    this.ngZone.run(() => {

                        this.currentCareerFamily =
                            careerFamily.trim();

                        this.isLoading = false;

                        this.loadFamilyQuestions();

                        this.changeDetectorRef
                            .detectChanges();
                    });
                },

                error: (error) => {

                    this.ngZone.run(() => {

                        this.isLoading = false;

                        if (
                            error?.status === 401 ||
                            error?.status === 403
                        ) {

                            this.errorMessage =
                                'Your session has expired. Please log in again.';

                        } else {

                            this.errorMessage =
                                'Unable to determine your career family.';
                        }

                        this.changeDetectorRef
                            .detectChanges();
                    });
                }
            });
    }

    private loadFamilyQuestions(): void {

        if (
            !this.currentCareerFamily ||
            this.currentCareerFamily.trim() === ''
        ) {

            this.errorMessage =
                'No career family was determined.';

            this.isLoading = false;

            this.changeDetectorRef.detectChanges();

            return;
        }

        this.isLoading = true;

        this.errorMessage = '';

        const token = this.authService.getToken();

        if (!token) {

            this.isLoading = false;

            this.errorMessage =
                'Your session has expired. Please log in again.';

            this.changeDetectorRef.detectChanges();

            return;
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        const encodedFamily =
            encodeURIComponent(
                this.currentCareerFamily
            );

        console.log(
            'LOADING FAMILY QUESTIONS:',
            this.currentCareerFamily
        );

        this.http
            .get<BackendAssessmentQuestion[]>(
                `${this.assessmentApiUrl}/family/${encodedFamily}/questions`,
                { headers }
            )
            .subscribe({

                next: (backendQuestions) => {

                    const mappedQuestions =
                        backendQuestions.map(
                            question =>
                                this.mapQuestion(question)
                        );

                    this.ngZone.run(() => {

                        if (mappedQuestions.length === 0) {

                            console.log(
                                'NO FAMILY QUESTIONS FOUND. COMPLETING CORE ASSESSMENT.'
                            );

                            this.questions = [];

                            this.isLoading = false;

                            this.isCompleted = true;

                            this.errorMessage = '';

                            this.changeDetectorRef
                                .detectChanges();

                            return;
                        }

                        this.questions =
                            mappedQuestions;

                        this.currentQuestionIndex = 0;

                        this.assessmentStage = 'FAMILY';

                        this.isLoading = false;

                        this.errorMessage = '';

                        console.log(
                            'FAMILY CAREER FAMILY:',
                            this.currentCareerFamily
                        );

                        console.log(
                            'FAMILY QUESTION COUNT:',
                            this.questions.length
                        );

                        this.changeDetectorRef
                            .detectChanges();
                    });
                },

                error: (error) => {

                    console.error(
                        'FAMILY ASSESSMENT LOAD ERROR:',
                        error
                    );

                    this.ngZone.run(() => {

                        this.isLoading = false;

                        if (
                            error?.status === 401 ||
                            error?.status === 403
                        ) {

                            this.errorMessage =
                                'Your session has expired. Please log in again.';

                        } else {

                            this.errorMessage =
                                'Unable to load family assessment questions.';
                        }

                        this.changeDetectorRef
                            .detectChanges();
                    });
                }
            });
    }

    private mapQuestion(
        question: BackendAssessmentQuestion
    ): AssessmentQuestionData {

        return {

            id: question.id,

            question: question.question,

            description: question.category,

            options: [

                {
                    value: 'A',
                    label: question.optionA
                },

                {
                    value: 'B',
                    label: question.optionB
                },

                {
                    value: 'C',
                    label: question.optionC
                },

                {
                    value: 'D',
                    label: question.optionD
                }
            ]
        };
    }

    get currentQuestion(): AssessmentQuestionData | null {

        if (this.questions.length === 0) {
            return null;
        }

        return this.questions[
            this.currentQuestionIndex
        ];
    }

    get totalQuestions(): number {
        return this.questions.length;
    }

    get selectedAnswer(): string | null {

        if (!this.currentQuestion) {
            return null;
        }

        return this.answers[
            this.currentQuestion.id
        ] || null;
    }

    get answeredCount(): number {
        return Object.keys(this.answers).length;
    }

    get isFirstQuestion(): boolean {
        return this.currentQuestionIndex === 0;
    }

    get isLastQuestion(): boolean {

        return (
            this.currentQuestionIndex ===
            this.questions.length - 1
        );
    }

    get assessmentTitle(): string {

        if (this.assessmentStage === 'CORE') {

            return 'Core Career Assessment';
        }

        return `${this.currentCareerFamily} Assessment`;
    }

    get assessmentDescription(): string {

        if (this.assessmentStage === 'CORE') {

            return 'Answer a few questions about your interests, strengths, preferences and goals. Your responses will help us understand your career direction.';
        }

        return `These questions help us understand your interests and strengths related to ${this.currentCareerFamily}.`;
    }

    selectAnswer(answer: string): void {

        if (
            this.isSaving ||
            !this.currentQuestion
        ) {

            return;
        }

        this.answers[
            this.currentQuestion.id
        ] = answer;

        this.changeDetectorRef.detectChanges();
    }

    nextQuestion(): void {

        if (
            !this.selectedAnswer ||
            this.isSaving ||
            !this.currentQuestion
        ) {

            return;
        }

        const user = this.authService.getUser();

        if (!user) {

            this.errorMessage =
                'Your session has expired. Please log in again.';

            this.changeDetectorRef.detectChanges();

            return;
        }

        const questionId =
            this.currentQuestion.id;

        const selectedOption =
            this.selectedAnswer;

        this.isSaving = true;

        this.errorMessage = '';

        this.changeDetectorRef.detectChanges();

        this.profileService
            .saveAssessmentResponse(
                user.id,
                questionId,
                selectedOption
            )
            .subscribe({

                next: () => {

                    this.ngZone.run(() => {

                        this.isSaving = false;

                        if (
                            this.currentQuestionIndex >=
                            this.questions.length - 1
                        ) {

                            if (
                                this.assessmentStage ===
                                'CORE'
                            ) {

                                this.determineCareerFamily();

                                return;
                            }

                            this.isCompleted = true;

                            this.changeDetectorRef
                                .detectChanges();

                            return;
                        }

                        this.currentQuestionIndex++;

                        this.changeDetectorRef
                            .detectChanges();

                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    });
                },

                error: (error) => {

                    this.ngZone.run(() => {

                        this.isSaving = false;

                        if (
                            error?.status === 401 ||
                            error?.status === 403
                        ) {

                            this.errorMessage =
                                'Your session has expired. Please log in again.';

                        } else {

                            this.errorMessage =
                                'Unable to save your answer. Please try again.';
                        }

                        this.changeDetectorRef
                            .detectChanges();
                    });
                }
            });
    }

    previousQuestion(): void {

        if (
            this.isFirstQuestion ||
            this.isSaving
        ) {

            return;
        }

        this.currentQuestionIndex--;

        this.changeDetectorRef.detectChanges();

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    finishAssessment(): void {

        this.isSaving = false;

        this.isCompleted = true;

        this.changeDetectorRef.detectChanges();

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    restartAssessment(): void {

        this.currentQuestionIndex = 0;

        this.answers = {};

        this.isCompleted = false;

        this.isSaving = false;

        this.errorMessage = '';

        this.assessmentStage = 'CORE';

        this.currentCareerFamily = '';

        this.changeDetectorRef.detectChanges();

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        this.loadCoreQuestions();
    }

    goToDashboard(): void {

        this.router.navigate([
            '/dashboard'
        ]);
    }

    goToCareerExplorer(): void {

        this.router.navigate([
            '/career-explorer'
        ]);
    }
}