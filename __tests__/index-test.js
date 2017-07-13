const origConsole = global.console;
const mjmlWithImageLoaderFn = require('../index');

const addDependency = jest.fn();
const mjmlWithImageLoader = mjmlWithImageLoaderFn.bind({
  context: __dirname,
  addDependency,
  resourcePath: __filename,
});

const mjmlWithImageLoaderOnlyHtml = mjmlWithImageLoaderFn.bind({
  context: __dirname,
  addDependency,
  resourcePath: __filename,
  query: '?onlyHtml',
});

describe('mjmlWithImageLoader', () => {
  it('should convert simple template', () => {
    expect(
      mjmlWithImageLoader(`
      <mjml>
        <mj-body>
          <mj-container>
            <mj-section>
              <mj-column>
                <mj-text>Hello World</mj-text>
              </mj-column>
            </mj-section>
          </mj-container>
        </mj-body>
      </mjml>
    `)
    ).toMatchSnapshot();
  });

  it('should convert template with image as attachments', () => {
    addDependency.mockClear();
    expect(
      mjmlWithImageLoader(`
      <mjml>
        <mj-body>
          <mj-container>
            <mj-section>
              <mj-column>
                <mj-text>Hello World</mj-text>
                <mj-image width="100" src="../test-img.jpg"></mj-image>
              </mj-column>
            </mj-section>
          </mj-container>
        </mj-body>
      </mjml>
    `)
    ).toMatchSnapshot();
    expect(addDependency).toHaveBeenCalled();
    expect(addDependency.mock.calls).toMatchSnapshot();
  });

  it('should convert template with image inline as data:image/*;base64', () => {
    addDependency.mockClear();
    expect(
      mjmlWithImageLoaderOnlyHtml(`
      <mjml>
        <mj-body>
          <mj-container>
            <mj-section>
              <mj-column>
                <mj-text>Hello World</mj-text>
                <mj-image width="100" src="../test-img.jpg"></mj-image>
              </mj-column>
            </mj-section>
          </mj-container>
        </mj-body>
      </mjml>
    `)
    ).toMatchSnapshot();
    expect(addDependency).toHaveBeenCalled();
    expect(addDependency.mock.calls).toMatchSnapshot();
  });

  it('should addDependency for mj-include to webpack', () => {
    addDependency.mockClear();
    expect(
      mjmlWithImageLoaderOnlyHtml(`
      <mjml>
        <mj-body>
          <mj-include path="./test-include.mjml" />
        </mj-body>
      </mjml>
    `)
    ).toMatchSnapshot();
    expect(addDependency).toHaveBeenCalled();
    expect(addDependency.mock.calls).toMatchSnapshot();
  });

  describe('errors', () => {
    beforeEach(() => {
      global.console = {
        log: jest.fn(),
        dir: origConsole.dir,
      };
    });

    afterEach(() => {
      global.console = origConsole;
    });

    it('should pass parse error to html', () => {
      expect(
        mjmlWithImageLoader(`
          <mjml ////>
            <mj123>
          </mjml>
        `)
      ).toMatchSnapshot();
      expect(console.log.mock.calls).toMatchSnapshot();
    });

    it('should pass template errors to html', () => {
      expect(
        mjmlWithImageLoader(`
          <mjml>
            <mj-body>
              <mj-text222>Hello World</mj-text222>
            </mj-body>
          </mjml>
        `)
      ).toMatchSnapshot();
      expect(console.log.mock.calls).toMatchSnapshot();
    });
  });
});
