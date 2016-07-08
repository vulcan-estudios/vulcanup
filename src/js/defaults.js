module.exports = {

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
  _uploading: false,

  // The kind of file the uploader will treat.
  type: 'all',  // String: 'all' | 'image' | 'pdf'

  // This is the initial value
  url: null,  // String

  // If `showFileName` and `url` is true, the initial file name. If no file
  // name is provided with an initial `url`, the `url` is set as file name.
  name: '',  // String

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
  canRemove: true,  // Boolean

  // Show the validations visually. Programmer has to attach an event
  // handler to detect errors if set to false.
  showValidations: true,

  // Server response handler.
  handler: null,  // function

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
    dropZone: null,  // Later re-configurated.
    replaceFileInput: false,

    // Validation.
    maxNumberOfFiles: 1,  // Only one file per instance.
    minFileSize: 1,  // 1 byte
    maxFileSize: 2000000,  // 2 MB
    acceptFileTypes: undefined // All file types.
  },

  // The type of files accepted.
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
