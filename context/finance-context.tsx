"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// 거래 타입 정의
export type Transaction = {
  id: string
  date: Date
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  cardId?: string
}

// 카드 타입 정의
export type CardInfo = {
  id: string
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  cardType: string
  lastFourDigits: string
}

// 컨텍스트 타입 정의
type FinanceContextType = {
  transactions: Transaction[]
  cards: CardInfo[]
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  addCard: (card: Omit<CardInfo, "id">) => void
  deleteCard: (id: string) => void
  getMonthlyTransactions: (year: number, month: number) => Transaction[]
  getYearlyTransactions: (year: number) => Transaction[]
  getTotalIncome: (transactions?: Transaction[]) => number
  getTotalExpense: (transactions?: Transaction[]) => number
  getBalance: (transactions?: Transaction[]) => number
}

// 컨텍스트 생성
const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

// 컨텍스트 프로바이더 컴포넌트
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cards, setCards] = useState<CardInfo[]>([])

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions")
    const storedCards = localStorage.getItem("cards")

    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions)
        // Date 객체로 변환
        setTransactions(
          parsedTransactions.map((t: any) => ({
            ...t,
            date: new Date(t.date),
          })),
        )
      } catch (error) {
        console.error("Failed to parse transactions:", error)
      }
    }

    if (storedCards) {
      try {
        setCards(JSON.parse(storedCards))
      } catch (error) {
        console.error("Failed to parse cards:", error)
      }
    }
  }, [])

  // 데이터 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions))
    }
  }, [transactions])

  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem("cards", JSON.stringify(cards))
    }
  }, [cards])

  // 거래 추가 함수
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  // 거래 삭제 함수
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  // 카드 추가 함수
  const addCard = (card: Omit<CardInfo, "id">) => {
    const newCard: CardInfo = {
      ...card,
      id: Date.now().toString(),
    }
    setCards((prev) => [...prev, newCard])
  }

  // 카드 삭제 함수
  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  // 월별 거래 필터링 함수
  const getMonthlyTransactions = (year: number, month: number) => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month
    })
  }

  // 연도별 거래 필터링 함수
  const getYearlyTransactions = (year: number) => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getFullYear() === year
    })
  }

  // 총 수입 계산 함수
  const getTotalIncome = (filteredTransactions?: Transaction[]) => {
    const transactionsToUse = filteredTransactions || transactions
    return transactionsToUse.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  }

  // 총 지출 계산 함수
  const getTotalExpense = (filteredTransactions?: Transaction[]) => {
    const transactionsToUse = filteredTransactions || transactions
    return transactionsToUse.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  }

  // 잔액 계산 함수
  const getBalance = (filteredTransactions?: Transaction[]) => {
    return getTotalIncome(filteredTransactions) - getTotalExpense(filteredTransactions)
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        cards,
        addTransaction,
        deleteTransaction,
        addCard,
        deleteCard,
        getMonthlyTransactions,
        getYearlyTransactions,
        getTotalIncome,
        getTotalExpense,
        getBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

// 커스텀 훅
export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

