import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import {
    Career,
    CareerService,
    EducationProgram,
    Skill
} from '../../services/career.service';

@Component({
    selector: 'app-career-pathway',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './career-pathway.html',
    styleUrl: './career-pathway.css'
})
export class CareerPathway implements OnInit {

    profile: any = null;

    careers: Career[] = [];
    selectedCareer: Career | null = null;

    educationPrograms: EducationProgram[] = [];

    isLoading = true;
    errorMessage = '';

    private careerId: number | null = null;

    constructor(
        private authService: AuthService,
        private profileService: ProfileService,
        private careerService: CareerService,
        private route: ActivatedRoute,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {

        const user = this.authService.getUser();


        if (!user?.id) {

            console.error('No logged-in user found.');

            this.isLoading = false;

            this.errorMessage =
                'Please log in to view your career pathway.';

            this.router.navigate(['/login']);

            return;
        }

        const routeCareerId =
            Number(
                this.route.snapshot.paramMap.get('careerId')
            );

        if (
            Number.isFinite(routeCareerId) &&
            routeCareerId > 0
        ) {

            this.careerId = routeCareerId;

        } else {

            this.careerId = null;
        }

        this.loadPathway(user.id);
    }

    private loadPathway(userId: number): void {

        this.isLoading = true;
        this.errorMessage = '';

        this.profileService.getProfile(userId).subscribe({

            next: (profile) => {

                this.profile = profile;

                this.changeDetectorRef.detectChanges();

                this.loadCareers();
            },

            error: (error) => {

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

    private loadCareers(): void {

        this.careerService.getAllCareers().subscribe({

            next: (careers) => {

                this.careers = careers ?? [];

                if (this.careers.length > 0) {

                    console.log(
                        'Required skills returned:',
                        this.careers.map(
                            career => ({
                                career: career.title,
                                requiredSkills:
                                    career.requiredSkills
                            })
                        )
                    );
                }

                if (this.careerId !== null) {

                    this.selectCareerById(
                        this.careerId
                    );

                } else {

                    this.selectCareerForStudent();
                }

                this.isLoading = false;

                this.changeDetectorRef.detectChanges();
            },

            error: (error) => {

                this.isLoading = false;

                if (error?.status === 0) {

                    this.errorMessage =
                        'Unable to connect to the server. Make sure the Spring Boot backend is running.';

                } else {

                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to load career pathway information.';
                }

                this.changeDetectorRef.detectChanges();
            }
        });
    }

    private selectCareerById(
        careerId: number
    ): void {

        const career =
            this.careers.find(
                item =>
                    Number(item.id) === careerId
            );

        if (!career) {

            this.selectedCareer = null;
            this.educationPrograms = [];

            this.errorMessage =
                'The selected career could not be found. Please return to Career Explorer and choose a career again.';

            return;
        }

        this.setSelectedCareer(career);
    }

    private selectCareerForStudent(): void {

        if (!this.careers.length) {

            return;
        }

        const careerGoal = this.normalizeText(
            this.profile?.careerGoals || ''
        );

        if (careerGoal) {

            const exactMatch = this.careers.find(
                career =>
                    this.normalizeText(career.title) === careerGoal
            );

            if (exactMatch) {

                this.setSelectedCareer(exactMatch);

                return;
            }
        }


        if (careerGoal) {

            const titleContainsGoal = this.careers.find(
                career => {

                    const title =
                        this.normalizeText(career.title);

                    return (
                        title.includes(careerGoal) ||
                        careerGoal.includes(title)
                    );
                }
            );

            if (titleContainsGoal) {

                this.setSelectedCareer(
                    titleContainsGoal
                );

                return;
            }
        }


        if (careerGoal) {

            const goalWords =
                this.getMeaningfulWords(careerGoal);


            let bestCareer: Career | null = null;
            let bestScore = 0;

            for (const career of this.careers) {

                const score =
                    this.calculateCareerMatchScore(
                        career,
                        goalWords
                    );

                console.log(
                    `Career "${career.title}" match score:`,
                    score
                );

                if (score > bestScore) {

                    bestScore = score;
                    bestCareer = career;
                }
            }

            if (
                bestCareer &&
                bestScore > 0
            ) {

                this.setSelectedCareer(
                    bestCareer
                );

                return;
            }
        }


        console.warn(
            'No suitable career match found for:',
            careerGoal
        );

        this.selectedCareer = null;
        this.educationPrograms = [];
    }

    private calculateCareerMatchScore(
        career: Career,
        goalWords: string[]
    ): number {

        if (!goalWords.length) {
            return 0;
        }

        const careerText = [
            career.title,
            career.domain,
            career.careerFamily,
            career.role,
            career.interests,
            career.skills,
            career.strengths
        ]
            .filter(value => !!value)
            .map(value => this.normalizeText(value))
            .join(' ');

        const careerWords =
            this.getMeaningfulWords(careerText);

        let score = 0;

        for (const goalWord of goalWords) {

            if (careerWords.includes(goalWord)) {

                score += 10;

                continue;
            }

            const relatedMatch =
                careerWords.some(
                    careerWord =>
                        careerWord.startsWith(goalWord) ||
                        goalWord.startsWith(careerWord)
                );

            if (relatedMatch) {

                score += 5;
            }
        }

        const normalizedTitle =
            this.normalizeText(career.title);

        for (const goalWord of goalWords) {

            if (
                normalizedTitle.includes(goalWord)
            ) {

                score += 8;
            }
        }

        return score;
    }

    private normalizeText(value: string): string {

        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    private getMeaningfulWords(
        value: string
    ): string[] {

        const ignoredWords = new Set([
            'a',
            'an',
            'and',
            'the',
            'in',
            'of',
            'to',
            'for',
            'with',
            'career',
            'job',
            'role',
            'professional'
        ]);

        return this.normalizeText(value)
            .split(' ')
            .filter(
                word =>
                    word.length >= 3 &&
                    !ignoredWords.has(word)
            );
    }

    private setSelectedCareer(
        career: Career
    ): void {

        console.log(
            'Selected career:',
            career
        );

        this.selectedCareer = career;

        this.educationPrograms =
            career.educationPrograms ?? [];

        console.log(
            'Education programs:',
            this.educationPrograms
        );

        console.log(
            'Required skills for selected career:',
            career.requiredSkills
        );

        this.changeDetectorRef.detectChanges();
    }

    selectCareer(
        career: Career
    ): void {

        this.setSelectedCareer(career);
    }


    /* =====================================================
       PROFILE INFORMATION
    ===================================================== */

    getEducationLevel(): string {

        const value =
            this.profile?.educationLevel;

        if (!value) {
            return 'Not provided';
        }

        return String(value)
            .replace(/_/g, ' ')
            .replace(
                /\b\w/g,
                letter => letter.toUpperCase()
            );
    }


    getCurrentClass(): string {

        return this.profile?.currentClass ||
            'Not provided';
    }


    getStream(): string {

        return this.profile?.stream ||
            'Not provided';
    }


    getSubjects(): string[] {

        if (!this.profile?.subjects) {
            return [];
        }

        return String(this.profile.subjects)
            .split(',')
            .map(
                subject => subject.trim()
            )
            .filter(
                subject => subject.length > 0
            );
    }


    getSkills(): string[] {

        if (!this.profile?.skills) {
            return [];
        }

        return String(this.profile.skills)
            .split(',')
            .map(
                skill => skill.trim()
            )
            .filter(
                skill => skill.length > 0
            );
    }

    getEducationLevelLabel(): string {

        return this.getEducationLevel();
    }

    getCareerSkills(): string[] {

        if (!this.selectedCareer?.skills) {
            return [];
        }

        const careerSkills =
            String(this.selectedCareer.skills)
                .split(',')
                .map(
                    skill => skill.trim()
                )
                .filter(
                    skill => skill.length > 0
                );

        const currentSkills =
            new Set(
                this.getSkills().map(
                    skill =>
                        this.normalizeText(skill)
                )
            );

        return careerSkills.filter(
            skill =>
                !currentSkills.has(
                    this.normalizeText(skill)
                )
        );
    }

    getCareerSkillDetails(): Skill[] {

        if (
            !this.selectedCareer?.requiredSkills?.length
        ) {
            return [];
        }

        const currentSkills =
            new Set(
                this.getSkills().map(
                    skill =>
                        this.normalizeText(skill)
                )
            );

        return this.selectedCareer.requiredSkills
            .filter(
                skill =>
                    !currentSkills.has(
                        this.normalizeText(skill.name)
                    )
            )
            .sort(
                (a, b) =>
                    a.name.localeCompare(b.name)
            );
    }

    getCareerSkillDetail(
        skillName: string
    ): Skill | null {

        if (
            !this.selectedCareer?.requiredSkills?.length
        ) {
            return null;
        }

        const normalizedSkillName =
            this.normalizeText(skillName);

        return (
            this.selectedCareer.requiredSkills.find(
                skill =>
                    this.normalizeText(skill.name) ===
                    normalizedSkillName
            ) ?? null
        );
    }


    scrollToEducation(): void {

        const educationSection =
            document.getElementById(
                'education-options'
            );

        if (!educationSection) {
            return;
        }

        educationSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    getPreferredEntryLevel(): string {

        if (
            this.profile?.educationLevel ===
            'higher_secondary' ||
            this.profile?.currentClass ===
            'class_12'
        ) {

            return 'after 12th';
        }

        if (
            this.profile?.educationLevel ===
            'secondary' ||
            this.profile?.currentClass ===
            'class_10'
        ) {

            return 'after 10th';
        }

        return '';
    }

    getRelevantEducationPrograms():
        EducationProgram[] {

        const preferred =
            this.getPreferredEntryLevel();

        if (!preferred) {

            return this.educationPrograms;
        }

        const matching =
            this.educationPrograms.filter(
                program =>
                    String(
                        program.entryLevel || ''
                    )
                        .toLowerCase() ===
                    preferred
            );

        const alternatives =
            this.educationPrograms.filter(
                program =>
                    String(
                        program.entryLevel || ''
                    )
                        .toLowerCase() !==
                    preferred
            );

        return [
            ...matching,
            ...alternatives
        ];
    }

    getOtherCareers(): Career[] {

        if (!this.selectedCareer) {

            return this.careers.slice(0, 5);
        }

        return this.careers
            .filter(
                career =>
                    career.id !==
                    this.selectedCareer?.id
            )
            .slice(0, 5);
    }


    openCareer(
        career: Career
    ): void {

        this.router.navigate([
            '/career-details',
            career.id
        ]);
    }


    analyzeCareer(): void {

        if (!this.selectedCareer) {
            return;
        }

        this.router.navigate([
            '/career-analysis',
            this.selectedCareer.id
        ]);
    }


    goToAiGuidance(): void {

        if (!this.selectedCareer) {
            return;
        }

        this.router.navigate([
            '/ai-guidance',
            this.selectedCareer.id
        ]);
    }



    goToRoadmap(): void {

        if (!this.selectedCareer?.id) {
            return;
        }

        this.router.navigate(
            [
                '/roadmap',
                this.selectedCareer.id
            ],
            {
                state: {
                    from: 'career-pathway'
                }
            }
        );
    }



    goToProfile(): void {

        this.router.navigate([
            '/profile'
        ]);
    }


    goToExplorer(): void {

        this.router.navigate([
            '/career-explorer'
        ]);
    }

}