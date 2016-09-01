var mjml = require('mjml');
var path = require('path');
var loaderUtils = require("loader-utils");
var fs = require("fs");
var crypto = require('crypto');

function getFileExtension(path) {
  return path.split('.').pop();
}

module.exports = function(content) {
  this.cacheable && this.cacheable();
  this.value = content;
  var html = mjml.mjml2html(content);

	var config = {
		onlyHtml: false,
	};

	var query = loaderUtils.parseQuery(this.query);
	Object.keys(query).forEach(function(attr) {
		config[attr] = query[attr];
	});

  var images = {};

  // find relative paths in src=""
  var re = /(src="((?:\.|\.\.)\/.*?)")/ig;
  var match;
  while (match = re.exec(html)) {
    var imgPath = path.normalize(`${this.context}/${match[2]}`);
    var imgExt = getFileExtension(imgPath);
    this.addDependency(imgPath);
    var imageBase64 = `data:image/${imgExt};base64,${fs.readFileSync(imgPath).toString('base64')}`;

    if (config.onlyHtml) {
      html = html.replace(match[1], `src="${imageBase64}"`);
    } else {
      var cid = crypto.createHash('md5').update(imageBase64).digest("hex");
      html = html.replace(match[1], `src="cid:${cid}"`);
      images[cid] = {
        filename: `${cid}.${imgExt}`,
        path: imageBase64,
        cid: cid,
      };
    }
  }

  if (config.onlyHtml) {
    return `module.exports = ${JSON.stringify(html)};`;
  } else {
    var mailOptions = {
      html: html,
      attachments: Object.keys(images).map(k => images[k]),
    }
    return `module.exports = ${JSON.stringify(mailOptions)};`;
  }
};
