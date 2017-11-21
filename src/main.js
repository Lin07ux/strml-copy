require('./favicon.ico')

import "classlist-polyfill"
import Promise from 'bluebird'
import Markdown from 'markdown'

import getPrefix from './lib/getPrefix.js'
import preStyle from './css/prestyles.css'

let styleText = [0, 1, 2, 3].map(i => require('./css/style-' + i + '.css'))

const md = Markdown.markdown.toHtml
const isDev = window.location.hostname === 'localhost'
const speed = isDev ? 16 : 16
let style, styleEl, workEl, pgpEl, skipAnimationEl, pauseEl;
let animationSkipped = false, done = false, paused = false;
let browserPrefix;

document.addEventListener('DOMContentLoaded', () => {
  getBrowserPrefix()
  initStyleAndRefs()
  createEventHandlers()
})

/**
 * Older versions of major browsers (like Android) still use prefixes.
 * So we figure out what that prefix is and use it.
 *
 * @return void
 */
function getBrowserPrefix () {
  browserPrefix = getPrefix()
  styleText = styleText.map(text => text.replace(/-webkit-/g, browserPrefix))
}

/**
 * Set the init style, init the links in header,
 * and assign the el refs in the module scope.
 *
 * @return void
 */
function initStyleAndRefs () {
  // We're cheating a bit on styles.
  let preStyleEl = document.createElement('style')

  preStyleEl.textContent = preStyle
  document.head.insertBefore(preStyleEl, document.getElementsByTagName('style')[0])

  // El refs
  style = document.getElementById('style-tag')
  styleEl = document.getElementById('style-text')
  workEl = document.getElementById('work-text')
  pgpEl = document.getElementById('pgp-text')
  skipAnimationEl = document.getElementById('skip-animation')
  pauseEl = document.getElementById('pause-resume')
}

/**
 * Create basic event handlers for user input.
 *
 * @return void
 */
function createEventHandlers () {
  // Mirror user edits back to the style element.
  styleEl.addEventListener('input', () => {
    style.textContent = styleEl.textContent
  })

  // Skip animation
  skipAnimationEl.addEventListener('click', e => {
    e.preventDefault()
    animationSkipped = true
  })

  // Pause or resume animation
  pauseEl.addEventListener('click', e => {
    e.preventDefault()

    pauseEl.textContent = paused ? 'Pause ||' : 'Resume >>'
    paused = !paused
  })
}
