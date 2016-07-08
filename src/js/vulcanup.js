require('./jup-validation');

const templates = require('./templates');
const constants = require('./constants');
const defaults = require('./defaults');
const methods = require('./methods');
const utils = require('./utils');


$(document).on('drop dragover', function (e) {
  e.preventDefault();
});


jQuery.fn.vulcanup = function (settings) {
  'use strict';

  const $input = $(this).first();

  if (typeof settings === 'string') {
    if (methods[settings]) {
			if (!$input.data(`vulcanup-config`)) {
				throw new Error(`vulcanup element is not instantiated, cannot invoke methods`);
			}
      const args = Array.prototype.slice.call(arguments, 1);
      return methods[settings].apply($input, args);
    } else {
      throw new Error(`vulcanup method unrecognized "${settings}".`);
    }
  }

  if ($input.data(`vulcanup-config`)) return this;

  //
  // CONFIGURATION
  //
  let id = $input.attr('id');
  if (!id) {
    id = 'vulcanup-'+ (new Date()).getTime();
    $input.attr('id', id);
  }

  if ($input.attr('multiple') !== undefined) {
    throw new Error('Input type file cannot be multiple');
  }

  const conf = $.extend(true, {}, defaults, settings, {
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

  $input.data(`vulcanup-config`, conf);


  //
  // DOM
  //
  const $container = $(utils.format(templates.main, conf));
  const $validations = $(utils.format(templates.validations, conf));
  const $remove = $container.find('.vulcanup__remove');
  const $dropzone = $container.find('.vulcanup__dropzone');
  const $msg = $container.find('.vulcanup__msg');

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
      if (conf._uploading || (conf._url && !conf.enableReupload)) {
        e.preventDefault();
        return false;
      }
    }).

    // On user error.
    on('fileuploadprocessfail', function (e, info) {
      const err = info.files[0].error;
      methods.setValidation.call($input, err);
    }).

    // On send.
    on('fileuploadsend', function (e, data) {
      methods.setUploading.call($input);
    }).

    // On server progress.
    on('fileuploadprogressall', function (e, data) {
      const progress = parseInt(data.loaded / data.total * 100, 10);
      methods.updateProgress.call($input, progress);
    }).

    // On server success.
    on('fileuploaddone', function (e, data) {

      const files = data.files;
      const result = data.result;

      if (conf.handler) {

        const info = conf.handler(result);

        if (typeof info !== 'object') {
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
      }

      else if (result && result.files && result.files.length) {
        methods.setUploaded.call($input, {
          url: result.files[0].url,
          file: files[0]
        });
      }

      else {
        methods.setError.call($input);
      }
    }).

    // On server error.
    on('fileuploadfail', function (e, data) {
      methods.setError.call($input);
    });

  $dropzone.
    on('dragenter dragover', e => {
      $container.addClass('vulcanup_dragover');
    }).
    on('dragleave drop', e => {
      $container.removeClass('vulcanup_dragover');
    });

  $container.find('.vulcanup__remove').on('click', function (e) {
    e.preventDefault();

    methods.updateProgress.call($input, 0, {silent: true});
    methods.setUpload.call($input);

    $input.trigger(`vulcanup-delete`);
    $input.trigger(`vulcanup-change`, { url: null, name: null });

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
