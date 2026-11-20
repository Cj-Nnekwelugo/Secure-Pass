const characterSets = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/|~',
}

function randomInteger(max) {
  const cryptoApi = globalThis.crypto
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Secure password generation is not supported by this browser.')
  }

  const range = 0x100000000
  const limit = range - (range % max)
  const value = new Uint32Array(1)
  do {
    cryptoApi.getRandomValues(value)
  } while (value[0] >= limit)
  return value[0] % max
}

export function generatePassword(length, options) {
  if (!Number.isInteger(length) || length < 8 || length > 40) {
    throw new Error('Choose a password length between 8 and 40 characters.')
  }

  const sets = Object.keys(characterSets)
    .filter((key) => options[key])
    .map((key) => characterSets[key])

  if (sets.length === 0) {
    throw new Error('Select at least one character type to generate a password.')
  }

  const pool = sets.join('')
  const characters = sets.map((set) => set[randomInteger(set.length)])
  while (characters.length < length) {
    characters.push(pool[randomInteger(pool.length)])
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(index + 1)
    ;[characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]]
  }

  return characters.join('')
}

export function getPasswordStrength(length, options) {
  const poolSize = Object.keys(characterSets)
    .filter((key) => options[key])
    .reduce((total, key) => total + characterSets[key].length, 0)
  const entropy = poolSize ? length * Math.log2(poolSize) : 0

  if (entropy < 40) return { label: 'Weak', score: 1 }
  if (entropy < 60) return { label: 'Fair', score: 2 }
  if (entropy < 80) return { label: 'Good', score: 3 }
  return { label: 'Strong', score: 4 }
}
