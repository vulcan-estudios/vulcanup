/**
 * @namespace settings
 * @type {Object}
 *
 * @description
 * vulcanup settings by default.
 */
const settings = {

  _id: null,  // Input id.
  _type: null,  // The type set.
  _$container: null,  // Widget element.
  _$validations: null,  // Validations container.
  _$dropzone: null,  // Dropzone element.
  _$msg: null,  // Message element.
  _url: null,  // Uploaded url
  _file: null,  // Uploaded file
  _name: null,  // Uploaded file name
  _width: null,  // Image width
  _height: null,  // Image height
  _uploading: false,  // Currently uploading a file.

  /**
   * The kind of file the uploader will treat: `all` | `image` | `pdf`.
   * @type {String}
   * @default 'all'
   */
  type: 'all',

  /**
   * This is the initial value.
   * @type {String}
   * @default null
   */
  url: null,

  /**
   * If there is an url, the initial file name. Is optional.
   * @type {String}
   * @default ''
   */
  name: '',

  /**
   * Enable file reupload. If false, once the file is uploaded, you have to delete
   * it in order to upload another in its place.
   * @type {Boolean}
   * @default true
   */
  enableReupload: true,

  /**
   * On type image, if the image is treated as background contain, instead of
   * cover and being resized.
   * @type {Boolean}
   * @default false
   */
  imageContain: false,

  /**
   * On type image, resize the image visualizator when the image is loaded. If
   * this is set to false, the background will have to be resized manually.
   * @type {Boolean}
   * @default true
   */
  imageResize: true,

  /**
   * Minimum image height in pixels.
   * @type {Number}
   * @default 100
   */
  imageMinHeight: 100,

  /**
   * Maximum image height in pixels.
   * @type {Number}
   * @default 400
   */
  imageMaxHeight: 400,

  /**
   * If the file can be removed, insert an option to do so.
   * @type {Boolean}
   * @default true
   */
  canRemove: true,

  /**
   * Show the validations visually. Programmer has to attach an event handler to
   * detect errors if set to false.
   * @type {Boolean}
   * @default true
   */
  showValidations: true,

  /**
   * Server response handler. If set, this will overwrite the way to treat the
   * response from server when the file is uploaded. This function receives as
   * first parameter the response from server and have to return an object with
   * the an `url` property with the file url.
   * @type {Function}
   * @default null
   */
  handler: null,

  /**
   * File upload plugin options.
   * @type {Object}
   */
  fileupload: {

    /**
     * URL to upload files.
     * @type {String}
     * @default '/api/files'
     */
    url: '/api/files',

    /**
     * XHR type.
     * @type {String}
     * @default 'POST'
     */
    type: 'POST',

    /**
     * The file param name.
     * @type {String}
     * @default 'file'
     */
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
    dropZone: null,  // Later re-configurated.
    replaceFileInput: false,

    // Validation.
    maxNumberOfFiles: 1,  // Only one file per instance.

    /**
     * minFileSize in bytes
     * @type {Number}
     * @default 1 (1 byte)
     */
    minFileSize: 1,

    /**
     * maxFileSize in bytes
     * @type {Number}
     * @default 2000000 (2MB)
     */
    maxFileSize: 2000000,

    /**
     * acceptFileTypes
     * @type {RegExp}
     * @default undefined (any file)
     */
    acceptFileTypes: undefined
  },

  /**
   * The type of files accepted. Every property (the type id) should be an object describing:
   * - {String} name - The name of the file for the user.
   * - {RegExp} formats - The regexp to validate the file type.
   * - {String} formatsText - The list of formats for the user.
   * @type {Object}
   */
  types: {
    'all': {
      name: 'file',
      formats: undefined,
      formatsText: 'any',
    },
    'image': {
      name: 'image',
      formats: /(\.|\/)(gif|jpe?g|png)$/i,
      formatsText: 'JPG, JPEG, PNG and GIF',
    },
    'pdf': {
      name: 'PDF file',
      formats: /(application\/pdf|application\/x\-pdf)/i,
      formatsText: 'PDF',
    }
  },

  /**
   * All messages used.
   * @type {Object}
   */
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

  /**
   * All icons used.
   * @type {Object}
   */
  icons: {
    UPLOAD: 'mdi mdi-cloud-upload',
    UPLOADING: 'mdi mdi-cloud',
    REUPLOAD: 'mdi mdi-cloud-upload',
    UPLOADED: 'mdi mdi-cloud-check',
    ERROR: 'mdi mdi-alert',
    REMOVE: 'mdi mdi-close'
  }
};

module.exports = settings;
