(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * PxLoader
 * https://github.com/thinkpixellab/PxLoader
 */

/*
 * PixelLab Resource Loader
 * Loads resources while providing progress updates.
 */
function PxLoader(settings) {

    // merge settings with defaults
    settings = settings || {};
    this.settings = settings;

    // how frequently we poll resources for progress
    if (settings.statusInterval == null) {
        settings.statusInterval = 5000; // every 5 seconds by default
    }

    // delay before logging since last progress change
    if (settings.loggingDelay == null) {
        settings.loggingDelay = 20 * 1000; // log stragglers after 20 secs
    }

    // stop waiting if no progress has been made in the moving time window
    if (settings.noProgressTimeout == null) {
        settings.noProgressTimeout = Infinity; // do not stop waiting by default
    }

    var entries = [],

    // holds resources to be loaded with their status
    progressListeners = [],
        timeStarted,
        progressChanged = Date.now();

    /**
     * The status of a resource
     * @enum {number}
     */
    var ResourceState = {
        QUEUED: 0,
        WAITING: 1,
        LOADED: 2,
        ERROR: 3,
        TIMEOUT: 4
    };

    // places non-array values into an array.
    var ensureArray = function ensureArray(val) {
        if (val == null) {
            return [];
        }

        if (Array.isArray(val)) {
            return val;
        }

        return [val];
    };

    // add an entry to the list of resources to be loaded
    this.add = function (resource) {

        // To do: would be better to create a base class for all resources and
        // initialize the PxLoaderTags there rather than overwritting tags here
        resource.tags = new PxLoaderTags(resource.tags);

        // ensure priority is set
        if (resource.priority == null) {
            resource.priority = Infinity;
        }

        entries.push({
            resource: resource,
            status: ResourceState.QUEUED
        });
    };

    this.addProgressListener = function (callback, tags) {
        progressListeners.push({
            callback: callback,
            tags: new PxLoaderTags(tags)
        });
    };

    this.addCompletionListener = function (_callback, tags) {
        progressListeners.push({
            tags: new PxLoaderTags(tags),
            callback: function callback(e) {
                if (e.completedCount === e.totalCount) {
                    _callback(e);
                }
            }
        });
    };

    // creates a comparison function for resources
    var getResourceSort = function getResourceSort(orderedTags) {

        // helper to get the top tag's order for a resource
        orderedTags = ensureArray(orderedTags);
        var getTagOrder = function getTagOrder(entry) {
            var resource = entry.resource,
                bestIndex = Infinity;
            for (var i = 0; i < resource.tags.length; i++) {
                for (var j = 0; j < Math.min(orderedTags.length, bestIndex); j++) {
                    if (resource.tags.all[i] === orderedTags[j] && j < bestIndex) {
                        bestIndex = j;
                        if (bestIndex === 0) {
                            break;
                        }
                    }
                    if (bestIndex === 0) {
                        break;
                    }
                }
            }
            return bestIndex;
        };
        return function (a, b) {
            // check tag order first
            var aOrder = getTagOrder(a),
                bOrder = getTagOrder(b);
            if (aOrder < bOrder) {
                return -1;
            }
            if (aOrder > bOrder) {
                return 1;
            }

            // now check priority
            if (a.priority < b.priority) {
                return -1;
            }
            if (a.priority > b.priority) {
                return 1;
            }
            return 0;
        };
    };

    this.start = function (orderedTags) {
        timeStarted = Date.now();

        // first order the resources
        var compareResources = getResourceSort(orderedTags);
        entries.sort(compareResources);

        // trigger requests for each resource
        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i];
            entry.status = ResourceState.WAITING;
            entry.resource.start(this);
        }

        // do an initial status check soon since items may be loaded from the cache
        setTimeout(statusCheck, 100);
    };

    var statusCheck = function statusCheck() {
        var checkAgain = false,
            noProgressTime = Date.now() - progressChanged,
            timedOut = noProgressTime >= settings.noProgressTimeout,
            shouldLog = noProgressTime >= settings.loggingDelay;

        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i];
            if (entry.status !== ResourceState.WAITING) {
                continue;
            }

            // see if the resource has loaded
            if (entry.resource.checkStatus) {
                entry.resource.checkStatus();
            }

            // if still waiting, mark as timed out or make sure we check again
            if (entry.status === ResourceState.WAITING) {
                if (timedOut) {
                    entry.resource.onTimeout();
                } else {
                    checkAgain = true;
                }
            }
        }

        // log any resources that are still pending
        if (shouldLog && checkAgain) {
            log();
        }

        if (checkAgain) {
            setTimeout(statusCheck, settings.statusInterval);
        }
    };

    this.isBusy = function () {
        for (var i = 0, len = entries.length; i < len; i++) {
            if (entries[i].status === ResourceState.QUEUED || entries[i].status === ResourceState.WAITING) {
                return true;
            }
        }
        return false;
    };

    var onProgress = function onProgress(resource, statusType) {

        var entry = null,
            i,
            len,
            numResourceTags,
            listener,
            shouldCall;

        // find the entry for the resource
        for (i = 0, len = entries.length; i < len; i++) {
            if (entries[i].resource === resource) {
                entry = entries[i];
                break;
            }
        }

        // we have already updated the status of the resource
        if (entry == null || entry.status !== ResourceState.WAITING) {
            return;
        }
        entry.status = statusType;
        progressChanged = Date.now();

        numResourceTags = resource.tags.length;

        // fire callbacks for interested listeners
        for (i = 0, len = progressListeners.length; i < len; i++) {

            listener = progressListeners[i];
            if (listener.tags.length === 0) {
                // no tags specified so always tell the listener
                shouldCall = true;
            } else {
                // listener only wants to hear about certain tags
                shouldCall = resource.tags.intersects(listener.tags);
            }

            if (shouldCall) {
                sendProgress(entry, listener);
            }
        }
    };

    this.onLoad = function (resource) {
        onProgress(resource, ResourceState.LOADED);
    };
    this.onError = function (resource) {
        onProgress(resource, ResourceState.ERROR);
    };
    this.onTimeout = function (resource) {
        onProgress(resource, ResourceState.TIMEOUT);
    };

    // sends a progress report to a listener
    var sendProgress = function sendProgress(updatedEntry, listener) {
        // find stats for all the resources the caller is interested in
        var completed = 0,
            total = 0,
            i,
            len,
            entry,
            includeResource;
        for (i = 0, len = entries.length; i < len; i++) {

            entry = entries[i];
            includeResource = false;

            if (listener.tags.length === 0) {
                // no tags specified so always tell the listener
                includeResource = true;
            } else {
                includeResource = entry.resource.tags.intersects(listener.tags);
            }

            if (includeResource) {
                total++;
                if (entry.status === ResourceState.LOADED || entry.status === ResourceState.ERROR || entry.status === ResourceState.TIMEOUT) {

                    completed++;
                }
            }
        }

        listener.callback({
            // info about the resource that changed
            resource: updatedEntry.resource,

            // should we expose StatusType instead?
            loaded: updatedEntry.status === ResourceState.LOADED,
            error: updatedEntry.status === ResourceState.ERROR,
            timeout: updatedEntry.status === ResourceState.TIMEOUT,

            // updated stats for all resources
            completedCount: completed,
            totalCount: total
        });
    };

    // prints the status of each resource to the console
    var log = this.log = function (showAll) {
        if (!window.console) {
            return;
        }

        var elapsedSeconds = Math.round((Date.now() - timeStarted) / 1000);
        window.console.log('PxLoader elapsed: ' + elapsedSeconds + ' sec');

        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i];
            if (!showAll && entry.status !== ResourceState.WAITING) {
                continue;
            }

            var message = 'PxLoader: #' + i + ' ' + entry.resource.getName();
            switch (entry.status) {
                case ResourceState.QUEUED:
                    message += ' (Not Started)';
                    break;
                case ResourceState.WAITING:
                    message += ' (Waiting)';
                    break;
                case ResourceState.LOADED:
                    message += ' (Loaded)';
                    break;
                case ResourceState.ERROR:
                    message += ' (Error)';
                    break;
                case ResourceState.TIMEOUT:
                    message += ' (Timeout)';
                    break;
            }

            if (entry.resource.tags.length > 0) {
                message += ' Tags: [' + entry.resource.tags.all.join(',') + ']';
            }

            window.console.log(message);
        }
    };
}

// Tag object to handle tag intersection; once created not meant to be changed
// Performance rationale: http://jsperf.com/lists-indexof-vs-in-operator/3

function PxLoaderTags(values) {

    this.all = [];
    this.first = null; // cache the first value
    this.length = 0;

    // holds values as keys for quick lookup
    this.lookup = {};

    if (values) {

        // first fill the array of all values
        if (Array.isArray(values)) {
            // copy the array of values, just to be safe
            this.all = values.slice(0);
        } else if ((typeof values === 'undefined' ? 'undefined' : _typeof(values)) === 'object') {
            for (var key in values) {
                if (values.hasOwnProperty(key)) {
                    this.all.push(key);
                }
            }
        } else {
            this.all.push(values);
        }

        // cache the length and the first value
        this.length = this.all.length;
        if (this.length > 0) {
            this.first = this.all[0];
        }

        // set values as object keys for quick lookup during intersection test
        for (var i = 0; i < this.length; i++) {
            this.lookup[this.all[i]] = true;
        }
    }
}

// compare this object with another; return true if they share at least one value
PxLoaderTags.prototype.intersects = function (other) {

    // handle empty values case
    if (this.length === 0 || other.length === 0) {
        return false;
    }

    // only a single value to compare?
    if (this.length === 1 && other.length === 1) {
        return this.first === other.first;
    }

    // better to loop through the smaller object
    if (other.length < this.length) {
        return other.intersects(this);
    }

    // loop through every key to see if there are any matches
    for (var key in this.lookup) {
        if (other.lookup[key]) {
            return true;
        }
    }

    return false;
};

// PxLoader plugin to load images
function PxLoaderImage(url, tags, priority, origin) {
    var self = this,
        loader = null;

    this.img = new Image();
    if (origin !== undefined) {
        this.img.crossOrigin = origin;
    }
    this.tags = tags;
    this.priority = priority;

    var onReadyStateChange = function onReadyStateChange() {
        if (self.img.readyState === 'complete') {
            removeEventHandlers();
            loader.onLoad(self);
        }
    };

    var onLoad = function onLoad() {
        removeEventHandlers();
        loader.onLoad(self);
    };

    var onError = function onError() {
        removeEventHandlers();
        loader.onError(self);
    };

    var removeEventHandlers = function removeEventHandlers() {
        self.unbind('load', onLoad);
        self.unbind('readystatechange', onReadyStateChange);
        self.unbind('error', onError);
    };

    this.start = function (pxLoader) {
        // we need the loader ref so we can notify upon completion
        loader = pxLoader;

        // NOTE: Must add event listeners before the src is set. We
        // also need to use the readystatechange because sometimes
        // load doesn't fire when an image is in the cache.
        self.bind('load', onLoad);
        self.bind('readystatechange', onReadyStateChange);
        self.bind('error', onError);

        self.img.src = url;
    };

    // called by PxLoader to check status of image (fallback in case
    // the event listeners are not triggered).
    this.checkStatus = function () {
        if (self.img.complete) {
            removeEventHandlers();
            loader.onLoad(self);
        }
    };

    // called by PxLoader when it is no longer waiting
    this.onTimeout = function () {
        removeEventHandlers();
        if (self.img.complete) {
            loader.onLoad(self);
        } else {
            loader.onTimeout(self);
        }
    };

    // returns a name for the resource that can be used in logging
    this.getName = function () {
        return url;
    };

    // cross-browser event binding
    this.bind = function (eventName, eventHandler) {
        if (self.img.addEventListener) {
            self.img.addEventListener(eventName, eventHandler, false);
        } else if (self.img.attachEvent) {
            self.img.attachEvent('on' + eventName, eventHandler);
        }
    };

    // cross-browser event un-binding
    this.unbind = function (eventName, eventHandler) {
        if (self.img.removeEventListener) {
            self.img.removeEventListener(eventName, eventHandler, false);
        } else if (self.img.detachEvent) {
            self.img.detachEvent('on' + eventName, eventHandler);
        }
    };
}

// add a convenience method to PxLoader for adding an image
PxLoader.prototype.addImage = function (url, tags, priority, origin) {
    var imageLoader = new PxLoaderImage(url, tags, priority, origin);
    this.add(imageLoader);

    // return the img element to the caller
    return imageLoader.img;
};

// Date.now() shim for older browsers
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// shims to ensure we have newer Array utility methods
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

module.exports = PxLoader;

},{}],2:[function(require,module,exports){
'use strict';

module.exports = {
  USER: {
    E_FORMAT: 'EUSER_FORMAT',
    E_SIZE_EXCEEDED: 'EUSER_SIZE_EXCEEDED',
    E_SIZE_INFERIOR: 'EUSER_SIZE_INFERIOR'
  }
};

},{}],3:[function(require,module,exports){
'use strict';

module.exports = {

  _id: null, // Input id.
  _type: null, // The type set.
  _$container: null, // Widget element.
  _$validations: null, // Validations container.
  _$dropzone: null, // Dropzone element.
  _$msg: null, // Message element.
  _url: null, // Uploaded url
  _file: null, // Uploaded file
  _name: null, // Uploaded file name
  _width: null, // Image width
  _height: null, // Image height
  _uploading: false,

  // The kind of file the uploader will treat.
  type: 'all', // String: 'all' | 'image' | 'pdf'

  // This is the initial value
  url: null, // String

  // If `showFileName` and `url` is true, the initial file name. If no file
  // name is provided with an initial `url`, the `url` is set as file name.
  name: '', // String

  // Enable reupload?
  enableReupload: true,

  // When is `type: 'image'`, if the image is treated as background contain,
  // instead of cover and being resized.
  imageContain: false,

  // When is `type: 'image'`, resize the image previsualizator when image is
  // loaded. If this is set to false, the background will have to be resized
  // manually.
  imageResize: true,

  // Minimum and maximum image height.
  imageMinHeight: 100,
  imageMaxHeight: 400,

  // If the file can be removed, insert an option to do so.
  canRemove: true, // Boolean

  // Show the validations visually. Programmer has to attach an event
  // handler to detect errors if set to false.
  showValidations: true,

  // Server response handler.
  handler: null, // function

  // File Uploader options.
  fileupload: {

    // Server request.
    url: '/api/files',
    type: 'POST',
    paramName: 'file',
    //formData: [
    //    { name: 'key', value: 'value' }
    //],

    // Server response.
    dataType: 'json',
    singleFileUploads: true,
    limitMultiFileUploads: 1,
    sequentialUploads: true,

    // Behaviour.
    autoUpload: true,

    // DOM.
    fileInput: null,
    dropZone: null, // Later re-configurated.
    replaceFileInput: false,

    // Validation.
    maxNumberOfFiles: 1, // Only one file per instance.
    minFileSize: 1, // 1 byte
    maxFileSize: 2000000, // 2 MB
    acceptFileTypes: undefined // All file types.
  },

  // The type of files accepted.
  types: {
    'all': {
      name: 'file',
      formats: undefined,
      formatsText: 'any'
    },
    'image': {
      name: 'image',
      formats: /(\.|\/)(gif|jpe?g|png)$/i,
      formatsText: 'JPG, JPEG, PNG and GIF'
    },
    'pdf': {
      name: 'PDF file',
      formats: /(application\/pdf|application\/x\-pdf)/i,
      formatsText: 'PDF'
    }
  },

  messages: {
    UPLOAD: 'Drag and drop {{name}} or browse',
    UPLOADING: 'Uploading',
    REUPLOAD: 'Click to upload a new {{name}}',
    UPLOADED: 'Uploaded',
    ERROR: 'Error, please try again',
    REMOVE: 'Remove {{name}}',
    EUSER_FORMAT: 'File format is invalid. Accepted file types include: {{formatsText}}.',
    EUSER_SIZE_EXCEEDED: 'File exceeds the maximum size: {{maxSize}}. Please use another.',
    EUSER_SIZE_INFERIOR: 'File size is below the minimum size: {{minSize}}. Please use another.'
  },

  icons: {
    UPLOAD: 'mdi mdi-cloud-upload',
    UPLOADING: 'mdi mdi-cloud',
    REUPLOAD: 'mdi mdi-cloud-upload',
    UPLOADED: 'mdi mdi-cloud-check',
    ERROR: 'mdi mdi-alert',
    REMOVE: 'mdi mdi-close'
  }
};

},{}],4:[function(require,module,exports){
'use strict';

var constants = require('./constants');

// Append to the default processQueue:
$.blueimp.fileupload.prototype.options.processQueue.push({
  action: 'vulcanupValidation',
  // Always trigger this action,
  // even if the previous action was rejected:
  always: true,
  // Options taken from the global options map:
  acceptFileTypes: '@',
  maxFileSize: '@',
  minFileSize: '@',
  maxNumberOfFiles: '@',
  disabled: '@disableValidation'
});

// The File Upload Validation plugin extends the fileupload widget
// with file validation functionality:
$.widget('blueimp.fileupload', $.blueimp.fileupload, {

  options: {
    /*
    // The regular expression for allowed file types, matches
    // against either file type or file name:
    acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
    // The maximum allowed file size in bytes:
    maxFileSize: 10000000, // 10 MB
    // The minimum allowed file size in bytes:
    minFileSize: undefined, // No minimal file size
    // The limit of files to be uploaded:
    maxNumberOfFiles: 10,
    */

    // Function returning the current number of files,
    // has to be overriden for maxNumberOfFiles validation:
    getNumberOfFiles: $.noop,

    // Error and info messages:
    messages: {
      maxNumberOfFiles: 'ERROR', //'Maximum number of files exceeded',
      acceptFileTypes: constants.USER.E_FORMAT, //'File type not allowed',
      maxFileSize: constants.USER.E_SIZE_EXCEEDED, //'File is too large',
      minFileSize: constants.USER.E_SIZE_INFERIOR //'File is too small'
    }
  },

  processActions: {

    vulcanupValidation: function vulcanupValidation(data, options) {

      if (options.disabled) {
        return data;
      }

      var dfd = $.Deferred(),
          settings = this.options,
          file = data.files[data.index],
          fileSize;

      if (options.minFileSize || options.maxFileSize) {
        fileSize = file.size;
      }

      if ($.type(options.maxNumberOfFiles) === 'number' && (settings.getNumberOfFiles() || 0) + data.files.length > options.maxNumberOfFiles) {
        file.error = settings.i18n('maxNumberOfFiles');
      } else if (options.acceptFileTypes && !(options.acceptFileTypes.test(file.type) || options.acceptFileTypes.test(file.name))) {
        file.error = settings.i18n('acceptFileTypes');
      } else if (fileSize > options.maxFileSize) {
        file.error = settings.i18n('maxFileSize');
      } else if ($.type(fileSize) === 'number' && fileSize < options.minFileSize) {
        file.error = settings.i18n('minFileSize');
      } else {
        delete file.error;
      }

      if (file.error || data.files.error) {
        data.files.error = true;
        dfd.rejectWith(this, [data]);
      } else {
        dfd.resolveWith(this, [data]);
      }

      return dfd.promise();
    }

  }

});

},{"./constants":2}],5:[function(require,module,exports){
'use strict';

var PxLoader = require('./PxLoader');
var constants = require('./constants');
var utils = require('./utils');

var methods = {

  /**
   * Set a file as uploaded in this instance.
   *
   * @param  {Object} values
   * @param  {String} values.url
   * @param  {String} [values.name]
   */

  update: function update(values) {
    var conf = this.data('vulcanup-config');
    values = $.extend(values, { noXHR: true });
    methods.setUploaded.call(this, values);
    return this;
  },


  /**
   * Get the current file.
   *
   * @return {Object}
   */
  get: function get() {
    var conf = this.data('vulcanup-config');
    return conf._url ? { url: conf._url, name: conf._name } : null;
  },


  /**
   * Set the current instance as empty, ready to upload a new file.
   *
   * @private
   */
  setUpload: function setUpload() {

    var conf = this.data('vulcanup-config');

    conf._url = null;
    conf._name = null;

    methods.reset.call(this);

    var text = utils.format(conf.messages.UPLOAD, conf._type);
    conf._$msg.html('<i class="' + conf.icons.UPLOAD + '"></i> ' + text);
  },


  /**
   * Set the current instance as uploading a file.
   *
   * @private
   */
  setUploading: function setUploading() {

    var conf = this.data('vulcanup-config');

    methods.hideValidation.call(this);
    methods.reset.call(this);

    conf._$container.addClass('vulcanup_uploading');

    var text = utils.format(conf.messages.UPLOADING, conf._type);
    conf._$msg.html('<i class="' + conf.icons.UPLOADING + '"></i> ' + text);

    conf._uploading = true;

    this.trigger('vulcanup-upload');

    methods.updateProgress.call(this, 0);
  },


  /**
   * Update the uploading progress information.
   *
   * @private
   * @param  {Number} progress
   */
  updateProgress: function updateProgress() {
    var progress = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var extra = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


    progress = Math.max(0, progress);
    progress = Math.min(100, progress);

    var conf = this.data('vulcanup-config');

    conf._$container.find('.vulcanup__progressbar span').width(progress + '%');

    if (!extra.silent) {
      this.trigger('vulcanup-progress', progress);
    }
  },


  /**
   * Set the current instance as if an error ocurred.
   *
   * @private
   * @param {Object} info - Information about the error.
   */
  setError: function setError(info) {

    var conf = this.data('vulcanup-config');

    methods.reset.call(this);
    methods.updateProgress.call(this, 100);

    var text = utils.format(conf.messages.ERROR, conf._type);
    conf._$container.addClass('vulcanup_error');
    conf._$msg.html('<i class="' + conf.icons.ERROR + '"></i> ' + text);

    conf._uploading = false;

    this.trigger('vulcanup-error', info);
    this.trigger('vulcanup-complete');
  },


  /**
   * Set the current instance as a file has been uploaded with this.
   *
   * @private
   * @param {Object} settings - The information about the file uploaded.
   */
  setUploaded: function setUploaded(_ref) {
    var url = _ref.url;
    var file = _ref.file;
    var name = _ref.name;
    var initial = _ref.initial;
    var noXHR = _ref.noXHR;


    if (typeof url !== 'string' || !url.length) {
      throw new Error('An URL path is required');
    }

    var conf = this.data('vulcanup-config');

    conf._url = url;
    conf._file = file;
    conf._name = name;

    methods.hideValidation.call(this);
    methods.reset.call(this);
    methods.updateProgress.call(this, 100, { silent: true });
    conf._$container.addClass('vulcanup_uploaded');

    var icon = void 0,
        text = void 0;

    if (conf.enableReupload) {
      icon = '<i class="' + conf.icons.REUPLOAD + '"></i>';
      text = utils.format(conf.messages.REUPLOAD, conf._type);
    } else {
      icon = '<i class="' + conf.icons.UPLOADED + '"></i>';
      text = name ? name : file && file.name ? file.name : utils.format(conf.messages.UPLOADED, conf._type);
    }

    conf._$msg.html(icon + ' ' + text);

    if (conf.type === 'image') {
      methods.loadImage.call(this);
    }

    conf._uploading = false;

    if (!initial) {
      this.trigger('vulcanup-change', {
        url: url,
        name: file && file.name ? file.name : name
      });

      if (!noXHR) {
        this.trigger('vulcanup-uploaded');
        this.trigger('vulcanup-complete');
      }
    }
  },


  /**
   * Reset the current instance styles and states.
   *
   * @private
   */
  reset: function reset() {

    var conf = this.data('vulcanup-config');

    conf._$container.removeClass(['vulcanup_uploading', 'vulcanup_uploaded', 'vulcanup_error'].join(' '));

    conf._$dropzone.removeAttr('style');
  },


  /**
   * When an image has been uploaded, set it on the instance and resize it.
   *
   * @private
   */
  resize: function resize() {

    var conf = this.data('vulcanup-config');

    if (conf.imageResize) {

      var $dropzone = conf._$dropzone;
      var width = conf._width;
      var height = conf._height;
      var dropzoneWidth = $dropzone.width();

      var dropzoneHeight = void 0;

      if (width && height) {
        dropzoneHeight = Math.round(dropzoneWidth * height / width);
      } else {
        dropzoneHeight = Math.round(dropzoneWidth * 0.55);
      }

      if (conf.imageMinHeight) {
        dropzoneHeight = Math.max(dropzoneHeight, conf.imageMinHeight);
      }
      if (conf.imageMaxHeight) {
        dropzoneHeight = Math.min(dropzoneHeight, conf.imageMaxHeight);
      }

      $dropzone.height(dropzoneHeight);
    }
  },


  /**
   * When an image has been uploaded, load the image in the instance.
   *
   * @private
   * @param  {String} url - File image URL.
   */
  loadImage: function loadImage(url) {
    var _this = this;

    var conf = this.data('vulcanup-config');

    url = url || conf._url || conf.url;
    conf._url = url;

    var $input = $(this);
    var $dropzone = conf._$dropzone;
    var loader = new PxLoader();
    var img = loader.addImage(url);

    methods.resize.call(this);

    $dropzone.css('background-image', 'url(' + url + ')');

    loader.addCompletionListener(function () {

      var width = img.naturalWidth || img.width;
      var height = img.naturalHeight || img.height;

      conf._width = width;
      conf._height = height;

      methods.resize.call(_this);
    });

    loader.start();
  },
  setValidation: function setValidation(err) {

    var conf = this.data('vulcanup-config');
    var msgFormat = conf.messages[err];
    var msgConf = $.extend({}, conf._type, {
      minSize: utils.formatSize(conf.fileupload.minFileSize),
      maxSize: utils.formatSize(conf.fileupload.maxFileSize)
    });
    var msg = utils.format(msgFormat, msgConf);

    this.trigger('vulcanup-val', { error: msg });

    if (conf.showValidations) {
      conf._$validations.html(msg).hide(0).show(300);
    }
  },
  hideValidation: function hideValidation() {
    var conf = this.data('vulcanup-config');
    if (conf.showValidations) {
      conf._$validations.hide(300);
    }
  }
};

module.exports = methods;

},{"./PxLoader":1,"./constants":2,"./utils":7}],6:[function(require,module,exports){
'use strict';

module.exports = {

  main: ['<div class="vulcanup">', '<i class="vulcanup__remove {{icons.REMOVE}}" title=""></i>', '<label class="vulcanup__dropzone" for="{{_id}}">', '<div class="vulcanup__placeholder">', '<span class="vulcanup__placeholder__content">', '<span class="vulcanup__msg"></span>', '</span>', '</div>', '</label>', '<div class="vulcanup__progressbar">', '<span></span>', '</div>', '</div>'].join(''),

  validations: ['<div class="vulcanup-validations"></div>'].join('.')

};

},{}],7:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var utils = {
  removeArrayDuplicates: function removeArrayDuplicates(arr) {
    'use strict';

    var obj = {};
    for (var i = 0; i < arr.length; i++) {
      obj[arr[i]] = true;
    }

    arr = [];
    for (var key in obj) {
      arr.push(key);
    }

    return arr;
  },
  format: function format(str, params) {
    'use strict';

    str = String(str);
    params = params || {};

    var walk = function walk(obj, list, i) {
      if (!list[i]) return;
      if (_typeof(obj[list[i]]) === 'object') {
        return walk(obj[list[i]], list, i + 1);
      } else {
        return obj[list[i]];
      }
    };

    var name = void 0,
        value = void 0;
    var props = str.match(/\{\{\w+(\w|\.\w+)*\}\}/g);

    if (props && props.length) {

      props = utils.removeArrayDuplicates(props);
      props = props.map(function (p) {
        return p.replace('{{', '').replace('}}', '').split('.');
      });

      for (var i = 0; i < props.length; i++) {
        value = walk(params, props[i], 0);
        if (value) {
          name = props[i].join('.');
          str = str.replace(new RegExp('{{' + name + '}}', 'g'), value);
        }
      }
    }

    return str;
  },
  formatSize: function formatSize(bytes) {
    'use strict';

    var scale = 'B';
    bytes = Number(bytes);

    if (bytes >= 1000000) {
      scale = 'MB';
      bytes = bytes / 1000000;
    } else if (bytes >= 1000) {
      scale = 'KB';
      bytes = bytes / 1000;
    }

    return bytes + ' ' + scale;
  }
};

module.exports = utils;

},{}],8:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

require('./jup-validation');

var templates = require('./templates');
var constants = require('./constants');
var defaults = require('./defaults');
var methods = require('./methods');
var utils = require('./utils');

$(document).on('drop dragover', function (e) {
  e.preventDefault();
});

jQuery.fn.vulcanup = function (settings) {
  'use strict';

  var $input = $(this).first();

  if (typeof settings === 'string') {
    if (methods[settings]) {
      if (!$input.data('vulcanup-config')) {
        throw new Error('vulcanup element is not instantiated, cannot invoke methods');
      }
      var args = Array.prototype.slice.call(arguments, 1);
      return methods[settings].apply($input, args);
    } else {
      throw new Error('vulcanup method unrecognized "' + settings + '".');
    }
  }

  if ($input.data('vulcanup-config')) return this;

  //
  // CONFIGURATION
  //
  var id = $input.attr('id');
  if (!id) {
    id = 'vulcanup-' + new Date().getTime();
    $input.attr('id', id);
  }

  if ($input.attr('multiple') !== undefined) {
    throw new Error('Input type file cannot be multiple');
  }

  var conf = $.extend(true, {}, defaults, settings, {
    _id: id,
    fileupload: {
      fileInput: $input
    }
  });

  // File type validation.
  if (conf.types[conf.type]) {
    conf._type = conf.types[conf.type];
    conf.fileupload.acceptFileTypes = conf._type.formats;
  } else {
    throw new Error('A valid type of file is required');
  }

  $input.data('vulcanup-config', conf);

  //
  // DOM
  //
  var $container = $(utils.format(templates.main, conf));
  var $validations = $(utils.format(templates.validations, conf));
  var $remove = $container.find('.vulcanup__remove');
  var $dropzone = $container.find('.vulcanup__dropzone');
  var $msg = $container.find('.vulcanup__msg');

  $remove.attr('title', utils.format(conf.messages.REMOVE, conf._type));
  $input.addClass('vulcanup-input vulcanup-input__hidden');
  $input.after($container);
  $container.after($validations);

  conf.fileupload.dropZone = $container;
  conf._$validations = $validations;
  conf._$container = $container;
  conf._$dropzone = $dropzone;
  conf._$msg = $msg;

  if (conf.type === 'image') {
    $container.addClass('vulcanup_isimage');
  }
  if (conf.imageContain) {
    $container.addClass('vulcanup_isimagecontain');
  }
  if (!conf.enableReupload) {
    $container.addClass('vulcanup_noreupload');
  }
  if (conf.canRemove) {
    $container.addClass('vulcanup_canremove');
  }

  //
  // EVENTS
  //
  $input.

  // On click.
  on('click', function (e) {
    if (conf._uploading || conf._url && !conf.enableReupload) {
      e.preventDefault();
      return false;
    }
  }).

  // On user error.
  on('fileuploadprocessfail', function (e, info) {
    var err = info.files[0].error;
    methods.setValidation.call($input, err);
  }).

  // On send.
  on('fileuploadsend', function (e, data) {
    methods.setUploading.call($input);
  }).

  // On server progress.
  on('fileuploadprogressall', function (e, data) {
    var progress = parseInt(data.loaded / data.total * 100, 10);
    methods.updateProgress.call($input, progress);
  }).

  // On server success.
  on('fileuploaddone', function (e, data) {

    var files = data.files;
    var result = data.result;

    if (conf.handler) {

      var info = conf.handler(result);

      if ((typeof info === 'undefined' ? 'undefined' : _typeof(info)) !== 'object') {
        methods.setError.call($input);
        throw new Error('handler should return file object info');
      }

      if (typeof info.url !== 'string') {
        methods.setError.call($input);
        throw new Error('handler should return file url property');
      }

      methods.setUploaded.call($input, {
        url: info.url,
        file: files[0]
      });
    } else if (result && result.files && result.files.length) {
      methods.setUploaded.call($input, {
        url: result.files[0].url,
        file: files[0]
      });
    } else {
      methods.setError.call($input);
    }
  }).

  // On server error.
  on('fileuploadfail', function (e, data) {
    methods.setError.call($input);
  });

  $dropzone.on('dragenter dragover', function (e) {
    $container.addClass('vulcanup_dragover');
  }).on('dragleave drop', function (e) {
    $container.removeClass('vulcanup_dragover');
  });

  $container.find('.vulcanup__remove').on('click', function (e) {
    e.preventDefault();

    methods.updateProgress.call($input, 0, { silent: true });
    methods.setUpload.call($input);

    $input.trigger('vulcanup-delete');
    $input.trigger('vulcanup-change', { url: null, name: null });

    return false;
  });

  //
  // CREATING AND SETTING
  //
  $input.fileupload(conf.fileupload);

  if (conf.url) {
    methods.setUploaded.call(this, {
      url: conf.url,
      name: conf.name,
      initial: true
    });
  } else {
    methods.setUpload.call(this);
  }

  return this;
};

},{"./constants":2,"./defaults":3,"./jup-validation":4,"./methods":5,"./templates":6,"./utils":7}]},{},[8]);
