const utils = {

  removeArrayDuplicates (arr) {
    'use strict';

    const obj = {};
    for (let i = 0; i < arr.length; i++) {
      obj[arr[i]] = true;
    }

    arr = [];
    for (let key in obj) {
      arr.push(key);
    }

    return arr;
  },

  format (str, params) {
    'use strict';

    str = String(str);
    params = params || {};

    const walk = (obj, list, i) => {
      if (!list[i]) return;
      if (typeof obj[list[i]] === 'object') {
        return walk(obj[list[i]], list, i+1);
      } else {
        return obj[list[i]];
      }
    };

    let name, value;
    let props = str.match(/\{\{\w+(\w|\.\w+)*\}\}/g);

    if (props && props.length) {

      props = utils.removeArrayDuplicates(props);
      props = props.map(p => p.replace('{{', '').replace('}}', '').split('.'));

      for (var i=0; i<props.length; i++) {
        value = walk(params, props[i], 0);
        if (value) {
          name = props[i].join('.');
          str = str.replace(new RegExp(`{{${name}}}`, 'g'), value);
        }
      }
    }

    return str;
  },

  formatSize (bytes) {
    'use strict';

    let scale = 'B';
    bytes = Number(bytes);

    if (bytes >= 1000000) {
      scale = 'MB';
      bytes = bytes / 1000000;
    }
    else if (bytes >= 1000) {
      scale = 'KB';
      bytes = bytes / 1000;
    }

    return `${bytes} ${scale}`;
  }
};

module.exports = utils;
