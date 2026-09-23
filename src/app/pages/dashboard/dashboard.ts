import { CareerService } from '../../services/career.service';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { RoadmapService } from '../../services/roadmap.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  userName = 'Student';

  profile: any = null;

  isLoading = true;

  errorMessage = '';

  roadmaps: any[] = [];

  roadmapLoading = false;

  careerId: number | null = null;


  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private roadmapService: RoadmapService,
    private careerService: CareerService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) { }


  ngOnInit(): void {

    const user = this.authService.getUser();

    if (!user?.id) {

      this.isLoading = false;

      this.changeDetectorRef.detectChanges();

      this.router.navigate(['/login']);

      return;
    }

    this.userName = user.name || 'Student';

    this.loadProfile(user.id);

    this.loadRoadmaps(user.id);

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd &&
            event.urlAfterRedirects === '/dashboard'
        )
      )
      .subscribe(() => {

        const currentUser =
          this.authService.getUser();

        if (currentUser?.id) {

          this.loadRoadmaps(
            currentUser.id
          );

        }

      });
  }


  private loadProfile(userId: number): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.profile = null;

    this.changeDetectorRef.detectChanges();


    this.profileService
      .getProfile(userId)
      .subscribe({

        next: (profile) => {

          this.profile = profile;

          this.isLoading = false;

          this.errorMessage = '';

          this.changeDetectorRef.detectChanges();

        },


        error: (error) => {

          this.profile = null;

          this.isLoading = false;


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
              'Unable to load your profile information.';

          }


          this.changeDetectorRef.detectChanges();

        }

      });

  }


  private loadRoadmaps(userId: number): void {

    this.roadmapLoading = true;

    this.changeDetectorRef.detectChanges();


    this.roadmapService
      .getStudentRoadmaps(userId)
      .subscribe({

        next: (roadmaps) => {

          this.roadmaps =
            roadmaps || [];

          this.careerId =
            this.roadmaps.length > 0
              ? this.roadmaps[0]?.career?.id ?? null
              : null;


          this.roadmapLoading = false;

          this.changeDetectorRef.detectChanges();

        },


        error: (error) => {


          this.roadmaps = [];

          this.careerId = null;

          this.roadmapLoading = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  getProfileCompletion(): number {

    if (!this.profile) {

      return 0;

    }


    const fields = [

      this.profile.educationLevel,

      this.profile.currentClass,

      this.profile.stream,

      this.profile.subjects,

      this.profile.interests,

      this.profile.strengths,

      this.profile.skills,

      this.profile.careerGoals

    ];


    const completedFields =
      fields.filter(

        field =>
          field !== null &&
          field !== undefined &&
          String(field).trim().length > 0

      ).length;


    return Math.round(
      (completedFields / fields.length) * 100
    );

  }


  getEducationLabel(): string {

    if (!this.profile?.educationLevel) {

      return 'Not provided';

    }


    const value =
      String(
        this.profile.educationLevel
      ).replace(/_/g, ' ');


    return value.replace(
      /\b\w/g,
      (letter: string) =>
        letter.toUpperCase()
    );

  }


  getInterests(): string[] {

    if (!this.profile?.interests) {

      return [];

    }


    return String(
      this.profile.interests
    )
      .split(',')
      .map(
        item => item.trim()
      )
      .filter(
        item => item.length > 0
      );

  }


  getSkills(): string[] {

    if (!this.profile?.skills) {

      return [];

    }


    return String(
      this.profile.skills
    )
      .split(',')
      .map(
        item => item.trim()
      )
      .filter(
        item => item.length > 0
      );

  }


  getRoadmapSteps(roadmap: any): any[] {

    if (!roadmap?.roadmapData) {

      return [];

    }


    try {

      const data =
        typeof roadmap.roadmapData === 'string'
          ? JSON.parse(roadmap.roadmapData)
          : roadmap.roadmapData;


      return data?.steps || [];

    } catch (error) {


      return [];

    }

  }


  getCompletedRoadmapSteps(
    roadmap: any
  ): number {

    return this.getRoadmapSteps(roadmap)
      .filter(
        step =>
          step.status === 'COMPLETED'
      )
      .length;

  }


  getRoadmapProgress(
    roadmap: any
  ): number {

    const steps =
      this.getRoadmapSteps(roadmap);


    if (steps.length === 0) {

      return 0;

    }


    const completed =
      this.getCompletedRoadmapSteps(
        roadmap
      );


    return Math.round(
      (completed / steps.length) * 100
    );

  }


  goToProfile(): void {

    this.router.navigate([
      '/profile'
    ]);

  }


  goToCareerExplorer(): void {

    this.router.navigate([
      '/career-explorer'
    ]);

  }


  goToCareerPathway(): void {

    if (this.careerId !== null) {
      this.router.navigate([
        '/career-pathway',
        this.careerId
      ]);

      return;
    }

    const careerGoal =
      this.profile?.careerGoals?.trim();

    if (!careerGoal) {
      return;
    }

    this.careerService
      .getAllCareers()
      .subscribe({

        next: (careers) => {

          const career =
            careers.find(
              item =>
                item.title?.trim().toLowerCase() ===
                careerGoal.toLowerCase()
            );

          if (!career) {
            return;
          }

          this.careerId = career.id;

          this.router.navigate([
            '/career-pathway',
            career.id
          ]);

        },

        error: () => {
          return;
        }

      });

  }

}