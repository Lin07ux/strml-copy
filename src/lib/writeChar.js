export default function writeChar (el, char) {
  el.innerHTML += char
}

// 这样的格式使其只能处理完成同一个元素的文本写入后再处理其他的元素
// 否则可能会造成部分内容的丢失
// id 处理的元素的 id 属性；content 已处理完成的文本；buffer 待处理的内容
// 将处理过的文本和未处理过的文本分开存放可以避免过多的正则查询
const fullText = { id: '', content: '', buffer: '' }
let styleBuffer = ''
let openComment = false

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
  if (fullText.id !== el.id) {
    fullText.id = el.id
    fullText.content = el.innerHTML
    fullText.buffer = ''
  }

  // debugger

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

function handleStyle (char) {
  let hasBuffer = fullText.buffer.length > 0

  switch (char) {
    case '/':
      handleSlashChar()
      break
    default:
      hasBuffer ? (fullText.buffer += char) : (fullText.content += char)
  }
}

/**
 * 处理斜线字符
 *
 * @return {void}
 */
function handleSlashChar () {
  fullText.buffer += '/'

  if (!openComment) {
    // 未开启注释则开启
    openComment = true
  } else if (fullText.buffer.slice(-2) === '*/') {
    // 否则如果符合结束注释的条件则结束注释，并将 buffer 写入到 content 中
    openComment = false
    fullText.content += '<span class="comment">' + fullText.buffer + '</span>'
    fullText.buffer = ''
  }
}
