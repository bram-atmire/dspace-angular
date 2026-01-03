
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { LangConfig } from '@dspace/config/lang-config.interface';
import { LanguageConfigService } from '@dspace/core/config/language-config.service';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'ds-base-lang-switch',
  styleUrls: ['lang-switch.component.scss'],
  templateUrl: 'lang-switch.component.html',
  imports: [
    NgbDropdownModule,
    TranslateModule,
  ],
})

/**
 * Component representing a switch for changing the interface language throughout the application
 * If only one language is active, the component will disappear as there are no languages to switch to.
 * This component automatically updates when an admin activates/deactivates languages.
 */
export class LangSwitchComponent implements OnInit, OnDestroy {

  // All of the languages that are active, meaning that a user can switch between them.
  activeLangs: LangConfig[] = [];

  // A language switch only makes sense if there is more than one active language to switch between.
  moreThanOneLanguage: boolean;

  // Subscription for active languages
  private languagesSubscription: Subscription;

  constructor(
    public el: ElementRef,
    public translate: TranslateService,
    private localeService: LocaleService,
    private languageConfigService: LanguageConfigService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
  }

  ngOnInit(): void {
    // Initialize with static config for SSR
    this.activeLangs = environment.languages.filter((lang) => lang.active);
    this.moreThanOneLanguage = (this.activeLangs.length > 1);

    // Only subscribe to dynamic updates in browser
    if (isPlatformBrowser(this.platformId)) {
      // Subscribe to active languages from LanguageConfigService
      // This will automatically update when an admin activates/deactivates languages
      this.languagesSubscription = this.languageConfigService.getActiveLanguages().subscribe(
        (activeLanguages: LangConfig[]) => {
          // Only update if we got actual data (not empty initial state)
          if (activeLanguages.length > 0) {
            this.activeLangs = activeLanguages;
            this.moreThanOneLanguage = (this.activeLangs.length > 1);

            // Show/hide the language switch based on number of active languages
            if (this.moreThanOneLanguage) {
              this.el.nativeElement.parentElement.classList.remove('d-none');
            } else {
              this.el.nativeElement.parentElement.classList.add('d-none');
            }
          }
        },
      );
    } else {
      // SSR: set visibility based on static config
      if (!this.moreThanOneLanguage) {
        this.el.nativeElement.parentElement.classList.add('d-none');
      }
    }
  }

  /**
   * Returns the label for the current language
   */
  currentLangLabel(): string {
    const currentLang = this.activeLangs.find((MyLangConfig) => MyLangConfig.code === this.translate.getCurrentLang());
    return currentLang?.label || this.translate.getCurrentLang();
  }

  /**
   * Returns the label for a specific language code
   */
  langLabel(langcode: string): string {
    const lang = this.activeLangs.find((MyLangConfig) => MyLangConfig.code === langcode);
    return lang?.label || langcode;
  }

  /**
   * Switch to a language and store it in a cookie
   * @param lang    The language to switch to
   */
  useLang(lang: string) {
    this.localeService.setCurrentLanguageCode(lang);
    this.localeService.refreshAfterChangeLanguage();
  }

  /**
   * Cleanup on component destruction
   */
  ngOnDestroy(): void {
    if (this.languagesSubscription) {
      this.languagesSubscription.unsubscribe();
    }
  }

}
