# Electron Sample App

Minimal Electron app with packaging (electron-builder), auto-update (electron-updater), and a sample winget manifest.

## Files added

- `main.js` - Electron main process and auto-updater integration
- `preload.js` - Minimal preload script exposing versions
- `index.html` - Blank page shown by the app
- `package.json` - Scripts, dependencies, and electron-builder config
- `build/icon.ico` - (placeholder) application icon for Windows builds
- `dist/` - output directory created by electron-builder
- `winget/manifest.yaml` - sample winget manifest

## Quick start

1. Install dependencies

```powershell
npm install
```

2. Run the app

```powershell
npm start
```

3. Build distributable (Windows NSIS installer or MSIX)

```powershell
# Create a signed or unsigned installer (NSIS exe):
npm run dist

# Create build artifacts without creating an installer (dir):
npm run dist:dir

# Create MSIX (platform and certificate prerequisites apply):
npm run build
```

## Signing the installer

electron-builder supports code signing via environment variables or `build.win.certificateFile` and `build.win.certificatePassword` in `package.json`.

Example `package.json` snippet (replace placeholders):

```json
"win": {
  "certificateFile": "C:/path/to/cert.pfx",
  "certificatePassword": "${env:CERT_PASSWORD}"
}
```

Instructions:

- Obtain a code signing certificate (.pfx) from a CA.
- Set `CERT_PASSWORD` in your CI secrets or local env before running the build.
- For EV certificates, you may need to use a hardware token or signing service; consult your CA.

PowerShell example (temporary env vars) to sign during build with a local .pfx:

```powershell
$env:CSC_LINK = "C:\path\to\certificate.pfx"
$env:CSC_KEY_PASSWORD = "your-cert-password"
npm run dist
```

If you must run signtool manually (post-build), example:

```powershell
# Replace with real path to your signed installer
& "C:\Program Files (x86)\Windows Kits\10\bin\x64\signtool.exe" sign /fd SHA256 /a /f "C:\path\to\certificate.pfx" /p "cert-password" "dist\ElectronSample-0.1.0-setup.exe"
```

## Auto-update

`electron-updater` is configured to use the `publish` URL from `package.json` (`build.publish.url`).

- To publish updates, upload the generated `latest.yml` and installer files from `dist/` to `https://example.com/downloads/` (or your chosen host).
  
Where artifacts appear
- The default output directory is `dist/` (see `package.json` build.directories.output). After a successful `npm run dist` you'll find:
  - `dist/*.exe` (NSIS installer)
  - `dist/latest.yml` and other update metadata (used by electron-updater)
  - `dist/msix/` if MSIX target was used

Test the installer locally

1. Run the produced EXE on a Windows machine (you may need to unblock in File Explorer).
2. For NSIS installers: installer will install to `%LOCALAPPDATA%` or Program Files depending on `perMachine` setting.
3. If signed with a test certificate, Windows may still warn; use a real CA cert for production.
- The app will call `autoUpdater.checkForUpdatesAndNotify()` on startup and handle download/install events.

## Winget manifest

See `winget/manifest.yaml` for a sample. Replace installer URL and SHA256 hash.

Compute SHA256 (PowerShell) after building the installer (adjust filename):

```powershell
Get-FileHash .\dist\ElectronSample-0.1.0-setup.exe -Algorithm SHA256 | Format-List
```

Copy the Hash value into `winget/manifest.yaml` as the `Sha256` field and update `Url` to the hosted installer.

## Build notes and CI

- Use `npm run dist` on a Windows runner (GitHub Actions, Azure DevOps) or cross-compile on macOS with wine if needed.
- Ensure the certificate is available to the runner and `CERT_PASSWORD` is set.

CI tips:

- Build on a Windows runner when creating signed installers. Use secrets for `CSC_LINK` (or a secure storage) and `CSC_KEY_PASSWORD`.
- After build, compute SHA256 and upload artifacts to a stable CDN (or GitHub Releases) before creating the winget manifest submission.

Local auto-update testing (serve updates with a simple HTTP server):

1. Build an update (increment version in `package.json` and run `npm run dist`).
2. Create a folder `updates/` and copy the generated installer and `latest.yml` into it.
3. Serve it locally:

```powershell
npx http-server ./updates -p 8080
```

4. Launch the installed app (not `npm start`); the running app will contact `http://localhost:8080/` if you set `GENERIC_UPDATES_URL` before launching. Example:

```powershell
$env:GENERIC_UPDATES_URL = 'http://localhost:8080/'
# then run the installed app from Program Files or the built EXE
```

## Next steps

- Add a proper icon at `build/icon.ico`.
- Provide a real update host or GitHub Releases (configure `publish` accordingly).
- Integrate CI to compute SHA256 and create winget submission artifacts.
