## Objects

<dl>
<dt><a href="#settings">settings</a> : <code>object</code></dt>
<dd><p>vulcanup settings by default.</p>
</dd>
</dl>

## External

<dl>
<dt><a href="#external_jQuery">jQuery</a></dt>
<dd><p>jQuery object.</p>
</dd>
<dt><a href="#external_jQuery.fn">jQuery.fn</a></dt>
<dd><p>The jQuery plugin namespace.</p>
</dd>
<dt><a href="#external_jQuery.vulcanup">jQuery.vulcanup</a></dt>
<dd><p>The plugin global configuration object.</p>
</dd>
</dl>

<a name="settings"></a>

## settings : <code>object</code>
vulcanup settings by default.

**Kind**: global namespace  

* [settings](#settings) : <code>object</code>
    * [.type](#settings.type) : <code>String</code>
    * [.url](#settings.url) : <code>String</code>
    * [.name](#settings.name) : <code>String</code>
    * [.enableReupload](#settings.enableReupload) : <code>Boolean</code>
    * [.imageContain](#settings.imageContain) : <code>Boolean</code>
    * [.imageResize](#settings.imageResize) : <code>Boolean</code>
    * [.imageMinHeight](#settings.imageMinHeight) : <code>Number</code>
    * [.imageMaxHeight](#settings.imageMaxHeight) : <code>Number</code>
    * [.canRemove](#settings.canRemove) : <code>Boolean</code>
    * [.showValidations](#settings.showValidations) : <code>Boolean</code>
    * [.handler](#settings.handler) : <code>function</code>
    * [.fileupload](#settings.fileupload) : <code>Object</code>
        * [.url](#settings.fileupload.url) : <code>String</code>
        * [.type](#settings.fileupload.type) : <code>String</code>
        * [.paramName](#settings.fileupload.paramName) : <code>String</code>
        * [.minFileSize](#settings.fileupload.minFileSize) : <code>Number</code>
        * [.maxFileSize](#settings.fileupload.maxFileSize) : <code>Number</code>
        * [.acceptFileTypes](#settings.fileupload.acceptFileTypes) : <code>RegExp</code>
    * [.types](#settings.types) : <code>Object</code>
    * [.messages](#settings.messages) : <code>Object</code>
    * [.icons](#settings.icons) : <code>Object</code>

<a name="settings.type"></a>

### settings.type : <code>String</code>
The kind of file the uploader will treat: `all` | `image` | `pdf`.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>&#x27;all&#x27;</code>  
<a name="settings.url"></a>

### settings.url : <code>String</code>
This is the initial value.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>null</code>  
<a name="settings.name"></a>

### settings.name : <code>String</code>
If there is an url, the initial file name. Is optional.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>&#x27;&#x27;</code>  
<a name="settings.enableReupload"></a>

### settings.enableReupload : <code>Boolean</code>
Enable file reupload. If false, once the file is uploaded, you have to delete
it in order to upload another in its place.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>true</code>  
<a name="settings.imageContain"></a>

### settings.imageContain : <code>Boolean</code>
On type image, if the image is treated as background contain, instead of
cover and being resized.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>false</code>  
<a name="settings.imageResize"></a>

### settings.imageResize : <code>Boolean</code>
On type image, resize the image visualizator when the image is loaded. If
this is set to false, the background will have to be resized manually.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>true</code>  
<a name="settings.imageMinHeight"></a>

### settings.imageMinHeight : <code>Number</code>
Minimum image height in pixels.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>100</code>  
<a name="settings.imageMaxHeight"></a>

### settings.imageMaxHeight : <code>Number</code>
Maximum image height in pixels.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>400</code>  
<a name="settings.canRemove"></a>

### settings.canRemove : <code>Boolean</code>
If the file can be removed, insert an option to do so.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>true</code>  
<a name="settings.showValidations"></a>

### settings.showValidations : <code>Boolean</code>
Show the validations visually. Programmer has to attach an event handler to
detect errors if set to false.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>true</code>  
<a name="settings.handler"></a>

### settings.handler : <code>function</code>
Server response handler. If set, this will overwrite the way to treat the
response from server when the file is uploaded. This function receives as
first parameter the response from server and have to return an object with
the an `url` property with the file url.

**Kind**: static property of <code>[settings](#settings)</code>  
**Default**: <code>null</code>  
<a name="settings.fileupload"></a>

### settings.fileupload : <code>Object</code>
File upload plugin options.

**Kind**: static property of <code>[settings](#settings)</code>  

* [.fileupload](#settings.fileupload) : <code>Object</code>
    * [.url](#settings.fileupload.url) : <code>String</code>
    * [.type](#settings.fileupload.type) : <code>String</code>
    * [.paramName](#settings.fileupload.paramName) : <code>String</code>
    * [.minFileSize](#settings.fileupload.minFileSize) : <code>Number</code>
    * [.maxFileSize](#settings.fileupload.maxFileSize) : <code>Number</code>
    * [.acceptFileTypes](#settings.fileupload.acceptFileTypes) : <code>RegExp</code>

<a name="settings.fileupload.url"></a>

#### fileupload.url : <code>String</code>
URL to upload files.

**Kind**: static property of <code>[fileupload](#settings.fileupload)</code>  
**Default**: <code>&#x27;/api/files&#x27;</code>  
<a name="settings.fileupload.type"></a>

#### fileupload.type : <code>String</code>
XHR type.

**Kind**: static property of <code>[fileupload](#settings.fileupload)</code>  
**Default**: <code>&#x27;POST&#x27;</code>  
<a name="settings.fileupload.paramName"></a>

#### fileupload.paramName : <code>String</code>
The file param name.

**Kind**: static property of <code>[fileupload](#settings.fileupload)</code>  
**Default**: <code>&#x27;file&#x27;</code>  
<a name="settings.fileupload.minFileSize"></a>

#### fileupload.minFileSize : <code>Number</code>
minFileSize in bytes

**Kind**: static property of <code>[fileupload](#settings.fileupload)</code>  
**Default**: <code>1 (1 byte)</code>  
<a name="settings.fileupload.maxFileSize"></a>

#### fileupload.maxFileSize : <code>Number</code>
maxFileSize in bytes

**Kind**: static property of <code>[fileupload](#settings.fileupload)</code>  
**Default**: <code>2000000 (2MB)</code>  
<a name="settings.fileupload.acceptFileTypes"></a>

#### fileupload.acceptFileTypes : <code>RegExp</code>
acceptFileTypes

**Kind**: static property of <code>[fileupload](#settings.fileupload)</code>  
**Default**: <code>undefined (any file)</code>  
<a name="settings.types"></a>

### settings.types : <code>Object</code>
The type of files accepted. Every property (the type id) should be an object describing:
- {String} name - The name of the file for the user.
- {RegExp} formats - The regexp to validate the file type.
- {String} formatsText - The list of formats for the user.

**Kind**: static property of <code>[settings](#settings)</code>  
<a name="settings.messages"></a>

### settings.messages : <code>Object</code>
All messages used.

**Kind**: static property of <code>[settings](#settings)</code>  
<a name="settings.icons"></a>

### settings.icons : <code>Object</code>
All icons used.

**Kind**: static property of <code>[settings](#settings)</code>  
<a name="external_jQuery"></a>

## jQuery
jQuery object.

**Kind**: global external  
**See**: [http://api.jquery.com/jQuery/](http://api.jquery.com/jQuery/)  
<a name="external_jQuery.fn"></a>

## jQuery.fn
The jQuery plugin namespace.

**Kind**: global external  
**See**: [The jQuery Plugin Guide](http://docs.jquery.com/Plugins/Authoring)  

* [jQuery.fn](#external_jQuery.fn)
    * [.vulcanup(update, fileInfo)](#external_jQuery.fn.vulcanup) ⇒ <code>jQuery</code>
    * [.vulcanup(get)](#external_jQuery.fn.vulcanup) ⇒ <code>Object</code> &#124; <code>null</code>
    * [.vulcanup([settings])](#external_jQuery.fn.vulcanup)

<a name="external_jQuery.fn.vulcanup"></a>

### jQuery.fn.vulcanup(update, fileInfo) ⇒ <code>jQuery</code>
***Invoke over instantiated elements.***

Update the current file as uploaded.

**Kind**: static method of <code>[jQuery.fn](#external_jQuery.fn)</code>  
**Returns**: <code>jQuery</code> - The same element.  

| Param | Type | Description |
| --- | --- | --- |
| update | <code>String</code> | With value `'update'`. |
| fileInfo | <code>Object</code> | The file details. |
| fileInfo.url | <code>String</code> | The file URL. |
| [fileInfo.name] | <code>String</code> | The file name. |

**Example**  
```js
$('#inputFile').vulcanup('update', {
  url: '/path/to/file.ext'
});
```
<a name="external_jQuery.fn.vulcanup"></a>

### jQuery.fn.vulcanup(get) ⇒ <code>Object</code> &#124; <code>null</code>
***Invoke over instantiated elements.***

Get the current uploaded file.

**Kind**: static method of <code>[jQuery.fn](#external_jQuery.fn)</code>  
**Returns**: <code>Object</code> &#124; <code>null</code> - The file info or null if there is no file.  

| Param | Type | Description |
| --- | --- | --- |
| get | <code>String</code> | With value `'get'`. |

**Example**  
```js
const fileInfo = $('#inputFile').vulcanup('get');  // { url, name }
```
<a name="external_jQuery.fn.vulcanup"></a>

### jQuery.fn.vulcanup([settings])
Invoke on a `<input type="file">` to set it as a file uploader.

By default the configuration is [settings](#settings) but you can pass an object
to configure it as you want.

Listen to event changes on the same input, review demo to see how to implement them
and what parameters they receive:

**`vulcanup-val`** - On validation error. Receives as parameter an object with the error message.

**`vulcanup-upload`** - On file started to being uploaded.

**`vulcanup-progress`** - On upload progress update. Receives as parameter the progress number.

**`vulcanup-error`** - On server error. Receives as parameter an object with details.

**`vulcanup-change`** - On file change. This is triggered when the user uploads
a file in the server, when it is deleted or when it is changed programmatically.
Receives as parameter an object with the new file details.

**`vulcanup-delete`** - On file deleted. Receives as parameter the deleted file details.

**`vulcanup-uploaded`** - On file uploaded in the server.

**`vulcanup-complete`** - On upload process completed. This is fired when the
XHR is finished, regardless of fail or success.

**Kind**: static method of <code>[jQuery.fn](#external_jQuery.fn)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [settings] | <code>[settings](#settings)</code> | Optional configuration. |

**Example**  
```js
$('input[type=file]').vulcanup({
  url: '/initial/file/url.ext'
});
```
<a name="external_jQuery.vulcanup"></a>

## jQuery.vulcanup
The plugin global configuration object.

**Kind**: global external  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| version | <code>String</code> | The plugin version. |
| defaults | <code>[settings](#settings)</code> | The default configuration. |
| templates | <code>Object</code> | The default templates. |

