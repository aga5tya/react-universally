/* @flow */

import React from 'react';
import Link from 'redux-first-router-link';
import Helmet from 'react-helmet';
import Post from './Post';
import { connect } from 'react-redux';


function Posts(props) {
  return (
    <div>
      <Helmet title="Posts" />

      <h1>Posts</h1>

      <ul>
        <li><Link to="/posts/1">Post 1</Link></li>
        <li><Link to="/posts/2">Post 22</Link></li>
      </ul>

      {props.postID && <Post id={props.postID} />}
    </div>
  );
}

export default connect(state => ({
  postID: state.location.payload.id
}))(Posts);
