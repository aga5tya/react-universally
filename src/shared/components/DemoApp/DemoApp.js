/* @flow */

import React from 'react';
import { Match, Miss } from 'react-router';
import Helmet from 'react-helmet';
import 'normalize.css/normalize.css';
import './globals.css';
import Error404 from './Error404';
import Header from './Header';
import { safeConfigGet } from '../../utils/config';

import Home from './Home'
import About from './About'
import Posts from './Posts'

function DemoApp() {
  return (
    <div style={{ padding: '10px' }}>
      {/*
        All of the following will be injected into our page header.
        @see https://github.com/nfl/react-helmet
      */}
      <Helmet
        htmlAttributes={safeConfigGet(['htmlPage', 'htmlAttributes'])}
        titleTemplate={safeConfigGet(['htmlPage', 'titleTemplate'])}
        defaultTitle={safeConfigGet(['htmlPage', 'defaultTitle'])}
        meta={safeConfigGet(['htmlPage', 'meta'])}
        link={safeConfigGet(['htmlPage', 'links'])}
        script={safeConfigGet(['htmlPage', 'scripts'])}
      />

      <Header />

      <Match
        exactly
        pattern="/"
        render={routerProps => <Home {...routerProps} />}
      />

      <Match
        pattern="/posts"
        render={routerProps => <Posts {...routerProps} />}
      />

      <Match
        pattern="/about"
        render={routerProps => <About {...routerProps} />}
      />
      <Miss component={Error404} />
    </div>
  );
}

export default DemoApp;
