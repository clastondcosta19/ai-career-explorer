import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AssessmentOption {
    value: string;
    label: string;
    description?: string;
}

@Component({
    selector: 'app-assessment-question',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './assessment-question.html',
    styleUrl: './assessment-question.css'
})
export class AssessmentQuestion {

    @Input() questionNumber = 1;

    @Input() totalQuestions = 1;

    @Input() question = '';

    @Input() description = '';

    @Input() options: AssessmentOption[] = [];

    @Input() selectedValue: string | null = null;

    @Input() disabled = false;

    @Output() answerSelected =
        new EventEmitter<string>();


    selectOption(
        value: string
    ): void {

        if (this.disabled) {
            return;
        }

        this.answerSelected.emit(value);
    }


    isSelected(
        value: string
    ): boolean {

        return this.selectedValue === value;
    }


    getProgressPercentage(): number {

        if (this.totalQuestions <= 0) {
            return 0;
        }

        return Math.round(
            (this.questionNumber /
                this.totalQuestions) *
                100
        );
    }
}