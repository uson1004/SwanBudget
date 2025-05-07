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

// 카테고리 타입 정의
export type Category = {
  id: string
  name: string
  type: "income" | "expense"
}

// 사용자 설정 타입 정의
export type UserSettings = {
  userName: string
  email: string
  theme: string
}

// 컨텍스트 타입 정의
type FinanceContextType = {
  transactions: Transaction[]
  cards: CardInfo[]
  categories: Category[]
  userSettings: UserSettings
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  addCard: (card: Omit<CardInfo, "id">) => void
  deleteCard: (id: string) => void
  addCategory: (category: Omit<Category, "id">) => void
  deleteCategory: (id: string) => void
  updateUserSettings: (settings: Partial<UserSettings>) => void
  resetAllData: () => void
  restoreData: (data: any) => void
  getMonthlyTransactions: (year: number, month: number) => Transaction[]
  getYearlyTransactions: (year: number) => Transaction[]
  getTotalIncome: (transactions?: Transaction[]) => number
  getTotalExpense: (transactions?: Transaction[]) => number
  getBalance: (transactions?: Transaction[]) => number
}

// 기본 카테고리
const defaultCategories: Category[] = [
  { id: "1", name: "식비", type: "expense" },
  { id: "2", name: "주거비", type: "expense" },
  { id: "3", name: "교통비", type: "expense" },
  { id: "4", name: "쇼핑", type: "expense" },
  { id: "5", name: "의료비", type: "expense" },
  { id: "6", name: "여가", type: "expense" },
  { id: "7", name: "교육", type: "expense" },
  { id: "8", name: "기타지출", type: "expense" },
  { id: "9", name: "급여", type: "income" },
  { id: "10", name: "보너스", type: "income" },
  { id: "11", name: "투자수익", type: "income" },
  { id: "12", name: "용돈", type: "income" },
  { id: "13", name: "기타수입", type: "income" },
]

// 기본 사용자 설정
const defaultUserSettings: UserSettings = {
  userName: "홍길동",
  email: "user@example.com",
  theme: "system",
}

// 컨텍스트 생성
const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

// 컨텍스트 프로바이더 컴포넌트
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cards, setCards] = useState<CardInfo[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultUserSettings)

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions")
    const storedCards = localStorage.getItem("cards")
    const storedCategories = localStorage.getItem("categories")
    const storedUserSettings = localStorage.getItem("userSettings")

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

    if (storedCategories) {
      try {
        setCategories(JSON.parse(storedCategories))
      } catch (error) {
        console.error("Failed to parse categories:", error)
        setCategories(defaultCategories)
      }
    }

    if (storedUserSettings) {
      try {
        setUserSettings(JSON.parse(storedUserSettings))
      } catch (error) {
        console.error("Failed to parse user settings:", error)
        setUserSettings(defaultUserSettings)
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

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(userSettings))
  }, [userSettings])

  // 거래 추가 함수
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    console.log("Adding transaction in context:", transaction)
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  // 거래 수정 함수
  const updateTransaction = (id: string, transaction: Omit<Transaction, "id">) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...transaction,
              id,
            }
          : t,
      ),
    )
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

  // 카테고리 추가 함수
  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    }
    setCategories((prev) => [...prev, newCategory])
  }

  // 카테고리 삭제 함수
  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  // 사용자 설정 업데이트 함수
  const updateUserSettings = (settings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...settings }))
  }

  // 모든 데이터 초기화 함수
  const resetAllData = () => {
    setTransactions([])
    setCards([])
    setCategories(defaultCategories)
    setUserSettings(defaultUserSettings)
    localStorage.clear()
  }

  // 데이터 복원 함수
  const restoreData = (data: any) => {
    if (data.transactions) {
      setTransactions(
        data.transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        })),
      )
    }
    if (data.cards) {
      setCards(data.cards)
    }
    if (data.categories) {
      setCategories(data.categories)
    }
    if (data.settings) {
      setUserSettings(data.settings)
    }
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
        categories,
        userSettings,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCard,
        deleteCard,
        addCategory,
        deleteCategory,
        updateUserSettings,
        resetAllData,
        restoreData,
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
