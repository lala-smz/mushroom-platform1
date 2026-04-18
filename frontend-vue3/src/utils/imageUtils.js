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

export function getPlaceholderImage(size = '300', type = 'mushroom') {
  const placeholderImages = {
    mushroom: {
      '50': BASE_URL + 'images/placeholder-mushroom-50.svg',
      '100': BASE_URL + 'images/placeholder-mushroom-100.svg',
      '150': BASE_URL + 'images/placeholder-mushroom-150.svg',
      '300': BASE_URL + 'images/placeholder-mushroom-300.svg',
      '400': BASE_URL + 'images/placeholder-mushroom-400.svg',
      '800': BASE_URL + 'images/placeholder-mushroom-800.svg'
    },
    recipe: {
      '200': BASE_URL + 'images/placeholder-recipe-200.svg'
    },
    video: {
      '300': BASE_URL + 'images/placeholder-video-300.svg'
    },
    avatar: {
      '40': BASE_URL + 'images/placeholder-avatar-40.svg'
    }
  }
  
  const typeImages = placeholderImages[type] || placeholderImages.mushroom
  return typeImages[size] || typeImages['300'] || BASE_URL + 'images/placeholder-mushroom-300.svg'
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