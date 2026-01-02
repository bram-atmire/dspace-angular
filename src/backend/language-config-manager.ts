import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import chokidar from 'chokidar';
import { Subject } from 'rxjs';

interface LangConfig {
  code: string;
  label: string;
  active: boolean;
}

/**
 * Manages language configuration from config.prod.yml with file watching and live updates.
 * This allows admin users to activate/deactivate UI languages at runtime without rebuilding.
 */
class LanguageConfigManager {
  private configFilePath: string;
  private currentConfig: any;
  public configChanged$ = new Subject<LangConfig[]>();

  constructor() {
    this.configFilePath = path.join(__dirname, '../../config/config.prod.yml');
    this.loadConfig();
    this.watchConfigFile();
  }

  /**
   * Load configuration from YAML file
   */
  private loadConfig(): void {
    try {
      const fileContents = fs.readFileSync(this.configFilePath, 'utf8');
      this.currentConfig = yaml.load(fileContents);
      console.log('[LanguageConfig] Configuration loaded');
    } catch (error) {
      console.error('[LanguageConfig] Error loading config:', error);
      throw error;
    }
  }

  /**
   * Watch config file for changes and reload when modified
   */
  private watchConfigFile(): void {
    const watcher = chokidar.watch(this.configFilePath, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('change', () => {
      console.log('[LanguageConfig] Config file changed, reloading...');
      this.loadConfig();
      // Notify all subscribers (Angular clients via SSE)
      this.configChanged$.next(this.getAllLanguages());
    });

    watcher.on('error', (error) => {
      console.error('[LanguageConfig] File watcher error:', error);
    });
  }

  /**
   * Get all languages from config (active and inactive)
   */
  public getAllLanguages(): LangConfig[] {
    return this.currentConfig.languages || [];
  }

  /**
   * Get only active languages
   */
  public getActiveLanguages(): LangConfig[] {
    return this.getAllLanguages().filter((lang) => lang.active);
  }

  /**
   * Update the active status of a language and persist to config file
   * @param code Language code (e.g., 'en', 'fr', 'de')
   * @param active New active status
   * @returns true if successful, false otherwise
   */
  public setLanguageActive(code: string, active: boolean): boolean {
    try {
      const langIndex = this.currentConfig.languages.findIndex(
        (l: LangConfig) => l.code === code,
      );

      if (langIndex === -1) {
        throw new Error(`Language ${code} not found`);
      }

      // Update in-memory config
      this.currentConfig.languages[langIndex].active = active;

      // Write back to YAML file
      const yamlStr = yaml.dump(this.currentConfig, {
        indent: 2,
        lineWidth: 120,
        quotingType: '"',
      });

      fs.writeFileSync(this.configFilePath, yamlStr, 'utf8');
      console.log(`[LanguageConfig] Updated ${code} active=${active}`);

      // File watcher will trigger reload and notify clients
      return true;
    } catch (error) {
      console.error('[LanguageConfig] Error updating language:', error);
      return false;
    }
  }
}

// Singleton instance
const languageConfigManager = new LanguageConfigManager();
export default languageConfigManager;
