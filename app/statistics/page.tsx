"use client"

import { useState } from "react"
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getYear,
  getMonth,
  getDate,
} from "date-fns"
import { ko } from "date-fns/locale"
import { ArrowUp, ArrowDown, CalendarIcon, TrendingDown, TrendingUp, DollarSign, Percent } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useFinance, type Transaction } from "@/context/finance-context"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// 카테고리별 데이터 집계 함수
const aggregateByCategory = (transactions: Transaction[], type: "income" | "expense") => {
  const result: { [category: string]: number } = {}

  transactions
    .filter((t) => t.type === type)
    .forEach((transaction) => {
      result[transaction.category] = (result[transaction.category] || 0) + transaction.amount
    })

  return Object.entries(result).map(([name, value]) => ({ name, value }))
}

export default function StatisticsPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "income" | "daily">("overview")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"month" | "day">("month")
  const { transactions, getMonthlyTransactions, getTotalIncome, getTotalExpense, getBalance } = useFinance()

  // 날짜 선택 시 통계 업데이트 함수
  const updateStatistics = (newDate: Date | undefined) => {
    if (newDate) {
      // 날짜 상태 업데이트
      setDate(newDate)

      // 상세 날짜 정보 로그 출력
      const formattedDate = format(newDate, "yyyy년 MM월 dd일 (EEEE)", { locale: ko })
      console.log(`통계 업데이트: ${formattedDate}`)

      // 선택한 연도와 월, 일 정보
      const year = getYear(newDate)
      const month = getMonth(newDate)
      const day = getDate(newDate)
      console.log(`선택한 연도: ${year}, 월: ${month + 1}, 일: ${day}`)

      // 해당 월의 거래 데이터 수
      const monthTransactions = getMonthlyTransactions(year, month)
      console.log(`해당 월 거래 데이터 수: ${monthTransactions.length}건`)

      // 해당 일의 거래 데이터 수
      const dayTransactions = monthTransactions.filter((t) => isSameDay(new Date(t.date), newDate))
      console.log(`해당 일 거래 데이터 수: ${dayTransactions.length}건`)

      // 일별 보기 모드에서 날짜를 선택하면 일별 탭으로 자동 전환
      if (viewMode === "day" && dayTransactions.length > 0) {
        setActiveTab("daily")
      }

      // 캘린더 팝오버 닫기
      setIsCalendarOpen(false)
    }
  }

  // 현재 월의 시작일과 종료일
  const startDate = startOfMonth(date)
  const endDate = endOfMonth(date)

  // 작년 같은 달의 시작일과 종료일
  const lastYearStartDate = subMonths(startDate, 12)
  const lastYearEndDate = subMonths(endDate, 12)

  // 현재 월과 작년 같은 달의 거래 데이터
  const currentMonthTransactions = getMonthlyTransactions(getYear(date), getMonth(date))
  const lastYearMonthTransactions = getMonthlyTransactions(getYear(lastYearStartDate), getMonth(lastYearStartDate))

  // 선택한 날짜의 거래 데이터
  const selectedDayTransactions = currentMonthTransactions.filter((t) => isSameDay(new Date(t.date), date))
  const dailyIncome = getTotalIncome(selectedDayTransactions)
  const dailyExpense = getTotalExpense(selectedDayTransactions)
  const dailyBalance = getBalance(selectedDayTransactions)

  // 현재 월과 작년 같은 달의 총 지출/수입
  const currentMonthExpense = getTotalExpense(currentMonthTransactions)
  const currentMonthIncome = getTotalIncome(currentMonthTransactions)
  const lastYearMonthExpense = getTotalExpense(lastYearMonthTransactions)
  const lastYearMonthIncome = getTotalIncome(lastYearMonthTransactions)

  // 지출/수입 증감률
  const expenseChangeRate = lastYearMonthExpense
    ? ((currentMonthExpense - lastYearMonthExpense) / lastYearMonthExpense) * 100
    : 0
  const incomeChangeRate = lastYearMonthIncome
    ? ((currentMonthIncome - lastYearMonthIncome) / lastYearMonthIncome) * 100
    : 0

  // 날짜별 데이터
  const dailyData = eachDayOfInterval({ start: startDate, end: endDate }).map((day) => {
    const dayTransactions = currentMonthTransactions.filter((t) => isSameDay(new Date(t.date), day))

    const expense = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    return {
      date: format(day, "MM.dd"),
      expense,
      income,
      balance: income - expense,
    }
  })

  // 카테고리별 지출 데이터
  const expenseByCategory = aggregateByCategory(
    viewMode === "month" ? currentMonthTransactions : selectedDayTransactions,
    "expense",
  )
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

  // 카테고리별 수입 데이터
  const incomeByCategory = aggregateByCategory(
    viewMode === "month" ? currentMonthTransactions : selectedDayTransactions,
    "income",
  )
  const INCOME_COLORS = ["#4CAF50", "#8BC34A", "#CDDC39", "#FFC107", "#FF9800"]

  // 선택한 날짜의 거래 내역
  const selectedDateTransactions = viewMode === "day" ? selectedDayTransactions : currentMonthTransactions

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">통계 분석</h1>
        <p className="text-muted-foreground">지출과 수입을 분석하고 관리하세요</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("month")}
            >
              월별 보기
            </Button>
            <Button variant={viewMode === "day" ? "default" : "outline"} size="sm" onClick={() => setViewMode("day")}>
              일별 보기
            </Button>
          </div>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {viewMode === "month"
                  ? format(date, "yyyy년 MM월", { locale: ko })
                  : format(date, "yyyy년 MM월 dd일 (EEEE)", { locale: ko })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={updateStatistics} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="flex-1 md:flex-none"
          >
            개요
          </Button>
          <Button
            variant={activeTab === "expenses" ? "default" : "outline"}
            onClick={() => setActiveTab("expenses")}
            className="flex-1 md:flex-none"
          >
            지출
          </Button>
          <Button
            variant={activeTab === "income" ? "default" : "outline"}
            onClick={() => setActiveTab("income")}
            className="flex-1 md:flex-none"
          >
            수입
          </Button>
          {viewMode === "day" && (
            <Button
              variant={activeTab === "daily" ? "default" : "outline"}
              onClick={() => setActiveTab("daily")}
              className="flex-1 md:flex-none"
            >
              일별
            </Button>
          )}
        </div>
      </div>

      {/* 일별 보기 모드에서 선택한 날짜의 요약 정보 */}
      {viewMode === "day" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{format(date, "yyyy년 MM월 dd일 (EEEE)", { locale: ko })} 요약</CardTitle>
            <CardDescription>선택한 날짜의 거래 요약</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">수입</span>
                <span className="text-2xl font-bold text-green-500">{dailyIncome.toLocaleString()}원</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">지출</span>
                <span className="text-2xl font-bold text-red-500">{dailyExpense.toLocaleString()}원</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">잔액</span>
                <span className={`text-2xl font-bold ${dailyBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {dailyBalance.toLocaleString()}원
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* 개요 탭 내용 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {viewMode === "month" ? "이번 달 지출" : "오늘 지출"}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(viewMode === "month" ? currentMonthExpense : dailyExpense).toLocaleString()}원
                </div>
                {viewMode === "month" && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span
                      className={cn("flex items-center", expenseChangeRate > 0 ? "text-red-500" : "text-green-500")}
                    >
                      {expenseChangeRate > 0 ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(expenseChangeRate).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">작년 대비</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {viewMode === "month" ? "이번 달 수입" : "오늘 수입"}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(viewMode === "month" ? currentMonthIncome : dailyIncome).toLocaleString()}원
                </div>
                {viewMode === "month" && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={cn("flex items-center", incomeChangeRate > 0 ? "text-green-500" : "text-red-500")}>
                      {incomeChangeRate > 0 ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(incomeChangeRate).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">작년 대비</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">잔액</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(viewMode === "month" ? getBalance(currentMonthTransactions) : dailyBalance).toLocaleString()}원
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span
                    className={cn(
                      "flex items-center",
                      (viewMode === "month" ? currentMonthIncome > currentMonthExpense : dailyIncome > dailyExpense)
                        ? "text-green-500"
                        : "text-red-500",
                    )}
                  >
                    {(viewMode === "month" ? currentMonthIncome > currentMonthExpense : dailyIncome > dailyExpense) ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {viewMode === "month"
                      ? currentMonthExpense > 0
                        ? Math.abs(((currentMonthIncome - currentMonthExpense) / currentMonthExpense) * 100).toFixed(1)
                        : "0"
                      : dailyExpense > 0
                        ? Math.abs(((dailyIncome - dailyExpense) / dailyExpense) * 100).toFixed(1)
                        : "0"}
                    %
                  </span>
                  <span className="text-muted-foreground">수입 대비</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">저축률</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {viewMode === "month"
                    ? currentMonthIncome > 0
                      ? (((currentMonthIncome - currentMonthExpense) / currentMonthIncome) * 100).toFixed(1)
                      : "0"
                    : dailyIncome > 0
                      ? (((dailyIncome - dailyExpense) / dailyIncome) * 100).toFixed(1)
                      : "0"}
                  %
                </div>
                <div className="text-xs text-muted-foreground">수입 중 저축 비율</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "overview" && viewMode === "month" && (
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>일별 수입/지출</CardTitle>
                <CardDescription>{format(date, "yyyy년 MM월", { locale: ko })} 일별 추이</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="income"
                        name="수입"
                        stackId="1"
                        stroke="#4CAF50"
                        fill="#4CAF50"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        name="지출"
                        stackId="2"
                        stroke="#FF5722"
                        fill="#FF5722"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>작년 대비 분석</CardTitle>
                <CardDescription>작년 같은 달과 비교</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "수입",
                          올해: currentMonthIncome,
                          작년: lastYearMonthIncome,
                        },
                        {
                          name: "지출",
                          올해: currentMonthExpense,
                          작년: lastYearMonthExpense,
                        },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                      <Legend />
                      <Bar dataKey="올해" fill="#8884d8" />
                      <Bar dataKey="작년" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">분석 결과</h4>
                  <p className="text-sm text-muted-foreground">
                    {expenseChangeRate > 0
                      ? `작년 같은 달보다 지출이 ${Math.abs(expenseChangeRate).toFixed(1)}% 증가했어요.`
                      : `작년 같은 달보다 지출이 ${Math.abs(expenseChangeRate).toFixed(1)}% 감소했어요.`}{" "}
                    {incomeChangeRate > 0
                      ? `수입은 ${Math.abs(incomeChangeRate).toFixed(1)}% 증가했습니다.`
                      : `수입은 ${Math.abs(incomeChangeRate).toFixed(1)}% 감소했습니다.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>카테고리별 지출</CardTitle>
                <CardDescription>
                  {viewMode === "month"
                    ? format(date, "yyyy년 MM월", { locale: ko })
                    : format(date, "yyyy년 MM월 dd일", { locale: ko })}{" "}
                  지출 분포
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {viewMode === "month" && (
              <Card>
                <CardHeader>
                  <CardTitle>일별 지출 추이</CardTitle>
                  <CardDescription>{format(date, "yyyy년 MM월", { locale: ko })} 일별 지출</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                        <Legend />
                        <Bar dataKey="expense" name="지출" fill="#FF5722" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "income" && (
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>카테고리별 수입</CardTitle>
                <CardDescription>
                  {viewMode === "month"
                    ? format(date, "yyyy년 MM월", { locale: ko })
                    : format(date, "yyyy년 MM월 dd일", { locale: ko })}{" "}
                  수입 분포
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#4CAF50"
                        dataKey="value"
                      >
                        {incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {viewMode === "month" && (
              <Card>
                <CardHeader>
                  <CardTitle>일별 수입 추이</CardTitle>
                  <CardDescription>{format(date, "yyyy년 MM월", { locale: ko })} 일별 수입</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                        <Legend />
                        <Bar dataKey="income" name="수입" fill="#4CAF50" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 일별 상세 탭 */}
        {activeTab === "daily" && viewMode === "day" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{format(date, "yyyy년 MM월 dd일 (EEEE)", { locale: ko })} 거래 내역</CardTitle>
                <CardDescription>선택한 날짜의 모든 거래</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDayTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">해당 날짜의 거래 내역이 없습니다.</div>
                ) : (
                  <div className="space-y-4">
                    {selectedDayTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex flex-col">
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transaction.date), "HH:mm")} • {transaction.category}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "font-medium",
                            transaction.type === "income" ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {transaction.amount.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>지출 분석</CardTitle>
                  <CardDescription>{format(date, "yyyy년 MM월 dd일", { locale: ko })} 지출 분석</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyExpense > 0 ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">카테고리 분석</h4>
                        <p className="text-sm text-muted-foreground">
                          {expenseByCategory.length > 0 &&
                            `가장 많은 지출은 ${expenseByCategory[0].name} 카테고리로, 전체 지출의 ${((expenseByCategory[0].value / dailyExpense) * 100).toFixed(1)}%를 차지합니다.`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">해당 날짜의 지출 내역이 없습니다.</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>수입 분석</CardTitle>
                  <CardDescription>{format(date, "yyyy년 MM월 dd일", { locale: ko })} 수입 분석</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyIncome > 0 ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-md">
                        <h4 className="font-medium mb-2">카테고리 분석</h4>
                        <p className="text-sm text-muted-foreground">
                          {incomeByCategory.length > 0 &&
                            `가장 많은 수입은 ${incomeByCategory[0].name} 카테고리로, 전체 수입의 ${((incomeByCategory[0].value / dailyIncome) * 100).toFixed(1)}%를 차지합니다.`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">해당 날짜의 수입 내역이 없습니다.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
