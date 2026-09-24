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

            error: () => {

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

    getCurrentStageTitle(): string {

        switch (this.currentClass) {

            case 'class_9':
                return 'Class 9';

            case 'class_10':
                return 'Class 10';

            case 'class_11':
                return 'Class 11';

            case 'class_12':
                return 'Class 12';

            case 'first_year':
                return '1st Year';

            case 'second_year':
                return '2nd Year';

            case 'third_year':
                return '3rd Year';

            case 'fourth_year':
                return '4th Year';

            case 'graduated':
                return 'Graduated';

            default:
                return 'Current Academic Stage';
        }
    }

    getStageSummary(): string {

        switch (this.currentClass) {

            case 'class_9':
                return 'You are at an early exploration stage. This is a good time to understand this career, explore related subjects and build a strong academic foundation.';

            case 'class_10':
                return 'You are approaching an important academic transition. Your next step should consider the subjects, stream and education routes that support this career.';

            case 'class_11':
                return 'You are building your higher-secondary foundation. Focus on relevant subjects and start planning the education route you can take after Class 12.';

            case 'class_12':
                return 'You are close to the next major education decision. Explore the undergraduate and other education pathways that can lead toward this career.';

            case 'first_year':
                return 'Focus on understanding your field, strengthening fundamentals and exploring the practical skills connected with this career.';

            case 'second_year':
                return 'Focus on developing core technical or professional skills and applying what you learn through practical projects.';

            case 'third_year':
                return 'Focus on deeper specialization, stronger projects, internships and building evidence of your skills.';

            case 'fourth_year':
                return 'Focus on becoming career-ready through projects, internships, resume preparation, interviews and applications.';

            case 'graduated':
                return 'Focus on moving toward employment, specialization, higher studies or certifications that support this career direction.';

            default:
                return 'Use this career information together with your profile, interests, subjects and skills to plan your next step.';
        }
    }

    getFocusAreas(): string[] {

        switch (this.currentClass) {

            case 'class_9':
                return [
                    'Explore what this career involves',
                    'Build strong fundamentals in relevant subjects',
                    'Explore beginner-level activities and projects',
                    'Understand which subjects may become important later'
                ];

            case 'class_10':
                return [
                    'Understand suitable subjects and academic streams',
                    'Compare education routes after Class 10',
                    'Strengthen subjects related to this career',
                    'Explore beginner projects and career activities'
                ];

            case 'class_11':
                return [
                    'Strengthen subjects relevant to this career',
                    'Build foundational career-related skills',
                    'Explore projects and practical activities',
                    'Start planning education options after Class 12'
                ];

            case 'class_12':
                return [
                    'Compare suitable education pathways after Class 12',
                    'Strengthen important subjects and skills',
                    'Research suitable degree or diploma options',
                    'Prepare for the next education or entrance step'
                ];

            case 'first_year':
                return [
                    'Strengthen fundamentals',
                    'Explore the career through small projects',
                    'Build basic technical or professional skills',
                    'Understand different roles within the career'
                ];

            case 'second_year':
                return [
                    'Develop core career-related skills',
                    'Build practical projects',
                    'Explore internships and real-world experience',
                    'Start identifying areas of specialization'
                ];

            case 'third_year':
                return [
                    'Develop advanced skills',
                    'Build strong portfolio projects',
                    'Look for internships and practical experience',
                    'Start preparing for placements or career opportunities'
                ];

            case 'fourth_year':
                return [
                    'Complete strong portfolio projects',
                    'Prepare your resume and professional profile',
                    'Practice interviews and career-specific skills',
                    'Apply for suitable jobs, internships or further studies'
                ];

            case 'graduated':
                return [
                    'Build or strengthen your professional portfolio',
                    'Prepare for career-specific interviews',
                    'Explore entry-level roles and opportunities',
                    'Consider specialization, certifications or higher studies'
                ];

            default:
                return [
                    'Understand the career requirements',
                    'Compare your current skills with the career',
                    'Explore suitable education and learning options',
                    'Build relevant skills through practical experience'
                ];
        }
    }

    getNextStepTitle(): string {

        switch (this.currentClass) {

            case 'class_9':
                return 'Prepare for the Class 10 transition';

            case 'class_10':
                return 'Choose your next academic route carefully';

            case 'class_11':
                return 'Plan your path after Class 12';

            case 'class_12':
                return 'Choose a suitable education pathway';

            case 'first_year':
                return 'Build your foundation';

            case 'second_year':
                return 'Build practical experience';

            case 'third_year':
                return 'Build specialization and experience';

            case 'fourth_year':
                return 'Prepare for the transition to your career';

            case 'graduated':
                return 'Move toward your chosen career direction';

            default:
                return 'Build your next career step';
        }
    }

    getNextStepDescription(): string {

        switch (this.currentClass) {

            case 'class_9':
                return 'Use the next academic stage to keep relevant subjects strong and continue exploring whether this career matches your interests.';

            case 'class_10':
                return 'Look at the subjects and education routes connected with this career before deciding your next academic stage.';

            case 'class_11':
                return 'Use Class 11 and 12 to strengthen relevant subjects, build useful skills and research post-12th options.';

            case 'class_12':
                return 'Compare the available education options, eligibility requirements and subjects before choosing your next course.';

            case 'first_year':
                return 'Focus on fundamentals and use small projects to understand whether this career area matches your interests and strengths.';

            case 'second_year':
                return 'Move beyond theory by building practical projects and gaining experience related to the career.';

            case 'third_year':
                return 'Develop specialization, strengthen your portfolio and look for internships or other practical opportunities.';

            case 'fourth_year':
                return 'Turn your academic work into career opportunities through a strong resume, projects, interview preparation and applications.';

            case 'graduated':
                return 'Use your skills and projects to target relevant opportunities while considering specialization or further education where useful.';

            default:
                return 'Review the career requirements and identify the skills, subjects and education options that are most relevant to you.';
        }
    }

    getEducationPrograms(): EducationProgram[] {

        const programs =
            this.career?.educationPrograms ?? [];

        if (!this.shouldShowEducationPrograms()) {
            return [];
        }

        const preferredEntryLevel =
            this.getPreferredEntryLevel();

        if (!preferredEntryLevel) {
            return programs;
        }

        return this.sortProgramsForStudent(
            programs,
            preferredEntryLevel
        );
    }

    shouldShowEducationPrograms(): boolean {

        return (
            this.currentClass === 'class_10' ||
            this.currentClass === 'class_11' ||
            this.currentClass === 'class_12'
        );
    }

    getEducationSectionTitle(): string {

        if (this.currentClass === 'class_10') {
            return 'Education Options After Class 10';
        }

        if (
            this.currentClass === 'class_11' ||
            this.currentClass === 'class_12'
        ) {
            return 'Education Options After Class 12';
        }

        return 'Education Pathways';
    }

    getEducationSectionDescription(): string {

        if (this.currentClass === 'class_10') {
            return 'These are education programs connected with this career that you can consider after completing Class 10.';
        }

        if (this.currentClass === 'class_11') {
            return 'You can use these options to start planning the education route you may take after Class 12.';
        }

        if (this.currentClass === 'class_12') {
            return 'These are education programs connected with this career that you can consider for your next academic step.';
        }

        return 'Explore education programs related to this career.';
    }

    getCareerPathway(): string {

        if (!this.career?.careerPaths) {
            return '';
        }

        return this.career.careerPaths;
    }

    hasCareerPathway(): boolean {

        return !!(
            this.career?.careerPaths &&
            this.career.careerPaths.trim().length > 0
        );
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
            this.toKeywordList(
                studentSubjects
            );

        const programSubjectList =
            this.toKeywordList(
                programSubjects
            );

        const subjectMatches =
            studentSubjectList.filter(
                studentSubject =>
                    programSubjectList.some(
                        programSubject =>
                            programSubject.includes(
                                studentSubject
                            ) ||
                            studentSubject.includes(
                                programSubject
                            )
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
            this.currentClass === 'class_11' ||
            this.currentClass === 'class_12' ||
            this.educationLevel === 'higher_secondary'
        ) {

            return 'after 12th';
        }

        if (
            this.currentClass === 'class_10' ||
            this.educationLevel === 'secondary'
        ) {

            return 'after 10th';
        }

        return '';
    }
}