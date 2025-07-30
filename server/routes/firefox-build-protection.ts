import { Request, Response, NextFunction } from 'express';

export function firefoxBuildProtection(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.headers['user-agent'] || '';
  const isFirefox = userAgent.includes('Firefox');
  const isBuildRequest = req.url.includes('/build') || 
                        req.url.includes('/deploy') ||
                        req.method === 'POST' && req.url.includes('/api/build');

  if (isFirefox && isBuildRequest) {
    console.log('Firefox build request blocked for safety');
    
    return res.status(200).json({
      success: false,
      error: 'FIREFOX_BUILD_BLOCKED',
      message: 'Firefox build disabled due to Service Worker compatibility issues',
      alternatives: [
        'Use command line: npm run build',
        'Switch to Chrome, Edge, or Safari for building',
        'Continue using Firefox for development'
      ],
      redirectUrl: '/firefox-safe-build.html'
    });
  }

  next();
}