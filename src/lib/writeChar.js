export default function writeChar (el, char) {
  el.innerHTML += char
}

let styleBuffer = ''
const fullText = { id: '', content: '' }
let openComment = false

export function writeStyleChar (el, char, style) {
  // 如果传入的元素的 ID 和当前缓存的内容的 ID 不同，则重置缓存
  // 设置缓存可以避免每次都要从 DOM 中读取
  if (fullText.id !== el.id) {
    fullText.id = el.id
    fullText.content = el.innerHTML
  }

  // 处理内容，并重新写入到元素中
  el.innerHTML = fullText.content = handleText(fullText.content, char)

  // 如果不是注释，则缓存字符串，避免过多的刷新 style 里面的样式
  if (!openComment) {
    styleBuffer += char

    // 如果样式
    if (char == ';') {
      style.innerHTML += styleBuffer
      styleBuffer = ''
    }
  }
}

function handleText (full, char) {
  return full + char
}
