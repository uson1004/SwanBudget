"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon, Plus, Trash2, CreditCard, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useFinance } from "@/context/finance-context"

export default function Home() {
  // 상태 관리
  const [date, setDate] = useState<Date>(new Date())
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [calculatorInput, setCalculatorInput] = useState("")
  const [calculatorResult, setCalculatorResult] = useState("")

  // 컨텍스트에서 데이터와 함수 가져오기
  const {
    transactions,
    cards,
    categories,
    addTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpense,
    getBalance,
  } = useFinance()

  // 카테고리 타입에 따라 필터링된 카테고리 목록
  const filteredCategories = categories.filter((cat) => cat.type === type)

  // 카테고리 타입이 변경될 때 첫 번째 카테고리로 선택 변경
  useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategory(filteredCategories[0].name)
    } else {
      setCategory("")
    }
  }, [type, filteredCategories])

  // 거래 추가 함수
  const handleAddTransaction = () => {
    if (!description || !amount || Number.parseFloat(amount) <= 0 || !category) return

    addTransaction({
      date,
      description,
      amount: Number.parseFloat(amount),
      type,
      category,
      cardId: type === "expense" ? selectedCardId : undefined,
    })

    // 폼 초기화
    setDescription("")
    setAmount("")
    setSelectedCardId(undefined)
  }

  // 계산기 함수
  const handleCalculatorInput = (value: string) => {
    if (value === "C") {
      setCalculatorInput("")
      setCalculatorResult("")
    } else if (value === "=") {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(calculatorInput)
        setCalculatorResult(result.toString())
        // 결과를 금액 입력란에 설정
        setAmount(result.toString())
        // 계산기 닫기
        setIsCalculatorOpen(false)
      } catch (error) {
        setCalculatorResult("오류")
      }
    } else if (value === "←") {
      setCalculatorInput((prev) => prev.slice(0, -1))
    } else {
      setCalculatorInput((prev) => prev + value)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">백조</h1>
        <p className="text-muted-foreground">최고의 돈 관리 웹</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* 거래 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>거래 내역</CardTitle>
            <CardDescription>
              총 잔액:{" "}
              <span className={cn("font-bold", getBalance() >= 0 ? "text-green-500" : "text-red-500")}>
                {getBalance().toLocaleString()}원
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all">
              <div className="px-6 pt-2">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="income">수입</TabsTrigger>
                  <TabsTrigger value="expense">지출</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="px-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    거래 내역이 없습니다. 새 거래를 추가해보세요.
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex flex-col">
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transaction.date), "yyyy년 MM월 dd일")} • {transaction.category}
                            {transaction.cardId && (
                              <span className="ml-2 flex items-center text-xs">
                                <CreditCard className="h-3 w-3 mr-1" />
                                {cards.find((c) => c.id === transaction.cardId)?.lastFourDigits
                                  ? `카드 •••• ${cards.find((c) => c.id === transaction.cardId)?.lastFourDigits}`
                                  : "카드 결제"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={cn(
                              "font-medium",
                              transaction.type === "income" ? "text-green-500" : "text-red-500",
                            )}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {transaction.amount.toLocaleString()}원
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => deleteTransaction(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="income" className="px-6">
                {transactions.filter((t) => t.type === "income").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    수입 내역이 없습니다. 새 수입을 추가해보세요.
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {transactions
                      .filter((transaction) => transaction.type === "income")
                      .map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex flex-col">
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(transaction.date), "yyyy년 MM월 dd일")} • {transaction.category}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-green-500">+{transaction.amount.toLocaleString()}원</span>
                            <Button variant="ghost" size="icon" onClick={() => deleteTransaction(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="expense" className="px-6">
                {transactions.filter((t) => t.type === "expense").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    지출 내역이 없습니다. 새 지출을 추가해보세요.
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {transactions
                      .filter((transaction) => transaction.type === "expense")
                      .map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex flex-col">
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(transaction.date), "yyyy년 MM월 dd일")} • {transaction.category}
                              {transaction.cardId && (
                                <span className="ml-2 flex items-center text-xs">
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  {cards.find((c) => c.id === transaction.cardId)?.lastFourDigits
                                    ? `카드 •••• ${cards.find((c) => c.id === transaction.cardId)?.lastFourDigits}`
                                    : "카드 결제"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-red-500">-{transaction.amount.toLocaleString()}원</span>
                            <Button variant="ghost" size="icon" onClick={() => deleteTransaction(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 새 거래 추가 및 요약 */}
        <div className="space-y-6">
          {/* 요약 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 수입:</span>
                  <span className="font-medium text-green-500">{getTotalIncome().toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 지출:</span>
                  <span className="font-medium text-red-500">{getTotalExpense().toLocaleString()}원</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">잔액:</span>
                  <span className={cn("font-bold", getBalance() >= 0 ? "text-green-500" : "text-red-500")}>
                    {getBalance().toLocaleString()}원
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 새 거래 추가 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>새 거래 추가</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={type === "expense" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setType("expense")}
                  >
                    지출
                  </Button>
                  <Button
                    variant={type === "income" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setType("income")}
                  >
                    수입
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">날짜</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: ko }) : <span>날짜 선택</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          카테고리가 없습니다. 설정에서 추가해주세요.
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Input
                    id="description"
                    placeholder="거래 설명"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amount">금액 (원)</Label>
                    <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>계산기</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                          <div className="bg-muted p-3 rounded-md mb-4">
                            <div className="text-right text-lg font-mono">{calculatorInput || "0"}</div>
                            {calculatorResult && (
                              <div className="text-right text-sm text-muted-foreground font-mono">
                                = {calculatorResult}
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("7")}>
                              7
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("8")}>
                              8
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("9")}>
                              9
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("/")}>
                              ÷
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("4")}>
                              4
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("5")}>
                              5
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("6")}>
                              6
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("*")}>
                              ×
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("1")}>
                              1
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("2")}>
                              2
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("3")}>
                              3
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("-")}>
                              -
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("0")}>
                              0
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput(".")}>
                              .
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("=")}>
                              =
                            </Button>
                            <Button variant="outline" className="h-12" onClick={() => handleCalculatorInput("+")}>
                              +
                            </Button>
                            <Button
                              variant="outline"
                              className="h-12 col-span-2"
                              onClick={() => handleCalculatorInput("C")}
                            >
                              C
                            </Button>
                            <Button
                              variant="outline"
                              className="h-12 col-span-2"
                              onClick={() => handleCalculatorInput("←")}
                            >
                              ←
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                {type === "expense" && cards.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="card">결제 카드 (선택)</Label>
                    <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                      <SelectTrigger>
                        <SelectValue placeholder="카드 선택 (선택사항)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">현금 결제</SelectItem>
                        {cards.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            {card.cardType} •••• {card.lastFourDigits}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleAddTransaction}
                disabled={!description || !amount || Number.parseFloat(amount) <= 0 || !category}
              >
                <Plus className="mr-2 h-4 w-4" /> 거래 추가
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
