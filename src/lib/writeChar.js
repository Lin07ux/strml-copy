export default function writeChar (el, char) {
  el.innerHTML += char
}

// 这样的格式使其只能处理完成同一个元素的文本写入后再处理其他的元素
// 否则可能会造成部分内容的丢失
// id 处理的元素的 id 属性；content 已处理完成的文本；buffer 待处理的内容
// 将处理过的文本和未处理过的文本分开存放可以避免过多的正则查询
let fullText = { id: '', content: '', buffer: '' }
let styleBuffer = ''
// 开始注释
let openComment = false
// 开始设置 css 属性(避免选择器中的伪类的 : 与属性设置时的 : 混淆)
let openBlock = false

/**
 * 写入样式字符
 * @param  {DOM}    el    写入字符的元素
 * @param  {String} char  写入的字符
 * @param  {DOM}    style 要映射到的 style 元素
 * @return {void}
 */
export function writeStyleChar (el, char, style) {
  // 如果传入的元素的 ID 和当前缓存的内容的 ID 不同，则重置缓存
  // 设置缓存可以避免每次都要从 DOM 中读取
  fullText.id !== el.id && resetInit(el)


  // 缓存处理字符全文之前是否是注释，避免处理后该值发生变化
  let openCommentTemp = openComment

  // 处理内容，并重新写入到元素中
  handleStyle(char)
  el.innerHTML = fullText.content + fullText.buffer

  // 如果不是注释，则缓存字符串，避免过多的刷新 style 里面的样式
  if (!openCommentTemp && !openComment) {
    styleBuffer += char

    // 如果是 CSS 语句结尾的分隔字符，则将其写入到样式中
    if (char == ';') {
      style.innerHTML += styleBuffer
      styleBuffer = ''
    }
  }
}

/**
 * 重置初始设置
 * @param  {DOM} el 新的需要处理的元素
 * @return {void}
 */
function resetInit (el) {
  openComment = openBlock = false
  fullText = { id: el.id, content: el.innerHTML, buffer: '' }
}

export function batchHandleStyle (el, style) {
  let length = style.length

  if (length) {
    resetInit(el)

    for (let i = 0; i < length; ++i) {
      handleStyle(style[i])
    }

    return fullText.content + fullText.buffer
  }

  return ''
}

/**
 * 处理样式字符
 * @param  {String} char 当前要添加的字符
 * @return {void}
 */
function handleStyle (char) {
  // 如果处于注释状态，而且当前字符不是 / 则直接存在 buffer 中即可
  if (openComment && char !== '/') return fullText.buffer += char

  switch (char) {
    case '/':
      handleSlashChar()
      break
    case '{':
      fullText.content += '<span class="selector">' + fullText.buffer + '</span>{'
      fullText.buffer = ''
      openBlock = true
      break
    case '}':
      fullText.content += fullText.buffer + '}'
      fullText.buffer = ''
      openBlock = false
      break
    case ':':
      if (openBlock) {
        fullText.content += '<span class="key">' + fullText.buffer + '</span>:'
        fullText.buffer = ''
      } else {
        fullText.buffer += ':'
      }
      break
    case ';':
      fullText.content += '<span class="value">' + fullText.buffer + '</span>;'
      fullText.buffer = ''
      break
    case 'x':
      fullText.buffer += 'x'
      if (fullText.buffer.slice(-2) === 'px') {
        fullText.buffer = fullText.buffer.slice(0, -2) + '<span class="px">px</span>'
      }
      break
    case ' ':
    case '\n':
    case '\t':
      // 空白字符不需处理，可直接附加到 buffer 或 content 中
      fullText.buffer.length ? (fullText.buffer += char) : (fullText.content += char)
      break
    default:
      fullText.buffer += char
  }
}

/**
 * 处理斜线字符
 *
 * @return {void}
 */
function handleSlashChar () {
  if (!openComment) {
    // 未开启注释则开启
    openComment = true
    if (fullText.buffer.length) fullText.content += fullText.buffer
    fullText.buffer = '/'
  } else if (fullText.buffer.slice(-1) === '*') {
    // 否则如果符合结束注释的条件则结束注释，并将 buffer 写入到 content 中
    openComment = false
    fullText.content += '<span class="comment">' + fullText.buffer + '/</span>'
    fullText.buffer = ''
  } else {
    fullText.buffer += '/'
  }
}
