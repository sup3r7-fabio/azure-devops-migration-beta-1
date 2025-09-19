// Minimal preload; expose a safe API if needed
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  versions: process.versions
});
