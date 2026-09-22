import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
    Career,
    CareerService,
    EducationProgram
} from '../../services/career.service';

import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-career-details',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './career-details.html',
    styleUrl: './career-details.css'
})
export class CareerDetails implements OnInit {

    career: Career | null = null;

    isLoading = true;
    errorMessage = '';

    educationLevel = '';
    currentClass = '';
    stream = '';
    studentSubjects = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private careerService: CareerService,
        private profileService: ProfileService,
        private authService: AuthService,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {

        const careerId =
            Number(this.route.snapshot.paramMap.get('id'));

        if (!careerId || Number.isNaN(careerId)) {

            this.errorMessage = 'Invalid career selected.';
            this.isLoading = false;

            this.changeDetectorRef.detectChanges();

            return;
        }

        this.loadCareer(careerId);
        this.loadStudentProfile();
    }

    loadCareer(id: number): void {

        this.isLoading = true;
        this.errorMessage = '';

        this.careerService.getCareerById(id).subscribe({

            next: (career: Career) => {

                this.career = career;

                this.isLoading = false;

                this.changeDetectorRef.detectChanges();

            },

            error: (error) => {

                this.career = null;
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
                        'Unable to load career details.';
                }

                this.changeDetectorRef.detectChanges();

            }
        });
    }

    loadStudentProfile(): void {

        const user = this.authService.getUser();

        if (!user?.id) {

            return;
        }

        this.profileService.getProfile(user.id).subscribe({

            next: (profile) => {

                this.educationLevel =
                    profile?.educationLevel || '';

                this.currentClass =
                    profile?.currentClass || '';

                this.stream =
                    profile?.stream || '';

                this.studentSubjects =
                    profile?.subjects || '';

                this.changeDetectorRef.detectChanges();
            },

            error: (error) => {

                this.changeDetectorRef.detectChanges();
            }
        });
    }

    goBack(): void {

        this.router.navigate([
            '/career-explorer'
        ]);
    }

    analyzeCareer(): void {

        if (!this.career) {
            return;
        }

        this.router.navigate([
            '/career-analysis',
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

    getSkills(): string[] {

    if (
        this.career?.requiredSkills &&
        this.career.requiredSkills.length > 0
    ) {
        return this.career.requiredSkills
            .map(skill => skill.name)
            .filter(name => !!name);
    }

    if (!this.career?.skills) {
        return [];
    }

    return this.career.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
}

    getSubjects(): string[] {

        if (!this.career?.subjects) {
            return [];
        }

        return this.career.subjects
            .split(',')
            .map(subject => subject.trim())
            .filter(subject => subject.length > 0);
    }

    getInterests(): string[] {

        if (!this.career?.interests) {
            return [];
        }

        return this.career.interests
            .split(',')
            .map(interest => interest.trim())
            .filter(interest => interest.length > 0);
    }

    getStrengths(): string[] {

        if (!this.career?.strengths) {
            return [];
        }

        return this.career.strengths
            .split(',')
            .map(strength => strength.trim())
            .filter(strength => strength.length > 0);
    }

    getEducationPrograms(): EducationProgram[] {

        const programs =
            this.career?.educationPrograms ?? [];

        if (!this.educationLevel) {
            return programs;
        }

        if (
            this.educationLevel === 'higher_secondary' ||
            this.currentClass === 'class_12'
        ) {

            return this.sortProgramsForStudent(
                programs,
                'after 12th'
            );
        }

        if (
            this.educationLevel === 'secondary' ||
            this.currentClass === 'class_10'
        ) {

            return this.sortProgramsForStudent(
                programs,
                'after 10th'
            );
        }

        return programs;
    }

    private sortProgramsForStudent(
        programs: EducationProgram[],
        preferredEntryLevel: string
    ): EducationProgram[] {

        return [...programs].sort((a, b) => {

            const scoreA =
                this.getProgramMatchScore(
                    a,
                    preferredEntryLevel
                );

            const scoreB =
                this.getProgramMatchScore(
                    b,
                    preferredEntryLevel
                );

            return scoreB - scoreA;
        });
    }

    private getProgramMatchScore(
        program: EducationProgram,
        preferredEntryLevel: string
    ): number {

        let score = 0;

        const entryLevel =
            (program.entryLevel || '')
                .toLowerCase();

        const field =
            (program.field || '')
                .toLowerCase();

        const programSubjects =
            (program.subjects || '')
                .toLowerCase();

        const studentStream =
            (this.stream || '')
                .toLowerCase();

        const studentSubjects =
            (this.studentSubjects || '')
                .toLowerCase();

        if (
            entryLevel === preferredEntryLevel
        ) {

            score += 50;
        }

        if (
            studentStream.includes('science') &&
            (
                field.includes('computer') ||
                field.includes('engineering') ||
                programSubjects.includes('mathematics') ||
                programSubjects.includes('physics')
            )
        ) {

            score += 25;
        }

        const studentSubjectList =
            this.toKeywordList(studentSubjects);

        const programSubjectList =
            this.toKeywordList(programSubjects);

        const subjectMatches =
            studentSubjectList.filter(
                studentSubject =>
                    programSubjectList.some(
                        programSubject =>
                            programSubject.includes(studentSubject) ||
                            studentSubject.includes(programSubject)
                    )
            );

        score += Math.min(
            subjectMatches.length * 10,
            20
        );

        return score;
    }

    private toKeywordList(
        value: string
    ): string[] {

        return value
            .split(',')
            .map(
                item =>
                    item.trim().toLowerCase()
            )
            .filter(
                item =>
                    item.length > 0
            );
    }

    getProgramMatchLabel(
        program: EducationProgram
    ): string {

        const preferredEntryLevel =
            this.getPreferredEntryLevel();

        const score =
            this.getProgramMatchScore(
                program,
                preferredEntryLevel
            );

        if (score >= 70) {
            return 'Strong pathway match';
        }

        if (score >= 50) {
            return 'Good pathway match';
        }

        return 'Alternative pathway';
    }

    getPreferredEntryLevel(): string {

        if (
            this.educationLevel === 'higher_secondary' ||
            this.currentClass === 'class_12'
        ) {

            return 'after 12th';
        }

        if (
            this.educationLevel === 'secondary' ||
            this.currentClass === 'class_10'
        ) {

            return 'after 10th';
        }

        return '';
    }
}