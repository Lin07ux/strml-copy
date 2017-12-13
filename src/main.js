require('./favicon.ico')

import "classlist-polyfill"
import Promise from 'bluebird'
import Markdown from 'markdown'

import getPrefix from './lib/getPrefix.js'
import { default as writeChar } from './lib/writeChar.js'

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
  startAnimation()
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

/**
 * Start animation
 *
 * @return {void}
 */
async function startAnimation () {
  try {
    await writeTo(styleEl, styleText[0], 0, speed, 1, true)
  } catch (e) {
    if (e.message == 'SKIP IT') {
      skipAnimation()
    } else {
      throw e
    }
  }
}

let endOfSentence = /[\.\?\!]\s$/  // 以 ./?/! 结束，后面跟随一个空格的表示语句结尾
let endOfBlock = /[^\/]\n\n$/  // 连续两个 \n 换行符表示一个块，注释结束的块不延迟
let comma = /\D\,\s$/   // \D 避免匹配到数字的千分位分隔符

/**
 * Write message to element
 * @param  {DOM}    el               写入的元素
 * @param  {String} message          待写入的信息
 * @param  {Int}    start            开始写入的位置
 * @param  {Int}    interval         写入间隔(ms)
 * @param  {Int}    charsPerInterval 每次写入的字符数
 * @param  {Bool}   mirrorToStyle    是否映射到样式中
 * @return {Promise|void}
 */
async function writeTo(el, message, start, interval, charsPerInterval, mirrorToStyle) {
  if (animationSkipped) throw new Error('SKIP IT')

  // Those characters that are going to be written to the buffer.
  let chars = message.slice(start, start + charsPerInterval)
  start += charsPerInterval

  // Write chars to element
  writeChar(el, chars)

  // Ensure we stay scrolled to the bottom.
  el.scrollTop = el.scrollHeight

  // Schedule another write.
  if (start < message.length) {
    let checkSlice = message.slice(start - 2, start + 1)
    let thisInterval = interval

    if (endOfSentence.test(checkSlice)) thisInterval = interval * 70
    else if (endOfBlock.test(checkSlice)) thisInterval = interval * 50
    else if (comma.test(checkSlice)) thisInterval = interval * 30

    // Delay a period of time until cancel the pause.
    do {
      await Promise.delay(thisInterval)
    } while (paused)

    // Start another write.
    return writeTo(el, message, start, interval, charsPerInterval, mirrorToStyle)
  }
}

function skipAnimation () {
  // TODO
}
