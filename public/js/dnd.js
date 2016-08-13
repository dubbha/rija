(function (window) {
  'use strict';
  
  /**
   * Drag'n'Drop class
   */
  function Dnd() {
    this.dragSrcElement = null;
  }
  Dnd.prototype = {
    // helper methods
    findPrev: function (element) {
      do {
        element = element.previousSibling;
      } while (element && element.nodeType !== 1);
      return element;
    },
    findNext:  function (element) {
      do {
        element = element.nextSibling;
      } while (element && element.nodeType !== 1);
      return element;
    },
    // draggable methods
    handleDragStart: function (e, that, selector) {  // e.target is the source element

      var source = e.target;
      while (!source.matches(selector)) {  // check if not over child element
        source = source.parentElement;
      }
      
      that.dragSrcElement = source;          // Save the source node aside for future swap
      source.classList.add('dnd-fade');
      e.dataTransfer.setData('text', source.outerHTML);
    },
    handleDragEnter: function (e, that, selector) {      // e.target is the element we enter
      var target = e.target;
      if (target.nodeType === 3) {    // child inner text node - go up to the parent element
        target = target.parentElement;
      }
      while (!target.matches(selector)) {  // check if not over child element
        target = target.parentElement;
      }
      // if target and source differ
      if (target !== that.dragSrcElement) {
        // if parent containers are the same
        if (target.parentElement === that.dragSrcElement.parentElement) {
          // swap siblings
          if (target === this.findNext(that.dragSrcElement)) {  // going down
            target.parentElement.insertBefore(target, that.dragSrcElement);
          } else if (target === this.findPrev(that.dragSrcElement)) { // going up
            target.parentElement.insertBefore(that.dragSrcElement, target);
          }
        } else {  // parents are different - move to the other parent
          // check parents sequence
          if (target.parentElement === that.findNext(that.dragSrcElement.parentElement)) {  // going down
            target.parentElement.insertBefore(that.dragSrcElement, target);
          } else {  // going up
            target.parentElement.insertBefore(that.dragSrcElement, target.nextSibling);
          }
        }
      }
    },
    handleDragOver: function (e) {
      if (e.stopPropagation) { e.stopPropagation(); }   // prevent cursor change to nodrop
      if (e.preventDefault) { e.preventDefault(); }
    },
    handleDrop: function (e) { // e.target is the target element
      if (e.stopPropagation) { e.stopPropagation(); }    // prevent redirecting
      if (e.preventDefault) { e.preventDefault(); }
      return false;
    },
    handleDragEnd: function (e, that) {     // e.target is the source node
      if (e.stopPropagation) { e.stopPropagation(); }    // prevent redirecting
      if (e.preventDefault) { e.preventDefault(); }
      that.dragSrcElement.classList.remove('dnd-fade');
      
      // call the configured callback
      that.callback();
    },
    handleSelectStart: function (e) {  // IE8
      e.preventDefault();
      e.stopPropagation();
      var element = e.target;
      if (element.dragDrop) {
        element.dragDrop();
      }
    },
    // container methods
    emptyContainerAllowDrop: function (e) {
      if (this.children.length === 0) {    // only allow dropping if continer is empty
        if (e.preventDefault) { e.preventDefault(); }        // allow dropping
        //if (e.stopPropagation) { e.stopPropagation(); }    // prevent redirection
        this.classList.add('dnd-over');
      }
    },
    emptyContainerDragLeave: function (e) {
      this.classList.remove('dnd-over');
    },
    emptyContainerDrop: function (e, that) {            // e.target is the target element
      if (e.stopPropagation) { e.stopPropagation(); }    // prevent redirecting
      if (e.preventDefault) { e.preventDefault(); }
      if (e.target.children.length === 0) {
        e.target.appendChild(that.dragSrcElement);
        e.target.classList.remove('dnd-over');
      }
    },
    initDraggables: function (selector) {
      var i, draggable,
        draggables = document.querySelectorAll(selector),
        that = this;   // make object's scope available for inner functions
      
      // Crockford: "Don't make functions in a loop"
      // https://www.youtube.com/watch?v=ya4UHuXNygM&feature=youtu.be&t=3974
      function makeHandler(methodName) {
        return function (e) {
          that[methodName](e, that, selector);
        };
      }
      for (i = 0; i < draggables.length; i += 1) {  // foreach replacement
        draggable = draggables[i];
        draggable.addEventListener('dragstart', makeHandler('handleDragStart'), false);
        draggable.addEventListener('dragenter', makeHandler('handleDragEnter'), false);
        draggable.addEventListener('dragover', that.handleDragOver, false);
        draggable.addEventListener('drop', that.handleDrop, false);
        draggable.addEventListener('dragend', makeHandler('handleDragEnd'), false);
        draggable.addEventListener('selectstart', that.handleSelectStart, false);  // IE8 - https://blog.frogslayer.com/using-html5-drag-and-drop-in-ie8/
      }
    },
    initContainers: function (selector) {
      var i, container,
        containers = document.querySelectorAll(selector),
        that = this;   // make object's scope available for inner functions
      
      function makeHandler(methodName) {
        return function (e) {
          that[methodName](e, that);
        };
      }
      for (i = 0; i < containers.length; i += 1) {
        container = containers[i];
        container.addEventListener('dragover', that.emptyContainerAllowDrop, false);
        container.addEventListener('drop', makeHandler('emptyContainerDrop'), false);
        container.addEventListener('dragleave', that.emptyContainerDragLeave, false);
      }
    },
    initCallback: function (callback) {
      this.callback = callback;
    }
  };
  Dnd.prototype.constructor = Dnd;
  
  // attach to window
  window.app = window.app || {};
  window.app.Dnd = Dnd;
  
}(window));