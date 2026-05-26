export function setCookie(name, value, maxAgeSeconds) {
  const encodedName = encodeURIComponent(name)
  const encodedValue = encodeURIComponent(value)
  document.cookie = `${encodedName}=${encodedValue}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`
}

export function getCookie(name) {
  const encodedName = `${encodeURIComponent(name)}=`
  const item = document.cookie
    .split('; ')
    .find((cookieItem) => cookieItem.startsWith(encodedName))

  return item ? decodeURIComponent(item.slice(encodedName.length)) : ''
}

export function removeCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=/; SameSite=Lax`
}
