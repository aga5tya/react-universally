/* @flow */
import React from 'react'; // eslint-disable-line
import universal from 'react-universal-component';


const Posts = universal(import('./Posts'), { minDelay: 500 });

export default Posts;
