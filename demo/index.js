(function () {

  $('#file1').vulcanup();


  $('#file2').vulcanup({
    name: 'Vulcan-Up-Image-Name.pdf',
    url: '/demo/uploads/example.pdf'
  });


  $('#file3').vulcanup({
    type: 'image',
    name: 'Vulcan-Up-Image-Name.jpg',
    url: '/demo/uploads/example.jpg',
    fileupload: {
      url: '/api/files',
      minFileSize: 2000000,  // 2 MB
      maxFileSize: 10000000  // 10 MB
    },
    handler (result) {
      // { files: [ { url } ] }
      return {
        url: result.files[0].url
      };
    }
  });

  $('#file3-get').on('click', function (e) {
    const file = $('#file3').vulcanup('get');
    $('#file3-info').html(JSON.stringify(file));
  });


  $('#file4').vulcanup({
    type: 'pdf',
    enableReupload: false,
    canRemove: false,
    fileupload: {
      url: '/api/wrong-endpoint'
    }
  });

  $('#file4-update').on('click', function (e) {
    $('#file4').vulcanup('update', {
      name: 'Vulcan-Up-File-Name.pdf',
      url: '/demo/uploads/example.pdf'
    });
  });


  $('form').on('submit', function (e) {
    e.preventDefault();
    return false;
  });


  $('input[type=file]').
    on('vulcanup-val', function (e, info) {
      console.log($(e.target).attr('id'), 'val', info);
    }).
    on('vulcanup-upload', function (e, info) {
      console.log($(e.target).attr('id'), 'upload', info);
    }).
    on('vulcanup-progress', function (e, info) {
      console.log($(e.target).attr('id'), 'progress', info);
    }).
    on('vulcanup-error', function (e, info) {
      console.log($(e.target).attr('id'), 'error', info);
    }).
    on('vulcanup-change', function (e, info) {
      console.log($(e.target).attr('id'), 'changed', info);
    }).
    on('vulcanup-delete', function (e, info) {
      console.log($(e.target).attr('id'), 'delete', info);
    }).
    on('vulcanup-uploaded', function (e, info) {
      console.log($(e.target).attr('id'), 'uploaded', info);
    }).
    on('vulcanup-complete', function (e, info) {
      console.log($(e.target).attr('id'), 'complete', info);
    });

})();
