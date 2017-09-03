/* @flow */

import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import 'normalize.css/normalize.css';
import './globals.css';
import Error404 from './Error404';
import Header from './Header';
import { safeConfigGet } from '../../utils/config';

import Home from './Home';
import About from './About';
import Posts from './Posts';

const ComponentsMap = { Home, About, Posts }

function DemoApp(props) {
  console.log(props.page);
  const CoreComponent = ComponentsMap[props.page] || Error404
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

      <CoreComponent />
    </div>
  );
}


export default connect((state)=> ({
  page: state.page
}))(DemoApp);
