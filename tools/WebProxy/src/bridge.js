(function () {
  var PROXY = '__PROXY_ORIGIN__'

  function post(message) {
    try {
      parent.postMessage(Object.assign({ source: 'nos4-web-bridge' }, message), '*')
    } catch (error) {
      return
    }
  }

  function absolute(href) {
    try {
      return new URL(href, document.baseURI).href
    } catch (error) {
      return ''
    }
  }

  function announce() {
    post({ kind: 'title', title: document.title || '' })
    post({ kind: 'location', url: document.baseURI })
  }

  function progress() {
    var state = document.readyState
    post({ kind: 'progress', value: state === 'complete' ? 1 : state === 'interactive' ? 0.7 : 0.3 })
  }

  document.addEventListener('readystatechange', progress)
  window.addEventListener('load', function () {
    progress()
    announce()
  })

  document.addEventListener(
    'click',
    function (event) {
      var node = event.target
      while (node && node.tagName !== 'A') node = node.parentElement
      if (!node) return
      var href = node.getAttribute('href')
      if (!href || href.charAt(0) === '#') return
      var target = absolute(href)
      if (!/^https?:/i.test(target)) return
      event.preventDefault()
      post({ kind: 'navigate', url: target })
    },
    true
  )

  document.addEventListener(
    'submit',
    function (event) {
      var form = event.target
      if (!form || form.tagName !== 'FORM') return
      var action = absolute(form.getAttribute('action') || document.baseURI)
      if (!/^https?:/i.test(action)) return
      if ((form.getAttribute('method') || 'get').toLowerCase() !== 'get') return
      event.preventDefault()
      var query = new URLSearchParams(new FormData(form)).toString()
      post({ kind: 'navigate', url: action + (action.indexOf('?') === -1 ? '?' : '&') + query })
    },
    true
  )

  var lastScroll = -1
  window.addEventListener(
    'scroll',
    function () {
      var y = window.scrollY || document.documentElement.scrollTop || 0
      if (Math.abs(y - lastScroll) < 1) return
      lastScroll = y
      post({ kind: 'scroll', y: y })
    },
    { passive: true }
  )

  document.addEventListener(
    'focusin',
    function (event) {
      var node = event.target
      if (!node) return
      var tag = node.tagName
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && node.isContentEditable !== true) return
      post({ kind: 'focus', field: 'text' })
    },
    true
  )

  document.addEventListener(
    'focusout',
    function () {
      post({ kind: 'blur' })
    },
    true
  )

  window.addEventListener('message', function (event) {
    var data = event.data
    if (!data || data.source !== 'cw-web-host') return
    if (data.kind === 'insert') {
      var active = document.activeElement
      if (!active) return
      if (typeof active.value === 'string') {
        active.value = active.value + data.text
        active.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
    if (data.kind === 'delete') {
      var target = document.activeElement
      if (target && typeof target.value === 'string') {
        target.value = target.value.slice(0, -1)
        target.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  })

  progress()
  announce()
  void PROXY
})()
