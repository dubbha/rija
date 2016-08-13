(function (window) {
  'use strict';
  function View(template, dnd) {
    this.template = template;
    this.dnd = dnd;
    
    this.containerPrefix = 'js-app-render-';
    this.mainContainer = 'main';
    
    // Registered timeout/interval handlers
    this.timeouts = [];
    this.intervals = [];
    
    // Publications object
    this.pubs = {};
    this.pubs.userLoginRequest = new window.app.Publisher();
    this.pubs.userLogoutRequest = new window.app.Publisher();
    this.pubs.isUserAuthenticatedRequest = new window.app.Publisher();
    this.pubs.redirect = new window.app.Publisher();
    this.pubs.restricted = new window.app.Publisher();
    this.pubs.userMailCheckRequest = new window.app.Publisher();
    this.pubs.userMailListRequest = new window.app.Publisher();
    this.pubs.userMailRead = new window.app.Publisher();
    this.pubs.userMailRead = new window.app.Publisher();
    this.pubs.userMailDelete = new window.app.Publisher();
    this.pubs.userMailSend = new window.app.Publisher();
    this.pubs.projectListRequest = new window.app.Publisher();
    this.pubs.projectCreate = new window.app.Publisher();
    this.pubs.setSession = new window.app.Publisher();
    this.pubs.issueListRequest = new window.app.Publisher();
    this.pubs.issueCreate = new window.app.Publisher();
    this.pubs.issueModify = new window.app.Publisher();
    this.pubs.issueDelete = new window.app.Publisher();
    this.pubs.assigneeList = new window.app.Publisher();
    this.pubs.backlogListRequest = new window.app.Publisher();
    this.pubs.backlogSequenceUpdate = new window.app.Publisher();
    this.pubs.sprintListRequest = new window.app.Publisher();
    this.pubs.sprintPlannedUpdate = new window.app.Publisher();
    this.pubs.sprintActivate = new window.app.Publisher();
    this.pubs.sprintActiveUpdate = new window.app.Publisher();
  }
  View.prototype = {
    output: function (content, container) {
      container = container || this.mainContainer;   // default container, the outmost one
      document.getElementById(this.containerPrefix + container).innerHTML = content;
    },
    /**
     * Restricted zone access
     */
    resticted: function (methodName) {
      var pub, args,
        that = this;

      args = Array.prototype.splice.call(arguments, 1);
      
      pub = {};
      pub.grantedCallback = function () { that[methodName].apply(that, args); };   // callback to call if access granted
      pub.deniedCallback = function () { that.userLoginForm.apply(that, args); };  // callback to call if access denied
      
      this.pubs.restricted.publish(pub);
    },
    userLoginForm: function (message, messageType) {
      message = message || '';
      
      var data, form,
        that = this,
        content = '',
        containerName = 'section';
      
      if (message) {  // if message passed to be fired (e.g. authentication failed from the previous attempt)
        data = {};
        data.message = message;
        data.messageType = messageType;
        content = this.template.parse(this.template.message, data);
        this.ensureParent('message');
        this.output(content, 'message');
      }

      // User login form
      content = this.template.parse(this.template.userLoginForm);
      this.ensureParent('section');
      this.output(content, 'section');
      
      // Check if user athenticated
      this.pubs.isUserAuthenticatedRequest.publish();
      
      if (message) {  // trigger hiding the message box
        setTimeout(function () {
          document.getElementById(that.containerPrefix + 'message-box').classList.add('message-hide');
          setTimeout(function () {
            document.getElementById(that.containerPrefix + 'message-box').style.display = 'none';
          }, 3000);
        }, 0);
      }
      
      form = document.forms.userLoginForm;
      
      form.addEventListener('submit', function (e) {
        var username, password, pub;

        e.preventDefault();   // do not actually post the form

        username = form.elements.username.value;
        password = form.elements.password.value;
        
        // Combined publication object,
        // since we need to pass more than one param
        pub = {};
        pub.username = username;
        pub.password = password;
        
        that.pubs.userLoginRequest.publish(pub);
      });
    },
    userLogin: function (auth) {
      var message, messageType,
        that = this;
      if (auth) {
        this.pubs.redirect.publish('/');
        this.pubs.isUserAuthenticatedRequest.publish();
      } else {
        this.userLoginForm('Authentication Failed', 'error');
      }
    },
    authUserRedraw: function (username) {  // if user is authenticated - redraw the authUserBox
      var data, authUserBox, menuLoginLink;
      
      if (username) {
        data = {
          'containerPrefix': this.containerPrefix,
          'username': username
        };
        
        // Redraw the authUserBox
        authUserBox = document.getElementById(this.containerPrefix + 'auth-user-box');
        authUserBox.innerHTML = this.template.parse(this.template.authUserBox, data);
        
        // Redraw the main menu login link
        menuLoginLink = document.getElementById(this.containerPrefix + 'menu-login-nav');
        menuLoginLink.href = "#user/logout";
        menuLoginLink.innerHTML = "log out";
        
        // Check for mail
        this.pubs.userMailCheckRequest.publish();
      }
    },
    authUserMailRedraw: function (count) {
      var data, authUserMailBox;
      
      authUserMailBox = document.getElementById(this.containerPrefix + 'auth-user-mail-box');
      
      if (count > 0) {
        data = {
          'containerPrefix': this.containerPrefix,
          'count': count
        };

        // Redraw the authUserMailBox
        authUserMailBox.innerHTML = this.template.parse(this.template.authUserMailBox, data);
      } else {
        authUserMailBox.innerHTML = '';
      }
    },
    userLogoutRequest: function (auth, sessId, username) {
      var that = this;
      that.pubs.userLogoutRequest.publish();
    },
    userLoggedOut: function () {  // model confirmed user logged out - redraw views
      var containerName, menuLoginLink;
      
      // Empty the auth user box
      containerName = 'auth-user-box';
      if (this.checkContainer(containerName)) {    // if container is currently enabled,
        this.output('', containerName);            // empty it
      }
      
      // Redraw the main menu login link
      containerName = 'menu-login-nav';
      if (this.checkContainer(containerName)) {    // if element is currently avialable
        menuLoginLink = document.getElementById(this.containerPrefix + 'menu-login-nav');
        menuLoginLink.href = "#user/login";
        menuLoginLink.innerHTML = "log in";
      }
    },
    userMailListRequest: function () {
      this.pubs.userMailListRequest.publish();
    },
    userMailList: function (userMail) {
      var sentSortFunc, sentHumanFunc, outputArr, outputObj, content, data, i,
        mailView, mailList, mailListBody,
        that = this,
        readMail = [],
        unreadMail = [],
        containerName = 'section';
  
      if (userMail) {
        // Implementing unread first, sorted by sent
        // Split to two groups
        for (i = 0; i < userMail.length; i += 1) {
          if (userMail[i].read) {  // boolean
            readMail.push(userMail[i]);
          } else {
            unreadMail.push(userMail[i]);
          }
        }
        // Sort each group by sent
        sentSortFunc = function (a, b) {
          return b.sent - a.sent;
        };
        unreadMail.sort(sentSortFunc);
        readMail.sort(sentSortFunc);
        
        // parse human-readable date time [DD/MM/YYYY hh:mm] from epoch date
        sentHumanFunc = function (sentEpoch) {
          var dateObj = new Date(sentEpoch);
          return ("0" + dateObj.getDate()).substr(-2)
            + '/' + ("0" + dateObj.getMonth()).substr(-2)
            + '/' + dateObj.getFullYear()
            + ' ' + ("0" + dateObj.getHours()).substr(-2)
            + ':' + ("0" + dateObj.getMinutes()).substr(-2);
        };

        // Prepare both groups for output
        outputArr = [];
        for (i = 0; i < unreadMail.length; i += 1) {
          outputObj = unreadMail[i];
          outputObj.sentHuman = sentHumanFunc(outputObj.sent);
          outputObj.addClass = ' highlight';    // highlight unread mail, add the string to classes
          outputObj.unread = '_unread';         // suffix for the read/unread image
          outputArr.push(outputObj);
        }
        for (i = 0; i < readMail.length; i += 1) {
          outputObj = readMail[i];
          outputObj.sentHuman = sentHumanFunc(outputObj.sent);
          outputObj.addClass = '';
          outputObj.unread = '';
          outputArr.push(outputObj);
        }
        
        // prepare the output
        data = {containerPrefix: this.containerPrefix};
        content = this.template.parse(this.template.userMailListHeader, data);
        for (i = 0; i < outputArr.length; i += 1) {
          content += this.template.parse(this.template.userMailListLine, outputArr[i]);
        }
        content += this.template.parse(this.template.userMailListFooter, data);
        
        this.ensureParent(containerName);
        this.output(content, containerName);
        
        // Add event listener
        mailView = document.getElementById(this.containerPrefix + 'user-mail-view');
        mailList = document.getElementById(this.containerPrefix + 'user-mail-list');
        mailListBody = document.getElementById(this.containerPrefix + 'user-mail-list-body');
        
        mailListBody.addEventListener('click', function (e) {
          var target, sent, mail, i, bodyParser;
          
          bodyParser = function (body) {
            var i, paragraphs,
              result = '';
              
            // remove \n\n duplicates
            body = body.replace(/\\n\\n/g, '\n');
            // replace \r\n with single \n
            body = body.replace(/\\r\\n/g, '\n');
            body = body.replace(/\\r\\n/g, '\n');
            // split to paragraphs by \n
            paragraphs = body.split('\n');
            
            for (i = 0; i < paragraphs.length; i += 1) {
              result += '<p class="mail-view-paragraph">' + paragraphs[i] + '</p>';
            }
            return result;
          };
          
          // Open Mail View on the first time
          if (!mailView.classList.contains('open')) {
            mailView.classList.add('open');
            mailList.classList.remove('col-12');
            mailList.classList.add('col-7');
          }
          
          // bubble up to row level
          target = e.target;
          while (!target.classList.contains('user-mail-row')) {
            target = target.parentElement;
          }
          
          sent = parseInt(target.getAttribute('data-mail-sent'), 10);

          for (i = 0; i < userMail.length; i += 1) {
            if (userMail[i].sent === sent) {
              mail = userMail[i];
              break;
            }
          }
          
          if (mail) {
            
            data = {};
            data.sentHuman = sentHumanFunc(mail.sent);
            data.sender = mail.sender;
            data.subject = mail.subject;
            data.body = bodyParser(mail.body);
            
            content = that.template.parse(that.template.userMailView, data);
            
            that.output(content, 'user-mail-view');

            if (mail.read === false) {     // mail read for the first time
              that.pubs.userMailRead.publish(mail.sent);   // update model
            }
            
            // add event listeners
            document.getElementById('mail-view-delete-icon').addEventListener('click', function () {
              that.modalConfirm('Are you sure you want to delete the message?',
                function () {
                  that.pubs.userMailDelete.publish(mail.sent);
                });
            });
            document.getElementById('mail-view-reply-icon').addEventListener('click', function () {
              document.getElementById('mail-view-reply').classList.toggle('open');
            });
            document.getElementById('mail-view-reply-button').addEventListener('click', function () {
              var mailView, mailList,
                data = {},
                rePrefix = 'Re: ';
              
              // Subject
              if (mail.subject.substr(0, 4) === rePrefix) {
                data.subject = mail.subject;
              } else {
                data.subject = rePrefix + mail.subject;
              }
              
              data.body = document.getElementById('mail-view-reply-text').value;
              data.recipient = mail.sender;    // sender will be filled by model from session
              data.sent = new Date().getTime();
              
              // Close the message
              mailView = document.getElementById(that.containerPrefix + 'user-mail-view');
              mailList = document.getElementById(that.containerPrefix + 'user-mail-list');
              
              mailView.classList.remove('open');
              mailList.classList.remove('col-7');
              mailList.classList.add('col-12');

              // Send the reply
              that.pubs.userMailSend.publish(data);
            });
          }
        });
      }
    },
    userMailReadRedraw: function (sent) {
      var mailListBodyRows, sentAttr, img, count, countElem, i;
      
      // Redraw the currently open list
      mailListBodyRows = document.getElementById(this.containerPrefix + 'user-mail-list-body').children;
      for (i = 0; i < mailListBodyRows.length; i += 1) {
        if (parseInt(mailListBodyRows[i].getAttribute('data-mail-sent'), 10) === sent) {
          mailListBodyRows[i].classList.remove('highlight');
          
          // change the envelope image
          img = mailListBodyRows[i].querySelector('img');
          img.src = 'img/email_env.png';

          break;
        }
      }
      
      // Redraw the Mail List and the authUserCounter
      this.pubs.userMailCheckRequest.publish();
    },
    userMailDeleteRedraw: function (sent) {
      var mailListBody, mailListBodyRows, mailView, mailList, sentAttr, img, count, countElem, i;
      
      // Redraw the currently open list
      mailListBody = document.getElementById(this.containerPrefix + 'user-mail-list-body');
      if (mailListBody) {
        mailListBodyRows = mailListBody.children;
        for (i = 0; i < mailListBodyRows.length; i += 1) {
          if (parseInt(mailListBodyRows[i].getAttribute('data-mail-sent'), 10) === sent) {
            mailListBody.removeChild(mailListBodyRows[i]);
            break;
          }
        }
      }
      
      // close the mail view
      mailView = document.getElementById(this.containerPrefix + 'user-mail-view');
      mailList = document.getElementById(this.containerPrefix + 'user-mail-list');

      // Close Mail View on the first time
      if (mailView.classList.contains('open')) {
        mailView.classList.remove('open');
        mailList.classList.remove('col-7');
        mailList.classList.add('col-12');
      }
    },
    /**
     * Send mail to a specific recipient
     */
    userMailTo: function (recipient) {
      var data, button, content,
        templateName = 'userMailTo',
        containerName = 'section',
        that = this;
      
      this.ensureParent(containerName);
      
      data = {};
      data.recipient = recipient;
      
      content = this.template.parse(this.template[templateName], data);
      this.output(content, containerName);

      button = document.getElementById('mail-to-button');
      button.addEventListener('click', function () {
        
        data.sent = new Date().getTime();
        data.subject = document.getElementById('mail-to-subj').value;
        data.body = document.getElementById('mail-to-body').value;
        
        that.pubs.userMailSend.publish(data);
        window.history.back();
      });
        
  
    },
    index: function () {
      var content, data, i,
        sliderId, slides, count, sliderIntervalSecs, slidesPath, intervalHandler,
        templateName = 'index',
        containerName = 'section',
        that = this;

      this.ensureParent(containerName);
      
      data = { containerPrefix: this.containerPrefix };
      content = this.template.parse(this.template[templateName], data);

      this.output(content, containerName);
      
      /* Slider */
      sliderId = this.containerPrefix + 'slider';
      sliderIntervalSecs = 10;
      slidesPath = 'img/slider/';

      slides = [];
      slides.push('0.jpg');
      slides.push('1.jpg');
      slides.push('2.jpg');
      
      // requestAnimationFrame polyfill
      window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function (callback) {
            window.setTimeout(callback, 1000 / 60);
          };
      }());
  
      // Date.now() polyfill
      if (!Date.now) {
        Date.now = function now() {
          return new Date().getTime();
        };
      }
      
      // Preload images
      for (i = 0; i < slides.length; i += 1) {
        [].src = slides[i];
      }
      
      for (i = 0; i < slides.length; i += 1) {
        document.getElementById(sliderId).innerHTML +=
          '<img src="' + slidesPath + slides[i] + '" id="slide' + i + '" class="slider-slide">';
        if (i > 0) {
          document.getElementById('slide' + i).style.top = '100%';
        }
      }

      function slider() {
        var prev, curr, next, step,
          start = null;
        
        // Re-check slider container is still available
        if (document.getElementById(sliderId)) {
          prev = (i - 1) % count > 0 ? (i - 1) % count : (i - 1 + count) % count;
          curr = i % count;
          next = (i + 1) % count;
          i += 1;

          step = function () {
            var timestamp, progress;

            timestamp = Date.now();
            if (!start) {
              start = timestamp;
            }
            progress = timestamp - start;

            document.getElementById('slide' + curr).style.top = (-Math.min(progress / 10, 100)) + "%";
            document.getElementById('slide' + next).style.top = (100 - Math.min(progress / 10, 100)) + "%";

            if (progress < 1000) {
              window.requestAnimFrame(step);
            } else {
              document.getElementById('slide' + prev).style.top = '100%';  // move down
            }
          };
          window.requestAnimFrame(step);

        } else {  // destroy
          that.unregInterval(intervalHandler);   // unregister the interval handler
          window.clearInterval(intervalHandler);
        }
      }
      
      i = 0;
      count = slides.length;
      
      this.flushIntervals();  // clear currently registered setTimeout handlers
      intervalHandler = setInterval(slider, sliderIntervalSecs * 1000);
      this.regInterval(intervalHandler);   // register the interval handler
    },
    userMailUpdate: function () { // generic notification from model - mail changed for the current user
      // Redraw authUserMail count
      this.pubs.userMailCheckRequest.publish();
      
      // Redraw Mail List
      this.pubs.userMailListRequest.publish();
    },
    plan: function () {
      var content, data,
        templateName = 'plan',
        containerName = 'section';

      this.ensureParent(containerName);
      
      data = { containerPrefix: this.containerPrefix };
      content = this.template.parse(this.template[templateName], data);

      this.output(content, containerName);
    },
    manual: function () {
      var content, data,
        templateName = 'manual',
        containerName = 'section';

      this.ensureParent(containerName);
      
      data = { containerPrefix: this.containerPrefix };
      content = this.template.parse(this.template[templateName], data);

      this.output(content, containerName);
    },
    faq: function () {
      var content, data,
        templateName = 'faq',
        containerName = 'section';

      this.ensureParent(containerName);
      
      data = { containerPrefix: this.containerPrefix };
      content = this.template.parse(this.template[templateName], data);

      this.output(content, containerName);
    },
    contact: function () {
      var content, data, script,
        templateName = 'contact',
        containerName = 'section',
        mapId = this.containerPrefix + 'map';   // pass to inner function

      this.ensureParent(containerName);
      
      data = { containerPrefix: this.containerPrefix };
      content = this.template.parse(this.template[templateName], data);

      this.output(content, containerName);
      
      script = '//maps.googleapis.com/maps/api/js?key=AIzaSyDjONPrzxfKE63s46Q2BW0RGyG2J-e2CYU';

      this.addScriptToHead(script, function () {    // load the script and fire the callback when loaded
        
        var location, mapOptions, map, markerOptions, marker,
          mapTarget = document.getElementById(mapId);

        // Map
        location = {
          lat: 32.075278,
          lng: 48.873889
        };

        mapOptions = {
          center: location,
          zoom: 17,
          mapTypeId: window.google.maps.MapTypeId.SATELLITE
        };

        map = new window.google.maps.Map(mapTarget, mapOptions);

        // Marker
        markerOptions = {
          position: location,
          label: 'R',
          map: map
        };

        marker = new window.google.maps.Marker(markerOptions);

      });
    },
    youtube: function () {

      var content, data, script,
        that = this,
        templateName = 'youtube',
        containerName = 'section';

      this.ensureParent(containerName);
      
      data = { containerPrefix: this.containerPrefix };
      content = this.template.parse(this.template[templateName], data);

      this.output(content, containerName);

      script = '//www.youtube.com/iframe_api';

      this.addScriptToHead(script, function () {    // load the script and fire the callback when loaded
        var done, player;
        
        function onYouTubeIframeAPIReady() {
          player = new window.YT.Player('player', {
            height: '390',
            width: '640',
            videoId: 'Q6jMgmPIxmk',
            events: {
              'onReady': window.onPlayerReady,
              'onStateChange': window.onPlayerStateChange
            }
          });
        }
        function onPlayerReady(event) {
          //event.target.playVideo();
        }
        done = false;
        function onPlayerStateChange(event) {
          //if (event.data == YT.PlayerState.PLAYING && !done) {
          //  setTimeout(stopVideo, 6000);
          //  done = true;
          //}
          //}
        }
        function stopVideo() {
          player.stopVideo();
        }
        
        // Make functions global
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        window.onPlayerReady = onPlayerReady;
        window.onPlayerStateChange = onPlayerStateChange;
        window.stopVideo = stopVideo;
        
        if (window.YT) {
          if (window.YT.Player) { // script already been loaded before, APIReady will not fire again, fire manually
            window.onYouTubeIframeAPIReady();
          }
        }
      });
    },
    notFound: function () {
      this.ensureParent('section');
      var content = '404: Page Not Found. Go <a href="#">Home</a>!';
      this.output(content, 'section');
    },
    section: function () {
      // section is an integral part of the main template
      // you normally don't need to init the section on it's own
      // the only situation when this method is fired is when a section child is missing a parent
      // so, basically, we need to init the whole main view
      this.main();
    },
    message: function () {
      // section is an integral part of the main template
      // you normally don't need to init the section on it's own
      // the only situation when this method is fired is when a section child is missing a parent
      // so, basically, we need to init the whole main view
      this.main();
    },
    main: function () {  // main view, top level
      var content, data, menuNavs, menu, subId, itemId, sub, item,
        menuWidth, itemWidth, itemOffsetLeft, itemOffsetRight, i,
        accumWidth = 0;
      
      // Main structure
      data = { containerPrefix: this.containerPrefix };
      content = this.template.parse(this.template.main, data);
      this.output(content);
      
      // Header
      content = this.template.parse(this.template.header, data);
      this.output(content, 'header');
      
      // Menu
      content = this.template.parse(this.template.menu, data);
      this.output(content, 'menu');
      
      // Modify each submenu positioning based on calculated width of the main menu
      menu = document.getElementById(this.containerPrefix + 'menu'); // main menu
      
      // Count menu width without using getComputedStyle().width not supported by IE even with polyfill
      // Go over the Menu navigation items (main links), accumulate width (right-to-left),
      // and move subs accordignly
      menuNavs = menu.querySelectorAll('a[id$="-nav"]');
      for (i = 0; i < menuNavs.length; i += 1) {
        if (i > 0) {  // no need to move subs for the rightmost element
          subId = menuNavs[i].id.substr(0, menuNavs[i].id.length - '-nav'.length) + '-sub';
          sub = document.getElementById(subId);
          if (sub) {  // if exists
            sub.style.right = -(accumWidth) + 'px';
          }
        }
        // accumulate width
        accumWidth += menuNavs[i].offsetWidth;
      }

      // Send the request to controller to check if user is authenticated,
      // will run authUserBoxRedraw as callback, to redraw the authUserBox
      this.pubs.isUserAuthenticatedRequest.publish();
    },
    /**
     * Request project list
     */
    projectListRequest: function () {
      this.pubs.projectListRequest.publish();
    },
    projectCreate: function () {
      var content, data, form, i,
        outputArr, outputObj,
        templateName = 'projectCreate',
        containerName = 'section',
        that = this;

      this.ensureParent(containerName);
      
      data = { containerPrefix: this.containerPrefix };
      content = this.template.parse(this.template[templateName], data);

      this.output(content, containerName);

      form = document.forms.projectCreateForm;

      form.addEventListener('submit', function (e) {
        var name, description, pub;

        e.preventDefault();   // do not actually post the form

        name = form.elements.name.value;
        description = form.elements.description.value;

        // Combined publication object,
        // since we need to pass more than one param
        pub = {};
        pub.name = name;
        pub.description = description;

        that.pubs.projectCreate.publish(pub);
      });
    },
    /**
     * Draw a project list based on the data returned from the request
     */
    projectList: function (list) {
      var content, data, templateName, form, i,
        view, listBody, button,
        outputArr, outputObj,
        containerName = 'section',
        that = this;

      if (list.length === 0) {

        templateName = 'projectCreate';
        
        this.ensureParent(containerName);
      
        data = { containerPrefix: this.containerPrefix };
        content = this.template.parse(this.template[templateName], data);

        this.output(content, containerName);
        
        form = document.forms.projectCreateForm;
      
        form.addEventListener('submit', function (e) {
          var name, description, pub;

          e.preventDefault();   // do not actually post the form

          name = form.elements.name.value;
          description = form.elements.description.value;

          // Combined publication object,
          // since we need to pass more than one param
          pub = {};
          pub.name = name;
          pub.description = description;

          that.pubs.projectCreate.publish(pub);
        });
        
      } else {  // list projects
        if (list) {
          
          // Prepare for output
          outputArr = [];
          for (i = 0; i < list.length; i += 1) {
            outputObj = list[i];
            outputObj.id = list[i].id;
            outputObj.name = list[i].name;
            outputObj.description = list[i].description;
            outputArr.push(outputObj);
          }

          // prepare the output
          data = {containerPrefix: this.containerPrefix};
          content = this.template.parse(this.template.projectListHeader, data);
          for (i = 0; i < outputArr.length; i += 1) {
            content += this.template.parse(this.template.projectListLine, outputArr[i]);
          }
          content += this.template.parse(this.template.projectListFooter, data);

          this.ensureParent(containerName);
          this.output(content, containerName);

          // Add event listener
          view = document.getElementById(this.containerPrefix + 'project-list-view');
          list = document.getElementById(this.containerPrefix + 'project-list');
          listBody = document.getElementById(this.containerPrefix + 'project-list-body');
          button = document.getElementById(this.containerPrefix + 'project-create-button');

          listBody.addEventListener('click', function (e) {
            var target, id, pub;
              
            // bubble up to row level
            target = e.target;
            while (!target.classList.contains('project-list-row')) {
              target = target.parentElement;
            }

            id = parseInt(target.getAttribute('data-project-id'), 10);

            
            templateName = 'issueView';

            
            // Save to session as active project
            pub = {};
            pub.key = 'project';
            pub.value = id;
            that.pubs.setSession.publish(pub);
            
            // Open the project issues prioritization list
            that.pubs.redirect.publish('/plan/issue');
          });

          button.addEventListener('click', function () {
            that.pubs.redirect.publish('/plan/project/create');
          });
        }
      }
    },
    issueCreate: function () {
      var content, data, form, types, i,
        templateName = 'issueCreate',
        containerName = 'section',
        that = this;

      this.ensureParent(containerName);
      
      data = { containerPrefix: this.containerPrefix };
      content = this.template.parse(this.template[templateName], data);

      this.output(content, containerName);

      form = document.forms.createForm;

      form.addEventListener('submit', function (e) {
        var summary, description, type, pub, redirect;

        e.preventDefault();   // do not actually post the form

        summary = form.elements.summary.value;
        description = form.elements.description.value;
        type = form.elements.type.value;

        // Combined publication object,
        // since we need to pass more than one param
        pub = {};
        pub.summary = summary;
        pub.description = description;
        pub.type = type;
        // redirect path [to be stripped out later]
        pub.redirect = '/plan/issue';

        that.pubs.issueCreate.publish(pub);
      });

      types = document.querySelectorAll('img[class^="issue-type-option-icon"]');
      for (i = 0; i < types.length; i += 1) {
        types[i].addEventListener('click', function (e) {
          var i, target,
            types = document.querySelectorAll('img[class="issue-type-option-icon on"]');

          for (i = 0; i < types.length; i += 1) {
            types[i].classList.remove('on');
          }
          e.target.classList.add('on');
          form.type.value = e.target.getAttribute('data-type');
        });
      }
    },
    /**
     * Request issue list
     */
    issueListRequest: function () {
      this.pubs.issueListRequest.publish();
    },
    /**
     * Draw an issue list based on the data returned from the request
     * List is returned based on the currently active project (session)
     */
    issueList: function (list) {
      var outputArr, outputObj, content, data, i,
        objList, objView, objListBody, objListFooter, button,
        containerName = 'section',
        that = this;
      
      if (!list || list.length === 0) { // create the first one
        this.issueCreate();
      } else {  // list
        if (list) {
          
          // Prepare for output
          outputArr = [];
          for (i = 0; i < list.length; i += 1) {
            outputObj = list[i];
            outputObj.summary = list[i].summary;
            outputObj.description = list[i].description;
            outputObj.type = list[i].type;
            outputObj.assignee = list[i].assignee;
            outputObj.assigneeDisplay = (list[i].assignee !== '') ? list[i].assignee : '[unassigned]';
            outputArr.push(outputObj);
          }

          data = {containerPrefix: this.containerPrefix};
          content = this.template.parse(this.template.issueListHeader, data);
          for (i = 0; i < outputArr.length; i += 1) {
            content += this.template.parse(this.template.issueListLine, outputArr[i]);
          }
          content += this.template.parse(this.template.issueListFooter, data);

          this.ensureParent(containerName);
          this.output(content, containerName);

          // Add event listener
          objView = document.getElementById(this.containerPrefix + 'issue-view');
          objList = document.getElementById(this.containerPrefix + 'issue-list');
          objListBody = document.getElementById(this.containerPrefix + 'issue-list-body');
          objListFooter = document.getElementById(this.containerPrefix + 'issue-list-footer');
          button = document.getElementById(this.containerPrefix + 'issue-create-button');
          
          objListBody.addEventListener('click', function (e) {
            var target, id, obj, pub, types, form, deleteButton, row;
            
            
            // prevent click with text selected - goes directly to ListBody
            if (e.target === objListBody) {
              return false;
            }
            
            // bubble up to row level
            target = e.target;
            while (!target.getAttribute('data-issue-id')) {
              target = target.parentElement;
            }
            id = parseInt(target.getAttribute('data-issue-id'), 10);
            
            if (id) {
              // Open View on the first time
              if (!objView.classList.contains('open')) {
                objView.classList.add('open');
                objList.classList.remove('col-12');
                objList.classList.add('col-7');
                objListFooter.classList.remove('col-12');
                objListFooter.classList.add('col-7');
              }
              
              // Find in collection
              for (i = 0; i < list.length; i += 1) {
                if (list[i].id === id) {
                  obj = list[i];
                  break;
                }
              }
              
              // Light up the row
              for (i = 0; i < objListBody.children.length; i += 1) {
                row = objListBody.children[i];
                if (id === parseInt(row.getAttribute('data-issue-id'), 10)) {
                  row.classList.add('highlight');
                } else {
                  row.classList.remove('highlight');
                }
              }
              
              
              // obj list view
              data = {};
              data = that.deepClone(obj);   // copy properties without linking to obj
              data.containerPrefix = that.containerPrefix;
              
              data.addClassTypeStory = '';
              data.addClassTypeBug = '';
              data.addClassTypeTask = '';
              
              if (data.type === 'story') {
                data.addClassTypeStory = ' on';
              } else if (data.type === 'bug') {
                data.addClassTypeBug = ' on';
              } else if (data.type === 'task') {
                data.addClassTypeTask = ' on';
              }

              data.assigneeEmail = '';    // clear from previous
              if (data.assignee) {
                data.assigneeDisplay = data.assignee;
                
                // Assignee email link
                data.assigneeEmail = '<img src="img/email_env_unread.png" id="assignee-email" class="list-view-assignee-email-icon">';
              } else {
                data.assigneeDisplay = '[unassigned]';
                data.assignee = '';
                //data.assigneeEmail = '';
              }
              
              content = that.template.parse(that.template.issueListView, data);

              that.output(content, 'issue-view');
              
              // Add mail link event listener
              if (document.getElementById('assignee-email')) {
                document.getElementById('assignee-email').addEventListener('click', function () {
                  that.pubs.redirect.publish('/user/mail/to/' + data.assignee);
                });
              }
              
              form = document.forms.modifyForm;
              
              form.addEventListener('submit', function (e) {    // form is submitted with button of type submit
                var summary, description, type, assignee, assigneeActivator, pub;

                e.preventDefault();   // do not actually post the form

                summary = form.elements.summary.value;
                description = form.elements.description.value;
                type = form.elements.type.value;
                
                if (form.elements.assignee) {
                  assignee = form.elements.assignee.value;
                } else {
                  assigneeActivator = document.getElementById(that.containerPrefix + 'assignee');
                  assignee = assigneeActivator.getAttribute('data-current-assignee');
                }

                // Combined publication object,
                // since we need to pass more than one param
                pub = {};
                pub.id = id;
                pub.summary = summary;
                pub.description = description;
                pub.type = type;
                pub.assignee = assignee;

                that.pubs.issueModify.publish(pub);
              });
              
              // Type quazi-checkboxes
              types = document.querySelectorAll('img[class^="issue-list-option-icon"]');
              for (i = 0; i < types.length; i += 1) {
                types[i].addEventListener('click', function (e) {
                  var i, target,
                    types = document.querySelectorAll('img[class="issue-list-option-icon on"]');

                  for (i = 0; i < types.length; i += 1) {
                    types[i].classList.remove('on');
                  }
                  e.target.classList.add('on');
                  form.type.value = e.target.getAttribute('data-type');
                });
              }
            
              // Assignee list activator
              document.getElementById('assignee-name').addEventListener('click', assigneeListRequest);
              // Named function wrapped, so that listener can remove itself
              function assigneeListRequest() {
                document.getElementById('assignee-name').removeEventListener('click', assigneeListRequest);
                that.pubs.assigneeList.publish();
              }
              
              // Delete button in view
              deleteButton = document.getElementById('list-view-button-delete');
              deleteButton.addEventListener('click', function () {
                that.modalConfirm('Are you sure you want to delete the issue?',
                  function () { that.pubs.issueDelete.publish(id); });
              });
            }
          });
          
          // Create button
          button.addEventListener('click', function () {
            that.pubs.redirect.publish('/plan/issue/create');
          });
        }
      }
    },
    /**
     * Activates the inactive list of assignees
     */
    assigneeListActivate: function (list) {
      var container, current, content, data, selected, username, i,
        currentDataAttr = 'data-current-assignee',
        containerName = 'assignee';
      
      container = document.getElementById(this.containerPrefix + containerName);
      
      if (list && container) {
        current = container.getAttribute(currentDataAttr);
        
        data = {containerPrefix: this.containerPrefix};
        
        // Header
        content = this.template.parse(this.template.assigneeListHeader, data);
        
        // Row
        for (i = 0; i < list.length;  i += 1) {
          data.username = list[i].username;
          data.selected = '';
          if (data.username === current) {
            data.selected = ' selected';
          }
          content += this.template.parse(this.template.assigneeListRow, data);
        }
        
        // Footer
        content += this.template.parse(this.template.assigneeListFooter, data);
        this.output(content, containerName);
      }
    },
    /**
     * Request backlog list
     */
    backlogListRequest: function () {
      this.pubs.backlogListRequest.publish();
    },
    /**
     * Draw an issue list based on the data returned from the request
     * List is returned based on the currently active project (session)
     */
    backlogList: function (list) {
      var outputArr, outputObj, content, data, i,
        objList, objView, objListBody, objListFooter, button,
        containerName = 'section',
        that = this;
      
      if (!list || list.length === 0) { // create the first one
        this.issueCreate();
      } else {  // list
        if (list) {
          
          // Prepare for output
          outputArr = [];
          for (i = 0; i < list.length; i += 1) {
            outputObj = list[i];
            outputObj.summary = list[i].summary;
            outputObj.description = list[i].description;
            outputObj.type = list[i].type;
            outputObj.assignee = list[i].assignee;
            outputObj.assigneeDisplay = (list[i].assignee !== '') ? list[i].assignee : '[unassigned]';
            outputArr.push(outputObj);
          }

          data = {containerPrefix: this.containerPrefix};
          content = this.template.parse(this.template.backlogListHeader, data);
          for (i = 0; i < outputArr.length; i += 1) {
            content += this.template.parse(this.template.backlogListLine, outputArr[i]);
          }
          content += this.template.parse(this.template.backlogListFooter, data);

          this.ensureParent(containerName);
          this.output(content, containerName);
          
          this.dnd.initDraggables('.dnd-draggable');   // pass the selector to draggable elements
          this.dnd.initContainers('.dnd-container');   // pass the selector to containers, that can be emptied and then re-filled again
          this.dnd.initCallback(function () {      // pass the callback
            var data = [];
            objListBody = document.getElementById(that.containerPrefix + 'backlog-list-body');
            for (i = 0; i < objListBody.children.length; i += 1) {
              // collect IDs sequence
              data.push(parseInt(objListBody.children[i].getAttribute('data-issue-id'), 10));
            }
            // submit to DB
            that.pubs.backlogSequenceUpdate.publish(data);
          });
        }
      }
    },
    /**
     * Request sprint data
     */
    sprintListRequest: function () {
      this.pubs.sprintListRequest.publish();
    },
    /**
     * Sprint list
     */
    sprintList: function (data) {
      var content, outputObj, outputArr, actButton, dest, i, j,
        issues = data.issues,
        priorities = data.priorities,
        sprint = data.sprint,
        containerName = 'section',
        that = this;
      
      if (this.isEmpty(sprint)) { // no active sprint, no planned sprint - can create planned sprint, add from backlog
        
        // Prepare for output
        outputArr = [];
        
        for (i = 0; i < priorities.backlog.length; i += 1) { // get ID from backlog
          for (j = 0; j < issues.length; j += 1) {  // get issue details
            if (issues[j].id === priorities.backlog[i]) {
              outputObj = issues[j];
              outputArr.push(outputObj);
              break;  // unique
            }
          }
        }
        
        data = {containerPrefix: this.containerPrefix};
        content = this.template.parse(this.template.sprintCreateContainer, data);
        content += this.template.parse(this.template.sprintBacklogListHeader, data);
        for (i = 0; i < outputArr.length; i += 1) {
          content += this.template.parse(this.template.sprintBacklogListLine, outputArr[i]);
        }
        content += this.template.parse(this.template.sprintBacklogListFooter, data);
        
        this.ensureParent(containerName);
        this.output(content, containerName);
        
        actButton = document.getElementById('activate-button');
        
        this.dnd.initDraggables('.dnd-draggable');   // pass the selector to draggable elements
        this.dnd.initContainers('.dnd-container');   // pass the selector to containers, that can be emptied and then re-filled again
        this.dnd.initCallback(function () {      // pass the callback (drag'n'drop handler)
          // Go over the newly created sprint, and send the moved IDs to the server
          // Server will do the rest of the counting
          var objList,
            data = {todo: [], backlog: []};
            
          // planned sprint data
          objList = document.getElementById(that.containerPrefix + 'sprint-container');
          for (i = 0; i < objList.children.length; i += 1) {
            // collect IDs sequence
            data.todo.push(parseInt(objList.children[i].getAttribute('data-issue-id'), 10));
          }
          
          // backlog data
          objList = document.getElementById(that.containerPrefix + 'sprint-backlog-list');
          for (i = 0; i < objList.children.length; i += 1) {
            // collect IDs sequence
            data.backlog.push(parseInt(objList.children[i].getAttribute('data-issue-id'), 10));
          }

          if (data.todo.length > 0) {
            actButton.style.display = 'inline-block';
          } else {
            actButton.style.display = 'none';
          }

          // submit to DB
          that.pubs.sprintPlannedUpdate.publish(data);
        });
        
        // Activate button handler
        actButton.addEventListener('click', function () {
          that.pubs.sprintActivate.publish();
        });
      } else if (!sprint.active) { // no active sprint, but planned sprint exists - sprint editable, can add from backlog

        // Todo
        outputArr = [];
        for (i = 0; i < priorities.todo.length; i += 1) { // get ID from backlog
          for (j = 0; j < issues.length; j += 1) {  // get issue details
            if (issues[j].id === priorities.todo[i]) {
              outputObj = issues[j];
              outputArr.push(outputObj);
              break;  // unique
            }
          }
        }
        data = {containerPrefix: this.containerPrefix};
        content = this.template.parse(this.template.sprintPlannedContainerHeader, data);
        for (i = 0; i < outputArr.length; i += 1) {
          content += this.template.parse(this.template.sprintBacklogListLine, outputArr[i]);
        }
        content += this.template.parse(this.template.sprintPlannedContainerFooter, data);
        
        // Backlog
        outputArr = [];
        for (i = 0; i < priorities.backlog.length; i += 1) { // get ID from backlog
          for (j = 0; j < issues.length; j += 1) {  // get issue details
            if (issues[j].id === priorities.backlog[i]) {
              outputObj = issues[j];
              outputArr.push(outputObj);
              break;  // unique
            }
          }
        }

        content += this.template.parse(this.template.sprintBacklogListHeader, data);
        for (i = 0; i < outputArr.length; i += 1) {
          content += this.template.parse(this.template.sprintBacklogListLine, outputArr[i]);
        }
        content += this.template.parse(this.template.sprintBacklogListFooter, data);
        
        this.ensureParent(containerName);
        this.output(content, containerName);
        
        actButton = document.getElementById('activate-button');
        
        if (priorities.todo.length > 0) {
          actButton.style.display = 'inline-block';
        } else {
          actButton.style.display = 'none';
        }
        
        this.dnd.initDraggables('.dnd-draggable');   // pass the selector to draggable elements
        this.dnd.initContainers('.dnd-container');   // pass the selector to containers, that can be emptied and then re-filled again
        this.dnd.initCallback(function () {      // pass the callback
          // Go over the newly created sprint, and send the moved IDs to the server
          // Server will do the rest of the counting
          var actButton, objList,
            data = {todo: [], backlog: []};
            
          // planned sprint data
          objList = document.getElementById(that.containerPrefix + 'sprint-container');
          for (i = 0; i < objList.children.length; i += 1) {
            // collect IDs sequence
            data.todo.push(parseInt(objList.children[i].getAttribute('data-issue-id'), 10));
          }
          
          // backlog data
          objList = document.getElementById(that.containerPrefix + 'sprint-backlog-list');

          for (i = 0; i < objList.children.length; i += 1) {
            // collect IDs sequence
            data.backlog.push(parseInt(objList.children[i].getAttribute('data-issue-id'), 10));
          }

          actButton = document.getElementById('activate-button');
          
          if (data.todo.length > 0) {
            actButton.style.display = 'inline-block';
          } else {
            actButton.style.display = 'none';
          }

          // submit to DB
          that.pubs.sprintPlannedUpdate.publish(data);
        });
        
        // Activate button handler
        actButton.addEventListener('click', function () {
          that.pubs.sprintActivate.publish();
        });
        
      } else {  // active sprint exists - work within a sprint, no adding from backlog
        data = {containerPrefix: this.containerPrefix};
        content = this.template.parse(this.template.sprintActiveTemplate, data);
        
        this.ensureParent(containerName);
        this.output(content, containerName);
        
        // ToDo
        dest = document.getElementById(this.containerPrefix + 'sprint-active-todo');
        for (i = 0; i < priorities.todo.length; i += 1) {
          for (j = 0; j < issues.length; j += 1) {
            if (issues[j].id === priorities.todo[i]) {
              data.id = issues[j].id;
              data.type = issues[j].type;
              data.summary = issues[j].summary;
              data.assignee = issues[j].assignee || '[unassigned]';   // only used for output this case
              content = this.template.parse(this.template.sprintActiveCardTemplate, data);
              dest.innerHTML += content;
            }
          }
        }
        // Progress
        dest = document.getElementById(this.containerPrefix + 'sprint-active-progress');
        for (i = 0; i < priorities.progress.length; i += 1) {
          for (j = 0; j < issues.length; j += 1) {
            if (issues[j].id === priorities.progress[i]) {
              data.id = issues[j].id;
              data.type = issues[j].type;
              data.summary = issues[j].summary;
              data.assignee = issues[j].assignee || '[unassigned]';   // only used for output this case
              content = this.template.parse(this.template.sprintActiveCardTemplate, data);
              dest.innerHTML += content;
            }
          }
        }
        // Done
        dest = document.getElementById(this.containerPrefix + 'sprint-active-done');
        for (i = 0; i < priorities.done.length; i += 1) {
          for (j = 0; j < issues.length; j += 1) {
            if (issues[j].id === priorities.done[i]) {
              data.id = issues[j].id;
              data.type = issues[j].type;
              data.summary = issues[j].summary;
              data.assignee = issues[j].assignee || '[unassigned]';   // only used for output this case
              content = this.template.parse(this.template.sprintActiveCardTemplate, data);
              dest.innerHTML += content;
            }
          }
        }
        
        
        this.dnd.initDraggables('.dnd-draggable');   // pass the selector to draggable elements
        this.dnd.initContainers('.dnd-container');   // pass the selector to containers, that can be emptied and then re-filled again
        this.dnd.initCallback(function () {      // pass the callback
          var list, data;
          
          data = { todo: [], progress: [], done: [] };
          
          list = document.getElementById(that.containerPrefix + 'sprint-active-todo');
          for (i = 0; i < list.children.length; i += 1) {
            data.todo.push(parseInt(list.children[i].getAttribute('data-issue-id'), 10));
          }
          
          list = document.getElementById(that.containerPrefix + 'sprint-active-progress');
          for (i = 0; i < list.children.length; i += 1) {
            data.progress.push(parseInt(list.children[i].getAttribute('data-issue-id'), 10));
          }
          
          list = document.getElementById(that.containerPrefix + 'sprint-active-done');
          for (i = 0; i < list.children.length; i += 1) {
            data.done.push(parseInt(list.children[i].getAttribute('data-issue-id'), 10));
          }

          // submit to DB
          that.pubs.sprintActiveUpdate.publish(data);
        });
        
        
      }
    },
     
    
    
    /**
     * confirm modal box
     *  - pressing 'OK' fires the callback
     *  - pressing 'Cancel' just closes the modal
     */
    modalConfirm: function (message, callbackOk, callbackCancel) {
      message = message || 'alert';
      callbackOk = callbackOk || function () {};   // optional
      callbackCancel = callbackCancel || function () {};   // optional
      var data, container, main, content, okButton, cancelButton, containerSub,
        templateName = 'modalConfirm',
        containerName = 'modal',      // main container
        containerSubName = 'modal-sub',   // sub container
        okButtonId = 'modal-ok',
        cancelButtonId = 'modal-cancel';
      
      container = document.getElementById(this.containerPrefix + containerName);
      data = {containerPrefix: this.containerPrefix};
      
      // Create subcontainer in modal container, if it's not there yet
      if (!document.getElementById(this.containerPrefix + containerSubName)) {
        content = this.template.parse(this.template.modal, data);
        this.output(content, containerName);
      }
      
      // output to subcontainer
      data.message = message;
      content = this.template.parse(this.template[templateName], data);
      this.output(content, containerSubName);   // output to subcontainer
      
      // show container
      container.style.display = 'block';
      
      okButton = document.getElementById(okButtonId);
      okButton.addEventListener('click', function () {
        // hide container
        container.style.display = 'none';
        callbackOk();
      });
      
      cancelButton = document.getElementById(cancelButtonId);
      cancelButton.addEventListener('click', function () {
        container.style.display = 'none';
        callbackCancel();
      });
    },
    /**
     * confirm modal box
     *  - pressing 'OK' fires the callback (optional) and closes the window
     */
    modalAlert: function (message, callbackOk) {
      message = message || 'alert';
      callbackOk = callbackOk || function () {};   // optional
      var data, container, main, content, okButton, cancelButton, containerSub,
        templateName = 'modalAlert',
        containerName = 'modal',      // main container
        containerSubName = 'modal-sub',   // sub container
        okButtonId = 'modal-ok';
      
      container = document.getElementById(this.containerPrefix + containerName);
      data = {containerPrefix: this.containerPrefix};
      
      // Create subcontainer in modal container, if it's not there yet
      if (!document.getElementById(this.containerPrefix + containerSubName)) {
        content = this.template.parse(this.template.modal, data);
        this.output(content, containerName);
      }
      
      // output to subcontainer
      data.message = message;
      content = this.template.parse(this.template[templateName], data);
      this.output(content, containerSubName);   // output to subcontainer
      
      // show container
      container.style.display = 'block';
      
      okButton = document.getElementById(okButtonId);
      okButton.addEventListener('click', function () {
        // hide container
        container.style.display = 'none';
        callbackOk();
      });
    },
    
    /*** Helpers ***/

    /**
     * Make sure parent is available
     * If it's not - initiate the parent
     */
    ensureParent: function (parent) {
      if (!document.getElementById(this.containerPrefix + parent)) {  // if container is not available
        this[parent]();  // init parent view
      }
    },
    /**
     * Check if container is currenly available
     */
    checkContainer: function (container) {
      return !!document.getElementById(this.containerPrefix + container);  // boolean
    },
    /**
     * Add script to head of the document
     */
    addScriptToHead: function (src, callback) {
      callback = callback || function () {};
      var i, head, script;
      
      // document.head is not supported by IE<=9
      head = document.head || document.getElementsByTagName("head")[0];

      // check if script is not in the head already
      if (head.querySelector('script[src="' + src + '"]')) {
        callback(); // script already there, still firing the callback
      } else {
        script = document.createElement('script');
        script.setAttribute('src', src);
        script.onload = callback;
        head.appendChild(script);
      }
    },
    /**
     * Register a timeout handler
     */
    regTimeout: function (timeoutHandler) {
      this.timeouts.push(timeoutHandler);
    },
    /**
     * Unregister a timeout handler
     */
    unregTimeout: function (timeoutHandler) {
      var i;
      for (i = this.timouts.length - 1; i >= 0; i -= 1) {
        if (this.timeouts[i] === timeoutHandler) {
          this.timeouts.splice(i, 1);
        }
      }
    },
    /**
     * Flush registered timeout handlers
     */
    flushTimouts: function () {
      var i;
      for (i = this.timouts.length - 1; i >= 0; i -= 1) {
        window.clearTimeout(this.timouts[i]);
      }
      this.timouts = [];
    },
    /**
     * Register an interval handler
     */
    regInterval: function (intervalHandler) {
      this.intervals.push(intervalHandler);
    },
    /**
     * Unregister an interval handler
     */
    unregInterval: function (intervalHandler) {
      var i;
      for (i = this.intervals.length - 1; i >= 0; i -= 1) {
        if (this.intervals[i] === intervalHandler) {
          this.intervals.splice(i, 1);
        }
      }
    },
    /**
     * Flush registered interval handlers
     */
    flushIntervals: function () {
      var i;
      for (i = this.intervals.length - 1; i >= 0; i -= 1) {
        window.clearInterval(this.intervals[i]);
      }
      this.intervals = [];
    },
    /**
     * Deep clone an object
     * http://stackoverflow.com/a/728694
     */
    deepClone: function (obj) {
      var copy, len, prop, i;

      // Handle the 3 simple types, and null or undefined
      if (null === obj || "object" !== typeof obj) {
        return obj;
      }

      // Handle Date
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        copy = [];
        for (i = 0, len = obj.length; i < len; i += 1) {
          copy[i] = this.deepClone(obj[i]);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        copy = {};
        for (prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            copy[prop] = this.deepClone(obj[prop]);
          }
        }
        return copy;
      }
    },
    /**
     * Check if object is empty, pre-ECMA5 replacement fro keys().length
     */
    isEmpty: function (obj) {
      var prop;
      
      if (obj.constructor !== Object) {  // make sure argument is an object
        return false;
      }
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {  // check for the first property
          return false;
        }
      }
      return true;
    }
  };
  View.prototype.constructor = View;
  
  // attach to window
  window.app = window.app || {};
  window.app.View = View;
    
}(window));