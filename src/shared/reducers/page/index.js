import { NOT_FOUND } from 'redux-first-router'

export default (state = 'HOME', action = {}) => components[action.type] || state

const components = {
  HOME: 'Home',
  POSTS: 'Posts',
  POSTSBYID: 'Posts',
  ABOUT: 'About',
  [NOT_FOUND]: 'Error404',
}