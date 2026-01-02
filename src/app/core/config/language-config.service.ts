import {
  Injectable,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
} from 'rxjs';
import {
  map,
  tap,
} from 'rxjs/operators';

import { LangConfig } from '../../../config/lang-config.interface';

/**
 * Service for managing UI language configuration with live updates.
 * Connects to the backend API for language management and receives real-time
 * updates via Server-Sent Events when languages are activated/deactivated.
 */
@Injectable({ providedIn: 'root' })
export class LanguageConfigService implements OnDestroy {
  /**
   * Subject holding the current list of all languages (active and inactive)
   */
  private languagesSubject = new BehaviorSubject<LangConfig[]>([]);

  /**
   * Observable of all languages
   */
  public languages$ = this.languagesSubject.asObservable();

  /**
   * Server-Sent Events connection for live updates
   */
  private eventSource: EventSource | null = null;

  /**
   * Reconnection timeout handle
   */
  private reconnectTimeout: any = null;

  /**
   * Flag to track if we've initialized
   */
  private initialized = false;

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    // Don't initialize in constructor to avoid SSR issues
    // Initialization will happen lazily when getActiveLanguages() or getAllLanguages() is called
  }

  /**
   * Initialize the service (only called once, lazily)
   */
  private ensureInitialized(): void {
    // Only initialize in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.initialized) {
      return;
    }
    this.initialized = true;

    // Use setTimeout to defer initialization until after current call stack
    // This ensures Angular's HTTP infrastructure is fully ready
    setTimeout(() => {
      this.initializeLanguages();
      this.connectToLiveUpdates();
    }, 0);
  }

  /**
   * Fetch initial language configuration from backend
   */
  private initializeLanguages(): void {
    this.http.get<{ languages: LangConfig[] }>('/api/ui/languages').subscribe({
      next: (response) => this.languagesSubject.next(response.languages),
      error: (error) => {
        console.error('[LanguageConfig] Error loading initial languages:', error);
        // On error, keep the current value (empty array if first load)
      },
    });
  }

  /**
   * Connect to Server-Sent Events stream for live language configuration updates.
   * This allows all connected clients to receive real-time updates when an admin
   * changes language activation status.
   */
  private connectToLiveUpdates(): void {
    try {
      this.eventSource = new EventSource('/api/ui/languages/stream');

      this.eventSource.onmessage = (event) => {
        this.ngZone.run(() => {
          try {
            const languages: LangConfig[] = JSON.parse(event.data);
            this.languagesSubject.next(languages);
            console.log('[LanguageConfig] Live update received:', languages.length, 'languages');
          } catch (error) {
            console.error('[LanguageConfig] Error parsing SSE data:', error);
          }
        });
      };

      this.eventSource.onerror = (error) => {
        console.error('[LanguageConfig] SSE connection error:', error);
        this.closeEventSource();
        // Attempt to reconnect after 5 seconds
        this.scheduleReconnect();
      };

      this.eventSource.onopen = () => {
        console.log('[LanguageConfig] SSE connection established');
      };
    } catch (error) {
      console.error('[LanguageConfig] Error creating EventSource:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule a reconnection attempt after a delay
   */
  private scheduleReconnect(): void {
    // Only reconnect in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log('[LanguageConfig] Attempting to reconnect to SSE...');
      this.connectToLiveUpdates();
    }, 5000);
  }

  /**
   * Close the EventSource connection
   */
  private closeEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Get all languages (active and inactive)
   */
  public getAllLanguages(): Observable<LangConfig[]> {
    this.ensureInitialized();
    return this.languages$;
  }

  /**
   * Get only active languages
   */
  public getActiveLanguages(): Observable<LangConfig[]> {
    this.ensureInitialized();
    return this.languages$.pipe(
      map((langs) => langs.filter((l) => l.active)),
    );
  }

  /**
   * Update the active status of a language
   * @param code Language code (e.g., 'en', 'fr', 'de')
   * @param active New active status
   * @returns Observable that completes when the update is successful
   */
  public setLanguageActive(code: string, active: boolean): Observable<any> {
    return this.http.patch(`/api/ui/languages/${code}`, { active });
    // Note: No need to manually refresh the language list here,
    // the SSE stream will push the update automatically
  }

  /**
   * Refresh the language configuration from backend
   * This is useful for manual refresh or error recovery
   */
  public refreshConfiguration(): Observable<void> {
    return this.http.get<{ languages: LangConfig[] }>('/api/ui/languages').pipe(
      map((response) => {
        this.languagesSubject.next(response.languages);
      }),
    );
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.closeEventSource();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }
}
