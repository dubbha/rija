(function (window) {
  'use strict';

  /**
   * Model class
   */
  function Model(storage) {
    this.storage = storage;
    
    // Publications object
    this.pubs = {};
    this.pubs.userLoggedOut = new window.app.Publisher();
    this.pubs.userMailReadResponse = new window.app.Publisher();
    this.pubs.userMailDeleteResponse = new window.app.Publisher();
    this.pubs.userMailUpdate = new window.app.Publisher();
  }
  Model.prototype = {
    userLogin: function (username, password, callback) {
      // Wrap view-level callback in a model-level callback
      var wrappedCallback = function (auth, sessId, username) {
        // model-level
        // store session ID in session storage
        if (auth) {
          sessionStorage.setItem('sessId', sessId);
          sessionStorage.setItem('username', username);
        }

        // view-level callback
        callback(auth);
      };
      this.storage.userLogin(username, password, wrappedCallback);
    },
    userLogout: function (callback) {
      var sessId, wrappedCallback,
        that = this;
      
      sessId = sessionStorage.getItem('sessId');
      
      // Wrap view-level callback in a model-level callback
      wrappedCallback = function () {
        // model-level
        // remove the session ID from session storage
        sessionStorage.removeItem('sessId');
        sessionStorage.removeItem('username');
        
        // issue a userLoggedOut pulication
        that.pubs.userLoggedOut.publish();
        
        // view-level callback
        callback();
      };
      this.storage.userLogout(sessId, wrappedCallback);
    },
    isUserAuthenticated: function (callback) {
      var username;
      if (sessionStorage.getItem('sessId') && sessionStorage.getItem('username')) {
        username = sessionStorage.getItem('username');
        callback(username);
      }
    },
    /**
     * restricted access check, run:
     *   - grantedCallback if access is granted
     *   - deniedCallback if access is denied
     */
    restricted: function (callbackTrue, callbackFalse) {
      if (sessionStorage.getItem('sessId') && sessionStorage.getItem('username')) {
        callbackTrue();
      } else {
        callbackFalse();
      }
    },
    setSession: function (data) {
      sessionStorage.setItem(data.key, data.value);
    },
    userMailCheck: function (callback) {
      var username;
      
      username = sessionStorage.getItem('username');
      if (username) {
        this.storage.userMailCheck(username, callback);
      }
    },
    userMailList: function (callback) {
      var username;
      username = sessionStorage.getItem('username');
      if (username) {
        this.storage.userMailList(username, callback);
      }
    },
    userMailRead: function (sent) {
      var callback,
        that = this;
      
      // Model-level callback to notify the views
      callback = function (sent) {
        that.pubs.userMailReadResponse.publish(sent);
      };
      this.storage.userMailRead(sent, callback);
    },
    userMailDelete: function (sent) {
      var callback,
        that = this;

      // Model-level callback to notify the views
      callback = function (sent) {
        that.pubs.userMailDeleteResponse.publish(sent);
      };
      this.storage.userMailDelete(sent, callback);
    },
    userMailSend: function (mail) {
      var username, callback,
        that = this;
      
      // Get sender from session
      username = sessionStorage.getItem('username');
      mail.sender = username;
      mail.read = false;
      
      // Model-level callback to notify the views
      // Only send if recipient is the current session user (mail sent to himself)
      if (mail.sender === mail.recipient) {
        callback = function () {
          that.pubs.userMailUpdate.publish();
        };
      }
      this.storage.userMailSend(mail, callback);
    },
    projectList: function (callback) {
      this.storage.projectList(callback);
    },
    projectCreate: function (pub, callback) {
      this.storage.projectCreate(pub, callback);
    },
    issueList: function (callback, failureCallback) {
      var projectId;
      
      // Get active project from session
      projectId = parseInt(sessionStorage.getItem('project'), 10);
      
      if (projectId) {
        this.storage.issueList(projectId, callback);
      } else {
        failureCallback();
      }
    },
    issueCreate: function (pub, callback, failureCallback) {
      var projectId;
      
      // Get active project from session
      projectId = parseInt(sessionStorage.getItem('project'), 10);
      
      if (projectId) {
        pub.projectId = projectId;
        this.storage.issueCreate(pub, callback);
      } else {
        failureCallback();
      }
    },
    issueModify: function (pub, callback) {
      var projectId;
      
      // Get active project from session
      projectId = parseInt(sessionStorage.getItem('project'), 10);
      
      if (projectId) {
        pub.projectId = projectId;  //inject
        this.storage.issueModify(pub, callback);
      }
    },
    issueDelete: function (id, callback) {
      this.storage.issueDelete(id, callback);
    },
    assigneeList: function (callback) {
      this.storage.assigneeList(callback);
    },
    backlogList: function (callback, failureCallback) {
      var projectId;
      
      // Get active project from session
      projectId = parseInt(sessionStorage.getItem('project'), 10);
      
      if (projectId) {
        this.storage.backlogList(projectId, callback);
      } else {
        failureCallback();
      }
    },
    backlogSequenceUpdate: function (pub) {
      var projectId;
      
      // Get active project from session
      projectId = parseInt(sessionStorage.getItem('project'), 10);
      
      if (projectId) {
        // pub is an array of issue IDs
        this.storage.backlogSequenceUpdate(projectId, pub);
      }
    },
    sprintList: function (callback, failureCallback) {
      var projectId;
      
      // Get active project from session
      projectId = parseInt(sessionStorage.getItem('project'), 10);
      
      if (projectId) {
        this.storage.sprintList(projectId, callback);
      } else {
        failureCallback();
      }
    },
    sprintPlannedUpdate: function (data) {
      var projectId;
      
      // Get active project from session
      projectId = parseInt(sessionStorage.getItem('project'), 10);

      if (projectId) {
        this.storage.sprintPlannedUpdate(projectId, data);
      }
    },
    sprintActivate: function (callback) {
      var projectId;
      
      // Get active project from session
      projectId = parseInt(sessionStorage.getItem('project'), 10);

      if (projectId) {
        this.storage.sprintActivate(projectId, callback);
      }
    },
    sprintActiveUpdate: function (data) {
      var projectId;
      
      // Get active project from session
      projectId = parseInt(sessionStorage.getItem('project'), 10);

      if (projectId) {
        this.storage.sprintActiveUpdate(projectId, data);
      }
    }
  };
  Model.prototype.constructor = Model;
    
  // attach to window
  window.app = window.app || {};
  window.app.Model = Model;
  
}(window));