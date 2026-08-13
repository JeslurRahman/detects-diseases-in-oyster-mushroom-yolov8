module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // NOTE (SDK 54 / Reanimated 4): the worklets babel transform is
    // 'react-native-worklets/plugin'. It is supplied by `nativewind/babel`
    // (react-native-css-interop) and processes ALL worklets, so it also powers
    // Reanimated. Adding it (or the old 'react-native-reanimated/plugin') here
    // again would duplicate the transform and break the build.
  };
};
