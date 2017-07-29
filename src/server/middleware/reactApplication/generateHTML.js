/* @flow */

// This module is responsible for generating the HTML page response for
// the react application middleware.
//
// NOTE: If you are using a service worker to support offline mode for your
// application then please make sure that you keep the structure of the html
// within this module in sync with the module used to generate the offline
// HTML page.
// @see ./tools/webpack/offlinePage/generate.js
import type { Head } from 'react-helmet';
import serialize from 'serialize-javascript';
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'
import getAssetsForClientChunks from './getAssetsForClientChunks';
import config, { clientConfig } from '../../../../config';

function styleTags(styles : Array<string>) {
  return styles
    .map(style =>
      `<link href="${style}" media="screen, projection" rel="stylesheet" type="text/css" />`,
    )
    .join('\n');
}

function scriptTag(jsFilePath: string) {
  return `<script type="text/javascript" src="${jsFilePath}"></script>`;
}

function scriptTags(jsFilePaths : Array<string>) { 
  return jsFilePaths.map(scriptTag).join('\n'); 
}

type Args = {
  reactAppString?: string,
  initialState?: Object,
  nonce: string,
  helmet?: Head,
  codeSplitState?: { chunks: Array<string>, modules: Array<string> },
  jobsState?: { state: Object, STATE_IDENTIFIER: string },
};

export default function generateHTML(args: Args) {
  const { reactAppString, initialState, nonce, helmet } = args;

  // Now we get the assets (js/css) for the chunks.
  const clientEntryStats = getAssetsForClientChunks();

  const chunkNames = flushChunkNames();

  const {
  // arrays of file names (not including publicPath):
  scripts,
  stylesheets,
  cssHashRaw,
  publicPath,
  } = flushChunks(clientEntryStats, {
    chunkNames,
    before: ['bootstrap', 'vendor'],
    after: ['index'],
  });

  // Creates an inline script definition that is protected by the nonce.
  const inlineScript = body =>
    `<script nonce="${nonce}" type='text/javascript'>
       ${body}
     </script>`;

  return `<!DOCTYPE html>
    <html ${helmet ? helmet.htmlAttributes.toString() : ''}>
      <head>
        ${helmet ? helmet.title.toString() : ''}
        ${helmet ? helmet.meta.toString() : ''}
        ${helmet ? helmet.link.toString() : ''}
        ${stylesheets ? styleTags(stylesheets.map(asset => `${publicPath}/${asset}`)) : ''}
        ${helmet ? helmet.style.toString() : ''}
      </head>
      <body>
        <div id='app'>${reactAppString || ''}</div>
        ${
          // Binds the client configuration object to the window object so
          // that we can safely expose some configuration values to the
          // client bundle that gets executed in the browser.
          inlineScript(`window.__CLIENT_CONFIG__=${serialize(clientConfig)}`)
        }
        ${
          // Bind the initial application state based on the server render
          // so the client can register the correct initial state for the view.
          initialState
            ? inlineScript(`window.__APP_STATE__=${serialize(initialState)};`)
            : ''
        }
        ${
          cssHashRaw
            ? inlineScript(`window.__CSS_CHUNKS__=${serialize(cssHashRaw)};`)
            : ''
        }
        ${
          // Enable the polyfill io script?
          // This can't be configured within a react-helmet component as we
          // may need the polyfill's before our client bundle gets parsed.
          config.polyfillIO.enabled
            ? scriptTag(config.polyfillIO.url)
            : ''
        }
        ${
          // When we are in development mode our development server will generate a
          // vendor DLL in order to dramatically reduce our compilation times.  Therefore
          // we need to inject the path to the vendor dll bundle below.
          // @see /tools/development/ensureVendorDLLExists.js
          process.env.NODE_ENV === 'development'
            && config.bundles.client.devVendorDLL.enabled
            ? scriptTag(`${config.bundles.client.webPath}${config.bundles.client.devVendorDLL.name}.js?t=${Date.now()}`)
            : ''
        }
        ${scripts && scriptTags(scripts.map(asset => `${publicPath}/${asset}`))}
        ${helmet ? helmet.script.toString() : ''}
      </body>
    </html>`;
}
