/* @flow */

import type { $Request, $Response, Middleware } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerRouter, createServerRenderContext } from 'react-router';
import { Provider } from 'react-redux';
import Helmet from 'react-helmet';
import generateHTML from './generateHTML';
import DemoApp from '../../../shared/components/DemoApp';
import configureStore from '../../../shared/redux/configureStore';
import config from '../../../../config';

/**
 * An express middleware that is capabable of service our React application,
 * supporting server side rendering of the application.
 */
function reactApplicationMiddleware(request: $Request, response: $Response) {
  // We should have had a nonce provided to us.  See the server/index.js for
  // more information on what this is.
  if (typeof response.locals.nonce !== 'string') {
    throw new Error('A "nonce" value has not been attached to the response');
  }
  const nonce = response.locals.nonce;

  // It's possible to disable SSR, which can be useful in development mode.
  // In this case traditional client side only rendering will occur.
  if (config.disableSSR) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('==> Handling react route without SSR');
    }
    // SSR is disabled so we will just return an empty html page and will
    // rely on the client to initialize and render the react application.
    const html = generateHTML({
      // Nonce which allows us to safely declare inline scripts.
      nonce,
    });
    response.status(200).send(html);
    return;
  }

  const initialReduxState = {
    posts: {
      all: [
        1,
        2,
      ],
      byId: {
        1: {
          userId: 1,
          id: 1,
          title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
          body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
        },
        2: {
          userId: 1,
          id: 2,
          title: 'qui est esse',
          body: 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla'
        },
      },
    },
  };

  // Create the redux store.
  const store = configureStore(initialReduxState);
  const { getState } = store;

  // First create a context for <ServerRouter>, which will allow us to
  // query for the results of the render.
  const reactRouterContext = createServerRenderContext();

  
  // Define our app to be server rendered.
  const app = (
    <ServerRouter location={request.url} context={reactRouterContext}>
      <Provider store={store}>
        <DemoApp />
      </Provider>
    </ServerRouter>
  );

  const reactAppString = renderToString(app);

  // Generate the html response.
  const html = generateHTML({
    // Provide the rendered React applicaiton string.
    reactAppString,
    // Nonce which allows us to safely declare inline scripts.
    nonce,
    // Running this gets all the helmet properties (e.g. headers/scripts/title etc)
    // that need to be included within our html.  It's based on the rendered app.
    // @see https://github.com/nfl/react-helmet
    helmet: Helmet.rewind(),
    // We provide our code split state so that it can be included within the
    // html, and then the client bundle can use this data to know which chunks/
    // modules need to be rehydrated prior to the application being rendered.
    initialState: getState(),
  });

  // Get the render result from the server render context.
  const renderResult = reactRouterContext.getResult();

  // Check if the render result contains a redirect, if so we need to set
  // the specific status and redirect header and end the response.
  if (renderResult.redirect) {
    response.status(301).setHeader('Location', renderResult.redirect.pathname);
    response.end();
    return;
  }

  response
    .status(
      renderResult.missed
        // If the renderResult contains a "missed" match then we set a 404 code.
        // Our App component will handle the rendering of an Error404 view.
        ? 404
        // Otherwise everything is all good and we send a 200 OK status.
        : 200,
    )
    .send(html);
}

export default (reactApplicationMiddleware : Middleware);
