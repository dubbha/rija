(function () {
  'use strict';

  /**
   * Router class
   *
   * @constructor
   */
  function Router(view) {
    this.view = view;
    this.routes = {};
    this.notFound = function () {};    // not found handler
  }
  Router.prototype = {
    /**
     * Set Route method
     *
     * @param {string} route Route hash
     * @param {function} handler Hander function
     */
    setRoute: function (route, handler) {
      var param, routeArr, routeRegexpStr, i,
        params = [];

      if (route.match(':')) {
        routeArr = route.split(':');

        // Prepare a regexp string that will be saved instead of a static route
        routeRegexpStr = routeArr[0];   // assing the first part, before the first variable

        for (i = 1; i < routeArr.length; i += 1) {
          // Param name, save aside
          if (routeArr[i].indexOf('/') > -1) {
            param = routeArr[i].substr(0, routeArr[i].indexOf('/'));
          } else {
            param = routeArr[i];
          }
          params.push(param);

          // Add a regexp part
          routeRegexpStr += '([a-z0-9_-]+)';    // will later be used in a case-insensitive manner: var re = new RegExp("a|b", "i");

          // Add the rest of the part, until the next variable (if exists)
          if (routeArr[i].match('/')) {   // if exists
            routeRegexpStr += routeArr[i].substr(routeArr[i].indexOf('/'));
          }
        }

        // replace the original route with the regexp one
        route = routeRegexpStr;
      }
      this.routes[route] = { 'handler': handler,
                              'params': params };
    },
    setNotFound: function (handler) {
      this.notFound = handler;
    },
    toPath: function (hash) {
      var key, res, params, reg,
        path = '/' + hash.substr(1),    // strip the leading hash sign, add the leading slash to store with
        found = false;
      
      for (key in this.routes) {
        if (this.routes.hasOwnProperty(key)) {
          if (key === path) {   // strict match, no params to pass
            this.routes[key].handler.call(this.view);
            found = true;
            break;
          } else {    // regexp match, need to pass params
            reg = new RegExp('^' + key + '$', 'i');
            res = path.match(reg);
            if (res) {
              params = res.splice(1);   // res.splice(1) contains params collected from regexp          
              this.routes[key].handler.apply(this.view, params);
              found = true;
              break;
            }
          }
        }
      }
      if (!found) {
        this.notFound.call(this.view);   // handler set by this.notFound();
      } else {
        window.location.hash = path.substr(1);  // strip the leading slash used to store the path
      }
    }
  };
  Router.prototype.constructor = Router;
  
  // Attache to window
  window.app = window.app || {};
  window.app.Router = Router;
  
  
}(window));
