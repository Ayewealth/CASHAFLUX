import { useEffect } from 'react'

interface PageMeta {
  title: string
  description?: string
  ogType?: string
  ogImage?: string
  canonical?: string
}

const BASE_URL = 'https://cashaflux.com'
const DEFAULT_IMAGE = 'https://cashaflux.com/og-default.png'

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    document.title = `${meta.title} — Cashaflux`

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        if (name.startsWith('og:')) {
          el.setAttribute('property', name)
        } else {
          el.setAttribute('name', name)
        }
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    if (meta.description) {
      setMeta('description', meta.description)
      setMeta('og:description', meta.description)
    }
    setMeta('og:title', meta.title)
    setMeta('og:type', meta.ogType || 'website')
    setMeta('og:image', meta.ogImage || DEFAULT_IMAGE)
    setMeta('og:url', meta.canonical || window.location.href)

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalEl)
    }
    canonicalEl.setAttribute('href', meta.canonical || window.location.href)

    return () => {
      document.title = 'Cashaflux'
    }
  }, [meta.title, meta.description, meta.ogType, meta.ogImage, meta.canonical])
}