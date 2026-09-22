import { Component, OnInit } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthService } from '../../services/auth.service';

type ThemeMode = 'system' | 'light' | 'dark';

@Component({
  selector: 'app-layout',
  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],

  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {

  themeMode: ThemeMode = 'system';

  showThemeMenu = false;


  constructor(
    public authService: AuthService,
    private router: Router
  ) {}


  ngOnInit(): void {

    const savedTheme =
      localStorage.getItem(
        'career-explorer-theme'
      ) as ThemeMode | null;


    if (
      savedTheme === 'light' ||
      savedTheme === 'dark' ||
      savedTheme === 'system'
    ) {

      this.themeMode = savedTheme;

    } else {

      this.themeMode = 'system';

    }


    this.applyTheme();

  }


  setTheme(mode: ThemeMode): void {

    this.themeMode = mode;


    localStorage.setItem(
      'career-explorer-theme',
      mode
    );


    this.applyTheme();


    this.showThemeMenu = false;

  }


  toggleThemeMenu(): void {

    this.showThemeMenu =
      !this.showThemeMenu;

  }


  private applyTheme(): void {

    const root =
      document.documentElement;

    root.removeAttribute(
      'data-theme'
    );

    if (this.themeMode === 'system') {

      return;

    }

    root.setAttribute(
      'data-theme',
      this.themeMode
    );

  }


  getThemeIcon(): string {

    if (
      this.themeMode === 'light'
    ) {

      return '☀';

    }


    if (
      this.themeMode === 'dark'
    ) {

      return '☾';

    }


    return '◐';

  }


  getThemeLabel(): string {

    if (
      this.themeMode === 'light'
    ) {

      return 'Light';

    }


    if (
      this.themeMode === 'dark'
    ) {

      return 'Dark';

    }


    return 'System';

  }


  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/'
    ]);

  }

}