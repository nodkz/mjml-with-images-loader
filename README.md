# MJML loader for Webpack

Converts MJML files with images to HTML and exports them as string or as Nodemailer config. Images will be inserted as base64 data.

Images should have relative paths (starting from `./` or `../`). Such files resolved and inserted as base64 strings (see examples below).

This package adds dependencies to Webpack for included mjml templates `<mj-include path="./some_other.mjml" />`. So if you change included file, also will be regenerated depended files.

## Install
```js
npm install --save-dev mjml-with-images-loader mjml
```

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

## Example 1 (for passing to Nodemailer)

With this configuration:
```javascript
{
    module: {
      loaders: [
        { test: /\.mjml$/, loader: 'mjml-with-images-loader' }
      ]
    }
}
```
`template.mjml`
```xml
 <mjml>
  <mj-body>
    <mj-container>
      <mj-section>
        <mj-column>
          <mj-text>Hello World!</mj-text>
          <mj-image src="./pic.jpg" width="480px" padding-top="20px"></mj-image>
        </mj-column>
      </mj-section>
    </mj-container>
  </mj-body>
</mjml>
```
`index.js`
```javascript
const template = require('./template.mjml');
console.log(template);
```
`console.log` output (compatible with [Nodemailer](https://github.com/nodemailer/nodemailer#e-mail-message-fields) configuration):
```
{
  html: '<html> ... <img src="cid:1234"></img> ... </html>',
  attachments: [{
    filename: '1234.jpg',
    path: 'data:image/jpg;base64,/9j/4RpdRXhpZgAA ...',
    cid: '1234',
  }],
}
```

## Example 2 (with `onlyHtml` option, for browser rendering)

With this configuration:
```javascript
{
    module: {
      loaders: [
        { test: /\.mjml$/, loader: 'mjml-with-images-loader?onlyHtml' }
      ]
    }
}
```
`template.mjml`
```xml
 <mjml>
  <mj-body>
    <mj-container>
      <mj-section>
        <mj-column>
          <mj-text>Hello World!</mj-text>
          <mj-image src="./pic.jpg" width="480px" padding-top="20px"></mj-image>
        </mj-column>
      </mj-section>
    </mj-container>
  </mj-body>
</mjml>
```
`index.js`
```javascript
const template = require('./template.mjml');
console.log(template);
```
`console.log` output (ready to display on web-page via `<iframe srcDoc={template} height="100%" width="100%" />`):
```
'<html> ... <img src="data:image/jpg;base64,/9j/4RpdRXhpZgAA ..."></img> ... </html>'
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
