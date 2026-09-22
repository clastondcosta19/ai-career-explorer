import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Career,
  CareerService
} from '../../services/career.service';

import {
  AnalysisService
} from '../../services/analysis.service';

import {
  CareerMatch,
  SkillGapAnalysis,
  CareerAnalysisResult
} from '../../models/analysis.model';

import {
  RoadmapService
} from '../../services/roadmap.service';

@Component({
  selector: 'app-career-analysis',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './career-analysis.html',
  styleUrl: './career-analysis.css'
})
export class CareerAnalysis implements OnInit {

  career: Career | null = null;

  match: CareerMatch | null = null;

  skillGap: SkillGapAnalysis | null = null;

  careerAnalysis: CareerAnalysisResult | null = null;

  isLoading = true;
  errorMessage = '';

  isGeneratingRoadmap = false;
  roadmapMessage = '';

  private currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private careerService: CareerService,
    private analysisService: AnalysisService,
    private roadmapService: RoadmapService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    const careerId =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (
      !careerId ||
      Number.isNaN(careerId)
    ) {
      this.errorMessage =
        'Invalid career selected.';

      this.isLoading = false;

      return;
    }

    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {

      this.errorMessage =
        'Please log in to analyze your career fit.';

      this.isLoading = false;

      return;
    }

    let userId: number;

    try {

      const user =
        JSON.parse(storedUser);

      userId = Number(user.id);

    } catch {

      this.errorMessage =
        'Unable to identify the logged-in user.';

      this.isLoading = false;

      return;
    }

    if (
      !userId ||
      Number.isNaN(userId)
    ) {

      this.errorMessage =
        'Unable to identify the logged-in user.';

      this.isLoading = false;

      return;
    }

    this.currentUserId = userId;

    this.loadAnalysis(
      userId,
      careerId
    );
  }

  loadAnalysis(
    userId: number,
    careerId: number
  ): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.careerService
      .getCareerById(careerId)
      .subscribe({

        next: (career) => {

          this.career = career;

          this.changeDetectorRef.detectChanges();

          this.loadCareerMatch(
            userId,
            careerId
          );

          this.loadSkillGap(
            userId,
            careerId
          );

          this.loadDetailedCareerAnalysis(
            userId,
            careerId
          );
        },

        error: (error) => {

          this.isLoading = false;

          if (error?.status === 404) {

            this.errorMessage =
              'The selected career could not be found.';

          } else if (error?.status === 0) {

            this.errorMessage =
              'Unable to connect to the server. Make sure the Spring Boot backend is running.';

          } else {

            this.errorMessage =
              error?.error?.message ||
              'Unable to load career information.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  loadCareerMatch(
    userId: number,
    careerId: number
  ): void {

    console.log(
      'Requesting career matches for user:',
      userId
    );

    this.analysisService
      .getCareerMatches(userId)
      .subscribe({

        next: (matches) => {

          this.match =
            matches.find(
              item =>
                Number(item.careerId) ===
                careerId
            ) || null;


          if (!this.match) {

          }

          this.checkLoadingComplete();
        },

        error: (error) => {

          this.errorMessage =
            error?.error?.message ||
            'Unable to analyze your career fit.';

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  loadSkillGap(
    userId: number,
    careerId: number
  ): void {

    this.analysisService
      .getSkillGap(
        userId,
        careerId
      )
      .subscribe({

        next: (skillGap) => {

          this.skillGap =
            skillGap;

          this.checkLoadingComplete();
        },

        error: (error) => {

          this.errorMessage =
            error?.error?.message ||
            'Unable to analyze your skill gap.';

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  loadDetailedCareerAnalysis(
    userId: number,
    careerId: number
  ): void {

    this.analysisService
      .getCareerAnalysis(
        userId,
        careerId
      )
      .subscribe({

        next: (analysis) => {

          this.careerAnalysis =
            analysis;

          this.checkLoadingComplete();
        },

        error: (error) => {

          this.errorMessage =
            error?.error?.message ||
            'Unable to load the detailed career analysis.';

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  private checkLoadingComplete(): void {

    if (
      this.career &&
      this.match &&
      this.skillGap &&
      this.careerAnalysis
    ) {

      console.log(
        'Career analysis loaded successfully.'
      );

      this.isLoading = false;

      this.changeDetectorRef.detectChanges();
    }
  }

  goBack(): void {

    this.router.navigate([
      '/career-details',
      this.career?.id
    ]);
  }

  goToExplorer(): void {

    this.router.navigate([
      '/career-explorer'
    ]);
  }

  goToAiGuidance(): void {

    if (!this.career) {
      return;
    }

    this.router.navigate([
      '/ai-guidance',
      this.career.id
    ]);
  }

  generateOrRenewRoadmap(): void {

    if (
      !this.career?.id ||
      !this.currentUserId ||
      this.isGeneratingRoadmap
    ) {
      return;
    }

    this.isGeneratingRoadmap = true;
    this.roadmapMessage = '';
    this.errorMessage = '';

    console.log(
      'Generating/renewing roadmap for:',
      {
        userId: this.currentUserId,
        careerId: this.career.id
      }
    );

    this.roadmapService
      .generateRoadmap(
        this.currentUserId,
        this.career.id
      )
      .subscribe({

        next: (roadmap) => {

          this.isGeneratingRoadmap = false;

          this.roadmapMessage =
            'Your roadmap has been generated successfully.';

          this.changeDetectorRef.detectChanges();

          this.router.navigate([
            '/roadmap',
            this.career?.id
          ]);
        },

        error: (error) => {

          this.isGeneratingRoadmap = false;

          if (
            error?.status === 401 ||
            error?.status === 403
          ) {

            this.errorMessage =
              'Your session has expired. Please log in again.';

          } else if (error?.status === 0) {

            this.errorMessage =
              'Unable to connect to the server. Make sure the Spring Boot backend is running.';

          } else {

            this.errorMessage =
              error?.error?.message ||
              'Unable to generate the career roadmap.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  getScore(): number {

    return this.match?.compatibilityScore ?? 0;
  }

  getConfidence(): string {

    return this.match?.confidence ?? 'Unknown';
  }

  getMatchedFactors(): string[] {

    return this.match?.matchedFactors ?? [];
  }

  getMatchedSkills(): string[] {

    return this.skillGap?.matchedSkills ?? [];
  }

  getMissingSkills(): string[] {

    return this.skillGap?.missingSkills ?? [];
  }

  getSkillPercentage(): number {

    return this.skillGap?.skillMatchPercentage ?? 0;
  }

  getEducationScore(): number {

    return this.match?.educationScore ?? 0;
  }

  getEducationExplanation(): string {

    return this.careerAnalysis?.educationExplanation ??
      'Your education profile is being compared with the typical education requirements for this career.';
  }

  goToRoadmap(): void {

    if (!this.career?.id) {
      return;
    }

    this.router.navigate([
      '/roadmap',
      this.career.id
    ]);
  }

  getInitial(): string {

    if (!this.career?.title) {
      return '?';
    }

    return this.career.title
      .charAt(0)
      .toUpperCase();
  }
}