(function (window) {
  'use strict';

  /**
  * Template class
  *
  * @constructor
  */
  function Template() {
    this.main
      = '<div id="{{containerPrefix}}modal"></div>'
      + '<div id="{{containerPrefix}}message"></div>'
      + '<div id="{{containerPrefix}}header"></div>'
      + '<div id="{{containerPrefix}}section"></div>'
      + '<div id="{{containerPrefix}}aside"></div>'
      + '<div id="{{containerPrefix}}footer"></div>';
    
    this.index
      = '<div class="login-header">Plan Like a Pro</div>'
      + '<div id="{{containerPrefix}}slider" class="slider"></div>'
      + '<div>Rija provides you with unlimited possibilities for highly professional Project Management</div>';
    
    this.manual
      = '<div class="login-header">Neque porro quisquam est qui dolorem</div>'
      + '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non quam diam. Nam et nisl nunc. Ut consequat turpis mi. Aenean nibh justo, commodo eu tortor pharetra, lacinia mattis metus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nunc eget velit nec dui pharetra laoreet ut maximus velit. Donec semper lectus a purus varius lobortis. Pellentesque et odio non urna ornare venenatis eu eget nisl. Donec iaculis nisi sit amet dui sodales, eu varius nulla facilisis. Nullam vel hendrerit purus.</p>'
      + '<p>Fusce condimentum nulla eget dictum egestas. Vivamus commodo, ligula eget dignissim cursus, lorem neque tempus velit, id aliquet nulla velit vitae elit. Morbi commodo lectus eget tristique vulputate. Praesent volutpat, enim et venenatis mattis, tortor nulla posuere sem, nec pretium ligula tellus ac nibh. In viverra tellus vitae lectus fermentum interdum. Morbi varius elit libero, vel maximus nisl aliquet nec. Fusce ligula elit, fringilla a accumsan sit amet, imperdiet nec nunc. Ut dapibus venenatis leo, a sagittis nibh dignissim quis. Donec quis aliquam ex. Praesent vel neque molestie felis aliquam venenatis vel at diam. Aenean efficitur sit amet elit eget blandit. Praesent ultricies tellus at nibh auctor, non lobortis mi volutpat. Sed non urna gravida, aliquam orci ut, varius metus.</p>'
      + '<p>Integer lacinia mattis magna, nec mollis ligula auctor sit amet. Cras dapibus tincidunt dui sit amet volutpat. Mauris risus nisl, interdum id mi ac, consectetur pellentesque mauris. Integer ut purus massa. Cras fermentum, felis quis imperdiet elementum, nulla massa viverra dolor, eu placerat nibh nisi at nisi. Donec lacinia ante id aliquam eleifend. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus convallis ultricies pellentesque. Mauris ullamcorper tortor ac sodales pharetra. Donec eget risus tortor. In id turpis at nunc fermentum accumsan et ac purus. Nam aliquam purus risus, eget porta mi imperdiet a. In tincidunt vulputate facilisis.</p>'
      + '<p>Nam vel est consequat, mattis mauris vel, laoreet mauris. Donec ullamcorper, sem id viverra facilisis, tellus magna convallis lacus, et mattis arcu est id lacus. Nunc urna sem, lobortis a quam in, porttitor fermentum enim. Fusce molestie auctor nunc in volutpat. Mauris laoreet at nisl vitae rhoncus. Nullam a consectetur quam. Vivamus congue ultrices tellus, vitae vehicula ex pharetra in. Donec augue elit, laoreet ac malesuada vitae, pellentesque nec turpis. Nunc mi neque, posuere eu dolor sit amet, commodo egestas nulla. Integer fringilla lobortis mauris, elementum sodales nunc dictum non. Duis porta turpis sed dapibus iaculis. In elementum blandit diam, at elementum odio vestibulum sit amet. Donec vehicula massa in sagittis porttitor. Nulla facilisi. Curabitur sed mattis ante. Aliquam erat volutpat.</p>';
    
    this.faq
      = '<div class="login-header">consectetur adipiscing elit</div>'
      + '<p>Fusce condimentum nulla eget dictum egestas. Vivamus commodo, ligula eget dignissim cursus, lorem neque tempus velit, id aliquet nulla velit vitae elit. Morbi commodo lectus eget tristique vulputate. Praesent volutpat, enim et venenatis mattis, tortor nulla posuere sem, nec pretium ligula tellus ac nibh. In viverra tellus vitae lectus fermentum interdum. Morbi varius elit libero, vel maximus nisl aliquet nec. Fusce ligula elit, fringilla a accumsan sit amet, imperdiet nec nunc. Ut dapibus venenatis leo, a sagittis nibh dignissim quis. Donec quis aliquam ex. Praesent vel neque molestie felis aliquam venenatis vel at diam. Aenean efficitur sit amet elit eget blandit. Praesent ultricies tellus at nibh auctor, non lobortis mi volutpat. Sed non urna gravida, aliquam orci ut, varius metus.</p>'
      + '<p>Integer lacinia mattis magna, nec mollis ligula auctor sit amet. Cras dapibus tincidunt dui sit amet volutpat. Mauris risus nisl, interdum id mi ac, consectetur pellentesque mauris. Integer ut purus massa. Cras fermentum, felis quis imperdiet elementum, nulla massa viverra dolor, eu placerat nibh nisi at nisi. Donec lacinia ante id aliquam eleifend. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus convallis ultricies pellentesque. Mauris ullamcorper tortor ac sodales pharetra. Donec eget risus tortor. In id turpis at nunc fermentum accumsan et ac purus. Nam aliquam purus risus, eget porta mi imperdiet a. In tincidunt vulputate facilisis.</p>'
      + '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non quam diam. Nam et nisl nunc. Ut consequat turpis mi. Aenean nibh justo, commodo eu tortor pharetra, lacinia mattis metus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nunc eget velit nec dui pharetra laoreet ut maximus velit. Donec semper lectus a purus varius lobortis. Pellentesque et odio non urna ornare venenatis eu eget nisl. Donec iaculis nisi sit amet dui sodales, eu varius nulla facilisis. Nullam vel hendrerit purus.</p>'
      + '<p>Nam vel est consequat, mattis mauris vel, laoreet mauris. Donec ullamcorper, sem id viverra facilisis, tellus magna convallis lacus, et mattis arcu est id lacus. Nunc urna sem, lobortis a quam in, porttitor fermentum enim. Fusce molestie auctor nunc in volutpat. Mauris laoreet at nisl vitae rhoncus. Nullam a consectetur quam. Vivamus congue ultrices tellus, vitae vehicula ex pharetra in. Donec augue elit, laoreet ac malesuada vitae, pellentesque nec turpis. Nunc mi neque, posuere eu dolor sit amet, commodo egestas nulla. Integer fringilla lobortis mauris, elementum sodales nunc dictum non. Duis porta turpis sed dapibus iaculis. In elementum blandit diam, at elementum odio vestibulum sit amet. Donec vehicula massa in sagittis porttitor. Nulla facilisi. Curabitur sed mattis ante. Aliquam erat volutpat.</p>';
    
    this.message
      = '<div class="message-grandparent" id="js-app-render-message-box">'
      +   '<div class="message-parent">'
      +     '<div class="message message-{{messageType}}">{{message}}</div>'
      +   '</div>'
      + '</div>';
      
    this.header
      = '<header>'
      +   '<!-- Left side -->'
      +   '<a href="#" class="left logo-link col-3" tabindex="-1"><img src="img/logo_white.png" alt="jira" class="logo"></a>'
      +   '<!-- Right side: right-to-left -->'
      +   '<nav id="{{containerPrefix}}nav-block" class="right col-9">'
      +     '<div id="{{containerPrefix}}menu" class="right menu"></div>'
      +     '<div id="{{containerPrefix}}auth-user-box" class="right user-auth-box"></div>'   // right-to-left
      +   '</nav>'
      + '</header>';

    this.authUserBox = '<span id="{{containerPrefix}}auth-user-mail-box" class="auth-user-mail-count-container"></span><span class="user-box-name"><a href="#user/mail" class="user-box-name-link" tabindex="10">[Hello, {{username}}]</a></span>';   // after we get a confirmation
    this.authUserMailBox = '<a href=#user/mail><span class="auth-user-mail-count-container"><span class="auth-user-mail-count" id="{{containerPrefix}}auth-user-mail-count">{{count}}</span><img src="img/redcircle.png" alt="You got mail" class="auth-user-mail-count-image"></span></a>';
      
    this.menu
      = '<div class="right submenu-wrap-first"><a href="#contact" class="right nav" id="{{containerPrefix}}menu-contact-nav" tabindex="14">contact</a></div>'
      + '<div class="right submenu-wrap"><a href="#learn" class="right nav" id="{{containerPrefix}}menu-learn-nav" tabindex="13">learn</a>'
      +   '<div class="submenu" id="{{containerPrefix}}menu-learn-sub">'
      +     '<a href="#learn/youtube" class="subnav">youtube</a>'
      +     '<a href="#learn/manual" class="subnav">manual</a>'
      +     '<a href="#learn/faq" class="subnav">faq</a>'
      +   '</div>'
      + '</div>'
      + '<div class="right submenu-wrap"><a href="#plan" class="right nav" id="{{containerPrefix}}menu-plan-nav" tabindex="12">plan</a>'
      +   '<div class="submenu" id="{{containerPrefix}}menu-plan-sub">'
      +     '<a href="#plan/project" class="subnav">projects</a>'
      +     '<a href="#plan/issue" class="subnav">issues</a>'
      +     '<a href="#plan/backlog" class="subnav">backlog</a>'
      +     '<a href="#plan/sprint" class="subnav">sprint</a>'
      +   '</div>'
      + '</div>'
      + '<div class="right submenu-wrap"><a href="#user/login" class="right nav" id="{{containerPrefix}}menu-login-nav" tabindex="11">log in</a></div>';
    
      
    this.userLoginForm
      = '<div class="login">'
      +   '<div class="login-header">log in</div>'
      +   '<form action="#" id="userLoginForm">'
      +    '<div><input type="text" name="username" class="user-login-input" placeholder="USERNAME" required tabindex="1"></div>'
      +    '<div><input type="password" name="password" class="user-login-input" placeholder="PASSWORD" required tabindex="2"></div>'
      +    '<button type="submit" class="user-login-button" tabindex="3">log in</button>'
      +   '</form>'
      +  '</div>';
      
    this.contact
      = '<div class="login-header">Rigestan, Iran</div>'
      + '<div id="{{containerPrefix}}map"></div>'
      + '<div>Rija Headquarters</div>'
      + '<div>4 Laleh Street, basement</div>'
      + '<div>Rigestan village, Iran</div>';
    
    this.youtube
      = '<div class="login-header">YouTube channel</div>'
      + '<div id="player" class="youtube-player"></div>'
      + '<div>Follow our YouTube channel to learn about Scrum Methodology best practices</div>';
    
    this.userMailListHeader
      = '<div id="{{containerPrefix}}user-mail-list" class="user-mail-table col-12">'
      +   '<div class="user-mail-list-head">'
      +     '<div class="user-mail-cell user-mail-icon-column"><img src="img/email_env_white.png" alt="" class="user-mail-icon"></div>'
      +     '<div class="user-mail-cell">From</div>'
      +     '<div class="user-mail-cell">Subject</div>'
      +     '<div class="user-mail-cell">Sent</div>'
      +   '</div>'
      +   '<div id="{{containerPrefix}}user-mail-list-body" class="user-mail-list-body">';
    
    this.userMailListLine
      =     '<div class="user-mail-row{{addClass}}" data-mail-sent="{{sent}}">'
      +       '<div class="user-mail-cell"><img src="img/email_env{{unread}}.png" alt="" class="user-mail-icon"></div>'
      +       '<div class="user-mail-cell">{{sender}}</div>'
      +       '<div class="user-mail-cell">{{subject}}</div>'
      +       '<div class="user-mail-cell">{{sentHuman}}</div>'
      +     '</div>';
    
    this.userMailListFooter
      =   '</div>'
      + '</div>'
      + '<div id="{{containerPrefix}}user-mail-view" class="user-mail-view col-5"></div>';
    
    this.userMailView
      = '<div class="mail-view-reply-button-wrap">'
      +   '<button type="button" id="mail-view-reply-icon" class="mail-view-reply-button-top" tabindex="1">'
      +     '<img src="img/email_reply.png" alt="Reply" class="mail-view-reply-button-icon">Reply</button>'
      +   '<button type="button" id="mail-view-delete-icon" class="mail-view-reply-button-top" tabindex="4">'
      +     '<img src="img/email_delete.png" alt="Reply" class="mail-view-reply-button-icon">Delete</button>'
      + '</div>'
      + '<div class="mail-view-reply-header-wrap">'
      +   '<div class="mail-view-header">Sent:</div><div class="mail-view-header-value">{{sentHuman}}</div>'
      +   '<div class="mail-view-header">From:</div><div class="mail-view-header-value">{{sender}}</div>'
      +   '<div class="mail-view-header">Subject:</div><div class="mail-view-header-value">{{subject}}</div>'
      + '</div>'
      + '<div id="mail-view-reply" class="mail-view-reply">'
      +   '<button type="submit" id="mail-view-reply-button" class="mail-view-reply-button" tabindex="3">'
      +     '<img src="img/email_send.png" alt="Reply" class="mail-view-reply-button-icon">Send</button>'
      +   '<textarea id="mail-view-reply-text" class="mail-view-reply-text" tabindex="2"></textarea>'
      + '</div>'
      + '<div class="mail-view-body">{{body}}</div>';
    
    this.userMailTo
      = '<div class="mail-to-wrap">'
      +   '<div class="mail-to-header">To:</div><div class="mail-to-header-value">{{recipient}}</div>'
      +   '<div class="mail-to-header">Subject: </div><div class="mail-to-header-value">'
      +   '<input id="mail-to-subj" type="text" class="mail-to-input" tabindex="1"></div>'
      +   '<div id="mail-view-reply" class="mail-view-reply" style="display: block;">'
      +   '<button type="button" id="mail-to-button" class="mail-view-reply-button" tabindex="3">'
      +     '<img src="img/email_send.png" alt="Reply" class="mail-view-reply-button-icon">Send</button>'
      +   '<textarea id="mail-to-body" class="mail-view-reply-text" tabindex="2"></textarea>'
      + '</div>';
    
    this.projectCreate
      = '<div class="login">'
      +   '<div class="login-header">Create Project</div>'
      +   '<form action="#" id="projectCreateForm">'
      +    '<div><input type="text" class="project-input" name="name" placeholder="Project Name" required tabindex="1"></div>'
      +    '<div><textarea type="text" class="project-textarea" name="description" placeholder="Project Description" tabindex="2"></textarea></div>'
      +    '<button type="submit" class="project-button" tabindex="3">Create</button>'
      +   '</form>'
      +  '</div>';
    
    this.projectListHeader
      = '<div class="list-info-box"><img src="img/info.png" alt="" class="list-info-icon">'
      +   '<span class="list-info-title">PROJECTS:</span>'
      +   '<span class="list-info-description">Use this interface to create projects and select an active project to work with</div>'
      + '<div id="{{containerPrefix}}project-list-table" class="project-list-table col-12">'
      +   '<div class="project-list-head">'
      +     '<div class="project-list-cell project-list-icon-column"></div>'
      +     '<div class="project-list-cell">Project Name</div>'
      +     '<div class="project-list-cell">Project Description</div>'
      +   '</div>'
      +   '<div id="{{containerPrefix}}project-list-body" class="project-list-body">';
    
    this.projectListLine
      =     '<div class="project-list-row" data-project-id="{{id}}">'
      +       '<div class="project-list-cell"><img src="img/project_active.png" alt="" class="project-list-icon"></div>'
      +       '<div class="project-list-cell">{{name}}</div>'
      +       '<div class="project-list-cell">{{description}}</div>'
      +     '</div>';
    
    this.projectListFooter
      =   '</div>'
      + '</div>'
      + '<div><button id="{{containerPrefix}}project-create-button" class="list-view-button"><img src="img/create.png" class="list-view-button-icon">Create Project</button></div>';
    
    this.issueCreate
      = '<div class="login">'
      +   '<div class="login-header">Create Issue</div>'
      +   '<form action="#" id="createForm">'
      +    '<div><input type="text" class="project-input" name="summary" placeholder="Issue Summary" required tabindex="1"></div>'
      +      '<div class="issue-list-option on" id="type-option-story"><img src="img/issue_type_story.png" class="issue-type-option-icon on" data-type="story"> Story</div>'
      +      '<div class="issue-list-option" id="type-option-bug"><img src="img/issue_type_bug.png" class="issue-type-option-icon" data-type="bug"> Bug</div>'
      +      '<div class="issue-list-option" id="type-option-task"><img src="img/issue_type_task.png" class="issue-type-option-icon" data-type="task"> Task</div>'
      +    '<div><textarea type="text" class="project-textarea" name="description" placeholder="Issue Description" tabindex="2"></textarea></div>'
      +    '<input type="hidden" name="type" value="story">'
      +    '<button type="submit" class="project-button" tabindex="3"><img src="img/create.png" class="list-view-button-icon">Create Issue</button>'
      +   '</form>'
      +  '</div>';

    this.issueListHeader
      = '<div class="list-info-box"><img src="img/info.png" alt="" class="list-info-icon">'
      +   '<span class="list-info-title">ISSUES:</span>'
      +   '<span class="list-info-description">Use this interface to create issues and modify them. Click the issue for details.</div>'
      + '<div id="{{containerPrefix}}issue-list" class="project-list-table col-12">'
      +   '<div class="project-list-head">'
      +     '<div class="project-list-cell project-list-icon-column"></div>'
      +     '<div class="project-list-cell">Issue Summary</div>'
      +     '<div class="project-list-cell">Issue Description</div>'
      +     '<div class="project-list-cell">Issue Type</div>'
      +     '<div class="project-list-cell">Assignee</div>'
      +   '</div>'
      +   '<div id="{{containerPrefix}}issue-list-body" class="project-list-body">';
    
    this.issueListLine
      =     '<div class="issue-list-row" data-issue-id="{{id}}">'
      +       '<div class="issue-list-cell"><img src="img/issue_type_{{type}}.png" alt="" class="project-list-icon"></div>'
      +       '<div class="issue-list-cell">{{summary}}</div>'
      +       '<div class="issue-list-cell">{{description}}</div>'
      +       '<div class="issue-list-cell">{{type}}</div>'
      +       '<div class="issue-list-cell">{{assigneeDisplay}}</div>'
      +     '</div>';
    
    this.issueListFooter
      =   '</div>'
      + '</div>'
      + '<div id="{{containerPrefix}}issue-view" class="user-mail-view col-5"></div>'
      + '<div id="{{containerPrefix}}issue-list-footer" class="col-12"><button id="{{containerPrefix}}issue-create-button" class="list-view-button"><img src="img/create.png" class="list-view-button-icon">Create Issue</button></div>';
    
    this.issueListView
      =   '<form action="#" id="modifyForm">'
      +    '<div><input type="text" class="list-view-form-input" name="summary" placeholder="Issue Summary" required value="{{summary}}"></div>'
      +      '<div class="issue-list-view-option on" id="type-option-story"><img src="img/issue_type_story.png" class="issue-list-option-icon{{addClassTypeStory}}" data-type="story"> Story</div>'
      +      '<div class="issue-list-view-option" id="type-option-bug"><img src="img/issue_type_bug.png" class="issue-list-option-icon{{addClassTypeBug}}" data-type="bug"> Bug</div>'
      +      '<div class="issue-list-view-option" id="type-option-task"><img src="img/issue_type_task.png" class="issue-list-option-icon{{addClassTypeTask}}" data-type="task"> Task</div>'
      +    '<div><textarea type="text" class="list-view-form-textarea" name="description" placeholder="Issue Description">{{description}}</textarea></div>'
      +    '<div id="{{containerPrefix}}assignee" class="issue-list-view-assignee-activator" data-current-assignee="{{assignee}}">{{assigneeEmail}}<div id="assignee-name" class="issue-list-view-assignee-name"><img src="img/assignee.png" class="list-view-button-icon"> Assignee: {{assigneeDisplay}}</a></div></div>'
      +    '<input type="hidden" name="type" value="{{type}}">'
      +    '<div class="list-view-button-wrap"><button type="submit" class="list-view-button"><img src="img/save.png" class="list-view-button-icon">Save</button></div>'
      +    '<div class="list-view-button-wrap"><button type="button" class="list-view-button" id="list-view-button-delete"><img src="img/delete.png" class="list-view-button-icon">Delete</button></div>'
      +   '</form>';
    
    this.modal
      = '<div class="modal-grandparent">'
      +   '<div class="modal-parent">'
      +     '<div id="{{containerPrefix}}modal-sub" class="modal"></div>'
      +   '</div>'
      + '</div>';
    
    this.modalAlert
      =  '<div>{{message}}</div>'
      +  '<div class="modal-button-wrap"><button type="submit" class="modal-button" id="modal-ok"><img src="img/save.png" class="modal-button-icon">OK</button></div>';
    
    this.modalConfirm
      =  '<div>{{message}}</div>'
      +  '<div class="modal-button-wrap-left"><button type="submit" class="modal-button" id="modal-ok" tabindex="5"><img src="img/save.png" class="modal-button-icon">OK</button></div>'
      +  '<div class="modal-button-wrap-right"><button type="button" class="modal-button" id="modal-cancel" tabindex="6"><img src="img/cancel.png" class="modal-button-icon">Cancel</button></div>';
    
    this.assigneeListHeader = '<img src="img/assignee.png" class="list-view-button-icon"><select name="assignee" class="issue-list-view-assignee-select"><option value="">[unassigned]</option>';
    this.assigneeListRow = '<option value="{{username}}"{{selected}}>{{username}}</option>';
    this.assigneeListFooter = '</select>';
    
    this.backlogListHeader
      = '<div class="list-info-box"><img src="img/info.png" alt="" class="list-info-icon">'
      +   '<span class="list-info-title">BACKLOG:</span>'
      +   '<span class="list-info-description">Use this interface to prioritize the backlog issues of the project. Drag the issue to change the priority.</div>'
      + '<div id="{{containerPrefix}}backlog-list" class="project-list-table col-12">'
      +   '<div class="project-list-head">'
      +     '<div class="project-list-cell project-list-icon-column"></div>'
      +     '<div class="project-list-cell">Issue Summary</div>'
      +     '<div class="project-list-cell">Issue Description</div>'
      +     '<div class="project-list-cell">Issue Type</div>'
      +     '<div class="project-list-cell">Assignee</div>'
      +   '</div>'
      +   '<div id="{{containerPrefix}}backlog-list-body" class="project-list-body dnd-container">';
    
    this.backlogListLine
      =     '<div class="issue-list-row dnd-draggable" draggable="true" data-issue-id="{{id}}">'
      +       '<div class="issue-list-cell"><img src="img/issue_type_{{type}}.png" alt="" class="project-list-icon"></div>'
      +       '<div class="issue-list-cell">{{summary}}</div>'
      +       '<div class="issue-list-cell">{{description}}</div>'
      +       '<div class="issue-list-cell">{{type}}</div>'
      +       '<div class="issue-list-cell">{{assigneeDisplay}}</div>'
      +     '</div>';
    
    this.backlogListFooter
      =   '</div>'
      + '</div>';
    
    this.sprintCreateContainer
      = '<div class="list-info-box"><img src="img/info.png" alt="" class="list-info-icon">'
      +   '<span class="list-info-title">SPRINT:</span>'
      +   '<span class="list-info-description">Use this interface to add issues to the planned sprint and activate the sprint when the time comes.</span></div>'
      + '<div class="sprint-container-header">Drag issues here to create a new sprint: <button id="activate-button" class="sprint-button">Activate</button></div>'
      + '<div id="{{containerPrefix}}sprint-container" class="sprint-container dnd-container"></div>';
    
    this.sprintBacklogListHeader
      = '<div id="{{containerPrefix}}sprint-backlog-list" class="sprint-container dnd-container">';
    
    this.sprintBacklogListLine
      = '<div class="dnd-draggable sprint-backlog-line" draggable="true" data-issue-id="{{id}}">'
      +   '<div class="dnd-sub sprint-backlog-line-sub">'
      +     '<div class="dnd-xsub sprint-backlog-line-xsub-icon-col"><img src="img/issue_type_{{type}}.png" alt="" class="sprint-backlog-line-xsub-icon"></div>'
      +     '<div class="dnd-xsub sprint-backlog-line-xsub-summary">{{summary}}</div>'
      +     '<div class="dnd-xsub sprint-backlog-line-xsub-description">{{description}}</div>'
      +   '</div>'
      + '</div>';

    this.sprintPlannedContainerHeader
      = '<div class="list-info-box"><img src="img/info.png" alt="" class="list-info-icon">'
      +   '<span class="list-info-title">PLANNED SPRINT:</span>'
      +   '<span class="list-info-description">Use this interface to add issues to the planned sprint and activate the sprint when the time comes.</span></div>'
      + '<div class="sprint-container-header">Drag issues here to modify the planned sprint: <button id="activate-button" class="sprint-button">Activate</button></div>'
      + '<div id="{{containerPrefix}}sprint-container" class="sprint-container dnd-container">';
    
    this.sprintPlannedContainerFooter
      = '</div>';
    
    this.sprintActiveTemplate
      = '<div class="list-info-box"><img src="img/info.png" alt="" class="list-info-icon">'
      +   '<span class="list-info-title">ACTIVE SPRINT:</span>'
      +   '<span class="list-info-description">Use this interface to move issues as they progress according to the workflow.</span></div>'
      + '<div class="sprint-active-table col-12">'
      +   '<div class="sprint-active-header">'
      +     '<div class="sprint-active-cell">ToDo</div>'
      +     '<div class="sprint-active-cell">In Progress</div>'
      +     '<div class="sprint-active-cell">Done</div>'
      +   '</div>'
      +   '<div class="sprint-active-row">'
      +     '<div class="sprint-active-cell dnd-container" id="{{containerPrefix}}sprint-active-todo"></div>'
      +     '<div class="sprint-active-cell dnd-container" id="{{containerPrefix}}sprint-active-progress"></div>'
      +     '<div class="sprint-active-cell dnd-container" id="{{containerPrefix}}sprint-active-done"></div>'
      +   '</div>'
      + '</div>';
    
    this.sprintActiveCardTemplate
      = '<div class="dnd-draggable sprint-active-card" draggable="true" data-issue-id="{{id}}">'
      +   '<div class="sprint-active-card-sub dnd-sub">'
      +     '<img src="img/issue_type_{{type}}.png" alt="" class="sprint-active-card-icon">{{summary}}'
      +   '</div>'
      +   '<div class="sprint-active-card-sub dnd-sub">'
      +     '<img src="img/assignee.png" alt="" class="sprint-active-card-icon">{{assignee}}'
      +   '</div>'
      + '</div>';
    
    this.sprintBacklogListFooter
      = '</div>';
    
  }
  Template.prototype = {
    parse: function (template, data) {
      data = data || {};
      return template.replace(/{{([^{}]*)}}/g, function (match, b) {
        var replacement = data[b];
        if (typeof replacement === 'string' || typeof replacement === 'number') {
          return replacement;
        } else {
          return match;
        }
      });
    }
  };
  Template.prototype.constructor = Template;

  // Export to window
  window.app = window.app || {};
  window.app.Template = Template;

}(window));