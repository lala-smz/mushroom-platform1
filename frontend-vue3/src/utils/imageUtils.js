import { uploadConfig } from '../config/upload.js'

const BASE_URL = '/mushroom-platform/'

export function getImageUrl(imagePath) {
  if (!imagePath) {
    return getPlaceholderImage()
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  if (imagePath.startsWith('/uploads/')) {
    return uploadConfig.imageUrl + imagePath.replace('/uploads/', '')
  }
  
  if (imagePath.startsWith('/mushrooms/')) {
    return uploadConfig.mushroomUrl + imagePath.replace('/mushrooms/', '')
  }
  
  if (imagePath.startsWith('uploads/')) {
    return uploadConfig.imageUrl + imagePath.replace('uploads/', '')
  }
  
  if (imagePath.startsWith('mushrooms/')) {
    return uploadConfig.mushroomUrl + imagePath.replace('mushrooms/', '')
  }
  
  return getPlaceholderImage()
}

export function getPlaceholderImage(size = '300') {
  const placeholderImages = {
    '150': BASE_URL + 'images/placeholder-mushroom-150.svg',
    '300': BASE_URL + 'images/placeholder-mushroom-300.svg',
    '400': BASE_URL + 'images/placeholder-mushroom-400.svg',
    '800': BASE_URL + 'images/placeholder-mushroom-800.svg'
  }
  
  return placeholderImages[size] || placeholderImages['300']
}

export function getUploadUrl() {
  return uploadConfig.uploadUrl
}

export function formatImages(images) {
  if (!images || !Array.isArray(images)) {
    return [getPlaceholderImage()]
  }
  
  return images.map(img => getImageUrl(img))
}

export const DEFAULT_PLACEHOLDER_URL = getPlaceholderImage()

export function handleImageError(event) {
  const target = event.target
  target.src = DEFAULT_PLACEHOLDER_URL
}