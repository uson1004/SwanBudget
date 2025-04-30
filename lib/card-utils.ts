// 카드 번호 포맷팅 (4자리마다 공백 추가)
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ""
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(" ")
  } else {
    return value
  }
}

// 카드 타입 감지
export function detectCardType(number: string): string {
  const re = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
  }

  if (re.visa.test(number)) return "Visa"
  if (re.mastercard.test(number)) return "Mastercard"
  if (re.amex.test(number)) return "American Express"
  if (re.discover.test(number)) return "Discover"
  return "Unknown"
}

// 카드 번호 마스킹 (마지막 4자리만 표시)
export function maskCardNumber(number: string): string {
  return `•••• •••• •••• ${number.slice(-4)}`
}

// 카드 유효성 검사 (Luhn 알고리즘)
export function validateCardNumber(number: string): boolean {
  const digits = number.replace(/\D/g, "")

  if (!/^\d+$/.test(digits)) return false

  let sum = 0
  let shouldDouble = false

  // Luhn 알고리즘
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(digits.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}
