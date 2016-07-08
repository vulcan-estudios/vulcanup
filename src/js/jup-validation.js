const constants = require('./constants');

// Append to the default processQueue:
$.blueimp.fileupload.prototype.options.processQueue.push(
  {
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
  }
);

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

    vulcanupValidation: function (data, options) {

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

      if ($.type(options.maxNumberOfFiles) === 'number' &&
          (settings.getNumberOfFiles() || 0) + data.files.length >
            options.maxNumberOfFiles) {
        file.error = settings.i18n('maxNumberOfFiles');
      }
      else if (options.acceptFileTypes &&
          !(options.acceptFileTypes.test(file.type) ||
          options.acceptFileTypes.test(file.name))) {
        file.error = settings.i18n('acceptFileTypes');
      }
      else if (fileSize > options.maxFileSize) {
        file.error = settings.i18n('maxFileSize');
      }
      else if ($.type(fileSize) === 'number' &&
          fileSize < options.minFileSize) {
        file.error = settings.i18n('minFileSize');
      }
      else {
        delete file.error;
      }

      if (file.error || data.files.error) {
        data.files.error = true;
        dfd.rejectWith(this, [data]);
      }
      else {
        dfd.resolveWith(this, [data]);
      }

      return dfd.promise();
    }

  }

});
