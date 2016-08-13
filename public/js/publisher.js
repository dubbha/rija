(function (window) {
  'use strict';

  /**
  * Publisher class implementing the Publish-Subscribe (Observer) pattern
  *
  * @constructor
  */
  function Publisher() {
    this.subscribers = [];
  }

  Publisher.prototype = {
    subscribe: function (fn) {
      this.subscribers.push(fn);
    },
    unsubscribe: function (fn) {
      var subs = this.subscribers,
        i;
      for (i = 0; i < subs.length; i += 1) {    // length property might change after the first splice
        if (this.subscribers[i] === fn) {
          subs.splice(i, 1);
        }
      }
    },
    publish: function (publication) {
      var subs = this.subscribers,
        i;

      for (i = 0; i < subs.length; i += 1) {
        subs[i](publication);   // pass the argument to the subscriber function
      }
    }
  };
  Publisher.prototype.constructor = Publisher;
  
  // Attach to window
  window.app = window.app || {};
  window.app.Publisher = Publisher;

}(window));