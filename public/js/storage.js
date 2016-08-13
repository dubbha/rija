(function (window) {
  'use strict';

  /**
   * Storage class
   *
   * Creates a new client side storage object
   * First time will get the initial data from the 'backend' JSON file
   *
   * @param {string} name The name of the newly created DB, same as the application instance name
   * @param {function} callback Callback function
   */
  function Storage(name, callback) {
    callback = callback || function () {};

    this.dbName = name;
    
    if (!localStorage.getItem(name)) {    // first time, load initial data from the 'backend'
      
      var xhr = new XMLHttpRequest();
      
      //xhr.responseType = 'json';   // parse the response as JSON [not supported by IE]
      
      xhr.open("GET", "backend/backend.json", true);  // make the request async

      // readyState values:
      // 0 - open() method not yet called
      // 1 - open() method called, but send() method not yet called
      // 2 - send() method called, but server reply not yet received
      // 3 - server reply is being received
      // 4 - server reply received completely, request fulfilled successfully
      xhr.onreadystatechange = function () {
        var data;
        if (xhr.readyState === 4) {    // response received
          if (xhr.status === 200) {    // HTTP 200 - OK
            // parse response text from JSON to object
            data = JSON.parse(xhr.responseText);

            // save to DB in a stringified form
            localStorage.setItem(name, JSON.stringify(data));

            // call the callback function, passing the data object
            callback(data);
          }
        }
      };

      xhr.send();

    } else {  // DB already exists
      callback(JSON.parse(localStorage.getItem(name)));
    }
  }
  
  Storage.prototype = {

    userLogin: function (username, password, callback) {
      callback = callback || function () {};
      var dbSnap, users, sessions, auth, i, sessId, updated;
      
      // Hash the password before comparing to DB entries, passwords are stored in a hashed form.
      // Don't forget the .toString() part, CryptoJS returns an object, not a string
      password = window.CryptoJS.SHA256(password).toString();
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      users = dbSnap.users;
      sessions = dbSnap.sessions;

      auth = false;
      for (i = 0; i < users.length; i += 1) {
        if (users[i].username === username) {
          if (users[i].password === password) {
            auth = true;
            break;
          }
        }
      }
      if (auth) { // generate Session ID
        sessId = Math.random().toString().substr(2);
        
        // Store/update the server-side session data
        // Multiple sessions per user are not supported
        updated = false;
        for (i = 0; i < sessions.length; i += 1) {
          if (sessions[i].username === username) {
            sessions[i].sessId = sessId;
            updated = true;
            break;
          }
        }
        if (!updated) { // if session data wasn't there for the user, create it
          sessions.push({ username: username, sessId: sessId });
        }

        // Update the DB itself with the modified snapshot
        localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      }
      callback(auth, sessId, username);
    },
    userLogout: function (sessId, callback) {
      callback = callback || function () {};
      var dbSnap, sessions, i;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      sessions = dbSnap.sessions;
      
      for (i = 0; i < sessions.length; i += 1) {
        if (sessions[i].sessId === sessId) {
          sessions.splice(i, 1);
        }
      }

      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      callback();
    },
    userMailCheck: function (username, callback) {
      callback = callback || function () {};
      var dbSnap, mails, i,
        count = 0;

      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      mails = dbSnap.mails;
      
      for (i = 0; i < mails.length; i += 1) {
        if (mails[i].recipient === username && mails[i].read === false) {   // only count unread mails
          count += 1;
        }
      }
      callback(count);
    },
    userMailList: function (username, callback) {
      callback = callback || function () {};
      var dbSnap, mails, i,
        userMail = [];
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      mails = dbSnap.mails;

      for (i = 0; i < mails.length; i += 1) {
        if (mails[i].recipient === username) {
          userMail.push(mails[i]);
        }
      }
      callback(userMail);
    },
    userMailRead: function (sent, callback) {
      callback = callback || function () {};
      var dbSnap, mails, i;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      mails = dbSnap.mails;

      for (i = 0; i < mails.length; i += 1) {
        if (mails[i].sent === sent) {
          mails[i].read = true;
        }
      }

      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      callback(sent);
    },
    userMailDelete: function (sent, callback) {
      callback = callback || function () {};
      var dbSnap, mails, i;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      mails = dbSnap.mails;

      for (i = 0; i < mails.length; i += 1) {
        if (mails[i].sent === sent) {
          mails.splice(i, 1);
        }
      }
      
      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));

      callback(sent);
    },
    userMailSend: function (mail, callback) {
      callback = callback || function () {};
      var dbSnap, mails, i;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      mails = dbSnap.mails;

      mails.push(mail);
      
      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      callback();
    },
    /**
     * Create a project
     */
    projectCreate: function (data, callback) {
      if (!data || !data.name) {   // mandatory argument
        throw "mandatory argument missing or inconsistent: data";
      }
      callback = callback || function () {};
      var dbSnap, projects, priorities, sprints;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      projects = dbSnap.projects;
      priorities = dbSnap.priorities;
      sprints = dbSnap.sprints;
      
      // Create unique ID
      data.id = this.uniqueId();
      projects.push(data);
      
      // Add to pririoties
      priorities[data.id] = { 'backlog': [],
                              'todo': [],
                              'progress': [],
                              'done': [] };
      
      // Add to sprints
      sprints[data.id] = {};

      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      callback(projects);   // return projects list to callback
    },
    /**
     * Delete a project
     */
    projectDelete: function (projectId, callback) {
      if (!projectId) {   // mandatory argument
        throw "mandatory argument missing: projectId";
      }
      callback = callback || function () {};
      var dbSnap, projects, priorities, i;
      
      // Delete all the srints of the project
      this.sprintDeleteAll(projectId);

      // Delete all the issues of the project
      this.issueDeleteAll(projectId);
          
      // Delete the project itself  
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      projects = dbSnap.projects;
      priorities = dbSnap.priorities;
      
      for (i = 0; i < projects.length; i += 1) {
        if (projects[i].id === projectId) {
          projects.splice(i, 1);
          break;    // no need to go on, deleting unique entry
        }
      }
      
      // Delete from priorities
      delete priorities[projectId];
      
      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      callback();
    },
    /**
     * List all projects
     */
    projectList: function (callback) {
      callback = callback || function () {};
      callback(JSON.parse(localStorage.getItem(this.dbName)).projects);
    },
    /**
     * Delete all sprints of a specific project
     */
    sprintDeleteAll: function (projectId, callback) {
      if (!projectId) {   // mandatory argument
        throw "mandatory argument missing: projectId";
      }
      callback = callback || function () {};
      var dbSnap, sprints, issues, i, j,
        removedSprintIds = [];
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      sprints = dbSnap.sprints;
      issues = dbSnap.issues;
      
      // Go reverse, cause we're deleting multiple items
      for (i = sprints.length - 1; i > -1; i -= 1) {
        if (sprints[i].projectId === projectId) {
          removedSprintIds.push(sprints[i].id);  // save aside to reset issues
          sprints.splice(i, 1);
        }
      }
      
      // Reset the issues currently assigned to this Sprint back to Backlog
      // Do not delete the issues, we're only deleting the sprint
      for (i = 0; i < issues.length; i += 1) {
        if (issues[i].sprintId !== 0) {  // if issue is not in the backlog
          for (j = 0; j < removedSprintIds.length; i += 1) {
            if (issues[i].sprintId === removedSprintIds[j]) {
              issues[i].sprintId = 0;
              break;
            }
          }
        }
      }
      
      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      callback();
    },
    /**
     * Delete all issues of a specific project
     */
    issueDeleteAllByProject: function (projectId, callback) {
      if (!projectId) {
        throw "mandatory argument missing: projectId";
      }
      callback = callback || function () {};
      var dbSnap, issues, i;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      issues = dbSnap.issues;
      
      // Go reverse, cause we're deleting multiple items
      for (i = issues.length - 1; i > -1; i -= 1) {
        if (issues[i].projectId === projectId) {
          issues.splice(i, 1);
        }
      }
      
      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));

      callback();
    },
    /**
     * Delete all issues of a specific sprint
     */
    issueDeleteAllBySprint: function (sprintId, callback) {
      if (!sprintId) {
        throw "mandatory argument missing: sprintId";
      }
      callback = callback || function () {};
      var dbSnap, issues, i;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      issues = dbSnap.issues;
      
      // Go reverse, cause we're deleting multiple items
      for (i = issues.length - 1; i > -1; i -= 1) {
        if (issues[i].sprintId === sprintId) {
          issues.splice(i, 1);
        }
      }
      
      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      callback();
    },
    
    /**
     * Create sprint
     */
    sprintCreate: function (projectId, data, callback) {
      if (!projectId) {
        throw "mandatory argument missing: projectId";
      }
      if (!data || !data.name || !data.start || !data.end) {
        throw "mandatory argument missing or inconsistent: data";
      }
      callback = callback || function () {};
      var dbSnap, sprints;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      sprints = dbSnap.sprints;
      
      data.active = false;  // sprint it created as planned, activated later
      
      sprints[projectId] = data;
      
      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));

      callback();
    },
    /**
     * Modify sprint
     * Used to modify the details of the sprint but not to activate it
     */
    sprintModify: function (projectId, data, callback) {
      if (!projectId) {
        throw "mandatory argument missing: projectId";
      }
      if (!data || !data.name || !data.start || !data.end) {
        throw "mandatory argument missing or inconsistent: data";
      }
      callback = callback || function () {};    // optional argument
      var dbSnap, sprints;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      sprints = dbSnap.sprints;
      
      // Stay with the current active status
      // Sprint activation is a separate task with possible additional checks
      data.active = sprints[projectId].active;
      
      sprints[projectId] = data;
      
      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));

      callback();
    },
    /**
     * Finish the sprint
     */
    sprintFinish: function (projectId, callback) {
      if (!projectId) {
        throw "mandatory argument missing: projectId";
      }
      callback = callback || function () {};
      var dbSnap, sprints, priorities, issues, i, j;

      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      sprints = dbSnap.sprints;
      priorities = dbSnap.priorities;
      issues = dbSnap.issues;

      // Delete the sprint entry
      delete sprints[projectId];

      // Clear the Done
      for (i = 0; i < priorities[projectId].done.length; i += 1) {  // get the done ID
        for (j = 0; j < issues.length; j += 1) {    // find the issue, remove it
          if (issues[j].id === priorities[projectId].done[i]) {
            issues.splice(j, 1);
            break;  // unique
          }
        }
      }
      priorities[projectId].done = [];  // clear the done in priorities
      
      // Move issues left undone to the top of the backlog
      for (i = 0; i < priorities[projectId].todo.length; i += 1) {
        priorities[projectId].backlog.unshift(priorities[projectId].todo[i]);
      }
      for (i = 0; i < priorities[projectId].progress.length; i += 1) {
        priorities[projectId].backlog.unshift(priorities[projectId].progress[i]);
      }
      
      // Update the DB itself with the modified snapshot
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));

      // run the sync
      this.issueReindex(projectId);

      callback();
    },
    /**
     * Create issue
     * data.projectId must already contain the project id
     */
    issueCreate: function (data, callback) {
      if (!data || !data.projectId || !data.summary) {
        throw "mandatory argument missing or inconsistent: data";
      }
      callback = callback || function () {};
      data.type = data.type || 'story';           // optional: story, bug, task
      data.description = data.description || '';
      data.assignee = data.assignee || '';
      var dbSnap, issues, priorities, i, filtered;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      issues = dbSnap.issues;
      priorities = dbSnap.priorities;
      
      data.id = this.uniqueId();
      issues.push(data);
      
      priorities[data.projectId].backlog.push(data.id);
      
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      // return filtered list
      filtered = [];
      
      for (i = 0; i < issues.length; i += 1) {
        if (issues[i].projectId === data.projectId) {
          filtered.push(issues[i]);
        }
      }

      callback(filtered);
    },
    /**
     * Modify issue
     */
    issueModify: function (data, callback) {
      if (!data || !data.projectId || !data.id || !data.summary) {
        throw "mandatory argument missing or inconsistent: data";
      }
      callback = callback || function () {};
      data.type = data.type || 'story';       // optional: story, bug
      data.description = data.description || '';
      var dbSnap, issues, filtered, i;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      issues = dbSnap.issues;

      for (i = 0; i < issues.length; i += 1) {
        if (issues[i].id === data.id) {
          issues[i] = data;
        }
      }

      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      // return filtered list to the callback
      filtered = [];
      
      for (i = 0; i < issues.length; i += 1) {
        if (issues[i].projectId === data.projectId) {
          filtered.push(issues[i]);
        }
      }
      
      callback(filtered);
    },
    /**
     * Delete issue
     */
    issueDelete: function (issueId, callback) {
      if (!issueId) {
        throw "mandatory argument missing or inconsistent: issueId";
      }
      callback = callback || function () {};
      var dbSnap, issues, projectId, priorities, filtered, i, p;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      issues = dbSnap.issues;
      priorities = dbSnap.priorities;
      
      // Delete the issue itself
      for (i = 0; i < issues.length; i += 1) {
        if (issues[i].id === issueId) {
          projectId = issues[i].projectId;   // save projectId aside
          issues.splice(i, 1);
          break;  // unique
        }
      }
      
      // Delete from priorities
outer:
      for (p in priorities[projectId]) {
        if (priorities[projectId].hasOwnProperty(p)) {
          for (i = 0; i < priorities[projectId][p].length; i += 1) {
            if (priorities[projectId][p][i] === issueId) {
              priorities[projectId][p].splice(i, 1);
              break outer;
            }
          }
        }
      }
      
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));

      // return filtered issue list to the callback
      filtered = [];

      for (i = 0; i < issues.length; i += 1) {
        if (issues[i].projectId === projectId) {
          filtered.push(issues[i]);
        }
      }

      callback(filtered);
    },
    /**
     * List issues
     */
    issueList: function (projectId, callback) {
      if (!projectId) {
        throw "mandatory argument(s) missing";
      }
      callback = callback || function () {};
      var dbSnap, issues, filtered, i;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      issues = dbSnap.issues;
      
      filtered = [];
      
      for (i = 0; i < issues.length; i += 1) {
        if (issues[i].projectId === projectId) {
          filtered.push(issues[i]);
        }
      }

      callback(filtered);
    },
    assigneeList: function (callback) {
      callback = callback || function () {};
      var dbSnap, users, i;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      users = dbSnap.users;

      callback(users);
    },
    /**
     * When issue is moved within the same sprint/backlog list
     * only update the priorities of the specific list
     *
     * Priorities collection in the DB has the following structure:
     *
     *  "priorities": {
     *    "projectId1": {
     *         "backlog":   [issueId, issueId, ...],    // backlog of project1
     *         "todo":      [issueId, issueId, ...],    // planned sprint/active todo of project1
     *         "progress":  [issueId, issueId, ...],    // active sprint in progress of project1
     *         "done":      [issueId, issueId, ...],    // active sprint done of project1
     *    },
     *    "projectId2": {
     *         "backlog":   [issueId, issueId, ...],    // backlog of project2
     *         "todo":      [issueId, issueId, ...],    // planned sprint/active todo of project2
     *         "progress":  [issueId, issueId, ...],    // active sprint in progress of project2
     *         "done":      [issueId, issueId, ...],    // active sprint done of project2
     *    },
     *
     */
    issueUpdatePriorities: function (projectId, data, callback) {
      if (!projectId || !data) {
        throw "mandatory argument(s) missing";
      }
      callback = callback || function () {};
      var dbSnap, priorities, key;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      priorities = dbSnap.priorities;
      
      for (key in data) {   // each key is the list (backlog/sprint ID)
        if (data.hasOwnProperty(key)) {
          priorities[projectId][key] = data[key];   // assign an array as a value
        }
      }
      
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      callback();
    },
    /**
     * When priorities change we need to reorder the issues collection to sync the issues output order
     * This can be done on every change or become a scheduled procedure, depending on the database size and load
     * Only run this for a specific projectId, since it is readily available on any priority change
     * Indexed issues are moved to the beginning of the issues array
     */
    issueReindex: function (projectId) {
      if (!projectId) {
        throw "mandatory argument(s) missing";
      }
      var dbSnap, priorities, issues, p, i, j,
        arr = [];
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      priorities = dbSnap.priorities;
      issues = dbSnap.issues;
      
      for (p in priorities[projectId]) {
        if (priorities[projectId].hasOwnProperty(p)) {
          for (i = 0; i < priorities[projectId][p].length; i += 1) {
            for (j = 0; j < issues.length; j += 1) {  // IDs are unique, no need to go reverese
              if (issues[j].id === priorities[projectId][p][i]) {
                arr.push(issues.splice(j, 1)[0]);
                break;  // IDs are unique
              }
            }
          }
        }
      }

      dbSnap.issues = arr.concat(issues);
      
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
    },
    backlogList: function (projectId, callback) {
      if (!projectId) {
        throw "mandatory argument(s) missing";
      }
      callback = callback || function () {};
      var dbSnap, issues, priorities, filtered, i, j;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      issues = dbSnap.issues;
      priorities = dbSnap.priorities;
      
      filtered = [];
      
      for (i = 0; i < priorities[projectId].backlog.length; i += 1) {  // get issue id from project backlog
        for (j = 0; j < issues.length; j += 1) { // find the issue in the issues
          if (issues[j].id === priorities[projectId].backlog[i]) {
            filtered.push(issues[j]);
          }
        }
      }
      callback(filtered);
    },
    backlogSequenceUpdate: function (projectId, arr) {
      if (!projectId || !arr) {
        throw "mandatory argument(s) missing";
      }
      var dbSnap, priorities;
      
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      priorities = dbSnap.priorities;
      
      priorities[projectId].backlog = arr;
      
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      // run the sync
      this.issueReindex(projectId);
    },
    sprintList: function (projectId, callback) {
      if (!projectId) {
        throw "mandatory argument(s) missing";
      }
      callback = callback || function () {};
      var dbSnap, issues, priorities, sprints, filtered, i;

      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      issues = dbSnap.issues;
      priorities = dbSnap.priorities;
      sprints = dbSnap.sprints;
      
      // Filtered data object
      // Return both, priorities and issues
      filtered = {};
      filtered.sprint = sprints[projectId];
      filtered.priorities = priorities[projectId];
      filtered.issues = [];

      for (i = 0; i < issues.length; i += 1) {
        if (issues[i].projectId === projectId) {
          filtered.issues.push(issues[i]);
        }
      }
      callback(filtered);
    },
    sprintPlannedUpdate: function (projectId, data) {
      if (!projectId) {
        throw "mandatory argument(s) missing";
      }
      var dbSnap, priorities, sprints;
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      priorities = dbSnap.priorities;
      sprints = dbSnap.sprints;
  
      priorities[projectId].todo = data.todo;
      priorities[projectId].backlog = data.backlog;
      
      // Add inactive sprint with no data but active=false
      sprints[projectId] = {active: false};
      
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      // run the sync
      this.issueReindex(projectId);
    },
    sprintActivate: function (projectId, callback) {
      if (!projectId) {
        throw "mandatory argument(s) missing";
      }
      callback = callback || function () {};
      var dbSnap, issues, priorities, sprints, filtered, i;

      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      issues = dbSnap.issues;
      priorities = dbSnap.priorities;
      sprints = dbSnap.sprints;
      
      // Activate
      sprints[projectId] = {active: true};
      
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      // Return filtered data object to the view
      filtered = {};
      filtered.sprint = sprints[projectId];
      filtered.priorities = priorities[projectId];
      filtered.issues = [];

      for (i = 0; i < issues.length; i += 1) {
        if (issues[i].projectId === projectId) {
          filtered.issues.push(issues[i]);
        }
      }
      callback(filtered);
    },
    sprintActiveUpdate: function (projectId, data) {
      if (!projectId || !data) {
        throw "mandatory argument(s) missing";
      }
      var dbSnap, priorities, sprints;
      dbSnap = JSON.parse(localStorage.getItem(this.dbName));
      priorities = dbSnap.priorities;
  
      priorities[projectId].todo = data.todo;
      priorities[projectId].progress = data.progress;
      priorities[projectId].done = data.done;
      
      localStorage.setItem(this.dbName, JSON.stringify(dbSnap));
      
      // run the sync
      this.issueReindex(projectId);
    },
    
    /*** Helpers ***/

    /**
     * Unique ID generator
     */
    uniqueId: function () {
      var date, epochPart, randPart, idStr, id;

      date = new Date();
      
      epochPart = date.getTime().toString();            // epoch millis string
      randPart = Math.random().toString().substr(2, 3);  // plus 3 random digits string
      
      idStr = epochPart + randPart;   // concatenate strings > string
      id = parseInt(idStr, 10);           // parse int > number

      return id;
    }
  };
  Storage.prototype.constructor = Storage;

  // Export to window
  window.app = window.app || {};
  window.app.Storage = Storage;

}(window));
