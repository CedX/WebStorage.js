# Changelog

## Version [2026.11.0](https://github.com/CedX/WebStorage.js/compare/v8.0.0...v2026.11.0)
- Breaking change: raised the required [Node.js](https://nodejs.org) version.
- Breaking change: the `Storage.keys` property is now implemented as `string[]`.
- Breaking change: the `Storage.onChange()` method now returns an `AbortController` allowing to cancel the subscription.
- Breaking change: removed the `Storage.toJSON()` method.
- Switched to a year-based versioning.

## Version [8.0.0](https://github.com/CedX/WebStorage.js/compare/v7.2.0...v8.0.0)
- Breaking change: the `Storage` class now **always** serializes/deserializes values to/from JSON.
- Breaking change: removed the `getObject()` and `setObject()` methods from the `Storage` class.
- Breaking change: renamed the `Storage.destroy()` method to `dispose()`.
- Breaking change: replaced the `StorageEvent.type` property by `Storage.changeEvent`.

## Version [7.2.0](https://github.com/CedX/WebStorage.js/compare/v7.1.0...v7.2.0)
- Fixed the return type of the generator functions.
- The `Storage` class now implements the `Disposable` interface.

## Version [7.1.0](https://github.com/CedX/WebStorage.js/compare/v7.0.0...v7.1.0)
- Ported the source code to [TypeScript](https://www.typescriptlang.org).

## Version [7.0.0](https://github.com/CedX/WebStorage.js/compare/v6.0.0...v7.0.0)
- Ported the source code to [CoffeeScript](https://coffeescript.org).

## Version [6.0.0](https://github.com/CedX/WebStorage.js/compare/v5.0.1...v6.0.0)
- Breaking change: the `Storage.keys` property is now implemented as `Set<string>`.

## Version [5.0.1](https://github.com/CedX/WebStorage.js/compare/v5.0.0...v5.0.1)
- Migrated the documentation to the [GitHub wiki](https://github.com/CedX/WebStorage.js/wiki).

## Version [5.0.0](https://github.com/CedX/WebStorage.js/compare/v4.2.0...v5.0.0)
- Breaking change: renamed the `Storage.remove()` method to `delete()`.
- Breaking change: removed the `putIfAbsent()` and `putObjectIfAbsent()` methods from the `Storage` class.

## Version [4.2.0](https://github.com/CedX/WebStorage.js/compare/v4.1.0...v4.2.0)
- Ported the source code to [TypeScript](https://www.typescriptlang.org).

## Version [4.1.0](https://github.com/CedX/WebStorage.js/compare/v4.0.0...v4.1.0)
- Use generics for the signature of the `getObject()`, `putObjectIfAbsent()` and `setObject()` methods of the `Storage` class.

## Version [4.0.0](https://github.com/CedX/WebStorage.js/compare/v3.0.0...v4.0.0)
- Breaking change: removed the `localStorage` and `sessionStorage` symbols.
- Fixed the [TypeScript](https://www.typescriptlang.org) typings.

## Version [3.0.0](https://github.com/CedX/WebStorage.js/compare/v2.0.2...v3.0.0)
- Breaking change: removed the `LocalStorage` and `SessionStorage` classes.
- Added the `localStorage` and `sessionStorage` symbols.

## Version [2.0.2](https://github.com/CedX/WebStorage.js/compare/v2.0.1...v2.0.2)
- Fixed the [TypeScript](https://www.typescriptlang.org) typings.

## Version [2.0.1](https://github.com/CedX/WebStorage.js/compare/v2.0.0...v2.0.1)
- Fixed a packaging issue.

## Version [2.0.0](https://github.com/CedX/WebStorage.js/compare/v1.6.0...v2.0.0)
- Breaking change: removed the `defaultValue` parameter from the getter methods.
- Breaking change: renamed the `WebStorage` class to `Storage`.
- Breaking change: replaced the `SimpleChange` class by the `StorageEvent` one.
- Added support for key prefix.
- Added the `local()` and `session()` static methods to the `Storage` class.
- Added the `Storage.onChange()` instance method.
- Ported the source code to [JavaScript](https://developer.mozilla.org/docs/Web/JavaScript).
- Restored support for [GitHub Packages](https://github.com/features/packages).

## Version [1.6.0](https://github.com/CedX/WebStorage.js/compare/v1.5.0...v1.6.0)
- Replaced the build system based on [Gulp](https://gulpjs.com) by [PowerShell](https://learn.microsoft.com/powershell) scripts.
- Updated the package dependencies.

## Version [1.5.0](https://github.com/CedX/WebStorage.js/compare/v1.4.0...v1.5.0)
- Dropped support for [GitHub Packages](https://github.com/features/packages).
- Raised the [Node.js](https://nodejs.org) constraint.
- Updated the documentation.
- Updated the package dependencies.

## Version [1.4.0](https://github.com/CedX/WebStorage.js/compare/v1.3.0...v1.4.0)
- Added the `listenToStorageEvents` optional parameter to the class constructors.
- Added the `WebStorageOptions` interface.
- Improved the documentation.

## Version [1.3.0](https://github.com/CedX/WebStorage.js/compare/v1.2.0...v1.3.0)
- Updated the package dependencies.

## Version [1.2.0](https://github.com/CedX/WebStorage.js/compare/v1.1.0...v1.2.0)
- Added the `putIfAbsent()` and `putObjectIfAbsent()` methods to the `WebStorage` class.
- Updated the package dependencies.

## Version [1.1.0](https://github.com/CedX/WebStorage.js/compare/v1.0.0...v1.1.0)
- Replaced [`babel-minify`](https://github.com/babel/minify) by [`terser`](https://terser.org) for minification.

## Version 1.0.0
- Initial release.
