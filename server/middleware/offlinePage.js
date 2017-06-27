/* eslint-disable no-unused-vars */

import { readFile } from 'await-fs';
import { resolve as pathResolve } from 'path';
import appRootDir from 'app-root-dir';

import config from '../../config';

/**
 * Middleware to intercept calls to our offline page to ensure that
 * inline scripts get a nonce value attached to them.
 */
export default async function offlinePageMiddleware(ctx, next) {
  // We should have had a nonce provided to us.  See the server/index.js for
  // more information on what this is.
  const { request, response, res } = ctx;

  if (typeof res.nonce !== 'string') {
    throw new Error('A "nonce" value has not been attached to the response');
  }
  const nonce = res.nonce;
  try {
    const data = await readFile(
      // Path to the offline page.
      pathResolve(
        appRootDir.get(),
        config('bundles.client.outputPath'),
        config('serviceWorker.offlinePageFileName'),
      ),
      // Charset for read
      'utf-8',
    );
    // We replace the placeholder with the actual nonce.
    const offlinePageWithNonce = data.replace('OFFLINE_PAGE_NONCE_PLACEHOLDER', nonce);
    // Send back the page as the response
    response.status = 200;
    response.body = offlinePageWithNonce;
  } catch (err) {
    ctx.status = typeof err.status === 'number' ? err.status : 500; // eslint-disable-line no-param-reassign
    ctx.app.emit('Error returning offline page.', err, ctx);
  }
}
