/* @flow */
import React from 'react'; // eslint-disable-line
import universal from 'react-universal-component';

const About = universal(import('./About'), { minDelay: 500 });

export default About;
