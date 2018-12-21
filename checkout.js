/**
 * @fileoverview Checkout is a layer that interacts with user site and performs actions
 *               on the remote server using rpc and browser cross origin domain 
 *               postMessage.
 */

/**
 * Element closest polyfill.
 */
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

/**
 * Object assign polyfill.
 */
if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

/**
 * CaptainPanel global object for checkout JavaScript.
 * @namespace
 */
var CaptainPanel = CaptainPanel || {};

/**
 * CaptainPanel checkout application where state is created and managed, event
 * listeners are registered.
 * @namespace
 */
CaptainPanel.Checkout = (function() {

  /**
   * Checkout panel default options.
   */
  var options = {
    iframeSrc: 'http://localhost:8080/iframe.html',
    iframeClass: '.captainpanel-iframe',
    iframeStyles: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 9999,
      width: '100%',
      height: '100%',
      border: 0,
      display: 'none'
    },
    controlSelector: '.captainpanel-checkout',
    controlClass: 'captainpanel-button',
    controlText: 'Book Now',
    controlStyles: {
      backgroundColor: 'tomato',
      color: '#ffffff',
      fontSize: '2rem',
      padding: '1rem 2rem',
      border: '1px solid tomato',
      borderRadius: '0.3rem',
      cursor: 'pointer',
    }
  };

  /**
   * RPC Action list which can performed remotely on the api.
   */
  var actions = {
    IframeClose: 'iframe.close',
    PackageLoad: 'package.load',
  };

  /**
   * Checkout control elements.
   */
  var controlElements =  null;

  /**
   * Checkout panel iframe element.
   */
  var iframeElement =  null;

  /**
   * Checkout panel iframe.
   */
  var iframe = null;

  /**
   * User site domain.
   */
  var domain = null;

  /**
   * Checkout container element.
   */
  var containerElement = null;

  /**
   * Create checkout panel control buttons using default styles.
   */
  function createControlElements() {
    controlElements.forEach(function(el, i) {
      var buttonElement = document.createElement('button');
      buttonElement.classList.add(options.controlClass);

      applyStyles(buttonElement, options.controlStyles);

      buttonElement.textContent = options.controlText;
      el.appendChild(buttonElement);
    });
  }

  /**
   * Create checkout panel iframe element.
   */
  function createIframeElement() {
    iframeElement = document.createElement('iframe');
    iframeElement.classList.add(options.iframeClass);
    iframeElement.src = options.iframeSrc;

    applyStyles(iframeElement, options.iframeStyles);

    containerElement.appendChild(iframeElement);
    iframe = iframeElement.contentWindow;
  }

  /**
   * Apply styles to an element.
   */
  function applyStyles(element, styles) {
      for (var prop in styles) {
        element.style[prop] = styles[prop];
      }
  }

  /**
   * Handle rpc message from remote.
   * @param {object} event custom action event.
   */
  function handlePostMessage(event) {
    var data = JSON.parse(event.data);
    if (data.action === actions.IframeClose) {
      iframeElement.style.display = "none";
    }
  }

  /**
   * Handle click on checkout panel controls, it registers only one event on
   * document and delegate down to individual target elements for better performance.
   * @param {object} event dom event.
   */
  function handleClick(event) {
    var targetElement = event.target.closest(options.controlSelector);
    if (!!targetElement) {
      iframeElement.style.display = "block";

      var data = JSON.stringify({
        action: actions.PackageLoad,
        arguments: [targetElement.dataset.id]
      });
      iframe.postMessage(data, domain);
    }
  }

  /**
   * Register events for checkout panel.
   */
  function registerEventListeners() {
    window.addEventListener('message', handlePostMessage);
    document.addEventListener('click', handleClick);
  }

  /**
   * Public method api.
   */
  return {
    /**
     * Initialize checkout panel.
     * @param {object} opts checkout panel options.
     */
    init: function(opts) {
      options = Object.assign(options, opts);

      controlElements = [].slice.call(document.querySelectorAll(options.controlSelector));
      containerElement = document.querySelector('body');

      domain = [window.location.protocol, window.location.host].join("//")

      createControlElements();
      createIframeElement();
      registerEventListeners();
    },

    /**
     * Destroy checkout panel
     */
    destroy: function() {
      iframeElement = null;
      controlElements = null;
      containerElement = null;
      iframe = null;
      domain = null;
    }
  };

}());

CaptainPanel.Checkout.init();
