import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Career,
  CareerService
} from '../../services/career.service';

import {
  AnalysisService
} from '../../services/analysis.service';

import {
  CareerMatch,
  SkillGapAnalysis
} from '../../models/analysis.model';

import {
  ProfileService
} from '../../services/profile.service';


@Component({
  selector: 'app-ai-guidance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-guidance.html',
  styleUrl: './ai-guidance.css'
})
export class AiGuidance implements OnInit {

  career: Career | null = null;

  match: CareerMatch | null = null;

  skillGap: SkillGapAnalysis | null = null;

  studentProfile: any = null;

  isLoading = true;

  errorMessage = '';

  aiResponse = '';

  isAiLoading = false;

  aiErrorMessage = '';

  currentQuestion = '';

  userId: number | null = null;

  careerId: number | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private careerService: CareerService,
    private analysisService: AnalysisService,
    private profileService: ProfileService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }


  ngOnInit(): void {

    const careerId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!careerId || Number.isNaN(careerId)) {

      this.errorMessage =
        'Invalid career selected.';

      this.isLoading = false;

      return;
    }


    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {

      this.errorMessage =
        'Please log in to use AI guidance.';

      this.isLoading = false;

      return;
    }


    let userId: number;

    try {

      const user = JSON.parse(storedUser);

      userId = Number(user.id);

    } catch {

      this.errorMessage =
        'Unable to identify the logged-in user.';

      this.isLoading = false;

      return;
    }


    if (!userId || Number.isNaN(userId)) {

      this.errorMessage =
        'Unable to identify the logged-in user.';

      this.isLoading = false;

      return;
    }


    this.userId = userId;

    this.careerId = careerId;


    this.loadGuidanceData(
      userId,
      careerId
    );
  }


  loadGuidanceData(
    userId: number,
    careerId: number
  ): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.aiResponse = '';

    this.aiErrorMessage = '';

    this.isAiLoading = false;


    this.careerService
      .getCareerById(careerId)
      .subscribe({

        next: (career) => {

          this.career = career;


          this.loadStudentProfile(
            userId
          );


          this.loadCareerMatch(
            userId,
            careerId
          );


          this.loadSkillGap(
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
              'Unable to connect to the server.';

          } else {

            this.errorMessage =
              error?.error?.message ||
              'Unable to load career information.';
          }


          this.changeDetectorRef.detectChanges();
        }

      });
  }


  loadStudentProfile(
    userId: number
  ): void {


    this.profileService
      .getProfile(userId)
      .subscribe({

        next: (profile) => {

          this.studentProfile = profile;

          this.checkLoadingComplete();
        },


        error: (error) => {

          this.errorMessage =
            error?.error?.message ||
            'Unable to load your student profile.';

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();
        }

      });
  }


  loadCareerMatch(
    userId: number,
    careerId: number
  ): void {

    this.analysisService
      .getCareerMatches(userId)
      .subscribe({

        next: (matches) => {

          this.match =
            matches.find(
              item =>
                Number(item.careerId) === careerId
            ) || null;


          this.checkLoadingComplete();
        },


        error: (error) => {

          this.errorMessage =
            error?.error?.message ||
            'Unable to load your career analysis.';

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

          this.skillGap = skillGap;

          this.checkLoadingComplete();
        },


        error: (error) => {

          console.error(
            'Failed to load skill gap:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load your skill gap.';

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
      this.studentProfile
    ) {

      this.isLoading = false;

      this.changeDetectorRef.detectChanges();

    }
  }


  askAi(question: string): void {

    const cleanedQuestion =
      question.trim();


    if (!cleanedQuestion) {
      return;
    }


    if (this.isAiLoading) {
      return;
    }


    if (!this.userId) {

      this.aiErrorMessage =
        'Unable to identify the logged-in user.';

      return;
    }


    if (!this.careerId) {

      this.aiErrorMessage =
        'Unable to identify the selected career.';

      return;
    }


    if (!this.career) {

      this.aiErrorMessage =
        'Career information is not available yet.';

      return;
    }


    if (!this.studentProfile) {

      this.aiErrorMessage =
        'Student profile information is not available yet.';

      return;
    }


    if (!this.skillGap) {

      this.aiErrorMessage =
        'Skill gap information is not available yet.';

      return;
    }


    this.currentQuestion =
      cleanedQuestion;

    this.aiResponse = '';

    this.aiErrorMessage = '';

    this.isAiLoading = true;

    this.changeDetectorRef.detectChanges();

    const educationLevel =
      this.studentProfile.educationLevel ||
      'Not available';

    const currentClass =
      this.studentProfile.currentClass ||
      'Not available';

    const stream =
      this.studentProfile.stream ||
      'Not available';

    const studentSubjects =
      this.studentProfile.subjects ||
      'Not available';

    const studentInterests =
      this.studentProfile.interests ||
      'Not available';

    const studentStrengths =
      this.studentProfile.strengths ||
      'Not available';

    const studentSkills =
      this.studentProfile.skills ||
      'Not available';

    const careerGoals =
      this.studentProfile.careerGoals ||
      'Not available';

    const careerName =
      this.career.title ||
      'Unknown career';

    const careerDescription =
      this.career.description ||
      'Not available';

    const careerDomain =
      this.career.domain ||
      'Not available';

    const careerFamily =
      this.career.careerFamily ||
      'Not available';

    const careerRole =
      this.career.role ||
      'Not available';

    const requiredEducation =
      this.career.requiredEducation ||
      'Not available';

    const relevantSubjects =
      this.career.subjects ||
      'Not available';

    const careerSkills =
      this.career.skills ||
      'Not available';

    const careerInterests =
      this.career.interests ||
      'Not available';

    const careerStrengths =
      this.career.strengths ||
      'Not available';

    const careerPaths =
      this.career.careerPaths ||
      'Not available';

    const educationPrograms =
      this.career.educationPrograms || [];


    const educationProgramInformation =
      educationPrograms.length > 0
        ? educationPrograms
          .map(program => {

            return [
              `Program: ${program.name || 'Not available'}`,
              `Level: ${program.level || 'Not available'}`,
              `Field: ${program.field || 'Not available'}`,
              `Entry Level: ${program.entryLevel || 'Not available'}`,
              `Eligibility: ${program.eligibility || 'Not available'}`,
              `Subjects: ${program.subjects || 'Not available'}`,
              `Typical Duration: ${program.typicalDuration || 'Not available'}`
            ].join(' | ');

          })
          .join('\n')
        : 'No structured education programs are available.';

    const compatibilityScore =
      this.match?.compatibilityScore ?? 0;

    const confidence =
      this.match?.confidence ||
      'Unknown';

    const matchedFactors =
      this.match?.matchedFactors?.join(', ') ||
      'None';

    const matchedSkills =
      this.skillGap?.matchedSkills?.length
        ? this.skillGap.matchedSkills.join(', ')
        : 'NONE IDENTIFIED';


    const missingSkills =
      this.skillGap?.missingSkills?.length
        ? this.skillGap.missingSkills.join(', ')
        : 'NONE IDENTIFIED';


    const skillPercentage =
      this.skillGap?.skillMatchPercentage ?? 0;


    const allowedSkillNames = [
      ...(this.skillGap?.matchedSkills ?? []),
      ...(this.skillGap?.missingSkills ?? [])
    ]
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);


    const allowedSkillList =
      allowedSkillNames.length > 0
        ? allowedSkillNames.join(', ')
        : 'NONE';


    const aiPrompt = `

You are the AI Career Guide inside a student career exploration platform.

Your role is to help the student EXPLORE and UNDERSTAND the selected career.

You are not a decision-maker.

The platform has provided verified structured information about:

- the student
- the selected career
- education programs
- career pathways
- career analysis
- skill matches
- skill gaps

Use this information as the primary source of truth.


========================================================
IMPORTANT RULES
========================================================

1. Do not make the career decision for the student.
2. Do not tell the student that they definitely should or should not choose the career.
3. Do not claim that compatibility scores predict future success.
4. Do not invent facts about the student.
5. Do not invent career requirements.
6. Do not invent eligibility rules.
7. Do not invent education programs.
8. Do not invent colleges, universities or institutions.
9. Do not invent certifications.
10. Do not invent career pathways.
11. Do not replace database education routes with routes that are not provided.
12. If information is missing, say that the platform does not currently have that information.
13. Use the actual missing skills supplied by the platform.
14. Use the student's actual profile when personalizing the answer.
15. Use the structured education programs for education-related questions.
16. Use the student's current education level, class, stream and subjects when explaining relevant next steps.
17. Distinguish between:
- routes available after 10th
- routes available after 12th
- routes that may require further study
18. Never imply that a single education route is mandatory if multiple routes are present.
19. Do not create an admission requirement that is not supplied by the platform.
20. Do not create an institution recommendation unless the platform provides one.


========================================================
STUDENT PROFILE
========================================================

Education Level:
${educationLevel}

Current Class:
${currentClass}

Stream:
${stream}

Subjects:
${studentSubjects}

Interests:
${studentInterests}

Strengths:
${studentStrengths}

Current Skills:
${studentSkills}

Career Goal:
${careerGoals}


========================================================
SELECTED CAREER
========================================================

Career:
${careerName}

Description:
${careerDescription}

Domain:
${careerDomain}

Career Family:
${careerFamily}

Role:
${careerRole}

Required Education:
${requiredEducation}

Relevant Subjects:
${relevantSubjects}

Important Skills:
${careerSkills}

Relevant Interests:
${careerInterests}

Relevant Strengths:
${careerStrengths}

Career Paths:
${careerPaths}


========================================================
STRUCTURED EDUCATION PROGRAMS
========================================================

These programs come directly from the platform database.

Treat them as the authoritative education options available
for this career.

${educationProgramInformation}


========================================================
CAREER ANALYSIS
========================================================

Compatibility Score:
${compatibilityScore}%

Confidence:
${confidence}

Matched Factors:
${matchedFactors}


========================================================
SKILL GAP ANALYSIS
========================================================

Skill Match:
${skillPercentage}%

Skills Already Matched:
${matchedSkills}

Skills Currently Missing:
${missingSkills}


========================================================
ABSOLUTE SKILL BOUNDARY
========================================================

The following is the COMPLETE list of skill names available
for this student's career analysis:

${allowedSkillList}

THIS LIST IS AUTHORITATIVE.

When discussing skills, you may ONLY use skill names that
appear exactly in the list above.

If a skill does not appear in this list, DO NOT mention it
as a skill.

Do NOT infer additional skills from:

- the career title
- career description
- career role
- career domain
- career family
- career skills
- career paths
- general knowledge
- knowledge about software development
- knowledge about the job market

Do NOT introduce:

- Algorithms
- Data Structures
- Git
- API Development
- Backend Development
- Frontend Development
- Web Development
- Software Testing
- Java
- Python
- JavaScript
- React
- Angular
- Node.js
- SQL
- frameworks
- tools
- technologies
- certifications

unless the EXACT name appears in the authoritative skill list.

If the student asks:

"What skills should I develop?"

you MUST recommend ONLY skills from:

Skills Currently Missing:

${missingSkills}

If there are no missing skills, say:

"The current career analysis has not identified a specific
missing skill."

Do not create additional skills to make the answer more
complete.


========================================================
STUDENT QUESTION
========================================================

${cleanedQuestion}


========================================================
EDUCATION QUESTION INSTRUCTIONS
========================================================

If the student asks:

"What education paths can I explore?"

or asks a similar education-path question:

1. Start with the student's current position.
2. Explain which database programs are relevant to the student's current stage.
3. Group the available programs logically by entry level.
4. Mention actual program names exactly as supplied.
5. Mention program level when available.
6. Mention field when useful.
7. Mention eligibility only when supplied.
8. Mention duration only when supplied.
9. Explain how the student's current education stage relates to those routes.
10. If the student is currently in Class 12, explain relevant after-12th options first.
11. If an after-10th route exists but the student is already in Class 12, mention it only as an alternative/background route.
12. Do not invent entrance examinations.
13. Do not invent cutoff marks.
14. Do not invent admission percentages.
15. Do not invent college names.
16. Do not say that a specific route guarantees the career.
17. End with a short practical next-step suggestion.


========================================================
SKILL QUESTION INSTRUCTIONS
========================================================

When the student asks about skills:

- First identify skills already matched.
- Then identify skills currently missing.
- Recommend ONLY skills from the supplied missing-skills list.
- Keep skill names exactly as supplied.
- Do not introduce new skill names.
- Do not expand one supplied skill into multiple skills.
- Do not recommend technologies, tools, frameworks, programming languages or certifications unless they appear exactly in the authoritative skill list.
- Give beginner-friendly practice activities for the supplied missing skills.
- If no missing skills are supplied, say that the platform has not identified a specific missing skill.


========================================================
NEXT-STEP QUESTION INSTRUCTIONS
========================================================

If the student asks what they should do next:

- Consider current education level.
- Consider current class.
- Consider stream.
- Consider subjects.
- Consider interests.
- Consider current skills.
- Consider the selected career.
- Suggest exploration and learning activities.
- Do not present one fixed route as mandatory.
- Do not introduce unsupported skills.


========================================================
CAREER-FIT QUESTION INSTRUCTIONS
========================================================

If the student asks why this career may suit them:

- Connect actual subjects with the career.
- Connect actual interests with the career.
- Connect actual strengths with the career.
- Mention only skills that appear in the authoritative skill list.
- Use matched factors.
- Do not treat the compatibility score as a prediction.
- Do not claim that the student will succeed in the career.


========================================================
RESPONSE STYLE
========================================================

Make the answer:

- Clear
- Student-friendly
- Practical
- Personalized
- Concise but useful

Use simple HTML formatting.

Allowed HTML elements:

<h3>
<h4>
<p>
<ul>
<ol>
<li>
<strong>
<em>

Do not use Markdown.

Do not use Markdown headings.

Do not use Markdown bullet points.

Do not use code fences.

Do not write HTML as plain text.

Return only the answer content.

Do not mention that you are an AI model.

Do not ask the student for the career name because the selected
career is already provided.


========================================================
FINAL GROUNDING RULE
========================================================

The database information supplied above is authoritative.

For education questions:
- Use only the supplied education programs and career paths.

For skill questions:
- Use ONLY the supplied matched skills and missing skills.
- Do not introduce additional skill names.

For profile questions:
- Use only the supplied student profile.

For career-fit questions:
- Use the supplied career information, student profile and matched factors.

The AI should interpret, explain and personalize verified platform information.

Do not add unsupported:

- career requirements
- education routes
- skills
- technologies
- certifications
- institutions
- qualifications

The purpose is career exploration and guidance, not career
prediction or automated decision-making.

`;


    this.analysisService
      .askAiGuidance(
        this.userId,
        this.careerId,
        aiPrompt
      )
      .subscribe({

        next: (response) => {

          this.aiResponse =
            this.formatAiResponse(response);

          this.isAiLoading = false;

          this.aiErrorMessage = '';

          this.changeDetectorRef.detectChanges();
        },


        error: (error) => {

          this.isAiLoading = false;


          if (error?.status === 0) {

            this.aiErrorMessage =
              'Unable to connect to the AI server. Make sure the Spring Boot backend is running.';

          } else if (
            error?.status === 401 ||
            error?.status === 403
          ) {

            this.aiErrorMessage =
              'Your login session has expired. Please log in again and try AI guidance.';

          } else if (error?.status === 429) {

            this.aiErrorMessage =
              'The free AI request limit has been reached. Please try again later.';

          } else if (error?.status === 500) {

            this.aiErrorMessage =
              'The AI could not generate a response. Please check the backend console for the exact error.';

          } else {

            this.aiErrorMessage =
              error?.error?.message ||
              'Unable to get an AI response. Please try again.';
          }


          this.changeDetectorRef.detectChanges();
        }

      });
  }


  formatAiResponse(
    response: string
  ): string {

    if (!response) {
      return '';
    }


    let html = response.trim();


    // Removes Markdown code fences.
    html = html.replace(
      /^```(?:html|markdown|text)?\s*/i,
      ''
    );

    html = html.replace(
      /\s*```$/i,
      ''
    );


    // Removes document-level tags.
    html = html.replace(
      /<\/?(?:html|head|body|title)[^>]*>/gi,
      ''
    );


    // Removes potentially dangerous elements.
    html = html.replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      ''
    );

    html = html.replace(
      /<style\b[^>]*>[\s\S]*?<\/style>/gi,
      ''
    );

    html = html.replace(
      /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,
      ''
    );

    html = html.replace(
      /<object\b[^>]*>[\s\S]*?<\/object>/gi,
      ''
    );

    html = html.replace(
      /<embed\b[^>]*>/gi,
      ''
    );


    // Remove event-handler attributes.
    html = html.replace(
      /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      ''
    );


    // Removes javascript URLs.
    html = html.replace(
      /\s+(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi,
      ''
    );


    // Markdowns heading fallback.
    html = html.replace(
      /^####\s+(.+)$/gm,
      '<h4>$1</h4>'
    );

    html = html.replace(
      /^###\s+(.+)$/gm,
      '<h3>$1</h3>'
    );

    html = html.replace(
      /^##\s+(.+)$/gm,
      '<h2>$1</h2>'
    );

    html = html.replace(
      /^#\s+(.+)$/gm,
      '<h2>$1</h2>'
    );

    html = html.replace(
      /\*\*(.+?)\*\*/g,
      '<strong>$1</strong>'
    );

    html = html.replace(
      /(?<!\*)\*([^\*\n]+)\*(?!\*)/g,
      '<em>$1</em>'
    );

    html = html.replace(
      /`([^`]+)`/g,
      '<code>$1</code>'
    );

    const lines =
      html.split(/\r?\n/);

    const output: string[] = [];

    let insideList = false;


    for (const rawLine of lines) {

      const line =
        rawLine.trim();

      const bulletMatch =
        line.match(/^[-*+]\s+(.+)$/);


      if (bulletMatch) {

        if (!insideList) {

          output.push('<ul>');

          insideList = true;
        }


        output.push(
          `<li>${bulletMatch[1]}</li>`
        );

        continue;
      }


      if (insideList) {

        output.push('</ul>');

        insideList = false;
      }


      output.push(rawLine);
    }


    if (insideList) {
      output.push('</ul>');
    }


    html =
      output.join('\n');

    html = html.replace(
      /(?:^|\n)\d+\.\s+(.+)(?=\n|$)/g,
      '<li>$1</li>'
    );

    html = html.replace(
      /\n{3,}/g,
      '\n\n'
    );


    return html.trim();
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


  goBack(): void {

    this.router.navigate([
      '/career-analysis',
      this.careerId
    ]);
  }


  goToExplorer(): void {

    this.router.navigate([
      '/career-explorer'
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

  goToCareerPathway(): void {

    console.log(
      'Opening Career Pathway for career:',
      this.careerId
    );


    if (this.careerId === null) {

      console.error(
        'Career ID is not available.'
      );

      return;
    }


    this.router.navigate([
      '/career-pathway',
      this.careerId
    ]);
  }

}