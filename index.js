const mjml = require('mjml');
const colors = require('colors');
const path = require('path');
const loaderUtils = require("loader-utils");
const fs = require("fs");
const crypto = require('crypto');

function getFileExtension(path) {
  return path.split('.').pop();
}

module.exports = function(content) {
  this.cacheable && this.cacheable();
  this.value = content;
  const config = {
		onlyHtml: false,
	};

  if (this.query) {
  	const query = loaderUtils.parseQuery(this.query);
  	Object.keys(query).forEach(function(attr) {
  		config[attr] = query[attr];
  	});
  }

  let result = {};
  try {
    result = mjml.mjml2html(content, { level: 'soft' });
  } catch (e) {
    result.html = displayErrors.bind(this)(e);
  }
  if (result.errors && result.errors.length) {
    result.html = displayErrors.bind(this)(result.errors);
  }

  const mod = prepareSrc.bind(this)(result.html || '', config);

  return `module.exports = ${JSON.stringify(mod)};`;
};

function displayErrors(errors) {
  if (!Array.isArray(errors)) errors = [errors];
  let htmlErr = [];
  console.log(colors.red(`[mjml-with-images-loader] ERROR in ${this.resourcePath}:`));
  htmlErr.push(`File: ${this.resourcePath}`);
  errors.forEach(e => {
    const msg = `- ${e.formattedMessage ? e.formattedMessage : e.message}`;
    htmlErr.push(msg);
    console.log(msg);
  });

  return htmlErr.join('<br />')
}

function prepareSrc(html, config) {
  const images = {};

  // find relative paths in src=""
  const re = /(src="((?:\.|\.\.)\/.*?)")/ig;
  let match;
  while (match = re.exec(html)) {
    const imgPath = path.normalize(`${this.context}/${match[2]}`);
    const imgExt = getFileExtension(imgPath);
    this.addDependency(imgPath);

    let imageBase64;
    try {
      imageBase64 = `data:image/${imgExt};base64,${fs.readFileSync(imgPath).toString('base64')}`;
    } catch (e) {
      html = displayErrors.bind(this)(e);
    }

    if (config.onlyHtml) {
      html = html.replace(match[1], `src="${imageBase64}"`);
    } else {
      const cid = crypto.createHash('md5').update(imageBase64).digest("hex");
      html = html.replace(match[1], `src="cid:${cid}"`);
      images[cid] = {
        filename: `${cid}.${imgExt}`,
        path: imageBase64,
        cid: cid,
      };
    }
  }

  if (config.onlyHtml) {
    return html;
  } else {
    return {
      html: html,
      attachments: Object.keys(images).map(k => images[k]),
    };
  }
}
