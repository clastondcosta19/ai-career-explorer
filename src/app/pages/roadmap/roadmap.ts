import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  RoadmapService
} from '../../services/roadmap.service';

import {
  StudentRoadmap,
  RoadmapData,
  RoadmapStep
} from '../../models/roadmap.model';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.html',
  styleUrl: './roadmap.css'
})
export class Roadmap implements OnInit {

  roadmap: StudentRoadmap | null = null;

  roadmapData: RoadmapData | null = null;

  isLoading = true;

  errorMessage = '';

  userId: number | null = null;

  careerId: number | null = null;

  updatingStep: number | null = null;

  cameFromCareerPathway = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roadmapService: RoadmapService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.cameFromCareerPathway =
      history.state?.from === 'career-pathway';

    const careerIdParam =
      this.route.snapshot.paramMap.get('careerId');

    const storedUser =
      localStorage.getItem('user');

    if (!careerIdParam || !storedUser) {

      this.errorMessage =
        'Unable to load the career roadmap.';

      this.isLoading = false;

      return;
    }

    const parsedCareerId =
      Number(careerIdParam);

    let user: any;

    try {

      user = JSON.parse(storedUser);

    } catch {

      this.errorMessage =
        'Your session information is invalid.';

      this.isLoading = false;

      return;
    }

    const parsedUserId =
      Number(user?.id);

    if (
      !Number.isFinite(parsedCareerId) ||
      !Number.isFinite(parsedUserId)
    ) {

      this.errorMessage =
        'Invalid roadmap information.';

      this.isLoading = false;

      return;
    }

    this.careerId =
      parsedCareerId;

    this.userId =
      parsedUserId;

    this.loadRoadmap(
      parsedUserId,
      parsedCareerId
    );
  }

  private loadRoadmap(
    userId: number,
    careerId: number
  ): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.roadmapService
      .getCareerRoadmap(
        userId,
        careerId
      )
      .subscribe({

        next: (roadmap) => {

          this.roadmap =
            roadmap;

          this.parseRoadmapData(
            roadmap.roadmapData
          );

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();
        },

        error: (error) => {

          console.error(
            'Roadmap loading error:',
            error
          );

          this.isLoading = false;

          if (
            error?.status === 401 ||
            error?.status === 403
          ) {

            this.errorMessage =
              'Your session has expired. Please log in again.';

          } else if (
            error?.status === 404
          ) {

            this.errorMessage =
              'No roadmap has been created for this career yet.';

          } else {

            this.errorMessage =
              'Unable to load the career roadmap.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  private parseRoadmapData(
    roadmapData: string
  ): void {

    if (!roadmapData) {

      this.roadmapData =
        null;

      return;
    }

    try {

      this.roadmapData =
        typeof roadmapData === 'string'
          ? JSON.parse(roadmapData)
          : roadmapData as any;

    } catch (error) {

      console.error(
        'Roadmap data parsing error:',
        error
      );

      this.roadmapData =
        null;

      this.errorMessage =
        'The roadmap data could not be displayed.';
    }
  }

  getSteps(): RoadmapStep[] {

    return this.roadmapData?.steps ?? [];
  }

  getProgressPercentage(): number {

    const steps =
      this.getSteps();

    if (steps.length === 0) {

      return 0;
    }

    const completedSteps =
      steps.filter(
        step =>
          step.status === 'COMPLETED'
      ).length;

    return Math.round(
      (completedSteps / steps.length) * 100
    );
  }

  getCompletedSteps(): number {

    return this.getSteps()
      .filter(
        step =>
          step.status === 'COMPLETED'
      )
      .length;
  }

  toggleStepStatus(
    step: RoadmapStep
  ): void {

    if (
      !this.userId ||
      !this.careerId ||
      this.updatingStep !== null
    ) {

      return;
    }

    const newStatus =
      step.status === 'COMPLETED'
        ? 'NOT_STARTED'
        : 'COMPLETED';

    this.updatingStep =
      step.step;

    this.changeDetectorRef.detectChanges();

    this.roadmapService
      .updateStepStatus(
        this.userId,
        this.careerId,
        step.step,
        newStatus
      )
      .subscribe({

        next: (updatedRoadmap) => {

          this.roadmap =
            updatedRoadmap;

          this.parseRoadmapData(
            updatedRoadmap.roadmapData
          );

          this.updatingStep =
            null;

          this.changeDetectorRef.detectChanges();
        },

        error: (error) => {

          this.updatingStep =
            null;

          this.errorMessage =
            'Unable to update this roadmap step. Please try again.';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  isStepUpdating(
    stepNumber: number
  ): boolean {

    return this.updatingStep === stepNumber;
  }


  goBack(): void {

    if (this.cameFromCareerPathway && this.careerId !== null) {

      this.router.navigate([
        '/career-pathway',
        this.careerId
      ]);

      return;
    }

    if (this.careerId !== null) {

      this.router.navigate([
        '/career-analysis',
        this.careerId
      ]);

      return;
    }

    this.router.navigate([
      '/career-explorer'
    ]);
  }


  goToExplorer(): void {

    this.router.navigate([
      '/career-explorer'
    ]);
  }
}
