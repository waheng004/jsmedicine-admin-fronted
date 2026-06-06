import { bodyRequest, getJsonData, rawRequest } from './http'

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
