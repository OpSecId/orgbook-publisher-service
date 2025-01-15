(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["credentialHandlerPolyfill"] = factory();
	else
		root["credentialHandlerPolyfill"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./CredentialHandler.js":
/*!******************************!*\
  !*** ./CredentialHandler.js ***!
  \******************************/
/*! exports provided: CredentialHandler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CredentialHandler", function() { return CredentialHandler; });
/* harmony import */ var web_request_rpc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! web-request-rpc */ "./node_modules/web-request-rpc/index.js");
/* harmony import */ var _CredentialHandlerService_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CredentialHandlerService.js */ "./CredentialHandlerService.js");
/*!
 * The core CredentialHandler class.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global DOMException */






const EVENT_TYPES = ['credentialrequest', 'credentialstore'];

class CredentialHandler extends web_request_rpc__WEBPACK_IMPORTED_MODULE_0__["WebApp"] {
  constructor(mediatorOrigin, inline = false) {
    if(typeof mediatorOrigin !== 'string') {
      throw new TypeError('"mediatorOrigin" must be a string.');
    }
    super(mediatorOrigin, inline);
    this._emitter = new web_request_rpc__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]({
      async waitUntil(event) {
        // TODO: may need to do `this.hide()` after this promise resolves
        //   to handle case where e.openWindow() was called
        return event._promise || Promise.reject(
          new DOMException(
            'No "credentialrequest" event handler found.', 'NotFoundError'));
      }
    });
  }

  async connect() {
    const injector = await super.connect();

    // define API that CredentialMediator can call on this credential handler
    this.server.define('credentialHandler', new _CredentialHandlerService_js__WEBPACK_IMPORTED_MODULE_1__["CredentialHandlerService"](this));

    // auto-call `ready`
    await this.ready();

    return injector;
  }

  addEventListener(eventType, fn) {
    if(!EVENT_TYPES.includes(eventType)) {
      throw new DOMException(
        `Unsupported event type "${eventType}"`, 'NotSupportedError');
    }
    return this._emitter.addEventListener(eventType, fn);
  }

  removeEventListener(eventType, fn) {
    if(!EVENT_TYPES.includes(eventType)) {
      throw new DOMException(
        `Unsupported event type "${eventType}"`, 'NotSupportedError');
    }
    return this._emitter.removeEventListener(eventType, fn);
  }
}


/***/ }),

/***/ "./CredentialHandlerRegistration.js":
/*!******************************************!*\
  !*** ./CredentialHandlerRegistration.js ***!
  \******************************************/
/*! exports provided: CredentialHandlerRegistration */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CredentialHandlerRegistration", function() { return CredentialHandlerRegistration; });
/* harmony import */ var _CredentialManager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CredentialManager.js */ "./CredentialManager.js");
/*!
 * A CredentialHandlerRegistration provides a CredentialManager to enable Web
 * apps to register Profiles that can be presented to websites.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */




class CredentialHandlerRegistration {
  constructor(url, injector) {
    if(!(url && typeof url === 'string')) {
      throw new TypeError('"url" must be a non-empty string.');
    }
    this.credentialManager = new _CredentialManager_js__WEBPACK_IMPORTED_MODULE_0__["CredentialManager"](url, injector);
  }
}


/***/ }),

/***/ "./CredentialHandlerService.js":
/*!*************************************!*\
  !*** ./CredentialHandlerService.js ***!
  \*************************************/
/*! exports provided: CredentialHandlerService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CredentialHandlerService", function() { return CredentialHandlerService; });
/* harmony import */ var _CredentialRequestEvent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CredentialRequestEvent.js */ "./CredentialRequestEvent.js");
/* harmony import */ var _CredentialStoreEvent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CredentialStoreEvent.js */ "./CredentialStoreEvent.js");
/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */



/* A CredentialHandlerService handles remote calls to a CredentialHandler. */
class CredentialHandlerService {
  constructor(credentialHandler) {
    this._credentialHandler = credentialHandler;
  }

  async request(credentialRequestEvent) {
    // TODO: validate credentialRequestEvent
    return await this._credentialHandler._emitter.emit(
      new _CredentialRequestEvent_js__WEBPACK_IMPORTED_MODULE_0__["CredentialRequestEvent"](Object.assign(
        {credentialHandler: this._credentialHandler}, credentialRequestEvent)));
  }

  async store(credentialStoreEvent) {
    // TODO: validate credentialStoreEvent
    return await this._credentialHandler._emitter.emit(
      new _CredentialStoreEvent_js__WEBPACK_IMPORTED_MODULE_1__["CredentialStoreEvent"](Object.assign(
        {credentialHandler: this._credentialHandler}, credentialStoreEvent)));
  }
}


/***/ }),

/***/ "./CredentialHandlers.js":
/*!*******************************!*\
  !*** ./CredentialHandlers.js ***!
  \*******************************/
/*! exports provided: CredentialHandlers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CredentialHandlers", function() { return CredentialHandlers; });
/* harmony import */ var _CredentialHandlerRegistration_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CredentialHandlerRegistration.js */ "./CredentialHandlerRegistration.js");
/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */


class CredentialHandlers {
  constructor(injector) {
    this._init = (async () => {
      this._injector = await injector;
      this._remote = this._injector.get('credentialHandlers', {
        functions: [
          'register', 'unregister', 'getRegistration', 'hasRegistration']
      });
    })();
  }

  /**
   * Creates a credential handler registration.
   *
   * @param url the unique URL for the credential handler.
   *
   * @return a Promise that resolves to the CredentialHandlerRegistration.
   */
  async register(url) {
    this._deprecateNotice();
    await this._init;
    // register with credential mediator
    url = await this._remote.register('credential', url);
    return new _CredentialHandlerRegistration_js__WEBPACK_IMPORTED_MODULE_0__["CredentialHandlerRegistration"](url, this._injector);
  }

  /**
   * Unregisters a credential handler, destroying its registration.
   *
   * @param url the unique URL for the credential handler.
   *
   * @return a Promise that resolves to `true` if the handler was registered
   *           and `false` if not.
   */
  async unregister(url) {
    this._deprecateNotice();
    await this._init;
    // unregister with credential mediator
    return this._remote.unregister('credential', url);
  }

  /**
   * Gets an existing credential handler registration.
   *
   * @param url the URL for the credential handler.
   *
   * @return a Promise that resolves to the CredentialHandlerRegistration or
   *           `null` if no such registration exists.
   */
  async getRegistration(url) {
    this._deprecateNotice();
    await this._init;
    url = await this._remote.getRegistration('credential', url);
    if(!url) {
      return null;
    }
    return new _CredentialHandlerRegistration_js__WEBPACK_IMPORTED_MODULE_0__["CredentialHandlerRegistration"](url, this._injector);
  }

  /**
   * Returns true if the given credential handler has been registered and
   * false if not.
   *
   * @param url the URL for the credential handler.
   *
   * @return a Promise that resolves to `true` if the registration exists and
   *           `false` if not.
   */
  async hasRegistration(url) {
    this._deprecateNotice();
    await this._init;
    return await this._remote.hasRegistration('credential', url);
  }

  _deprecateNotice() {
    console.warn(
      'Credential handler registration APIs are deprecated. The credential ' +
      'handler specified in "manifest.json" is now automatically registered ' +
      'when a user grants permission to install a credential handler via ' +
      '"CredentialManager.requestPermission()".');
  }
}


/***/ }),

/***/ "./CredentialHints.js":
/*!****************************!*\
  !*** ./CredentialHints.js ***!
  \****************************/
/*! exports provided: CredentialHints */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CredentialHints", function() { return CredentialHints; });
/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */
/* global Image */
class CredentialHints {
  constructor(url, injector) {
    const remote = injector.get('credentialHints', {
      functions: ['delete', 'get', 'keys', 'has', 'set', 'clear']
    });
    for(let methodName in remote) {
      if(methodName !== 'set') {
        const method = remote[methodName].bind(this, url);
        this[methodName] = function(...args) {
          this._deprecateNotice();
          return method(...args);
        };
      }
    }
    this._remoteSet = remote.set.bind(this, url);
  }

  async set(hintKey, credentialHint) {
    this._deprecateNotice();

    // ensure images are prefetched so that they will not leak information
    // when fetched later
    credentialHint.icons = credentialHint.icons || [];
    const promises = credentialHint.icons.map(icon =>
      imageToDataUrl(icon.src).then(fetchedImage => {
        icon.fetchedImage = fetchedImage;
      }));
    await Promise.all(promises);
    return this._remoteSet(hintKey, credentialHint);
  }

  _deprecateNotice() {
    console.warn('Credential hints are deprecated and no longer used.');
  }
}

function imageToDataUrl(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      let canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL();
      resolve(dataUrl);
      canvas = null;
    };
    // TODO: `reject` as an error and fail `.set`?
    img.onerror = () => resolve(null);
    img.src = url;
  });
}


/***/ }),

/***/ "./CredentialManager.js":
/*!******************************!*\
  !*** ./CredentialManager.js ***!
  \******************************/
/*! exports provided: CredentialManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CredentialManager", function() { return CredentialManager; });
/* harmony import */ var _CredentialHints_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CredentialHints.js */ "./CredentialHints.js");
/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator */


/* A CredentialManager for a Web Credential Mediator. */
class CredentialManager {
  constructor(url, injector) {
    if(!(url && typeof url === 'string')) {
      throw new TypeError('"url" must be a non-empty string.');
    }
    this.hints = new _CredentialHints_js__WEBPACK_IMPORTED_MODULE_0__["CredentialHints"](url, injector);
  }

  /**
   * Requests that the user grant 'credentialhandler' permission to the current
   * origin.
   *
   * @return a Promise that resolves to the new PermissionState of the
   *           permission (e.g. 'granted'/'denied').
   */
  static async requestPermission() {
    const status = await navigator.credentialsPolyfill.permissions.request(
      {name: 'credentialhandler'});
    return status.state;
  }
}


/***/ }),

/***/ "./CredentialRequestEvent.js":
/*!***********************************!*\
  !*** ./CredentialRequestEvent.js ***!
  \***********************************/
/*! exports provided: CredentialRequestEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CredentialRequestEvent", function() { return CredentialRequestEvent; });
/* harmony import */ var web_request_rpc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! web-request-rpc */ "./node_modules/web-request-rpc/index.js");
/*!
 * A CredentialRequestEvent is emitted when a request has been made for
 * credentials.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global Event */




// can't use "ExtendableEvent"; only accessible from Workers
// TODO: may not be able to even extend `Event` here; could produce "incorrect"
//   core attributes
class CredentialRequestEvent /*extends Event*/ {
  constructor({
    credentialHandler,
    credentialRequestOrigin,
    credentialRequestOptions,
    hintKey
  }) {
    //super('credentialrequest');
    this.type = 'credentialrequest';
    this._credentialHandler = credentialHandler;
    this.credentialRequestOrigin = credentialRequestOrigin;
    this.credentialRequestOptions = credentialRequestOptions;
    this.hintKey = hintKey;
  }

  async openWindow(url) {
    // TODO: disallow more than one call

    // TODO: ensure `url` is to the same origin
    await this._credentialHandler.show();
    const appWindow = new web_request_rpc__WEBPACK_IMPORTED_MODULE_0__["WebAppWindow"](url, {
      className: 'credential-handler'
    });
    appWindow.ready();
    appWindow.show();
    // TODO: note that `appWindow.handle` is not a ServiceWorker
    //   `WindowClient` polyfill... could be confusing here, should we
    //   implement one to wrap it? -- there is, for example, a
    //   `navigate` call on `WindowClient` that enforces same origin, would
    //   need to attempt to add or approximate that
    appWindow.handle._dialog = appWindow.dialog;
    return appWindow.handle;
  }

  respondWith(handlerResponse) {
    // TODO: throw exception if `_promise` is already set

    // TODO: validate handlerResponse
    this._promise = handlerResponse;
  }
}


/***/ }),

/***/ "./CredentialStoreEvent.js":
/*!*********************************!*\
  !*** ./CredentialStoreEvent.js ***!
  \*********************************/
/*! exports provided: CredentialStoreEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CredentialStoreEvent", function() { return CredentialStoreEvent; });
/* harmony import */ var web_request_rpc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! web-request-rpc */ "./node_modules/web-request-rpc/index.js");
/*!
 * A CredentialStoreEvent is emitted when a request has been made to
 * store a credential.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global Event */




// can't use "ExtendableEvent"; only accessible from Workers
// TODO: may not be able to even extend `Event` here; could produce "incorrect"
//   core attributes
class CredentialStoreEvent /*extends Event*/ {
  constructor({
    credentialHandler,
    credentialRequestOrigin,
    credential,
    hintKey
  }) {
    //super('credentialstore');
    this.type = 'credentialstore';
    this._credentialHandler = credentialHandler;
    this.credentialRequestOrigin = credentialRequestOrigin;
    this.credential = credential;
    this.hintKey = hintKey;
  }

  async openWindow(url) {
    // TODO: disallow more than one call

    // TODO: ensure `url` is to the same origin
    await this._credentialHandler.show();
    const appWindow = new web_request_rpc__WEBPACK_IMPORTED_MODULE_0__["WebAppWindow"](url);
    appWindow.ready();
    appWindow.show();
    // TODO: note that `appWindow.handle` is not a ServiceWorker
    //   `WindowClient` polyfill... could be confusing here, should we
    //   implement one to wrap it? -- there is, for example, a
    //   `navigate` call on `WindowClient` that enforces same origin, would
    //   need to attempt to add or approximate that
    appWindow.handle._dialog = appWindow.dialog;
    return appWindow.handle;
  }

  respondWith(handlerResponse) {
    // TODO: throw exception if `_promise` is already set

    // TODO: validate handlerResponse
    this._promise = handlerResponse;
  }
}


/***/ }),

/***/ "./CredentialsContainer.js":
/*!*********************************!*\
  !*** ./CredentialsContainer.js ***!
  \*********************************/
/*! exports provided: CredentialsContainer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CredentialsContainer", function() { return CredentialsContainer; });
/* harmony import */ var _WebCredential_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WebCredential.js */ "./WebCredential.js");
/*!
 * Wrapper for native CredentialsContainer that uses remote Credential Mediator
 * for WebCredential-related operations.
 *
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator, DOMException */




// RPC timeouts, 0 = indefinite
const CREDENTIAL_GET_TIMEOUT = 0;
const CREDENTIAL_STORE_TIMEOUT = 0;

class CredentialsContainer {
  constructor(injector) {
    this._nativeCredentialsContainer = {
      get: navigator.credentials && navigator.credentials.get &&
        navigator.credentials.get.bind(navigator.credentials),
      store: navigator.credentials && navigator.credentials.store &&
        navigator.credentials.store.bind(navigator.credentials),
    };

    this._init = (async () => {
      this._remote = (await injector).get('credentialsContainer', {
        functions: [
          {name: 'get', options: {timeout: CREDENTIAL_GET_TIMEOUT}},
          {name: 'store', options: {timeout: CREDENTIAL_STORE_TIMEOUT}}
        ]
      });
    })();
  }

  async get(/*CredentialRequestOptions*/ options = {}) {
    if(options.web) {
      await this._init;
      const credential = await this._remote.get(options);
      if(!credential) {
        // no credential selected
        return null;
      }
      // TODO: validate credential
      return new _WebCredential_js__WEBPACK_IMPORTED_MODULE_0__["WebCredential"](credential.dataType, credential.data);
    }
    if(this._nativeCredentialsContainer.get) {
      return this._nativeCredentialsContainer.get(options);
    }
    throw new DOMException('Not implemented.', 'NotSupportedError');
  }

  async store(credential) {
    if(credential instanceof _WebCredential_js__WEBPACK_IMPORTED_MODULE_0__["WebCredential"]) {
      await this._init;
      const result = await this._remote.store(credential);
      if(!result) {
        // nothing stored
        return null;
      }
      // TODO: validate result
      return new _WebCredential_js__WEBPACK_IMPORTED_MODULE_0__["WebCredential"](result.dataType, result.data);
    }
    if(this._nativeCredentialsContainer.store) {
      return this._nativeCredentialsContainer.store(credential);
    }
    throw new DOMException('Not implemented.', 'NotSupportedError');
  }
}


/***/ }),

/***/ "./PermissionManager.js":
/*!******************************!*\
  !*** ./PermissionManager.js ***!
  \******************************/
/*! exports provided: PermissionManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PermissionManager", function() { return PermissionManager; });
/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */
// RPC timeouts, 0 = indefinite
const PERMISSION_REQUEST_TIMEOUT = 0;

/* Provides an API for working with permissions. */
class PermissionManager {
  constructor(injector) {
    this._init = (async () => {
      this._remote = (await injector).get('permissionManager', {
        functions: [
          'query',
          {name: 'request', options: {timeout: PERMISSION_REQUEST_TIMEOUT}},
          'revoke']
      });
    })();
  }

  async query(permissionDesc) {
    await this._init;
    return await this._remote.query(permissionDesc);
  }

  async request(permissionDesc) {
    await this._init;
    return await this._remote.request(permissionDesc);
  }

  async revoke(permissionDesc) {
    await this._init;
    return await this._remote.revoke(permissionDesc);
  }
}


/***/ }),

/***/ "./WebCredential.js":
/*!**************************!*\
  !*** ./WebCredential.js ***!
  \**************************/
/*! exports provided: WebCredential */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WebCredential", function() { return WebCredential; });
/*!
 * A WebCredential is a Credential that can be retrieved from or stored by a
 * "credential handler" that runs in a third party Web application.
 *
 * Copyright (c) 2017-2023 Digital Bazaar, Inc. All rights reserved.
 */
class WebCredential {
  constructor(dataType, data, {
    recommendedHandlerOrigins = [],
    protocols = {}
  } = {}) {
    if(typeof dataType !== 'string') {
      throw new TypeError('"dataType" must be a string.');
    }
    this.type = 'web';
    this.dataType = dataType;
    this.data = data;
    this.options = {recommendedHandlerOrigins, protocols};
  }
}


/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! exports provided: CredentialHandler, CredentialManager, WebCredential, loadOnce, load */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadOnce", function() { return loadOnce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "load", function() { return load; });
/* harmony import */ var web_request_rpc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! web-request-rpc */ "./node_modules/web-request-rpc/index.js");
/* harmony import */ var _CredentialHandler_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CredentialHandler.js */ "./CredentialHandler.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CredentialHandler", function() { return _CredentialHandler_js__WEBPACK_IMPORTED_MODULE_1__["CredentialHandler"]; });

/* harmony import */ var _CredentialHandlers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CredentialHandlers.js */ "./CredentialHandlers.js");
/* harmony import */ var _CredentialManager_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CredentialManager.js */ "./CredentialManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CredentialManager", function() { return _CredentialManager_js__WEBPACK_IMPORTED_MODULE_3__["CredentialManager"]; });

/* harmony import */ var _CredentialsContainer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CredentialsContainer.js */ "./CredentialsContainer.js");
/* harmony import */ var _PermissionManager_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PermissionManager.js */ "./PermissionManager.js");
/* harmony import */ var _WebCredential_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./WebCredential.js */ "./WebCredential.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WebCredential", function() { return _WebCredential_js__WEBPACK_IMPORTED_MODULE_6__["WebCredential"]; });

/*!
 * Copyright (c) 2017-2024 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator, window */









const DEFAULT_MEDIATOR_ORIGIN = 'https://authn.io';

// export classes for testing/TypeScript


let loaded;
async function loadOnce(options) {
  if(loaded) {
    return loaded;
  }

  loaded = true;
  return load(options);
}

async function load(options = {
  mediatorOrigin: DEFAULT_MEDIATOR_ORIGIN
}) {
  _assertSecureContext();
  // backwards compatibility (`options` used to be a string for expressing
  // the full mediator URL)
  let mediatorUrl;
  if(typeof options === 'string') {
    mediatorUrl = options;
  } else if(options && typeof options === 'object' &&
    typeof options.mediatorOrigin === 'string') {
    mediatorUrl = `${options.mediatorOrigin}/mediator`;
  } else {
    throw new Error(
      '"options.mediatorOrigin" must be a string expressing the ' +
      'origin of the mediator.');
  }

  // temporarily still using this for setting permissions and other
  // non-get/store APIs
  const appContext = new web_request_rpc__WEBPACK_IMPORTED_MODULE_0__["WebAppContext"]();
  const injector = appContext.createWindow(mediatorUrl, {
    className: 'credential-mediator',
    // 30 second timeout for loading the mediator
    timeout: 30000
  });

  // ensure backdrop is transparent by default
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(
    `dialog.web-app-window.credential-mediator > .web-app-window-backdrop {
      background-color: rgba(0, 0, 0, 0.25);
    }`));
  document.body.appendChild(style);

  const polyfill = {};

  // TODO: only expose certain APIs when appropriate
  polyfill.permissions = new _PermissionManager_js__WEBPACK_IMPORTED_MODULE_5__["PermissionManager"](injector);
  polyfill.CredentialHandlers = new _CredentialHandlers_js__WEBPACK_IMPORTED_MODULE_2__["CredentialHandlers"](injector);
  polyfill.CredentialHandler = _CredentialHandler_js__WEBPACK_IMPORTED_MODULE_1__["CredentialHandler"];
  polyfill.CredentialManager = _CredentialManager_js__WEBPACK_IMPORTED_MODULE_3__["CredentialManager"];
  polyfill.credentials = new _CredentialsContainer_js__WEBPACK_IMPORTED_MODULE_4__["CredentialsContainer"](injector);

  polyfill.WebCredential = _WebCredential_js__WEBPACK_IMPORTED_MODULE_6__["WebCredential"];

  // expose polyfill
  navigator.credentialsPolyfill = polyfill;

  // polyfill
  if('credentials' in navigator) {
    navigator.credentials.get = polyfill.credentials.get.bind(
      polyfill.credentials);
    navigator.credentials.store = polyfill.credentials.store.bind(
      polyfill.credentials);
  } else {
    navigator.credentials = polyfill.credentials;
  }

  // set up proxy for `navigator.credentials`, to ensure subsequent changes
  // to it do not prevent the polyfill from running
  const navCredentialsProxy = new Proxy(navigator.credentials, {
    set(obj, prop, value) {
      if(prop in polyfill.credentials._nativeCredentialsContainer) {
        // replace underlying function, keeping credentials polyfill intact
        polyfill.credentials._nativeCredentialsContainer[prop] = value;
      } else {
        obj[prop] = value;
      }
      // success
      return true;
    }
  });

  Object.defineProperty(navigator, 'credentials', {
    value: navCredentialsProxy,
    writable: true
  });

  window.CredentialManager = _CredentialManager_js__WEBPACK_IMPORTED_MODULE_3__["CredentialManager"];
  window.WebCredential = _WebCredential_js__WEBPACK_IMPORTED_MODULE_6__["WebCredential"];

  return polyfill;
}

function _assertSecureContext() {
  if(!window.isSecureContext) {
    throw new DOMException('SecurityError', 'The operation is insecure.')
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/Client.js":
/*!************************************************!*\
  !*** ./node_modules/web-request-rpc/Client.js ***!
  \************************************************/
/*! exports provided: Client */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Client", function() { return Client; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./node_modules/web-request-rpc/utils.js");
/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */




// 30 second default timeout
const RPC_CLIENT_CALL_TIMEOUT = 30000;

class Client {
  constructor() {
    this.origin = null;
    this._handle = null;
    this._listener = null;
    // all pending requests
    this._pending = new Map();
  }

  /**
   * Connects to a Web Request RPC server.
   *
   * The Promise will resolve to an RPC injector that can be used to get or
   * define APIs to enable communication with the server.
   *
   * @param origin the origin to send messages to.
   * @param options the options to use:
   *          [handle] a handle to the window (or a Promise that resolves to
   *            a handle) to send messages to
   *            (defaults to `window.opener || window.parent`).
   *
   * @return a Promise that resolves to an RPC injector once connected.
   */
  async connect(origin, options) {
    if(this._listener) {
      throw new Error('Already connected.');
    }

    options = options || {};

    // TODO: validate `origin` and `options.handle`
    const self = this;
    self.origin = _utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"](origin).origin;
    self._handle = options.handle || window.opener || window.parent;

    const pending = self._pending;
    self._listener = _utils_js__WEBPACK_IMPORTED_MODULE_0__["createMessageListener"]({
      origin: self.origin,
      handle: self._handle,
      expectRequest: false,
      listener: message => {
        // ignore messages that have no matching, pending request
        if(!pending.has(message.id)) {
          return;
        }

        // resolve or reject Promise associated with message
        const {resolve, reject, cancelTimeout} = pending.get(message.id);
        cancelTimeout();
        if('result' in message) {
          return resolve(message.result);
        }
        reject(_utils_js__WEBPACK_IMPORTED_MODULE_0__["deserializeError"](message.error));
      }
    });
    window.addEventListener('message', self._listener);

    return new Injector(self);
  }

  /**
   * Performs a RPC by sending a message to the Web Request RPC server and
   * awaiting a response.
   *
   * @param qualifiedMethodName the fully-qualified name of the method to call.
   * @param parameters the parameters for the method.
   * @param options the options to use:
   *          [timeout] a timeout, in milliseconds, for awaiting a response;
   *            a non-positive timeout (<= 0) will cause an indefinite wait.
   *
   * @return a Promise that resolves to the result (or error) of the call.
   */
  async send(qualifiedMethodName, parameters, {
    timeout = RPC_CLIENT_CALL_TIMEOUT
  }) {
    if(!this._listener) {
      throw new Error('RPC client not connected.');
    }

    const self = this;

    const message = {
      jsonrpc: '2.0',
      id: _utils_js__WEBPACK_IMPORTED_MODULE_0__["uuidv4"](),
      method: qualifiedMethodName,
      params: parameters
    };

    // HACK: we can't just `Promise.resolve(handle)` because Chrome has
    // a bug that throws an exception if the handle is cross domain
    if(_utils_js__WEBPACK_IMPORTED_MODULE_0__["isHandlePromise"](self._handle)) {
      const handle = await self._handle;
      handle.postMessage(message, self.origin);
    } else {
      self._handle.postMessage(message, self.origin);
    }

    // return Promise that will resolve once a response message has been
    // received or once a timeout occurs
    return new Promise((resolve, reject) => {
      const pending = self._pending;
      let cancelTimeout;
      if(timeout > 0) {
        const timeoutId = setTimeout(() => {
          pending.delete(message.id);
          reject(new Error('RPC call timed out.'));
        }, timeout);
        cancelTimeout = () => {
          pending.delete(message.id);
          clearTimeout(timeoutId);
        };
      } else {
        cancelTimeout = () => {
          pending.delete(message.id);
        };
      }
      pending.set(message.id, {resolve, reject, cancelTimeout});
    });
  }

  /**
   * Disconnects from the remote Web Request RPC server and closes down this
   * client.
   */
  close() {
    if(this._listener) {
      window.removeEventListener('message', this._listener);
      this._handle = this.origin = this._listener = null;
      // reject all pending calls
      for(const value of this._pending.values()) {
        value.reject(new Error('RPC client closed.'));
      }
      this._pending = new Map();
    }
  }
}

class Injector {
  constructor(client) {
    this.client = client;
    this._apis = new Map();
  }

  /**
   * Defines a named API that will use an RPC client to implement its
   * functions. Each of these functions will be asynchronous and return a
   * Promise with the result from the RPC server.
   *
   * This function will return an interface with functions defined according
   * to those provided in the given `definition`. The `name` parameter can be
   * used to obtain this cached interface via `.get(name)`.
   *
   * @param name the name of the API.
   * @param definition the definition for the API, including:
   *          functions: an array of function names (as strings) or objects
   *            containing: {name: <functionName>, options: <rpcClientOptions>}.
   *
   * @return an interface with the functions provided via `definition` that
   *           will make RPC calls to an RPC server to provide their
   *           implementation.
   */
  define(name, definition) {
    if(!(name && typeof name === 'string')) {
      throw new TypeError('`name` must be a non-empty string.');
    }
    // TODO: support Web IDL as a definition format?
    if(!(definition && typeof definition === 'object' &&
      Array.isArray(definition.functions))) {
      throw new TypeError(
        '`definition.function` must be an array of function names or ' +
        'function definition objects to be defined.');
    }

    const self = this;
    const api = {};

    definition.functions.forEach(fn => {
      if(typeof fn === 'string') {
        fn = {name: fn, options: {}};
      }
      api[fn.name] = async function() {
        return self.client.send(
          name + '.' + fn.name, [...arguments], fn.options);
      };
    });

    self._apis[name] = api;
    return api;
  }

  /**
   * Get a named API, defining it if necessary when a definition is provided.
   *
   * @param name the name of the API.
   * @param [definition] the definition for the API; if the API is already
   *          defined, this definition is ignored.
   *
   * @return the interface.
   */
  get(name, definition) {
    const api = this._apis[name];
    if(!api) {
      if(definition) {
        return this.define(name, definition);
      }
      throw new Error(`API "${name}" has not been defined.`);
    }
    return this._apis[name];
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/EventEmitter.js":
/*!******************************************************!*\
  !*** ./node_modules/web-request-rpc/EventEmitter.js ***!
  \******************************************************/
/*! exports provided: EventEmitter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EventEmitter", function() { return EventEmitter; });
/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */


class EventEmitter {
  constructor({deserialize = e => e, waitUntil = async () => {}} = {}) {
    this._listeners = [];
    this._deserialize = deserialize;
    this._waitUntil = waitUntil;
  }

  async emit(event) {
    event = this._deserialize(event);
    (this._listeners[event.type] || []).forEach(l => l(event));
    return this._waitUntil(event);
  }

  addEventListener(eventType, fn) {
    if(!this._listeners[eventType]) {
      this._listeners[eventType] = [fn];
    } else {
      this._listeners[eventType].push(fn);
    }
  }

  removeEventListener(eventType, fn) {
    const listeners = this._listeners[eventType];
    if(!listeners) {
      return;
    }
    const idx = listeners.indexOf(fn);
    if(idx !== -1) {
      listeners.splice(idx, 1);
    }
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/Server.js":
/*!************************************************!*\
  !*** ./node_modules/web-request-rpc/Server.js ***!
  \************************************************/
/*! exports provided: Server */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Server", function() { return Server; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./node_modules/web-request-rpc/utils.js");
/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */




class Server {
  constructor() {
    this.origin = null;
    this._handle = null;
    this._apis = new Map();
  }

  /**
   * Provides an implementation for a named API. All functions in the given
   * API will be made callable via RPC clients connected to this server.
   *
   * @param name the name of the API.
   * @param api the API to add.
   */
  define(name, api) {
    if(!(name && typeof name === 'string')) {
      throw new TypeError('`name` must be a non-empty string.');
    }
    if(!(api && api !== 'object')) {
      throw new TypeError('`api` must be an object.');
    }
    if(name in this._apis) {
      throw new Error(`The "${name}" API is already defined.`);
    }

    this._apis[name] = api;
  }

  /**
   * Listens for RPC messages from clients from a particular origin and
   * window handle and uses them to execute API calls based on predefined
   * APIs.
   *
   * If messages are not from the given origin or window handle, they are
   * ignored. If the messages refer to named APIs that have not been defined
   * then an error message is sent in response. These error messages can
   * be suppressed by using the `ignoreUnknownApi` option.
   *
   * If a message refers to an unknown method on a known named API, then an
   * error message is sent in response.
   *
   * @param origin the origin to listen for.
   * @param options the options to use:
   *          [handle] a handle to the window (or a Promise that resolves to
   *            a handle) to listen for messages from
   *            (defaults to `window.opener || window.parent`).
   *          [ignoreUnknownApi] `true` to ignore unknown API messages.
   */
  async listen(origin, options) {
    if(this._listener) {
      throw new Error('Already listening.');
    }

    options = options || {};

    // TODO: validate `origin` and `options.handle`
    const self = this;
    self.origin = _utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"](origin).origin;
    self._handle = options.handle || window.opener || window.parent;

    const ignoreUnknownApi = (options.ignoreUnknownApi === 'true') || false;

    self._listener = _utils_js__WEBPACK_IMPORTED_MODULE_0__["createMessageListener"]({
      origin: self.origin,
      handle: self._handle,
      expectRequest: true,
      listener: message => {
        const {name, method} = _utils_js__WEBPACK_IMPORTED_MODULE_0__["destructureMethodName"](message.method);
        const api = self._apis[name];

        // do not allow calling "private" methods (starts with `_`)
        if(method && method.startsWith('_')) {
          return sendMethodNotFound(self._handle, self.origin, message);
        }

        // API not found but ignore flag is on
        if(!api && ignoreUnknownApi) {
          // API not registered, ignore the message rather than raise error
          return;
        }

        // no ignore flag and unknown API or unknown specific method
        if(!api || typeof api[method] !== 'function') {
          return sendMethodNotFound(self._handle, self.origin, message);
        }

        // API and specific function found
        const fn = api[method];
        (async () => {
          const response = {
            jsonrpc: '2.0',
            id: message.id
          };
          try {
            response.result = await fn.apply(api, message.params);
          } catch(e) {
            response.error = _utils_js__WEBPACK_IMPORTED_MODULE_0__["serializeError"](e);
          }
          // if server did not `close` while we waited for a response
          if(self._handle) {
            // HACK: we can't just `Promise.resolve(handle)` because Chrome has
            // a bug that throws an exception if the handle is cross domain
            if(_utils_js__WEBPACK_IMPORTED_MODULE_0__["isHandlePromise"](self._handle)) {
              self._handle.then(h => h.postMessage(response, self.origin));
            } else {
              self._handle.postMessage(response, self.origin);
            }
          }
        })();
      }
    });
    window.addEventListener('message', self._listener);
  }

  close() {
    if(this._listener) {
      window.removeEventListener('message', this._listener);
      this._handle = this.origin = this._listener = null;
    }
  }
}

function sendMethodNotFound(handle, origin, message) {
  const response = {
    jsonrpc: '2.0',
    id: message.id,
    error: Object.assign({}, _utils_js__WEBPACK_IMPORTED_MODULE_0__["RPC_ERRORS"].MethodNotFound)
  };
  // HACK: we can't just `Promise.resolve(handle)` because Chrome has
  // a bug that throws an exception if the handle is cross domain
  if(_utils_js__WEBPACK_IMPORTED_MODULE_0__["isHandlePromise"](handle)) {
    return handle.then(h => h.postMessage(response, origin));
  } else {
    return handle.postMessage(response, origin);
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/WebApp.js":
/*!************************************************!*\
  !*** ./node_modules/web-request-rpc/WebApp.js ***!
  \************************************************/
/*! exports provided: WebApp */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WebApp", function() { return WebApp; });
/* harmony import */ var _Client_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Client.js */ "./node_modules/web-request-rpc/Client.js");
/* harmony import */ var _Server_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Server.js */ "./node_modules/web-request-rpc/Server.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils.js */ "./node_modules/web-request-rpc/utils.js");
/*!
 * A WebApp is a remote application that runs in a WebAppContext.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */






class WebApp {
  constructor(relyingOrigin) {
    // this is the origin that created the WebAppContext to run it in
    // TODO: better name? `contextOrigin`?
    this.relyingOrigin = Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__["parseUrl"])(relyingOrigin).origin;
    this.client = null;
    this.injector = null;
    this.client = new _Client_js__WEBPACK_IMPORTED_MODULE_0__["Client"]();
    this.server = new _Server_js__WEBPACK_IMPORTED_MODULE_1__["Server"]();

    this._control = null;
    this._connected = false;
  }

  /**
   * Connects this WebApp to the relying origin that instantiated it. Once
   * connected, the WebApp can start servicing calls from that origin.
   *
   * @return a Promise that resolves to an injector for creating custom client
   *           APIs once the connection is ready.
   */
  async connect() {
    this.injector = await this.client.connect(this.relyingOrigin);
    this._connected = true;
    this._control = this.injector.define('core.control', {
      functions: ['ready', 'show', 'hide']
    });
    this.server.listen(this.relyingOrigin);
    return this.injector;
  }

  /**
   * Must be called after `connect` when this WebApp is ready to start
   * receiving calls from the remote end.
   */
  async ready() {
    if(!this._connected) {
      throw new Error('WebApp not connected. Did you call ".connect()"?');
    }
    await this._control.ready();
    return this;
  }

  /**
   * Closes this WebApp's connection to the relying origin.
   */
  close() {
    if(this._connected) {
      this.server.close();
      this.client.close();
      this._connected = false;
    }
  }

  /**
   * Shows the UI for this WebApp on the relying origin.
   */
  async show() {
    if(!this._connected) {
      throw new Error(
        'Cannot "show" yet; not connected. Did you call ".connect()"?');
    }
    return this._control.show();
  }

  /**
   * Hides the UI for this WebApp on the relying origin.
   */
  async hide() {
    if(!this._connected) {
      throw new Error(
        'Cannot "hide" yet; not connected. Did you call ".connect()?"');
    }
    return this._control.hide();
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/WebAppContext.js":
/*!*******************************************************!*\
  !*** ./node_modules/web-request-rpc/WebAppContext.js ***!
  \*******************************************************/
/*! exports provided: WebAppContext */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WebAppContext", function() { return WebAppContext; });
/* harmony import */ var _Client_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Client.js */ "./node_modules/web-request-rpc/Client.js");
/* harmony import */ var _Server_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Server.js */ "./node_modules/web-request-rpc/Server.js");
/* harmony import */ var _WebAppWindow_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./WebAppWindow.js */ "./node_modules/web-request-rpc/WebAppWindow.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils.js */ "./node_modules/web-request-rpc/utils.js");
/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */





// 10 seconds
const WEB_APP_CONTEXT_LOAD_TIMEOUT = 10000;

class WebAppContext {
  constructor() {
    this.client = new _Client_js__WEBPACK_IMPORTED_MODULE_0__["Client"]();
    this.server = new _Server_js__WEBPACK_IMPORTED_MODULE_1__["Server"]();
    this.injector = null;
    this.control = null;
    this.loaded = false;
    this.closed = false;
  }

  /**
   * Creates a window (or attaches to an existing one) that loads a page that
   * is expected to understand the web request RPC protocol. This method
   * returns a Promise that will resolve once the page uses RPC to indicate
   * that it is ready to be communicated with or once a timeout occurs.
   *
   * The Promise will resolve to an RPC injector that can be used to get or
   * define APIs to enable communication with the WebApp running in the
   * WebAppContext.
   *
   * @param url the URL to the page to connect to.
   * @param options the options to use:
   *          [timeout] the timeout for waiting for the client to be ready.
   *          [handle] a window handle to connect to; may be a Promise that
   *            that resolves to a handle.
   *          [iframe] an iframe element to connect to.
   *          [windowControl] a window control interface to connect to.
   *          [className] a className to assign to the window for CSS purposes.
   *          [customize(options)] a function to customize the dialog that
   *            loads the window after its construction.
   *          [bounds] a bounding rectangle (top, left, width, height) to
   *            use when creating a popup window.
   *
   * @return a Promise that resolves to an RPC injector once the window is
   *           ready.
   */
  async createWindow(
    url, {
      timeout = WEB_APP_CONTEXT_LOAD_TIMEOUT,
      iframe,
      dialog = null,
      popup = false,
      handle,
      windowControl,
      className,
      customize,
      // top, left, width, height
      bounds
    } = {}) {
    // disallow loading the same WebAppContext more than once
    if(this.loaded) {
      throw new Error('AppContext already loaded.');
    }
    this.loaded = true;

    // create control API for WebApp to call via its own RPC client
    this.control = new _WebAppWindow_js__WEBPACK_IMPORTED_MODULE_2__["WebAppWindow"](url, {
      timeout,
      dialog,
      iframe,
      popup,
      handle,
      windowControl,
      className,
      customize,
      bounds
    });

    // if the local window closes, close the control window as well
    window.addEventListener('pagehide', () => this.close(), {once: true});

    // define control class; this enables the WebApp that is running in the
    // WebAppContext to control its UI or close itself down
    this.server.define('core.control', this.control);

    // listen for calls from the window, ignoring calls to unknown APIs
    // to allow those to be handled by other servers
    const origin = Object(_utils_js__WEBPACK_IMPORTED_MODULE_3__["parseUrl"])(url).origin;
    this.server.listen(origin, {
      handle: this.control.handle,
      ignoreUnknownApi: true
    });

    // wait for control to be ready
    await this.control._private.isReady();

    // connect to the WebAppContext and return the injector
    this.injector = await this.client.connect(origin, {
      handle: this.control.handle
    });
    return this.injector;
  }

  close() {
    if(!this.closed) {
      this.closed = true;
      this.control._private.destroy();
      this.server.close();
      this.client.close();
    }
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/WebAppWindow.js":
/*!******************************************************!*\
  !*** ./node_modules/web-request-rpc/WebAppWindow.js ***!
  \******************************************************/
/*! exports provided: WebAppWindow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WebAppWindow", function() { return WebAppWindow; });
/* harmony import */ var _WebAppWindowInlineDialog_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WebAppWindowInlineDialog.js */ "./node_modules/web-request-rpc/WebAppWindowInlineDialog.js");
/* harmony import */ var _WebAppWindowPopupDialog_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./WebAppWindowPopupDialog.js */ "./node_modules/web-request-rpc/WebAppWindowPopupDialog.js");
/*!
 * Copyright (c) 2017-2023 Digital Bazaar, Inc. All rights reserved.
 */



// default timeout is 60 seconds
const LOAD_WINDOW_TIMEOUT = 60000;

/**
 * Provides a window and API for remote Web applications. This API is typically
 * used by RPC WebApps that run in a WebAppContext to indicate when they are
 * ready and to show/hide their UI.
 */
class WebAppWindow {
  constructor(
    url, {
      timeout = LOAD_WINDOW_TIMEOUT,
      dialog = null,
      handle,
      popup = false,
      className = null,
      customize = null,
      // top, left, width, height
      bounds
    } = {}) {
    this.visible = false;
    this.dialog = dialog;
    this.handle = null;
    this.popup = popup;
    this.windowControl = null;
    this._destroyed = false;
    this._ready = false;
    this._private = {};
    this._timeoutId = null;

    if(handle && handle._dialog) {
      this.dialog = dialog = handle._dialog;
    }
    // private to allow caller to track readiness
    this._private._readyPromise = new Promise((resolve, reject) => {
      // reject if timeout reached
      this._timeoutId = setTimeout(
        () => reject(new DOMException(
          'Loading Web application window timed out.', 'TimeoutError')),
        timeout);
      this._private._resolveReady = value => {
        clearTimeout(this.timeoutId);
        this._timeoutId = null;
        resolve(value);
      };
      this._private._rejectReady = err => {
        clearTimeout(this.timeoutId);
        this._timeoutId = null;
        reject(err);
      };
    });
    this._private.isReady = async () => {
      return this._private._readyPromise;
    };

    // private to disallow destruction via client
    this._private.destroy = () => {
      // window not ready yet, but destroyed
      if(this._timeoutId) {
        this._private._rejectReady(new DOMException(
          'Web application window closed before ready.', 'AbortError'));
      }
      if(!this._destroyed) {
        this.dialog.destroy();
        this.dialog = null;
        this._destroyed = true;
      }
    };

    if(customize) {
      if(!typeof customize === 'function') {
        throw new TypeError('`options.customize` must be a function.');
      }
    }

    if(!this.dialog) {
      if(this.popup) {
        this.dialog = new _WebAppWindowPopupDialog_js__WEBPACK_IMPORTED_MODULE_1__["WebAppWindowPopupDialog"]({url, handle, bounds});
      } else {
        this.dialog = new _WebAppWindowInlineDialog_js__WEBPACK_IMPORTED_MODULE_0__["WebAppWindowInlineDialog"]({url, handle, className});
      }
    }
    if(this.popup && bounds) {
      // resize / re-position popup window as requested
      let {x, y, width = 500, height = 400} = bounds;
      width = Math.min(width, window.innerWidth);
      // ~30 pixels must be added when resizing for window titlebar
      height = Math.min(height + 30, window.innerHeight);
      x = Math.floor(x !== undefined ?
        x : window.screenX + (window.innerWidth - width) / 2);
      // ~15 pixels must be added to account for window titlebar
      y = Math.floor(y !== undefined ?
        y : window.screenY + (window.innerHeight - height) / 2 + 15);
      this.dialog.handle.resizeTo(width, height);
      this.dialog.handle.moveTo(x, y);
    }

    this.handle = this.dialog.handle;
    if(customize) {
      try {
        customize({
          dialog: this.dialog.dialog,
          container: this.dialog.container,
          iframe: this.dialog.iframe,
          webAppWindow: this
        });
      } catch(e) {
        console.error(e);
      }
    }
  }

  /**
   * Called by the client when it is ready to receive messages.
   */
  ready() {
    this._ready = true;
    this._private._resolveReady(true);
  }

  /**
   * Called by the client when it wants to show UI.
   */
  show() {
    if(!this.visible) {
      this.visible = true;
      // disable scrolling on body
      const body = document.querySelector('body');
      this._bodyOverflowStyle = body.style.overflow;
      body.style.overflow = 'hidden';
      if(!this._destroyed) {
        this.dialog.show();
      } else if(this.windowControl.show) {
        this.windowControl.show();
      }
    }
  }

  /**
   * Called by the client when it wants to hide UI.
   */
  hide() {
    if(this.visible) {
      this.visible = false;
      // restore `overflow` style on body
      const body = document.querySelector('body');
      if(this._bodyOverflowStyle) {
        body.style.overflow = this._bodyOverflowStyle;
      } else {
        body.style.overflow = '';
      }
      if(!this._destroyed) {
        this.dialog.close();
      } else if(this.windowControl.hide) {
        this.windowControl.hide();
      }
    }
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/WebAppWindowDialog.js":
/*!************************************************************!*\
  !*** ./node_modules/web-request-rpc/WebAppWindowDialog.js ***!
  \************************************************************/
/*! exports provided: WebAppWindowDialog */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WebAppWindowDialog", function() { return WebAppWindowDialog; });
/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
class WebAppWindowDialog {
  constructor() {
    this._closeEventListeners = new Set();
  }

  addEventListener(name, listener) {
    if(name !== 'close') {
      throw new Error(`Unknown event "${name}".`);
    }
    if(typeof listener !== 'function') {
      throw new TypeError('"listener" must be a function.');
    }
    this._closeEventListeners.add(listener);
  }

  removeEventListener(name, listener) {
    if(name !== 'close') {
      throw new Error(`Unknown event "${name}".`);
    }
    if(typeof listener !== 'function') {
      throw new TypeError('"listener" must be a function.');
    }
    this._closeEventListeners.delete(listener);
  }

  show() {}

  close() {
    // emit event to all `close` event listeners
    for(const listener of this._closeEventListeners) {
      listener({});
    }
  }

  destroy() {
    this._closeEventListeners.clear();
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/WebAppWindowInlineDialog.js":
/*!******************************************************************!*\
  !*** ./node_modules/web-request-rpc/WebAppWindowInlineDialog.js ***!
  \******************************************************************/
/*! exports provided: WebAppWindowInlineDialog */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WebAppWindowInlineDialog", function() { return WebAppWindowInlineDialog; });
/* harmony import */ var _WebAppWindowDialog_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WebAppWindowDialog.js */ "./node_modules/web-request-rpc/WebAppWindowDialog.js");
/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */


class WebAppWindowInlineDialog extends _WebAppWindowDialog_js__WEBPACK_IMPORTED_MODULE_0__["WebAppWindowDialog"] {
  constructor({url, handle, className}) {
    super();
    this.url = url;
    this.handle = handle;
    // create a top-level dialog overlay
    this.dialog = document.createElement('dialog');
    applyStyle(this.dialog, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      'max-width': '100%',
      'max-height': '100%',
      display: 'none',
      margin: 0,
      padding: 0,
      border: 'none',
      background: 'transparent',
      color: 'black',
      'box-sizing': 'border-box',
      overflow: 'hidden',
      // prevent focus bug in chrome
      'user-select': 'none',
      'z-index': 1000000
    });
    this.dialog.className = 'web-app-window';
    if(typeof className === 'string') {
      this.dialog.className = this.dialog.className + ' ' + className;
    }

    // ensure backdrop is transparent by default
    const style = document.createElement('style');
    style.appendChild(
      document.createTextNode(`dialog.web-app-window::backdrop {
        background-color: transparent;
      }`));

    // create flex container for iframe
    this.container = document.createElement('div');
    applyStyle(this.container, {
      position: 'relative',
      width: '100%',
      height: '100%',
      margin: 0,
      padding: 0,
      display: 'flex',
      'flex-direction': 'column'
    });
    this.container.className = 'web-app-window-backdrop';

    // create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = url;
    this.iframe.scrolling = 'auto';
    applyStyle(this.iframe, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 'none',
      background: 'transparent',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      'flex-grow': 1,
      // prevent focus bug in chrome
      'user-select': 'none'
    });

    // assemble dialog
    this.dialog.appendChild(style);
    this.container.appendChild(this.iframe);
    this.dialog.appendChild(this.container);

    // a.document.appendChild(this.iframe);
    // handle cancel (user pressed escape)
    this.dialog.addEventListener('cancel', e => {
      e.preventDefault();
      this.hide();
    });

    // attach to DOM
    document.body.appendChild(this.dialog);
    this.handle = this.iframe.contentWindow;
  }

  show() {
    this.dialog.style.display = 'block';
    if(this.dialog.showModal) {
      this.dialog.showModal();
    }
    /* Note: Hack to solve chromium bug that sometimes (race condition) causes
    mouse events to go to the underlying page instead of the iframe. This bug
    generally manifests by showing a very quick flash of unstyled content /
    background followed by a "not-allowed" mouse cursor over the page and over
    the dialog and iframe, preventing interaction with the page until
    the user right-clicks or causes some other render event in the page (a
    render event inside the iframe does not seem to help resolve the bug).

    Could be related to bug: tinyurl.com/2p9c66z9
    Or could be related to the "Paint Holding" chromium feature.

    We have found experimentally, that resetting accepting pointer events on
    the dialog and allowing enough frames for rendering (16 ms is insufficient
    but 32 ms seems to work), the bug resolves. */
    try {
      this.dialog.style.pointerEvents = 'none';
    } catch(e) {}
    setTimeout(() => {
      try {
        this.dialog.style.pointerEvents = '';
      } catch(e) {}
    }, 32);
  }

  close() {
    this.dialog.style.display = 'none';
    if(this.dialog.close) {
      try {
        this.dialog.close();
      } catch(e) {
        console.error(e);
      }
    }
    super.close();
  }

  destroy() {
    this.dialog.parentNode.removeChild(this.dialog);
    super.destroy();
  }
}

function applyStyle(element, style) {
  for(const name in style) {
    element.style[name] = style[name];
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/WebAppWindowPopupDialog.js":
/*!*****************************************************************!*\
  !*** ./node_modules/web-request-rpc/WebAppWindowPopupDialog.js ***!
  \*****************************************************************/
/*! exports provided: WebAppWindowPopupDialog */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WebAppWindowPopupDialog", function() { return WebAppWindowPopupDialog; });
/* harmony import */ var _WebAppWindowDialog_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WebAppWindowDialog.js */ "./node_modules/web-request-rpc/WebAppWindowDialog.js");
/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */


class WebAppWindowPopupDialog extends _WebAppWindowDialog_js__WEBPACK_IMPORTED_MODULE_0__["WebAppWindowDialog"] {
  constructor({url, handle, bounds = {width: 500, height: 400}}) {
    super();
    this.url = url;
    this.handle = handle;
    this._locationChanging = false;
    if(!handle) {
      this._openWindow({url, name: 'web-app-window', bounds});
    }
    this.destroyed = false;
    this._removeListeners = () => {};
  }

  show() {}

  close() {
    this.destroy();
  }

  destroy() {
    if(this.handle && !this.destroyed) {
      this.handle.close();
      super.close();
      this.handle = null;
      this.destroyed = true;
      this._removeListeners();
      super.destroy();
    }
  }

  isClosed() {
    return !this.handle || this.handle.closed;
  }

  _openWindow({url, name, bounds}) {
    const {x, y} = bounds;
    let {width = 500, height = 400} = bounds;
    width = Math.min(width, window.innerWidth);
    height = Math.min(height, window.innerHeight);
    const left = Math.floor(x !== undefined ?
      x : window.screenX + (window.innerWidth - width) / 2);
    const top = Math.floor(y !== undefined ?
      y : window.screenY + (window.innerHeight - height) / 2);
    const features =
      'popup=yes,menubar=no,location=no,resizable=no,scrollbars=no,status=no,' +
      `width=${width},height=${height},left=${left},top=${top}`;
    this._locationChanging = true;
    this.handle = window.open(url, name, features);

    this._addListeners();
  }

  setLocation(url) {
    this.url = url;
    this._locationChanging = true;
    this.handle.location.replace(url);
  }

  _addListeners() {
    const destroyDialog = () => this.destroy();

    // when a new URL loads in the dialog, clear the location changing flag
    const loadDialog = () => {
      this._locationChanging = false;
    };

    // when the dialog URL changes...
    const unloadDialog = () => {
      if(this._locationChanging) {
        // a location change was expected, return
        return;
      }

      // a location change was NOT expected, destroy the dialog
      this.destroy();
    };

    this.handle.addEventListener('unload', unloadDialog);
    this.handle.addEventListener('load', loadDialog);

    // before the current window unloads, destroy the child dialog
    window.addEventListener('beforeUnload', destroyDialog, {once: true});

    // poll to check for closed window handle; necessary because cross domain
    // windows will not emit any close-related events we can use here
    const intervalId = setInterval(() => {
      if(this.isClosed()) {
        this.destroy();
        clearInterval(intervalId);
      }
    }, 250);

    // create listener clean up function
    this._removeListeners = () => {
      clearInterval(intervalId);
      this.handle.removeListener('unload', unloadDialog);
      this.handle.removeListener('load', loadDialog);
      window.removeEventListener('beforeUnload', destroyDialog);
    }
  }
}


/***/ }),

/***/ "./node_modules/web-request-rpc/index.js":
/*!***********************************************!*\
  !*** ./node_modules/web-request-rpc/index.js ***!
  \***********************************************/
/*! exports provided: Client, EventEmitter, Server, WebApp, WebAppContext, WebAppWindow, utils */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Client_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Client.js */ "./node_modules/web-request-rpc/Client.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Client", function() { return _Client_js__WEBPACK_IMPORTED_MODULE_0__["Client"]; });

/* harmony import */ var _EventEmitter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./EventEmitter.js */ "./node_modules/web-request-rpc/EventEmitter.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EventEmitter", function() { return _EventEmitter_js__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]; });

/* harmony import */ var _Server_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Server.js */ "./node_modules/web-request-rpc/Server.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Server", function() { return _Server_js__WEBPACK_IMPORTED_MODULE_2__["Server"]; });

/* harmony import */ var _WebApp_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./WebApp.js */ "./node_modules/web-request-rpc/WebApp.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WebApp", function() { return _WebApp_js__WEBPACK_IMPORTED_MODULE_3__["WebApp"]; });

/* harmony import */ var _WebAppContext_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./WebAppContext.js */ "./node_modules/web-request-rpc/WebAppContext.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WebAppContext", function() { return _WebAppContext_js__WEBPACK_IMPORTED_MODULE_4__["WebAppContext"]; });

/* harmony import */ var _WebAppWindow_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./WebAppWindow.js */ "./node_modules/web-request-rpc/WebAppWindow.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WebAppWindow", function() { return _WebAppWindow_js__WEBPACK_IMPORTED_MODULE_5__["WebAppWindow"]; });

/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils.js */ "./node_modules/web-request-rpc/utils.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "utils", function() { return _utils_js__WEBPACK_IMPORTED_MODULE_6__; });
/*!
 * JSON-RPC for Web Request Polyfills.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */













/***/ }),

/***/ "./node_modules/web-request-rpc/utils.js":
/*!***********************************************!*\
  !*** ./node_modules/web-request-rpc/utils.js ***!
  \***********************************************/
/*! exports provided: RPC_ERRORS, parseUrl, originMatches, uuidv4, isValidOrigin, isValidMessage, isValidRequest, isValidResponse, isValidError, serializeError, deserializeError, createMessageListener, destructureMethodName, isHandlePromise */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RPC_ERRORS", function() { return RPC_ERRORS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseUrl", function() { return parseUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "originMatches", function() { return originMatches; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uuidv4", function() { return uuidv4; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidOrigin", function() { return isValidOrigin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidMessage", function() { return isValidMessage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidRequest", function() { return isValidRequest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidResponse", function() { return isValidResponse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidError", function() { return isValidError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "serializeError", function() { return serializeError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deserializeError", function() { return deserializeError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createMessageListener", function() { return createMessageListener; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "destructureMethodName", function() { return destructureMethodName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isHandlePromise", function() { return isHandlePromise; });
/*!
 * Utilities for Web Request RPC.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global URL */


const RPC_ERRORS = {
  ParseError: {
    message: 'Parse error',
    code: -32700
  },
  InvalidRequest: {
    message: 'Invalid Request',
    code: -32600
  },
  MethodNotFound: {
    message: 'Method not found',
    code: -32601
  },
  InvalidParams: {
    message: 'Invalid params',
    code: -32602
  },
  InternalError: {
    message: 'Internal Error',
    code: -32603
  },
  ServerError: {
    message: 'Server error',
    code: -32000
  }
};

function parseUrl(url, base) {
  if(base === undefined) {
    base = window.location.href;
  }

  if(typeof URL === 'function') {
    return new URL(url, base);
  }

  if(typeof url !== 'string') {
    throw new TypeError('"url" must be a string.');
  }

  // FIXME: rudimentary relative URL resolution
  if(!url.includes(':')) {
    if(base.startsWith('http') && !url.startsWith('/')) {
      url = base + '/' + url;
    } else {
      url = base + url;
    }
  }

  // `URL` API not supported, use DOM to parse URL
  const parser = document.createElement('a');
  parser.href = url;
  let origin = (parser.protocol || window.location.protocol) + '//';
  if(parser.host) {
    // use hostname when using default ports
    // (IE adds always adds port to `parser.host`)
    if((parser.protocol === 'http:' && parser.port === '80') ||
      (parser.protocol === 'https:' && parser.port === '443')) {
      origin += parser.hostname;
    } else {
      origin += parser.host;
    }
  } else {
    origin += window.location.host;
  }

  // ensure pathname begins with `/`
  let pathname = parser.pathname;
  if(!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }

  return {
    // TODO: is this safe for general use on every browser that doesn't
    //   support WHATWG URL?
    host: parser.host || window.location.host,
    hostname: parser.hostname,
    origin: origin,
    protocol: parser.protocol,
    pathname: pathname
  };
}

function originMatches(url, origin) {
  return parseUrl(url, origin).origin === origin;
}

// https://gist.github.com/LeverOne/1308368
function uuidv4(a,b) {
  for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;
}

function isValidOrigin(url, origin) {
  if(!originMatches(url, origin)) {
    throw new Error(
      `Origin mismatch. Url "${url}" does not have an origin of "${origin}".`);
  }
}

function isValidMessage(message) {
  return (
    message && typeof message === 'object' &&
    message.jsonrpc === '2.0' &&
    message.id && typeof message.id === 'string');
}

function isValidRequest(message) {
  return isValidMessage(message) && Array.isArray(message.params);
}

function isValidResponse(message) {
  return (
    isValidMessage(message) &&
    !!('result' in message ^ 'error' in message) &&
    (!('error' in message) || isValidError(message.error)));
}

function isValidError(error) {
  return (
    error && typeof error === 'object' &&
    typeof error.code === 'number' &&
    typeof error.message === 'string');
}

function serializeError(error) {
  const err = {
    message: error.message
  };
  if(error.constructor.name !== 'Error') {
    err.constructor = error.constructor.name;
  }
  if('name' in error) {
    err.name = error.name;
  }
  if('code' in error) {
    err.code = error.code;
  } else {
    err.code = RPC_ERRORS.ServerError.code;
  }
  if('details' in error) {
    err.details = error.details;
  }
  return err;
}

function deserializeError(error) {
  let err;
  // special case known types, otherwise use generic Error
  if(error.constructor === 'DOMException') {
    err = new DOMException(error.message, error.name)
    // ignore code, name will set it
  } else {
    err = new Error(error.message);
    if('code' in error) {
      err.code = error.code;
    }
  }
  if(error.details) {
    err.details = error.details;
  }
  return err;
}

function createMessageListener(
  {listener, origin, handle, expectRequest}) {
  // HACK: we can't just `Promise.resolve(handle)` because Chrome has
  // a bug that throws an exception if the handle is cross domain
  if(isHandlePromise(handle)) {
    const promise = handle;
    handle = false;
    promise.then(h => handle = h);
  }
  return e => {
    // ignore messages from a non-matching handle or origin
    // or that don't follow the protocol
    if(!(e.source === handle && e.origin === origin &&
      ((expectRequest && isValidRequest(e.data)) ||
        (!expectRequest && isValidResponse(e.data))))) {
      return;
    }
    listener(e.data, e);
  };
}

function destructureMethodName(fqMethodName) {
  // fully-qualified method name is: `<api-name>.<method-name>`
  // where `<api-name>` is all but the last dot-delimited segment and
  // `<method-name>` is the last dot-delimited segment
  let [name, ...rest] = fqMethodName.split('.');
  const method = rest.pop();
  name = [name, ...rest].join('.');
  return {name, method};
}

function isHandlePromise(handle) {
  try {
    // HACK: we can't just `Promise.resolve(handle)` because Chrome has
    // a bug that throws an exception if the handle is cross domain
    return typeof handle.then === 'function';
  } catch(e) {}
  return false;
}


/***/ })

/******/ });
});
//# sourceMappingURL=credential-handler-polyfill.min.js.map