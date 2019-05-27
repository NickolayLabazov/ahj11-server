import './css/style.css';
import js from './img/js.png';
import favicon from './img/favicon.ico';

import './js/app.js';

const fav = document.createElement('link');
fav.setAttribute('rel', 'shortcut icon');
fav.setAttribute('href', `.${favicon}`);
fav.setAttribute('type', 'image/x-icon');
document.head.appendChild(fav);

const img = document.createElement('img');
img.setAttribute('src', `.${js}`);
const h = document.querySelector('h1');
document.body.insertBefore(img, h);
