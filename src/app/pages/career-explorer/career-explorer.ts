import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
    Career,
    CareerService
} from '../../services/career.service';

@Component({
    selector: 'app-career-explorer',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './career-explorer.html',
    styleUrl: './career-explorer.css'
})
export class CareerExplorer implements OnInit {

    careers: Career[] = [];
    filteredCareers: Career[] = [];

    domains: string[] = [];
    careerFamilies: string[] = [];

    selectedDomain = '';
    selectedFamily = '';
    searchTerm = '';

    isLoading = true;
    errorMessage = '';

    constructor(
        private careerService: CareerService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {

        this.loadCareers();
    }


    loadCareers(): void {

        this.isLoading = true;
        this.errorMessage = '';

        this.careerService.getAllCareers().subscribe({

            next: (careers: Career[]) => {

                this.careers = Array.isArray(careers)
                    ? careers
                    : [];

                this.filteredCareers = [...this.careers];

                this.buildFilters();

                this.applyFilters();

                this.isLoading = false;

                this.changeDetectorRef.detectChanges();

            },

            error: (error) => {

                this.careers = [];
                this.filteredCareers = [];

                this.isLoading = false;

                if (error?.status === 0) {

                    this.errorMessage =
                        'Unable to connect to the server. Make sure the Spring Boot backend is running.';

                } else {

                    this.errorMessage =
                        error?.error?.message ||
                        'Unable to load careers. Please try again.';
                }
            }

        });
    }


    buildFilters(): void {

        const domainSet = new Set<string>();
        const familySet = new Set<string>();

        for (const career of this.careers) {

            if (career.domain) {
                domainSet.add(career.domain);
            }

            if (career.careerFamily) {
                familySet.add(career.careerFamily);
            }
        }

        this.domains = Array.from(domainSet).sort();
        this.careerFamilies = Array.from(familySet).sort();

        this.updateCareerFamilies();
    }

    updateCareerFamilies(): void {

        let availableCareers = this.careers;

        if (this.selectedDomain) {

            availableCareers = this.careers.filter(
                career =>
                    career.domain === this.selectedDomain
            );
        }

        const familySet = new Set<string>();

        for (const career of availableCareers) {

            if (career.careerFamily) {
                familySet.add(career.careerFamily);
            }
        }

        this.careerFamilies =
            Array.from(familySet).sort();

        if (
            this.selectedFamily &&
            !this.careerFamilies.includes(
                this.selectedFamily
            )
        ) {

            this.selectedFamily = '';
        }
    }

    onDomainChange(): void {

        this.updateCareerFamilies();

        this.applyFilters();
    }

    onFamilyChange(): void {

        this.applyFilters();
    }

    onSearchChange(): void {

        this.applyFilters();
    }

    applyFilters(): void {

        const search =
            this.searchTerm
                .trim()
                .toLowerCase();

        this.filteredCareers =
            this.careers.filter(
                (career: Career) => {

                    const matchesSearch =
                        !search ||
                        this.contains(
                            career.title,
                            search
                        ) ||
                        this.contains(
                            career.description,
                            search
                        ) ||
                        this.contains(
                            career.domain,
                            search
                        ) ||
                        this.contains(
                            career.careerFamily,
                            search
                        ) ||
                        this.contains(
                            career.role,
                            search
                        ) ||
                        this.contains(
                            career.requiredEducation,
                            search
                        ) ||
                        this.contains(
                            career.subjects,
                            search
                        ) ||
                        this.contains(
                            career.skills,
                            search
                        ) ||
                        this.contains(
                            career.interests,
                            search
                        ) ||
                        this.contains(
                            career.strengths,
                            search
                        );

                    /*
                     * Domain filter.
                     */
                    const matchesDomain =
                        !this.selectedDomain ||
                        career.domain === this.selectedDomain;

                    /*
                     * Family filter.
                     */
                    const matchesFamily =
                        !this.selectedFamily ||
                        career.careerFamily === this.selectedFamily;

                    return (
                        matchesSearch &&
                        matchesDomain &&
                        matchesFamily
                    );
                }
            );

        console.log(
            'Filters applied:',
            {
                search: this.searchTerm,
                domain: this.selectedDomain,
                family: this.selectedFamily,
                results: this.filteredCareers.length
            }
        );
    }

    private contains(
        value: string | undefined | null,
        search: string
    ): boolean {

        if (!value) {
            return false;
        }

        return value
            .toLowerCase()
            .includes(search);
    }

    clearFilters(): void {

        this.searchTerm = '';
        this.selectedDomain = '';
        this.selectedFamily = '';

        this.buildFilters();

        this.filteredCareers =
            [...this.careers];

        console.log(
            'Filters cleared:',
            this.filteredCareers.length
        );
    }

    trackByCareerId(
        index: number,
        career: Career
    ): number {

        return career.id;
    }

    exploreCareer(career: Career): void {
        this.router.navigate([
            '/career-details',
            career.id
        ]);
    }

}