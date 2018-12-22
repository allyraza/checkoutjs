var Checkout = (function() {
  /**
   * Rpc action list.
   */
  var actions = {
    PackageLoad: 'package.load',
    IframeClose: 'iframe.close',
  };

  /**
   * Checkout options.
   */
  var options = {
    checkoutSelector: '.js-checkout',
    closeSelector: '.js-checkout-close',
    domain: 'http://localhost:8080',
  };

  /**
   * Rpc action callbacks.
   */
  var callbacks = {};

  /**
   * Checkout element.
   */
  var checkoutElement = null;

  /**
   * Origin window.
   */
  var origin = null;

  /**
   * Handle post message.
   * @param {object} event custom action event.
   */
  function handlePostMessage(event) {
    try {
      var data = JSON.parse(event.data);
      if (data.action in callbacks) {
        var actions = callbacks[data.action];

        actions.forEach(function(fn, i) {
          fn(data.arguments);
        });
      }
    } catch(e) {
      console.log(e);
    }
  }

  /**
   * Handle click action.
   * @param {object} event dom event.
   */
  function handleClick(event) {
    event.preventDefault();
    var targetElement = event.target;

    if (!!targetElement.matches(options.closeSelector) || !!targetElement.closest(options.closeSelector)) {
      sendCloseMessage();
    }
  }

  /**
   * Send a message to origin to close the checkout dialog.
   */
  function sendCloseMessage() {
    var data = JSON.stringify({
      action: actions.IframeClose,
      arguments: []
    });

    origin.postMessage(data, options.domain);
  }

  /**
   * Register event listeners.
   */
  function registerEventListeners() {
    document.addEventListener('click', handleClick);
    window.addEventListener('message', handlePostMessage);
  }

  return {
    /**
     * Initialize checkout.
     */
    init: function(opts) {
      options = Object.assign(options, opts);
      origin = window.parent;

      checkoutElement = document.querySelector(options.checkoutSelector);

      if (window.top !== window.self) {
        checkoutElement.classList.add('checkout--iframe');
      }

      this.register(actions.PackageLoad, function(data) {
        console.log("data: ", data);
      });

      registerEventListeners();
    },

    /**
     * Register a callback.
     * @param {string} action rpc action name.
     * @param {function} callback function to execute for action.
     */
    register: function(action, callback) {
      if (typeof  callback !== 'function') {
        throw new TypeError("Callback is not a valid function.");
      }

      callbacks[action] = callbacks[action] || [];
      callbacks[action].push(callback);
    },

    /**
     * Available actions.
     */
    Actions: actions,

    /**
     * Destory checkout.
     */
    destroy: function() {
      checkoutElement = null;
      origin = null;
    },
  };
}());
