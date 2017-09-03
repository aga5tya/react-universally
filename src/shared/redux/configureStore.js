/* @flow */

import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import axios from 'axios';
import reducers from '../reducers';
import type { State } from '../reducers';
import routesMap from './routesMap'
import { combineReducers } from 'redux';
import { connectRoutes, NOT_FOUND } from 'redux-first-router'

function configureStore(history, initialState: ?State) {

  const { reducer, middleware, enhancer, thunk } = connectRoutes(
    history,
    routesMap,
    {}
  )

  const enhancers = compose(
    enhancer,
    // Middleware store enhancer.
    applyMiddleware(
      // Initialising redux-thunk with extra arguments will pass the below
      // arguments to all the redux-thunk actions. Below we are passing a
      // preconfigured axios instance which can be used to fetch data with.
      // @see https://github.com/gaearon/redux-thunk
      reduxThunk.withExtraArgument({ axios }),
      middleware
    ),
    // Redux Dev Tools store enhancer.
    // @see https://github.com/zalmoxisus/redux-devtools-extension
    // We only want this enhancer enabled for development and when in a browser
    // with the extension installed.
    process.env.NODE_ENV === 'development'
      && typeof window !== 'undefined'
      && typeof window.devToolsExtension !== 'undefined'
      // Call the brower extension function to create the enhancer.
      ? window.devToolsExtension()
      // Else we return a no-op function.
      : f => f,
  );

  const rootReducer = combineReducers({ ...reducers, location: reducer })

  const store = initialState
    ? createStore(rootReducer, initialState, enhancers)
    : createStore(rootReducer, enhancers);

  if (process.env.NODE_ENV === 'development' && module.hot) {
    // Enable Webpack hot module replacement for reducers. This is so that we
    // don't lose all of our current application state during hot reloading.
    module.hot.accept('../reducers', () => {
      const reducers = require('../reducers').default;
      const rootReducer = combineReducers({ ...reducers, location: reducer })
      store.replaceReducer(rootReducer)
    });
  }

  return { store, thunk };
}

export const configureSSRStore = async (
	res,
	history,
	initialState = {},
) => {

	const { store, thunk } = configureStore(history, initialState)
	// store gives the reducer from state
	let location = store.getState().location
	if (doesRedirect(location, res)) return false // only do this again if ur thunks have redirects

  // rehydrate all thunk data if any from routes.
  await thunk(store)

  // changed now based on the thunks.
  location = store.getState().location

  // if thunk state had a redirect then send off
  if (doesRedirect(location, res)) return false


  const status = location.type === NOT_FOUND ? 404 : 200
  res.status(status)
	return store
}

export const doesRedirect = ({ kind, pathname }, res) => {
	if (kind === 'redirect') {
		res.redirect(302, pathname)
    return true
	}
}

export default configureStore;
