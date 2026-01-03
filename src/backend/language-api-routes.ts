import {
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';

import languageConfigManager from './language-config-manager';

const router = Router();

/**
 * Middleware to check admin access
 * TODO: Integrate with DSpace authentication
 * For now, this is a placeholder. In production, this should:
 * 1. Check JWT token from Authorization header
 * 2. Verify user has ADMIN role
 * 3. Return 401/403 if not authorized
 */
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // TODO: Integrate with DSpace authentication
  // For now, assume authenticated admin for development
  // In production: check JWT token, verify ADMIN role
  next();
}

/**
 * GET /api/ui/languages
 * List all languages with their active status
 * Public endpoint - no authentication required
 */
router.get('/languages', (req: Request, res: Response) => {
  try {
    const languages = languageConfigManager.getAllLanguages();
    res.json({ languages });
  } catch (error) {
    console.error('[LanguageAPI] Error getting languages:', error);
    res.status(500).json({ error: 'Failed to load languages' });
  }
});

/**
 * PATCH /api/ui/languages/:code
 * Toggle language active status
 * Requires admin authentication
 */
router.patch('/languages/:code', requireAdmin, (req: Request, res: Response) => {
  const { code } = req.params;
  const { active } = req.body;

  // Validate input
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'active must be boolean' });
  }

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ error: 'language code is required' });
  }

  try {
    const success = languageConfigManager.setLanguageActive(code, active);

    if (success) {
      res.json({ success: true, code, active });
    } else {
      res.status(500).json({ error: 'Failed to update language' });
    }
  } catch (error) {
    console.error('[LanguageAPI] Error updating language:', error);
    res.status(500).json({ error: 'Failed to update language' });
  }
});

/**
 * GET /api/ui/languages/stream
 * Server-Sent Events endpoint for live language configuration updates
 * Public endpoint - no authentication required
 *
 * This allows all connected clients to receive real-time updates when
 * an admin changes language activation status.
 */
router.get('/languages/stream', (req: Request, res: Response) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial data
  try {
    const initialData = languageConfigManager.getAllLanguages();
    res.write(`data: ${JSON.stringify(initialData)}\n\n`);
  } catch (error) {
    console.error('[LanguageAPI] Error sending initial SSE data:', error);
    res.end();
    return;
  }

  // Subscribe to config changes
  const subscription = languageConfigManager.configChanged$.subscribe({
    next: (languages) => {
      try {
        res.write(`data: ${JSON.stringify(languages)}\n\n`);
      } catch (error) {
        console.error('[LanguageAPI] Error sending SSE update:', error);
        subscription.unsubscribe();
      }
    },
    error: (error: unknown) => {
      console.error('[LanguageAPI] SSE subscription error:', error);
      subscription.unsubscribe();
      res.end();
    },
  });

  // Cleanup on client disconnect
  req.on('close', () => {
    console.log('[LanguageAPI] SSE client disconnected');
    subscription.unsubscribe();
    res.end();
  });

  // Send periodic keepalive to prevent timeout
  const keepaliveInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (error) {
      clearInterval(keepaliveInterval);
    }
  }, 30000); // Every 30 seconds

  req.on('close', () => {
    clearInterval(keepaliveInterval);
  });
});

export default router;
