export function uuid() {
    const timestamp = Date.now()

    const randomBytes = new Uint8Array(10)
    crypto.getRandomValues(randomBytes)

    const timestampHex = timestamp.toString(16).padStart(12, '0')

    const randomHex = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')

    return (
        timestampHex.slice(0, 8) +
        '-' +
        timestampHex.slice(8, 12) +
        '-' +
        randomHex.slice(0, 4) +
        '-' +
        randomHex.slice(4, 8) +
        '-' +
        randomHex.slice(8, 20)
    )
}
