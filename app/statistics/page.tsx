"use client"

import { useState } from "react"
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getYear, getMonth } from "date-fns"
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
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "income">("overview")
  const { transactions, getMonthlyTransactions, getTotalIncome, getTotalExpense, getBalance } = useFinance()

  // 현재 월의 시작일과 종료일
  const startDate = startOfMonth(date)
  const endDate = endOfMonth(date)

  // 작년 같은 달의 시작일과 종료일
  const lastYearStartDate = subMonths(startDate, 12)
  const lastYearEndDate = subMonths(endDate, 12)

  // 현재 월과 작년 같은 달의 거래 데이터
  const currentMonthTransactions = getMonthlyTransactions(getYear(date), getMonth(date))
  const lastYearMonthTransactions = getMonthlyTransactions(getYear(lastYearStartDate), getMonth(lastYearStartDate))

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
  const expenseByCategory = aggregateByCategory(currentMonthTransactions, "expense")
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

  // 카테고리별 수입 데이터
  const incomeByCategory = aggregateByCategory(currentMonthTransactions, "income")
  const INCOME_COLORS = ["#4CAF50", "#8BC34A", "#CDDC39", "#FFC107", "#FF9800"]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">통계 분석</h1>
        <p className="text-muted-foreground">지출과 수입을 분석하고 관리하세요</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "yyyy년 MM월", { locale: ko })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="month" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
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
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* 개요 탭 내용 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">이번 달 지출</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMonthExpense.toLocaleString()}원</div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className={cn("flex items-center", expenseChangeRate > 0 ? "text-red-500" : "text-green-500")}>
                    {expenseChangeRate > 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(expenseChangeRate).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">작년 대비</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">이번 달 수입</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMonthIncome.toLocaleString()}원</div>
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
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">잔액</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getBalance(currentMonthTransactions).toLocaleString()}원</div>
                <div className="flex items-center space-x-2 text-sm">
                  <span
                    className={cn(
                      "flex items-center",
                      currentMonthIncome > currentMonthExpense ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {currentMonthIncome > currentMonthExpense ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {currentMonthExpense > 0
                      ? Math.abs(((currentMonthIncome - currentMonthExpense) / currentMonthExpense) * 100).toFixed(1)
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
                  {currentMonthIncome > 0
                    ? (((currentMonthIncome - currentMonthExpense) / currentMonthIncome) * 100).toFixed(1)
                    : "0"}
                  %
                </div>
                <div className="text-xs text-muted-foreground">수입 중 저축 비율</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "overview" && (
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
                <CardDescription>{format(date, "yyyy년 MM월", { locale: ko })} 지출 분포</CardDescription>
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
          </div>
        )}

        {activeTab === "expenses" && (
          <Card>
            <CardHeader>
              <CardTitle>지출 분석</CardTitle>
              <CardDescription>{format(date, "yyyy년 MM월", { locale: ko })} 지출 분석 결과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">작년 대비 분석</h4>
                  <p className="text-sm text-muted-foreground">
                    {expenseChangeRate > 0
                      ? `작년 같은 달보다 지출이 ${Math.abs(expenseChangeRate).toFixed(1)}% 증가했어요. 지출 관리에 주의가 필요합니다.`
                      : `작년 같은 달보다 지출이 ${Math.abs(expenseChangeRate).toFixed(1)}% 감소했어요. 지출 관리를 잘하고 계시네요!`}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">카테고리 분석</h4>
                  <p className="text-sm text-muted-foreground">
                    {expenseByCategory.length > 0 &&
                      `가장 많은 지출은 ${expenseByCategory[0].name} 카테고리로, 전체 지출의 ${((expenseByCategory[0].value / currentMonthExpense) * 100).toFixed(1)}%를 차지합니다.`}
                    {expenseByCategory.length > 1 &&
                      ` 그 다음으로는 ${expenseByCategory[1].name} 카테고리가 ${((expenseByCategory[1].value / currentMonthExpense) * 100).toFixed(1)}%를 차지합니다.`}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">지출 패턴</h4>
                  <p className="text-sm text-muted-foreground">
                    {dailyData.length > 0 && dailyData.some((d) => d.expense > 0) ? (
                      <>
                        {dailyData.reduce((max, item) => (item.expense > max.expense ? item : max), dailyData[0]).date}
                        일에 가장 많은 지출(
                        {dailyData
                          .reduce((max, item) => (item.expense > max.expense ? item : max), dailyData[0])
                          .expense.toLocaleString()}
                        원)이 있었습니다. 월초보다 월말에 지출이{" "}
                        {dailyData.slice(0, 10).reduce((sum, item) => sum + item.expense, 0) <
                        dailyData.slice(-10).reduce((sum, item) => sum + item.expense, 0)
                          ? "증가"
                          : "감소"}
                        하는 경향이 있습니다.
                      </>
                    ) : (
                      "이번 달 지출 데이터가 충분하지 않습니다."
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "income" && (
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>카테고리별 수입</CardTitle>
                <CardDescription>{format(date, "yyyy년 MM월", { locale: ko })} 수입 분포</CardDescription>
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
          </div>
        )}

        {activeTab === "income" && (
          <Card>
            <CardHeader>
              <CardTitle>수입 분석</CardTitle>
              <CardDescription>{format(date, "yyyy년 MM월", { locale: ko })} 수입 분석 결과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">작년 대비 분석</h4>
                  <p className="text-sm text-muted-foreground">
                    {incomeChangeRate > 0
                      ? `작년 같은 달보다 수입이 ${Math.abs(incomeChangeRate).toFixed(1)}% 증가했어요. 재정 상태가 개선되고 있습니다!`
                      : `작년 같은 달보다 수입이 ${Math.abs(incomeChangeRate).toFixed(1)}% 감소했어요. 추가 수입원을 고려해보세요.`}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">카테고리 분석</h4>
                  <p className="text-sm text-muted-foreground">
                    {incomeByCategory.length > 0 &&
                      `가장 많은 수입은 ${incomeByCategory[0].name} 카테고리로, 전체 수입의 ${((incomeByCategory[0].value / currentMonthIncome) * 100).toFixed(1)}%를 차지합니다.`}
                    {incomeByCategory.length > 1 &&
                      ` 그 다음으로는 ${incomeByCategory[1].name} 카테고리가 ${((incomeByCategory[1].value / currentMonthIncome) * 100).toFixed(1)}%를 차지합니다.`}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">수입 패턴</h4>
                  <p className="text-sm text-muted-foreground">
                    {dailyData.length > 0 && dailyData.some((d) => d.income > 0) ? (
                      <>
                        {dailyData.reduce((max, item) => (item.income > max.income ? item : max), dailyData[0]).date}
                        일에 가장 많은 수입(
                        {dailyData
                          .reduce((max, item) => (item.income > max.income ? item : max), dailyData[0])
                          .income.toLocaleString()}
                        원)이 있었습니다. 수입이 지출보다 {currentMonthIncome > currentMonthExpense ? "많아" : "적어"}
                        {currentMonthIncome > currentMonthExpense
                          ? " 재정 상태가 양호합니다."
                          : " 지출 관리에 주의가 필요합니다."}
                      </>
                    ) : (
                      "이번 달 수입 데이터가 충분하지 않습니다."
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
