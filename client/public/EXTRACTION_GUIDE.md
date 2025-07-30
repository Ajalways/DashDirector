# How to Extract Your PulseBoardAI Files

## If You Downloaded: pulseboardai-complete.tar.gz

### Windows:
1. **Download 7-Zip** (free): https://www.7-zip.org/
2. Right-click the .tar.gz file
3. Select "7-Zip" → "Extract Here"
4. You'll get a folder with all your files

### Mac:
1. Double-click the .tar.gz file
2. Archive Utility will automatically extract it
3. Or use Terminal: `tar -xzf pulseboardai-complete.tar.gz`

### Linux:
```bash
tar -xzf pulseboardai-complete.tar.gz
```

## Alternative: Download Individual Files

Instead of the compressed file, you can download these files individually from Replit:

### Essential Files for Deployment:
- `DIGITAL_OCEAN_SETUP.md` - Complete deployment guide
- `deploy.sh` - Deployment script
- `ecosystem.config.js` - PM2 configuration
- `package.json` - Dependencies
- `drizzle.config.ts` - Database configuration

### Source Code Folders:
- `client/` - React frontend
- `server/` - Express backend  
- `shared/` - Shared types and schemas

## Quick Start:
1. Extract files to a folder
2. Open terminal in that folder
3. Run: `npm install`
4. Run: `npm run build`
5. Follow DIGITAL_OCEAN_SETUP.md

## If Still Having Issues:
Download the project directly from Replit using:
- File Explorer → Three dots menu → "Download as zip"
- This creates a standard ZIP file that works on all systems