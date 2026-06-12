import { bodyRequest, getJsonData, rawRequest, resolveApiUrl } from './http'
import { getAuthHeader } from '../utils/auth'

export function createCoverUploadUrl({ usage, originalName, contentType, fileSize }) {
  return bodyRequest('/api/v1/admin/content/files/covers/upload-url', 'POST', {
    usage,
    originalName,
    contentType,
    fileSize,
  })
}

export async function uploadCoverToStorage(uploadUrl, file) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error(`封面上传失败，状态码 ${response.status}`)
  }
}

export function confirmCoverUpload({ usage, objectKey, originalName }) {
  return bodyRequest('/api/v1/admin/content/files/covers/confirm', 'POST', {
    usage,
    objectKey,
    originalName,
  })
}

export async function uploadCoverFile(file, usage) {
  const uploadMetaResult = await createCoverUploadUrl({
    usage,
    originalName: file.name,
    contentType: file.type,
    fileSize: file.size,
  })
  const uploadMeta = uploadMetaResult?.data || uploadMetaResult

  await uploadCoverToStorage(uploadMeta.uploadUrl, file)

  const confirmResult = await confirmCoverUpload({
    usage,
    objectKey: uploadMeta.objectKey,
    originalName: file.name,
  })

  return confirmResult?.data || confirmResult
}

export async function uploadMediaFile(file, assetType) {
  // Step 1: 申请媒体上传地址
  const uploadMetaResult = await bodyRequest('/api/v1/admin/content/files/media/upload-url', 'POST', {
    usage: assetType,
    originalName: file.name,
    contentType: file.type,
    fileSize: file.size,
  })
  const uploadMeta = uploadMetaResult?.data || uploadMetaResult

  // Step 2: PUT 文件到 OSS
  const putResponse = await fetch(uploadMeta.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!putResponse.ok) {
    throw new Error(`文件上传失败，状态码 ${putResponse.status}`)
  }

  // Step 3: 确认上传，获取稳定 URL
  const confirmResult = await bodyRequest('/api/v1/admin/content/files/media/confirm', 'POST', {
    usage: assetType,
    objectKey: uploadMeta.objectKey,
    originalName: file.name,
  })

  const mediaAsset = confirmResult?.data || confirmResult
  return mediaAsset?.mediaUrl || mediaAsset?.coverUrl || ''
}

export async function listFileAssets(params = {}) {
  return getJsonData(`/api/v1/admin/content/files${buildQuery(params)}`)
}

function buildQuery(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}
