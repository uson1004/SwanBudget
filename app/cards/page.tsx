"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinance } from "@/context/finance-context"

export default function CardsPage() {
  const router = useRouter()
  const { cards, addCard, deleteCard } = useFinance()
  const [cardNumber, setCardNumber] = useState("")
  const [cardholderName, setCardholderName] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  // 카드 번호 포맷팅 (4자리마다 공백 추가)
  const formatCardNumber = (value: string) => {
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
  const detectCardType = (number: string) => {
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

  // 카드 번호 입력 핸들러
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value)
    setCardNumber(formattedValue)
  }

  // 카드 추가 함수
  const handleAddCard = async () => {
    setError(null)
    setSuccess(null)

    // 입력 검증
    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvv) {
      setError("모든 필드를 입력해주세요.")
      return
    }

    if (cardNumber.replace(/\s/g, "").length < 16) {
      setError("유효한 카드 번호를 입력해주세요.")
      return
    }

    if (cvv.length < 3) {
      setError("유효한 CVV를 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      // 실제 구현에서는 여기서 결제 처리 서비스 API를 호출합니다
      // 여기서는 시뮬레이션만 합니다
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const cleanCardNumber = cardNumber.replace(/\s/g, "")
      const lastFourDigits = cleanCardNumber.slice(-4)
      const cardType = detectCardType(cleanCardNumber)

      addCard({
        cardNumber: cleanCardNumber,
        cardholderName,
        expiryMonth,
        expiryYear,
        cardType,
        lastFourDigits,
      })

      setSuccess("카드가 성공적으로 연결되었습니다.")

      // 폼 초기화
      setCardNumber("")
      setCardholderName("")
      setExpiryMonth("")
      setExpiryYear("")
      setCvv("")
      setOpenDialog(false)
    } catch (err) {
      setError("카드 연결 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  // 카드 삭제 함수
  const handleDeleteCard = async (id: string) => {
    setError(null)
    setSuccess(null)

    try {
      // 실제 구현에서는 여기서 결제 처리 서비스 API를 호출합니다
      await new Promise((resolve) => setTimeout(resolve, 800))

      deleteCard(id)
      setSuccess("카드가 성공적으로 삭제되었습니다.")
    } catch (err) {
      setError("카드 삭제 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

  // 알림 메시지 자동 제거
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">백조</h1>
        <p className="text-muted-foreground">카드 관리</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>성공</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>연결된 카드</CardTitle>
              <CardDescription>결제에 사용할 카드를 관리하세요</CardDescription>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> 카드 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 카드 연결</DialogTitle>
                  <DialogDescription>
                    결제에 사용할 카드 정보를 입력하세요. 카드 정보는 안전하게 저장됩니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">카드 번호</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">카드 소유자 이름</Label>
                    <Input
                      id="cardholderName"
                      placeholder="홍길동"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">만료 월</Label>
                      <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                        <SelectTrigger id="expiryMonth">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = (i + 1).toString().padStart(2, "0")
                            return (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">만료 년</Label>
                      <Select value={expiryYear} onValueChange={setExpiryYear}>
                        <SelectTrigger id="expiryYear">
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = (new Date().getFullYear() + i).toString()
                            return (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddCard} disabled={isLoading}>
                    {isLoading ? "처리 중..." : "카드 연결"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                연결된 카드가 없습니다. 새 카드를 추가해보세요.
              </div>
            ) : (
              <div className="space-y-4">
                {cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {card.cardType} •••• {card.lastFourDigits}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {card.cardholderName} • 만료: {card.expiryMonth}/{card.expiryYear.slice(-2)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              가계부로 돌아가기
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

