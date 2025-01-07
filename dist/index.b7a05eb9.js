// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"cAPdp":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "7dd44675b7a05eb9";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || location.port;
}
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == 'https:' && ![
        'localhost',
        '127.0.0.1',
        '0.0.0.0'
    ].includes(hostname) ? 'wss' : 'ws';
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
    } catch (err) {
        if (err.message) console.error(err.message);
        ws = {};
    }
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    // $FlowFixMe
    ws.onmessage = async function(event /*: {data: string, ...} */ ) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        disposedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        assetsToDispose = [];
        var data /*: HMRMessage */  = JSON.parse(event.data);
        if (data.type === 'reload') fullReload();
        else if (data.type === 'update') {
            // Remove error overlay if there is one
            if (typeof document !== 'undefined') removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH);
            // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear();
                // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
                await hmrApplyUpdates(assets);
                hmrDisposeQueue();
                // Run accept callbacks. This will also re-execute other disposed assets in topological order.
                let processedAssets = {};
                for(let i = 0; i < assetsToAccept.length; i++){
                    let id = assetsToAccept[i][1];
                    if (!processedAssets[id]) {
                        hmrAccept(assetsToAccept[i][0], id);
                        processedAssets[id] = true;
                    }
                }
            } else fullReload();
        }
        if (data.type === 'error') {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
            }
            if (typeof document !== 'undefined') {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html);
                // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    if (ws instanceof WebSocket) {
        ws.onerror = function(e) {
            if (e.message) console.error(e.message);
        };
        ws.onclose = function() {
            console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
        };
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ('reload' in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"jeorp":[function(require,module,exports,__globalThis) {
/**
 * main.ts
 *
 * Controller for application.
 *
 * Initializes view and handles view-created events
 *
 * Implements controller part of MVC architecture--though for this application the
 *  benefits of this design pattern are slim, it could be extended in the future to
 *  an application that fully leverages this pattern.
 */ var _neptune = require("./neptune/neptune");
var _view = require("./view");
/**
 * Program entry point
 */ function main() {
    customElements.define("neptune-component", (0, _neptune.NeptuneComponent));
    let dimensions = 2;
    const displaySize = [
        window.innerWidth,
        window.innerHeight
    ];
    const resolution2d = [
        Math.ceil(displaySize[0]) / 100,
        Math.ceil(displaySize[1]) / 100
    ];
    const resolution3d = [
        256,
        256,
        256
    ];
    const neptuneOptions = {
        displaySize: displaySize,
        dimensions: 2,
        resolution2d: resolution2d,
        resolution3d: resolution3d,
        cellSize: 1
    };
    const neptune = new (0, _neptune.NeptuneComponent)(neptuneOptions, loadResource);
    const view = (0, _view.initView)(neptune);
    document.addEventListener("toggleDimension", handleToggleDimension);
    window.addEventListener("resize", handleWindowResize);
    /**
   * Handle a toggleDimension event from the view.
   * Should toggle between 2 and 3 dimensions
   */ function handleToggleDimension() {
        dimensions = dimensions === 2 ? 3 : 2;
        neptune.setDimension(dimensions);
        view.toggleDimension();
    }
    /**
   * Handle browser resize, updating simulation environment as needed
   */ function handleWindowResize() {
        neptune.resize([
            window.innerWidth,
            window.innerHeight
        ]);
    }
}
/**
 * Load code from external file
 */ async function loadResource(resourceName) {
    try {
        const response = await fetch(`${resourceName}`);
        return await response.text();
    } catch  {
        throw new Error(`Failed to load shader ${resourceName}`);
    }
}
/**
 * Run main function after DOM fully loaded
 */ document.addEventListener("DOMContentLoaded", ()=>{
    main();
});

},{"./neptune/neptune":"dWIaG","./view":"1ce4O"}],"dWIaG":[function(require,module,exports,__globalThis) {
/**
 * neptune.ts
 *
 * Defines neptune web component.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
/**
 * A web component that simulates an interactible fluid simulation and renders
 *  in real time.
 * Provides a public-facing interface for setting simulation parameters
 *
 * Encapsulates all WebGPU API activity, handles user interactive input, simulation
 *  and animation frame request, and renders result to a canvas element.
 *
 * The neptune system consists of four layers, each of which it creates and applies:
 *
 * * input layer
 *      the input layer recieves user interaction events (i.e. mouse down, mouse up, and mouse move), and
 *  corresponding coordinates. It is then responsible for converting those normalized screen space mouse
 *  coordinates into world space coordinates, and delegating to substance layer for creating simulation
 *  input, or moving the camera as needed
 *
 * * substance layer
 *      the substance layer recieves input commands from the input layer with corresponding world space
 *  coordinates. It is then responsible for adding substance to the simulation plane/volume and/or adding
 *  a force to the simulation plane/volume, modifying the current simulation state
 *
 * * simulation layer
 *      the simulation layer is in charge of handling a single simulation timestep, beginning with current
 *  simulation state and applying sequential (1) advection, (2) diffusion, and (3) projection steps to the
 *  current simulation state
 *
 * * render layer
 *      the render layer is in charge of rendering the current simulation state. Depending on the number
 *  of dimensions of the current simulation, this could mean simply rendering to an appropriately sized
 *  plane, or it could mean using a ray-marched volume renderer to visualize a 3D simulation
 */ parcelHelpers.export(exports, "NeptuneComponent", ()=>NeptuneComponent);
var _inputProcessor = require("./inputProcessor");
var _simulator = require("./simulator");
var _substanceCreator = require("./substanceCreator");
var _renderer = require("./renderer");
var _simulationState = require("./simulationState");
var _camera = require("./camera");
class NeptuneComponent extends HTMLElement {
    // All html content is contained in this shadow root
    shadow;
    controller = null;
    // Indicates that initialization is complete and system is ready to render.
    ready = false;
    // Function to load resources using a name
    loadResource;
    canvas;
    // System layers
    inputLayer = null;
    substanceLayer = null;
    simulationLayer = null;
    renderLayer = null;
    // System variables
    dimensions = null;
    device = null;
    context = null;
    // Will point to whichever camera is currently in use
    camera = null;
    // Will always hold the 2-dimensional camera
    camera2d = null;
    // Will always hold the 3-dimensional camera
    camera3d = null;
    // Will hold the resolution corresponding with the current number of dimensions
    resolution = null;
    // Will always hold the 2-dimensional simulation resolution
    resolution2d = null;
    // Will always hold the 3-dimensional simulation resolution
    resolution3d = null;
    // Will hold the state corresponding with the current number of dimensions
    state = null;
    // Will always hold the 2-dimensional simulation state, even if not currently rendering
    state2d = null;
    // Will always hold the 3-dimensional simulation state, even if not currently rendering
    state3d = null;
    /**
   * Constructs a new NeptuneComponent instance.
   *
   * @param options a NeptuneOptions object containing information
   * for initializing simulation environment.
   */ constructor(options, loadResource){
        super();
        this.loadResource = loadResource;
        this.shadow = this.attachShadow({
            mode: "open"
        });
        this.canvas = document.createElement("canvas");
        this.shadow.append(this.canvas);
        this.initializeSystem(options);
    }
    /**
   * Once connected to the DOM, attach necessary event listeners.
   */ connectedCallback() {
        this.controller = new AbortController();
        const options = {
            signal: this.controller.signal
        };
        // Add input event listeners
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this), options);
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this), options);
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this), options);
        // Request animation frame for main loop
        window.requestAnimationFrame(this.mainLoop.bind(this));
    }
    /**
   * Clean up event listeners when disconnected from DOM.
   */ disconnectedCallback() {
        this.controller?.abort();
        this.controller = null;
    }
    /**
   * Handle computation for each timestep
   */ mainLoop() {
        if (this.ready) {
            if (!this.dimensions) throw new Error("Error, dimensions not set");
            if (!this.state) throw new Error("Error, no simulation state initialized");
            if (!this.substanceLayer) throw new Error("Error, substance layer not initialized");
            if (!this.inputLayer) throw new Error("Error, input layer not initialized");
            if (!this.camera) throw new Error("Error, camera not initialized");
            if (!this.simulationLayer) throw new Error("Error, simulation layer not initialized");
            if (!this.renderLayer) throw new Error("Error, render layer not initialized");
            this.inputLayer.step(this.dimensions, this.state, this.substanceLayer, this.camera);
            this.simulationLayer.step(this.dimensions, this.state);
            this.renderLayer.render(this.dimensions, this.state, this.camera);
        }
        window.requestAnimationFrame(this.mainLoop.bind(this));
    }
    /**
   * Set the dimensionality of the simulation environment.
   * Must either be 2 or 3.
   *
   * @param dimension number of desired simulation dimensions
   */ setDimension(dimensions) {
        this.dimensions = dimensions;
        if (dimensions === 2) {
            this.resolution = this.resolution2d;
            this.state = this.state2d;
            this.camera = this.camera2d;
        } else if (dimensions === 3) {
            this.resolution = this.resolution3d;
            this.state = this.state3d;
            this.camera = this.camera3d;
        }
    }
    /**
   * Change the size of the canvas element.
   *
   * @param displaySize the desired display size
   */ resize(displaySize) {
        const deltaW = displaySize[0] / this.canvas.width;
        const deltaH = displaySize[1] / this.canvas.height;
        if (!this.resolution2d || !this.resolution) throw new Error("Attempted to resize display before resolution set");
        if (!this.state2d) throw new Error("Attempted to resize simulation resolution before state initialized");
        const newResolution = this.resolution2d;
        newResolution[0] = Math.ceil(deltaW * this.resolution[0]);
        newResolution[1] = Math.ceil(deltaH * this.resolution[1]);
        this.state2d.resize(newResolution);
        this.setDisplaySize(displaySize);
    }
    async initializeSystem(options) {
        if (!navigator.gpu) throw new Error("WebGPU Not supported in this browser");
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: "high-performance"
        });
        if (!adapter) throw new Error("No appropriate GPUAdapter found.");
        this.device = await adapter.requestDevice();
        if (!this.device) throw new Error("No appropriate GPUDevice foujnd.");
        this.context = this.canvas.getContext("webgpu");
        if (!this.context) throw new Error("Failed to get webgpu context from canvas element");
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context?.configure({
            device: this.device,
            format: canvasFormat
        });
        this.dimensions = options.dimensions;
        this.resolution2d = options.resolution2d;
        this.resolution3d = options.resolution3d;
        this.resolution = this.resolution2d;
        this.state2d = new (0, _simulationState.SimulationState)(this.resolution2d, this.device);
        this.state3d = new (0, _simulationState.SimulationState)(this.resolution3d, this.device);
        this.state = this.state2d;
        this.camera2d = new (0, _camera.Camera)();
        this.camera3d = new (0, _camera.Camera)();
        this.camera = this.camera2d;
        this.inputLayer = new (0, _inputProcessor.InputProcessor)();
        this.substanceLayer = new (0, _substanceCreator.SubstanceCreator)();
        this.simulationLayer = new (0, _simulator.Simulator)();
        this.renderLayer = new (0, _renderer.Renderer)();
        this.setDisplaySize(options.displaySize);
    }
    /**
   * Set the display size.
   *
   * @param displaySize display size desired
   */ setDisplaySize(displaySize) {
        this.canvas.width = displaySize[0];
        this.canvas.height = displaySize[1];
        if (!this.resolution2d || !this.resolution) throw new Error("Attempted to resize display before resolution set");
        if (!this.state2d) throw new Error("Attempted to resize simulation resolution before state initialized");
        const canvasAspect = this.canvas.width / this.canvas.height;
        const simAspect = this.resolution2d[0] / this.resolution2d[1];
        const newResolution = this.resolution2d ?? [
            0,
            0
        ];
        if (simAspect < canvasAspect) newResolution[1] = Math.ceil(newResolution[0] / canvasAspect);
        else if (simAspect > canvasAspect) newResolution[0] = Math.ceil(newResolution[1] * canvasAspect);
        this.state2d.resize(newResolution);
    }
    /**
   * Handle a mouse click event on the canvas element.
   *
   * @param event mouse down event
   */ handleMouseDown(event) {
        this.inputLayer?.setMouseDown();
        this.inputLayer?.setModifier(event.altKey);
    }
    /**
   * Handle a mouse unclick event on the canvas element.
   *
   * @param event mouse up event
   */ handleMouseUp(event) {
        this.inputLayer?.setMouseUp();
        this.inputLayer?.setModifier(event.altKey);
    }
    /**
   * Handle a mouse move event on the canvas element.
   *
   * @param event mouse move event
   */ handleMouseMove(event) {
        const canvasRect = this.canvas.getBoundingClientRect();
        this.inputLayer?.setMousePosition(event.clientX - canvasRect.left, event.clientY - canvasRect.top);
        this.inputLayer?.setModifier(event.altKey);
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./inputProcessor":"5j1rq","./simulator":"bOQPk","./substanceCreator":"1iLPh","./renderer":"4KE4h","./simulationState":"izkl6","./camera":"i7FI2"}],"gkKU3":[function(require,module,exports,__globalThis) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"5j1rq":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "InputProcessor", ()=>InputProcessor);
class InputProcessor {
    constructor(){}
    step(dimensions, state, substanceCreator, camera) {}
    setMouseDown() {}
    setMouseUp() {}
    setMousePosition(x, y) {}
    setModifier(modifier) {}
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bOQPk":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Simulator", ()=>Simulator);
class Simulator {
    constructor(){}
    step(dimensions, state) {}
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1iLPh":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "SubstanceCreator", ()=>SubstanceCreator);
class SubstanceCreator {
    constructor(){}
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"4KE4h":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Renderer", ()=>Renderer);
const PLANE_VERTICES = new Float32Array([
    -0.8,
    -0.8,
    0.8,
    -0.8,
    0.8,
    0.8,
    -0.8,
    -0.8,
    -0.8,
    0.8,
    0.8,
    0.8
]);
class Renderer {
    vertices;
    vertexBuffer;
    cellPipeline;
    bindGroup;
    constructor(){}
    render(device, renderView, dimensions, state, camera) {
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    //   view: context.getCurrentTexture().createView(),
                    view: renderView,
                    loadOp: "clear",
                    clearValue: {
                        r: 0,
                        g: 0,
                        b: 0.4,
                        a: 1
                    },
                    storeOp: "store"
                }
            ]
        });
        pass.setPipeline(this.cellPipeline);
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.setBindGroup(0, this.bindGroup);
        pass.draw(this.vertices.length / 2);
        pass.end();
        device.queue.submit([
            encoder.finish()
        ]);
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"izkl6":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "SimulationState", ()=>SimulationState);
class SimulationState {
    dimensions;
    resolution;
    device;
    velocityField;
    constructor(resolution, device){
        this.dimensions = resolution.length;
        this.resolution = resolution;
        this.device = device;
        // TODO CURRENTLY SUPPORTS ONLY 2D
        const defaultArray = new Float32Array(this.resolution[0] * this.resolution[1] * (this.resolution?.[2] ?? 1));
        for(let i = 0; i < defaultArray.length; i++)if (i % 3 == 0) defaultArray[i] = 1;
        this.velocityField = [
            this.device.createBuffer({
                label: "Velocity Field A",
                size: defaultArray.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
            }),
            this.device.createBuffer({
                label: "Velocity Field B",
                size: defaultArray.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
            })
        ];
        this.device.queue.writeBuffer(this.velocityField[0], 0, defaultArray);
    }
    resize(newResolution) {
        // TODO implement this
        throw new Error("SimulationState does not currently support dynamic resizing");
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"i7FI2":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Camera", ()=>Camera);
class Camera {
    constructor(){}
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1ce4O":[function(require,module,exports,__globalThis) {
/**
 * view.ts
 *
 * View for the application
 */ /**
 * Factory to create and initialize the View.
 *
 * @param attachedComponent an arbitrary component to attach to view.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initView", ()=>initView);
function initView(attachedComponent) {
    // Extract the relevant HTML elements from our web page and ensure they are present and of the correct types
    const dimensionToggleButton = document.querySelector("button#dimension-toggle");
    if (!(dimensionToggleButton instanceof HTMLButtonElement)) throw new Error("Failed to find dimension toggle button, cannot initialize the View");
    const componentContainer = document.querySelector("#component-container");
    if (!(componentContainer instanceof HTMLElement)) throw new Error("Failed to find container for input web component");
    componentContainer.append(attachedComponent);
    return new View(dimensionToggleButton);
}
/**
 * Dispatches events on user interaction.
 * Provides a public interface for modifying the DOM based on user events.
 *
 * Also provides an attachment point for an arbitrary web component, which
 * will sit in the DOM and may violate the MVC pattern
 * (used for the simulation render loop)
 */ class View {
    // Elements
    dimensionToggleButton;
    /**
   * Constructs a new View instance.
   *
   * @param button a button element to use for toggling dimensions
   */ constructor(button){
        this.dimensionToggleButton = button;
        this.dimensionToggleButton.addEventListener("click", this.handleDimensionButtonClick.bind(this));
    }
    /**
   * Switch dimension button icon with dataset alt
   */ toggleDimension() {
        const icon = this.dimensionToggleButton.querySelector("#dimension-toggle-icon");
        if (!(icon instanceof HTMLElement)) throw new Error("Failed to get dimension icon");
        const alt = icon.dataset.alt ?? "";
        icon.dataset.alt = icon.getAttribute("icon") ?? "";
        icon.setAttribute("icon", alt);
    }
    /**
   * Handle a click on the dimension toggle button.
   */ handleDimensionButtonClick() {
        const toggleDimensionEvent = new CustomEvent("toggleDimension");
        document.dispatchEvent(toggleDimensionEvent);
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["cAPdp","jeorp"], "jeorp", "parcelRequire94c2")

//# sourceMappingURL=index.b7a05eb9.js.map
