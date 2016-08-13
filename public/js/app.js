(function (window) {
  'use strict';
  
  /**
  * Sets up an app instance
  *
  * @constructor
  * @param {string} name The name of the specific app instance
  */
  function Instance(name) {
    var that = this;
    
    // Load modules
    this.storage = new window.app.Storage(name);
    this.model = new window.app.Model(this.storage);
    this.template = new window.app.Template();
    this.dnd = new window.app.Dnd();
    this.view = new window.app.View(this.template, this.dnd);
    this.controller = new window.app.Controller(this.model, this.view);
    this.publisher = new window.app.Publisher();

    // Set routes
    this.controller.setRoute('/', this.view.index);
    this.controller.setRoute('/contact', this.view.contact);
    this.controller.setRoute('/learn', this.view.youtube);
    this.controller.setRoute('/learn/youtube', this.view.youtube);
    this.controller.setRoute('/learn/manual', this.view.manual);
    this.controller.setRoute('/learn/faq', this.view.faq);
    this.controller.setRoute('/user/login', this.view.userLoginForm);
    this.controller.setRoute('/user/logout', this.view.userLogoutRequest);
    // Restricted
    this.controller.setRoute('/user/mail', function () {
      that.view.resticted.call(that.view, 'userMailListRequest');
    });
    this.controller.setRoute('/user/mail/to/:id', function (args) {
      that.view.resticted.call(that.view, 'userMailTo', args);
    });
    this.controller.setRoute('/plan', function () {
      that.view.resticted.call(that.view, 'projectListRequest');
    });
    this.controller.setRoute('/plan/project', function () {
      that.view.resticted.call(that.view, 'projectListRequest');
    });
    this.controller.setRoute('/plan/project/create', function () {
      that.view.resticted.call(that.view, 'projectCreate');
    });
    this.controller.setRoute('/plan/issue', function () {
      that.view.resticted.call(that.view, 'issueListRequest');
    });
    this.controller.setRoute('/plan/issue/create', function () {
      that.view.resticted.call(that.view, 'issueCreate');
    });
    this.controller.setRoute('/plan/backlog', function () {
      that.view.resticted.call(that.view, 'backlogListRequest');
    });
    this.controller.setRoute('/plan/sprint', function () {
      that.view.resticted.call(that.view, 'sprintListRequest');
    });
    // Not found
    this.controller.setNotFound(this.view.notFound);
  }

  var instance = new Instance('rija');

  function setView() {
    instance.controller.toPath(document.location.hash);
  }

  window.addEventListener('load', setView);
  window.addEventListener('hashchange', setView);

}(window));