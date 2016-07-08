const express = require('express');
const upload = require('jquery-file-upload-middleware');

const app = express();
const port = process.env.PORT || 7500;

upload.configure({
  uploadDir: __dirname + '/uploads',
  uploadUrl: '/demo/uploads',
});

app.use(express.static(__dirname.replace(/demo$/, '')));
app.use('/api/files', upload.fileHandler());
app.get('/', (req, res) => res.redirect('/demo'));

app.listen(port, function(err) {
  if (err) throw err;
  console.log('server running at http://127.0.0.1:' + port);
});
