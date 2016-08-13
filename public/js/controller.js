(function (window) {
  'use strict';
  
  /**
  * Controller class
  *
  * @constructor
  */
  function Controller(model, view) {
    var that = this;
    that.model = model;
    that.view = view;
    that.router = new window.app.Router(this.view);
    
    
    /*** View-initiated publications ***/
    
    that.view.pubs.redirect.subscribe(function (path) {
      that.router.toPath(path);
    });
    that.view.pubs.restricted.subscribe(function (pub) {
      that.restricted(pub);
    });
    that.view.pubs.userLoginRequest.subscribe(function (pub) {
      that.userLogin(pub);
    });
    that.view.pubs.userLogoutRequest.subscribe(function () {
      that.userLogout();
    });
    that.view.pubs.isUserAuthenticatedRequest.subscribe(function () {
      that.isUserAuthenticated();
    });
    that.view.pubs.userMailCheckRequest.subscribe(function () {
      that.userMailCheck();
    });
    that.view.pubs.userMailListRequest.subscribe(function () {
      that.userMailList();
    });
    that.view.pubs.userMailRead.subscribe(function (sent) {
      that.userMailRead(sent);
    });
    that.view.pubs.userMailDelete.subscribe(function (sent) {
      that.userMailDelete(sent);
    });
    that.view.pubs.userMailSend.subscribe(function (sent) {
      that.userMailSend(sent);
    });
    that.view.pubs.projectListRequest.subscribe(function () {
      that.projectList();
    });
    that.view.pubs.projectCreate.subscribe(function (pub) {
      that.projectCreate(pub);
    });
    that.view.pubs.setSession.subscribe(function (pub) {
      that.setSession(pub);
    });
    that.view.pubs.issueListRequest.subscribe(function () {
      that.issueList();
    });
    that.view.pubs.issueCreate.subscribe(function (pub) {
      that.issueCreate(pub);
    });
    that.view.pubs.issueModify.subscribe(function (pub) {
      that.issueModify(pub);
    });
    that.view.pubs.issueDelete.subscribe(function (id) {
      that.issueDelete(id);
    });
    that.view.pubs.assigneeList.subscribe(function (id) {
      that.assigneeList(id);
    });
    that.view.pubs.backlogListRequest.subscribe(function () {
      that.backlogList();
    });
    that.view.pubs.backlogSequenceUpdate.subscribe(function (pub) {
      that.backlogSequenceUpdate(pub);
    });
    that.view.pubs.sprintListRequest.subscribe(function () {
      that.sprintList();
    });
    that.view.pubs.sprintPlannedUpdate.subscribe(function (pub) {
      that.sprintPlannedUpdate(pub);
    });
    that.view.pubs.sprintActivate.subscribe(function () {
      that.sprintActivate();
    });
    that.view.pubs.sprintActiveUpdate.subscribe(function (pub) {
      that.sprintActiveUpdate(pub);
    });
    
    
    /*** Model-initiated publications ***/
    
    that.model.pubs.userLoggedOut.subscribe(function () {
      that.userLoggedOut();
    });
    that.model.pubs.userMailReadResponse.subscribe(function (sent) {
      that.userMailReadResponse(sent);
    });
    that.model.pubs.userMailDeleteResponse.subscribe(function (sent) {
      that.view.userMailDeleteRedraw(sent);
    });
    that.model.pubs.userMailUpdate.subscribe(function () {
      that.view.userMailUpdate();
    });
    
  }
  Controller.prototype = {
    setRoute: function (path, handler) {
      this.router.setRoute(path, handler);
    },
    setNotFound: function (handler) {
      this.router.setNotFound(handler);
    },
    toPath: function (hash) {
      this.router.toPath(hash);
    },

    
    /*** View-initiated publications subscribers ***/
    
    userLogin: function (pub) {
      var username, password,
        that = this;
      
      username = pub.username;
      password = pub.password;
      
      this.model.userLogin(username, password, function (auth) {
        that.view.userLogin(auth);
      });
    },
    userLogout: function () {
      var that = this;
      this.model.userLogout(function () {
        that.view.index();
      });
    },
    isUserAuthenticated: function () {
      var that = this;
      this.model.isUserAuthenticated(function (username) {
        that.view.authUserRedraw(username);
      });
    },
    /**
     * Check access to restricted area
     * Access will only be granted if user is currently authenticated.
     * If not, user will be forced to log in
     */
    restricted: function (pub) {
      var that = this;
      // Let model check the authentication and run the approprate callback
      //this.model.restricted(function () { pub.grantedCallback.call(that.view) },
      //                      function () { pub.deniedCallback.call(that.view) } );
      this.model.restricted(pub.grantedCallback, pub.deniedCallback);
      
    },
    userMailCheck: function () {
      var that = this;
      this.model.userMailCheck(function (count) {
        that.view.authUserMailRedraw(count);
      });
    },
    userMailList: function () {
      var that = this;
      this.model.userMailList(function (userMail) {
        that.view.userMailList(userMail);
      });
    },
    userMailRead: function (sent) {
      this.model.userMailRead(sent);  // no callback, model will notify the views upon success
    },
    userMailDelete: function (sent) {
      this.model.userMailDelete(sent);  // no callback, model will notify the views upon success
    },
    userMailSend: function (mail) {
      this.model.userMailSend(mail);
    },
    projectList: function () {
      var that = this;
      this.model.projectList(function (list) {
        that.view.projectList(list);
      });
    },
    projectCreate: function (pub) {
      var that = this;
      
      this.model.projectCreate(pub, function (list) {
        that.view.projectList(list);
      });
    },
    setSession: function (pub) {
      this.model.setSession(pub);
    },
    issueList: function () {
      var that = this;
      this.model.issueList(function (list) {        // active projectId found in session
        that.view.issueList(list);
      }, function () {                              // active projectId not found
        that.view.projectListRequest();
      });
    },
    issueCreate: function (pub) {
      var redirect,
        that = this;
      
      redirect = pub.redirect;
      delete pub.redirect;  // strip redirect from the pub data
      
      this.model.issueCreate(pub, function (list) {   // active projectId found in session
        that.view.pubs.redirect.publish(redirect);
      }, function () {                                // active projectId not found
        that.view.projectListRequest();
      });
    },
    issueModify: function (pub) {
      var that = this;
      
      this.model.issueModify(pub, function (list) {
        that.view.issueList(list);
      });
    },
    issueDelete: function (id) {
      var that = this;

      this.model.issueDelete(id, function (list) {
        that.view.issueList(list);
      });
    },
    assigneeList: function () {
      var that = this;
      
      this.model.assigneeList(function (list) {
        that.view.assigneeListActivate(list);
      });
    },
    backlogList: function () {
      var that = this;
      this.model.backlogList(function (list) {   // active projectId found in session
        that.view.backlogList(list);
      }, function () {                           // active projectId not found
        that.view.projectListRequest();
      });
    },
    backlogSequenceUpdate: function (pub) {
      var that = this;
      this.model.backlogSequenceUpdate(pub);     // no callback
    },
    sprintList: function () {
      var that = this;
      this.model.sprintList(function (data) {   // active projectId found in session
        that.view.sprintList(data);
      }, function () {                           // active projectId not found
        that.view.projectListRequest();
      });
    },
    sprintPlannedUpdate: function (data) {
      this.model.sprintPlannedUpdate(data);     // no callback
    },
    sprintActivate: function () {
      var that = this;
      this.model.sprintActivate(function (data) {
        that.view.sprintList(data);
      });     // no callback
    },
    sprintActiveUpdate: function (data) {
      this.model.sprintActiveUpdate(data);     // no callback
    },
    
    /*** Model-initiated publications subscribers ***/
    
    userLoggedOut: function () {
      this.view.userLoggedOut();
    },
    userMailReadResponse: function (sent) {
      this.view.userMailReadRedraw(sent);
    },
    userMailUpdate: function () {
      this.view.userMailUpdate();
    }
    
    
  };
  Controller.prototype.constructor = Controller;
  
  // attach to window
  window.app = window.app || {};
  window.app.Controller = Controller;
  
}(window));