const PxLoader = require('./PxLoader');
const constants = require('./constants');
const utils = require('./utils');

const methods = {

  /**
   * ***Invoke over instantiated elements.***
   *
   * Update the current file as uploaded.
   *
   * @function external:"jQuery.fn".vulcanup
   *
   * @param  {String} update - With value `'update'`.
   * @param  {Object} fileInfo - The file details.
   * @param  {String} fileInfo.url - The file URL.
   * @param  {String} [fileInfo.name] - The file name.
   *
   * @return {jQuery} The same element.
   *
   * @example
   * $('#inputFile').vulcanup('update', {
   *   url: '/path/to/file.ext'
   * });
   */
  update (values) {
    const conf = this.data(`vulcanup-config`);
    values = $.extend(values, {noXHR: true});
    methods.setUploaded.call(this, values);
    return this;
  },

  /**
   * ***Invoke over instantiated elements.***
   *
   * Get the current uploaded file.
   *
   * @function external:"jQuery.fn".vulcanup
   *
   * @param  {String} get - With value `'get'`.
   * @return {Object|null} The file info or null if there is no file.
   *
   * @example
   * const fileInfo = $('#inputFile').vulcanup('get');  // { url, name }
   */
  get () {
    const conf = this.data(`vulcanup-config`);
    return conf._url ? { url: conf._url, name: conf._name } : null;
  },

  /**
   * Set the current instance as empty, ready to upload a new file.
   *
   * @private
   */
  setUpload () {

    const conf = this.data(`vulcanup-config`);

    conf._url = null;
    conf._name = null;

    methods.reset.call(this);

    const text = utils.format(conf.messages.UPLOAD, conf._type);
    conf._$msg.html(`<i class="${conf.icons.UPLOAD}"></i> ${text}`);
  },

  /**
   * Set the current instance as uploading a file.
   *
   * @private
   */
  setUploading () {

    const conf = this.data(`vulcanup-config`);

    methods.hideValidation.call(this);
    methods.reset.call(this);

    conf._$container.addClass('vulcanup_uploading');

    const text = utils.format(conf.messages.UPLOADING, conf._type);
    conf._$msg.html(`<i class="${conf.icons.UPLOADING}"></i> ${text}`);

    conf._uploading = true;

    this.trigger(`vulcanup-upload`);

    methods.updateProgress.call(this, 0);
  },

  /**
   * Update the uploading progress information.
   *
   * @private
   * @param  {Number} progress
   */
  updateProgress (progress = 0, extra = {}) {

    progress = Math.max(0, progress);
    progress = Math.min(100, progress);

    const conf = this.data(`vulcanup-config`);

    conf._$container.find('.vulcanup__progressbar span').width(`${progress}%`);

    if (!extra.silent) {
      this.trigger(`vulcanup-progress`, progress);
    }
  },

  /**
   * Set the current instance as if an error ocurred.
   *
   * @private
   * @param {Object} info - Information about the error.
   */
  setError (info) {

    const conf = this.data(`vulcanup-config`);

    methods.reset.call(this);
    methods.updateProgress.call(this, 100);

    const text = utils.format(conf.messages.ERROR, conf._type);
    conf._$container.addClass('vulcanup_error');
    conf._$msg.html(`<i class="${conf.icons.ERROR}"></i> ${text}`);

    conf._uploading = false;

    this.trigger(`vulcanup-error`, info);
    this.trigger(`vulcanup-complete`);
  },

  /**
   * Set the current instance as a file has been uploaded with this.
   *
   * @private
   * @param {Object} settings - The information about the file uploaded.
   */
  setUploaded ({ url, file, name, initial, noXHR }) {

    if (typeof url !== 'string' || !url.length) {
      throw new Error('An URL path is required');
    }

    const conf = this.data(`vulcanup-config`);

    conf._url = url;
    conf._file = file;
    conf._name = name;

    methods.hideValidation.call(this);
    methods.reset.call(this);
    methods.updateProgress.call(this, 100, {silent: true});
    conf._$container.addClass('vulcanup_uploaded');

    let icon, text;

    if (conf.enableReupload) {
      icon = `<i class="${conf.icons.REUPLOAD}"></i>`;
      text = utils.format(conf.messages.REUPLOAD, conf._type);
    }
    else {
      icon = `<i class="${conf.icons.UPLOADED}"></i>`;
      text = name ? name :
        file && file.name ? file.name :
        utils.format(conf.messages.UPLOADED, conf._type);
    }

    conf._$msg.html(`${icon} ${text}`);

    if (conf.type === 'image') {
      methods.loadImage.call(this);
    }

    conf._uploading = false;

    if (!initial) {
      this.trigger(`vulcanup-change`, {
        url,
        name: file && file.name ? file.name : name
      });

      if (!noXHR) {
        this.trigger(`vulcanup-uploaded`);
        this.trigger(`vulcanup-complete`);
      }
    }
  },

  /**
   * Reset the current instance styles and states.
   *
   * @private
   */
  reset () {

    const conf = this.data(`vulcanup-config`);

    conf._$container.
      removeClass([
        'vulcanup_uploading',
        'vulcanup_uploaded',
        'vulcanup_error',
      ].join(' '));

    conf._$dropzone.removeAttr('style');
  },

  /**
   * When an image has been uploaded, set it on the instance and resize it.
   *
   * @private
   */
  resize () {

    const conf = this.data(`vulcanup-config`);

    if (conf.imageResize) {

      const $dropzone = conf._$dropzone;
      const width = conf._width;
      const height = conf._height;
      const dropzoneWidth = $dropzone.width();

      let dropzoneHeight;

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
  loadImage (url) {

    const conf = this.data(`vulcanup-config`);

    url = url || conf._url || conf.url;
    conf._url = url;

    const $input = $(this);
    const $dropzone = conf._$dropzone;
    const loader = new PxLoader();
    const img = loader.addImage(url);

    methods.resize.call(this);

    $dropzone.css('background-image', `url(${url})`);

    loader.addCompletionListener(() => {

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      conf._width = width;
      conf._height = height;

      methods.resize.call(this);
    });

    loader.start();
  },

  /**
   * Set validation error message.
   *
   * @private
   * @param {String} err
   */
  setValidation (err) {

    const conf = this.data(`vulcanup-config`);
    const msgFormat = conf.messages[err];
    const msgConf = $.extend({}, conf._type, {
      minSize: utils.formatSize(conf.fileupload.minFileSize),
      maxSize: utils.formatSize(conf.fileupload.maxFileSize)
    });
    const msg = utils.format(msgFormat, msgConf);

    this.trigger('vulcanup-val', { error: msg });

    if (conf.showValidations) {
      conf._$validations.html(msg).hide(0).show(300);
    }
  },

  /**
   * Hide validation errors.
   *
   * @private
   */
  hideValidation () {
    const conf = this.data(`vulcanup-config`);
    if (conf.showValidations) {
      conf._$validations.hide(300);
    }
  }
};

module.exports = methods;
