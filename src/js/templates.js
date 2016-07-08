module.exports = {

  main: [
    '<div class="vulcanup">',

      '<i class="vulcanup__remove {{icons.REMOVE}}" title=""></i>',

      '<label class="vulcanup__dropzone" for="{{_id}}">',
        '<div class="vulcanup__placeholder">',
          '<span class="vulcanup__placeholder__content">',
            '<span class="vulcanup__msg"></span>',
          '</span>',
        '</div>',
      '</label>',

      '<div class="vulcanup__progressbar">',
        '<span></span>',
      '</div>',

    '</div>'
  ].join(''),

  validations: [
    '<div class="vulcanup-validations"></div>'
  ].join('.')

};
