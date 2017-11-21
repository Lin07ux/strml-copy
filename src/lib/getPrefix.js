export default function generatePrefix() : string {
  // Checking specifically for 'window.document' is for pseudo-browser server-side
  // environments that define 'window' as the global context.
  // E.g. React-rails (see https://github.com/reactjs/react-rails/pull/84)
  if (typeof window === 'undefined' || typeof window.document === 'undefined') return ''

  const prefixes = ['ms', 'O', 'Moz', 'Webkit']
  const style = window.document.documentElement.style

  if (!('tranform' in style)) {
    for (let i = prefixes.length - 1; i >= 0; i--) {
      if (prefixes[i] + 'Transform' in style) return prefixes[i]
    }
  }

  return ''
}
