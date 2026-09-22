import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  ProfileService,
  ProfileRequest
} from '../../services/profile.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  isSubmitting = false;
  isLoading = true;

  profileForm;

  profileCompletion = 0;

  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {

    this.profileForm = this.formBuilder.group({

      educationLevel: [
        '',
        Validators.required
      ],

      currentClass: [
        '',
        Validators.required
      ],

      stream: [
        ''
      ],

      subjects: [
        '',
        Validators.required
      ],

      interests: [
        '',
        Validators.required
      ],

      strengths: [
        '',
        Validators.required
      ],

      skills: [
        '',
        Validators.required
      ],

      careerGoals: [
        '',
        Validators.required
      ]

    });

    this.profileForm.valueChanges.subscribe(() => {
      this.calculateProfileCompletion();
    });

  }


  ngOnInit(): void {

    this.loadProfile();

  }


  get educationLevel() {
    return this.profileForm.controls.educationLevel;
  }


  get currentClass() {
    return this.profileForm.controls.currentClass;
  }


  get subjects() {
    return this.profileForm.controls.subjects;
  }


  get interests() {
    return this.profileForm.controls.interests;
  }


  get strengths() {
    return this.profileForm.controls.strengths;
  }


  get skills() {
    return this.profileForm.controls.skills;
  }


  get careerGoals() {
    return this.profileForm.controls.careerGoals;
  }


  calculateProfileCompletion(): void {

    const fields = [

      {
        control: this.educationLevel,
        weight: 15
      },

      {
        control: this.currentClass,
        weight: 10
      },

      {
        control: this.profileForm.controls.stream,
        weight: 5
      },

      {
        control: this.subjects,
        weight: 15
      },

      {
        control: this.interests,
        weight: 15
      },

      {
        control: this.strengths,
        weight: 15
      },

      {
        control: this.skills,
        weight: 15
      },

      {
        control: this.careerGoals,
        weight: 10
      }

    ];


    let completion = 0;


    fields.forEach(field => {

      const value = field.control.value;

      if (
        value !== null &&
        value !== undefined &&
        value.toString().trim().length > 0
      ) {

        completion += field.weight;

      }

    });


    this.profileCompletion = completion;

  }


  loadProfile(): void {

    const userId = this.getUserId();

    if (!userId) {

      this.isLoading = false;

      this.errorMessage =
        'Unable to identify your account. Please log in again.';

      return;

    }


    this.profileService
      .getProfile(userId)
      .subscribe({

        next: (profile) => {

          this.profileForm.patchValue({

            educationLevel:
              profile.educationLevel ?? '',

            currentClass:
              profile.currentClass ?? '',

            stream:
              profile.stream ?? '',

            subjects:
              profile.subjects ?? '',

            interests:
              profile.interests ?? '',

            strengths:
              profile.strengths ?? '',

            skills:
              profile.skills ?? '',

            careerGoals:
              profile.careerGoals ?? ''

          });


          this.calculateProfileCompletion();

          this.isLoading = false;

        },


        error: (error) => {

          this.isLoading = false;

          if (error.status === 404) {

            this.errorMessage = '';

            return;

          }


          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please log in again.';

          } else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to the server. Make sure the Spring Boot backend is running.';

          } else {

            this.errorMessage =
              error.error?.message ||
              'Unable to load your profile.';

          }

        }

      });

  }


  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';


    if (this.profileForm.invalid) {

      this.profileForm.markAllAsTouched();

      return;

    }


    const userId = this.getUserId();


    if (!userId) {

      this.errorMessage =
        'Unable to identify your account. Please log in again.';

      return;

    }


    this.isSubmitting = true;


    const request: ProfileRequest = {

      educationLevel:
        this.educationLevel.value ?? '',

      currentClass:
        this.currentClass.value ?? '',

      stream:
        this.profileForm.controls.stream.value ?? '',

      subjects:
        this.subjects.value ?? '',

      interests:
        this.interests.value ?? '',

      strengths:
        this.strengths.value ?? '',

      skills:
        this.skills.value ?? '',

      careerGoals:
        this.careerGoals.value ?? ''

    };


    this.profileService
      .saveProfile(userId, request)
      .subscribe({

        next: (response) => {

          this.isSubmitting = false;

          this.successMessage =
            'Profile saved successfully.';


          setTimeout(() => {

            this.router.navigate(['/']);

          }, 800);

        },


        error: (error) => {

          this.isSubmitting = false;


          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please log in again.';

          } else if (error.status === 400) {

            this.errorMessage =
              error.error?.message ||
              'Please check your profile information.';

          } else if (error.status === 404) {

            this.errorMessage =
              'Profile or user account was not found.';

          } else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to the server. Make sure the Spring Boot backend is running.';

          } else {

            this.errorMessage =
              error.error?.message ||
              'Unable to save your profile. Please try again.';

          }

        }

      });

  }


  private getUserId(): number | null {

    const user = this.authService.getUser();

    return user?.id ?? null;

  }

}