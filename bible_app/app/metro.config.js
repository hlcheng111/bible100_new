const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { resolve } = require('metro-resolver');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  '@bible-app/core': path.resolve(monorepoRoot, 'packages', 'core'),
};
config.resolver.assetExts = [...config.resolver.assetExts, 'db'];

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (moduleName === '@grpc/grpc-js' || moduleName.startsWith('@grpc/'))) {
    return { type: 'empty' };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return resolve(context, moduleName, platform);
};

// Windows monorepo: normalize backslash bundle URLs in dev server
config.server.rewriteRequestUrl = (url) => {
  if (!url.includes('bundle')) return url;
  let next = url.replace(/%5C/gi, '/').replace(/\\/g, '/');
  if (next.includes('/../node_modules/')) {
    next = next.replace('/../node_modules/', '/node_modules/');
  }
  return next;
};

module.exports = config;
