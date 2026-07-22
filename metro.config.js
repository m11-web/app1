const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude the .local directory (Replit internal skills/artifacts) from Metro's file watcher
// so it doesn't crash when those paths don't exist.
config.watchFolders = (config.watchFolders || []).filter(
  f => !f.includes('.local')
);
config.resolver = config.resolver || {};
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /\/\.local\/.*/,
];

module.exports = config;
