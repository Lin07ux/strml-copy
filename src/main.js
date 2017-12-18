require('./favicon.ico')

import "classlist-polyfill"
import Promise from 'bluebird'
import Markdown from 'markdown'

import getPrefix from './lib/getPrefix.js'
import replaceURLs from './lib/replaceURLs.js'
import { default as writeChar, writeStyleChar } from './lib/writeChar.js'

import workText from './text/work.txt'
import preStyle from './css/prestyles.css'

let styleText = [0, 1, 2, 3].map(i => require('./css/style-' + i + '.css'))

const isDev = window.location.hostname === 'localhost'
const speed = isDev ? 0 : 16
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
    await writeTo(workEl, workText, 0, speed, 1, false)
    await writeTo(styleEl, styleText[1], 0, speed, 1, true)
    createWorkBox()
    await Promise.delay(1000)
    await writeTo(styleEl, styleText[2], 0, speed, 1, true)
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

  // If this is going to <style> it's more complex; otherwise, just write.
  mirrorToStyle ? writeStyleChar(el, chars, style) : writeChar(el, chars)

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

/**
 * 创建工作简介的展示框
 *
 * @return void
 */
function createWorkBox () {
  // 避免重复执行该方法
  if (workEl.getElementsByTagName('div').length) return false

  workEl.innerHTML = '<div class="text">' + replaceURLs(workText) + '</div>' +
    '<div class="md">' + replaceURLs(Markdown.markdown.toHTML(workText)) + '</div>'

  workEl.classList.add('flipped')
  workEl.scrollTop = 9999

  let flipping = false

  // 设置滚动监听，在滚动到一定程度时进行翻转，第三个参数设置为 true 是为了避免
  // 在处理滚动的时候，能够在翻转前后页面的滚动效果一致
  require('mouse-wheel')(workEl, async function (dx, dy) {
    if (flipping) return false

    let flipped = workEl.classList.contains('flipped')
    let halfHeight = (workEl.scrollHeight - workEl.clientHeight) / 2
    let passHalf = flipped ? (workEl.scrollTop < halfHeight) : (workEl.scrollTop > halfHeight)

    if (passHalf) {
      workEl.classList.toggle('flipped')
      flipping = true
      await Promise.delay(600)
      workEl.scrollTop = flipped ? 0 : 9999
      flipping = false
    } else {
      workEl.scrollTop += dy * (flipped ? -1 : 1)
    }
  }, true)
}

function skipAnimation () {
  // TODO
}
