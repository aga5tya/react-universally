/* @flow */
import React from 'react'; // eslint-disable-line
import universal from 'react-universal-component';


const Home = universal(import('./Home'), { minDelay: 500 });

export default Home;
