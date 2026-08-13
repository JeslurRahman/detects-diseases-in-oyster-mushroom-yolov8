const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// SDK 54 enables Metro "package exports" resolution by default. That makes some
// libraries (e.g. zustand) resolve to their ESM build, which uses
// `import.meta.env` — invalid syntax in Metro's classic web bundle, producing
// "Cannot use 'import.meta' outside a module" in the browser. Disabling package
// exports restores CommonJS resolution (the SDK 52 behavior) and fixes web,
// while native is unaffected.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './global.css' });
