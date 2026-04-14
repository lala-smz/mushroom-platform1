
export const DEFAULT_PLACEHOLDER_URL = 'https://via.placeholder.com/800x600/e2e8f0/6b7289?text=暂无图片'

export const SMALL_PLACEHOLDER_URL = 'https://via.placeholder.com/200x150/e2e8f0/6b7289?text=暂无图片'

export function getImageUrl(imageUrl, forceRefresh = false) {
  console.log('[imageUtils] 原始图片URL:', imageUrl, 'forceRefresh:', forceRefresh)
  
  if (!imageUrl || imageUrl.trim() === '') {
    console.log('[imageUtils] 图片URL为空，返回占位图')
    return DEFAULT_PLACEHOLDER_URL
  }

  let url = imageUrl.trim()
  console.log('[imageUtils] 处理后的URL:', url)

  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('[imageUtils] 完整URL，直接返回:', url)
    const finalUrl = forceRefresh ? addCacheBuster(url) : url
    return finalUrl
  }

  if (url.startsWith('/uploads/')) {
    const fullUrl = `http://localhost:3303${url}`
    console.log('[imageUtils] 相对路径，补全:', fullUrl)
    const finalUrl = forceRefresh ? addCacheBuster(fullUrl) : fullUrl
    return finalUrl
  }

  if (url.startsWith('uploads/')) {
    const fullUrl = `http://localhost:3303/${url}`
    console.log('[imageUtils] uploads开头，补全:', fullUrl)
    const finalUrl = forceRefresh ? addCacheBuster(fullUrl) : fullUrl
    return finalUrl
  }

  if (url.startsWith('/')) {
    const fullUrl = `http://localhost:3303${url}`
    console.log('[imageUtils] /开头，补全:', fullUrl)
    const finalUrl = forceRefresh ? addCacheBuster(fullUrl) : fullUrl
    return finalUrl
  }

  const fullUrl = `http://localhost:3303/uploads/${url}`
  console.log('[imageUtils] 默认补全:', fullUrl)
  const finalUrl = forceRefresh ? addCacheBuster(fullUrl) : fullUrl
  return finalUrl
}

function addCacheBuster(url) {
  const separator = url.includes('?') ? '&' : '?'
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `${url}${separator}_t=${timestamp}&_r=${random}`
}

export function getSmallImageUrl(imageUrl) {
  const result = getImageUrl(imageUrl)
  if (result === DEFAULT_PLACEHOLDER_URL) {
    return SMALL_PLACEHOLDER_URL
  }
  return result
}

export function handleImageError(event, fallbackUrl = DEFAULT_PLACEHOLDER_URL) {
  console.warn('[imageUtils] 图片加载失败:', event.target.src)
  event.target.onerror = null
  event.target.src = fallbackUrl
}

