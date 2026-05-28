import { bodyRequest, pageRequest, request } from './http'

function fillPath(path, record = {}) {
  return path.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(record[key] ?? record.id ?? ''))
}

export function pageResource(config, params) {
  return pageRequest(fillPath(config.api.list, params), params)
}

export function detailResource(config, record) {
  if (!config.api.detail) {
    return Promise.reject(new Error('待接口加入'))
  }

  return request(fillPath(config.api.detail, record))
}

export function createResource(config, body) {
  if (!config.api.create) {
    return Promise.reject(new Error('待接口加入'))
  }

  return bodyRequest(config.api.create, 'POST', body)
}

export function updateResource(config, record, body) {
  if (!config.api.update) {
    return Promise.reject(new Error('待接口加入'))
  }

  return bodyRequest(fillPath(config.api.update, record), 'PUT', body)
}

export function deleteResource(config, record) {
  if (!config.api.delete) {
    return Promise.reject(new Error('待接口加入'))
  }

  return request(fillPath(config.api.delete, record), { method: 'DELETE' })
}

export function runResourceAction(action, record, body = {}) {
  if (!action.api) {
    return Promise.reject(new Error('待接口加入'))
  }

  const method = action.method || 'PATCH'
  const path = fillPath(action.api, record)

  if (method === 'GET' || method === 'DELETE') {
    return request(path, { method })
  }

  return bodyRequest(path, method, body)
}

export async function enrichResourceRecords(config, records) {
  if (!config.enrichRecords || records.length === 0) {
    return records
  }

  return config.enrichRecords(records, { request })
}
