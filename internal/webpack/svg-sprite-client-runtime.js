import BrowserSprite from 'svg-baker-runtime/browser-sprite';

const sprite = new BrowserSprite();

// Sprite DOM node is already there, so we don't need to mount it,
// just assign existing element to sprite instance
sprite.node = document.querySelector('body svg:first-child');

export default sprite;
