import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AsyncPipe,
  NgClass,
} from '@angular/common';
import {
  Observable,
  Subscription,
} from 'rxjs';
import { take } from 'rxjs/operators';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import { LangConfig } from '../../../config/lang-config.interface';
import { LanguageConfigService } from '../../core/config/language-config.service';
import { NotificationsService } from '../../core/notification-system/notifications.service';
import { BtnDisabledDirective } from '../../shared/btn-disabled.directive';

/**
 * Component for managing UI language activation/deactivation.
 * Allows administrators to enable or disable languages at runtime without rebuilding the application.
 */
@Component({
  selector: 'ds-admin-language-settings',
  templateUrl: './admin-language-settings.component.html',
  styleUrls: ['./admin-language-settings.component.scss'],
  imports: [
    AsyncPipe,
    BtnDisabledDirective,
    NgClass,
    TranslateModule,
  ],
})
export class AdminLanguageSettingsComponent implements OnInit, OnDestroy {
  /**
   * Observable of all available languages
   */
  languages$: Observable<LangConfig[]>;

  /**
   * Loading state
   */
  loading = false;

  /**
   * Subscription to track ongoing operations
   */
  private subscription: Subscription = new Subscription();

  constructor(
    private languageConfigService: LanguageConfigService,
    private notificationsService: NotificationsService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    // Get all languages (active and inactive)
    this.languages$ = this.languageConfigService.getAllLanguages();
  }

  /**
   * Toggle the active status of a language
   * @param language The language to toggle
   */
  toggleLanguage(language: LangConfig): void {
    const newActiveState = !language.active;
    const action = newActiveState ? 'activate' : 'deactivate';

    this.loading = true;

    const sub = this.languageConfigService.setLanguageActive(language.code, newActiveState).subscribe({
      next: () => {
        this.loading = false;
        this.notificationsService.success(
          this.translateService.get(`admin.language-settings.notifications.${action}.success.title`),
          this.translateService.get(`admin.language-settings.notifications.${action}.success.content`),
        );
      },
      error: (error) => {
        this.loading = false;
        console.error(`Error ${action}ing language ${language.code}:`, error);
        this.notificationsService.error(
          this.translateService.get(`admin.language-settings.notifications.${action}.error.title`),
          this.translateService.get(`admin.language-settings.notifications.${action}.error.content`),
        );
      },
    });

    this.subscription.add(sub);
  }

  /**
   * Disable all languages except English
   */
  disableAllLanguages(): void {
    this.loading = true;

    // Get all active languages except English
    const sub = this.languageConfigService.getAllLanguages().pipe(
      take(1),
    ).subscribe({
      next: (languages) => {
        const languagesToDisable = languages.filter(lang => lang.active && lang.code !== 'en');

        if (languagesToDisable.length === 0) {
          // No languages to disable, just return silently
          this.loading = false;
          return;
        }

        // Disable each language
        let completed = 0;
        let hasError = false;

        languagesToDisable.forEach(language => {
          const langSub = this.languageConfigService.setLanguageActive(language.code, false).subscribe({
            next: () => {
              completed++;
              if (completed === languagesToDisable.length) {
                this.loading = false;
                if (!hasError) {
                  this.notificationsService.success(
                    this.translateService.get('admin.language-settings.notifications.disable-all.success.title'),
                    this.translateService.get('admin.language-settings.notifications.disable-all.success.content'),
                  );
                }
              }
            },
            error: (error) => {
              completed++;
              hasError = true;
              console.error(`Error disabling language ${language.code}:`, error);
              if (completed === languagesToDisable.length) {
                this.loading = false;
                this.notificationsService.error(
                  this.translateService.get('admin.language-settings.notifications.disable-all.error.title'),
                  this.translateService.get('admin.language-settings.notifications.disable-all.error.content'),
                );
              }
            },
          });
          this.subscription.add(langSub);
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching languages:', error);
        this.notificationsService.error(
          this.translateService.get('admin.language-settings.notifications.disable-all.error.title'),
          this.translateService.get('admin.language-settings.notifications.disable-all.error.content'),
        );
      },
    });

    this.subscription.add(sub);
  }


  /**
   * Track by function for ngFor optimization
   */
  trackByCode(index: number, language: LangConfig): string {
    return language.code;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
