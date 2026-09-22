import { Routes } from '@angular/router';
import { Home } from './pages/Home/home';
import { Register } from './pages/register/register';
import { Login } from './pages/Login/login';
import { Profile } from './pages/profile/profile';
import { CareerExplorer } from './pages/career-explorer/career-explorer';
import { CareerDetails } from './pages/career-details/career-details';
import { CareerAnalysis } from './pages/career-analysis/career-analysis';
import { AiGuidance } from './pages/ai-guidance/ai-guidance';
import { Dashboard } from './pages/dashboard/dashboard';
import { CareerPathway } from './pages/career-pathway/career-pathway';
import { Assessment } from './pages/assessment/assessment';
import { Roadmap } from './pages/roadmap/roadmap';

export const routes: Routes = [

    {
        path: '',
        component: Home
    },

    {
        path: 'login',
        component: Login
    },

    {
        path: 'register',
        component: Register
    },
    {
        path: 'profile',
        component: Profile
    },

    {
        path: 'career-explorer',
        component: CareerExplorer
    },

    {
        path: 'career-details/:id',
        component: CareerDetails
    },

    {
        path: 'career-analysis/:id',
        component: CareerAnalysis
    },

    {
        path: 'ai-guidance/:id',
        component: AiGuidance
    },
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: 'career-pathway/:careerId',
        component: CareerPathway
    },
    {
        path: 'assessment',
        component: Assessment
    },
    {
        path: 'roadmap/:careerId',
        component: Roadmap
    },
    {
        path: '**',
        redirectTo: ''
    }
];