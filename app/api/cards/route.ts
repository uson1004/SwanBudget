import { NextResponse } from "next/server"

// 실제 구현에서는 이 부분이 결제 처리 서비스 API와 연동됩니다
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 카드 정보 검증
    if (!body.cardNumber || !body.cardholderName || !body.expiryMonth || !body.expiryYear || !body.cvv) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 })
    }

    // 실제 구현에서는 여기서 결제 처리 서비스 API를 호출합니다
    // 예: Stripe, PayPal 등

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: "카드가 성공적으로 연결되었습니다.",
      card: {
        id: Date.now().toString(),
        lastFourDigits: body.cardNumber.slice(-4),
        cardType: detectCardType(body.cardNumber),
        expiryMonth: body.expiryMonth,
        expiryYear: body.expiryYear,
        cardholderName: body.cardholderName,
      },
    })
  } catch (error) {
    console.error("카드 연결 오류:", error)
    return NextResponse.json({ error: "카드 연결 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "카드 ID가 필요합니다." }, { status: 400 })
    }

    // 실제 구현에서는 여기서 결제 처리 서비스 API를 호출합니다

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: "카드가 성공적으로 삭제되었습니다.",
    })
  } catch (error) {
    console.error("카드 삭제 오류:", error)
    return NextResponse.json({ error: "카드 삭제 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 카드 타입 감지 함수
function detectCardType(number: string) {
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

