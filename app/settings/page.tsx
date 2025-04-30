"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Trash2, Download, Upload, Plus, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useFinance } from "@/context/finance-context"

export default function SettingsPage() {
  const router = useRouter()
  const { transactions, cards, categories, addCategory, deleteCategory, resetAllData, restoreData } = useFinance()

  const [newCategory, setNewCategory] = useState("")
  const [categoryType, setCategoryType] = useState<"income" | "expense">("expense")
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 카테고리 추가 함수
  const handleAddCategory = () => {
    if (!newCategory.trim()) return

    const exists = categories.some((cat) => cat.name === newCategory && cat.type === categoryType)
    if (exists) {
      setError("이미 존재하는 카테고리입니다.")
      setTimeout(() => setError(null), 3000)
      return
    }

    addCategory({
      name: newCategory,
      type: categoryType,
    })

    setNewCategory("")
    setSuccess("카테고리가 추가되었습니다.")
    setTimeout(() => setSuccess(null), 3000)
  }

  // 카테고리 삭제 함수
  const handleDeleteCategory = (id: string) => {
    deleteCategory(id)
    setSuccess("카테고리가 삭제되었습니다.")
    setTimeout(() => setSuccess(null), 3000)
  }

  // 데이터 백업 함수
  const backupData = () => {
    try {
      const data = {
        transactions,
        cards,
        categories,
        backupDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `백조_백업_${format(new Date(), "yyyy-MM-dd")}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess("데이터가 성공적으로 백업되었습니다.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("데이터 백업 중 오류가 발생했습니다.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // 데이터 복원 함수
  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        restoreData(data)

        setSuccess("데이터가 성공적으로 복원되었습니다.")
        setTimeout(() => setSuccess(null), 3000)
      } catch (err) {
        setError("데이터 복원 중 오류가 발생했습니다.")
        setTimeout(() => setError(null), 3000)
      }
    }
    reader.readAsText(file)

    // 파일 입력 초기화
    event.target.value = ""
  }

  // 데이터 초기화 함수
  const handleResetData = () => {
    resetAllData()
    setIsResetDialogOpen(false)
    setSuccess("모든 데이터가 초기화되었습니다.")
    setTimeout(() => {
      setSuccess(null)
      router.push("/")
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">설정</h1>
        <p className="text-muted-foreground">앱 설정 및 데이터 관리</p>
      </div>

      {success && (
        <Alert className="mb-6 border-green-500 text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>성공</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="categories">카테고리</TabsTrigger>
          <TabsTrigger value="data">데이터</TabsTrigger>
        </TabsList>

        {/* 카테고리 탭 */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>카테고리 관리</CardTitle>
              <CardDescription>수입 및 지출 카테고리를 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={categoryType === "expense" ? "default" : "outline"}
                    onClick={() => setCategoryType("expense")}
                    className="w-full"
                  >
                    지출 카테고리
                  </Button>
                  <Button
                    variant={categoryType === "income" ? "default" : "outline"}
                    onClick={() => setCategoryType("income")}
                    className="w-full"
                  >
                    수입 카테고리
                  </Button>
                </div>

                <div className="flex items-end space-x-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-category">새 카테고리</Label>
                    <Input
                      id="new-category"
                      placeholder="카테고리 이름"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddCategory}>
                    <Plus className="mr-2 h-4 w-4" /> 추가
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {categoryType === "expense" ? "지출 카테고리" : "수입 카테고리"}
                </h3>
                <div className="space-y-2">
                  {categories
                    .filter((cat) => cat.type === categoryType)
                    .map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 border rounded-md">
                        <span>{category.name}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 데이터 탭 */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>데이터 관리</CardTitle>
              <CardDescription>데이터 백업 및 복원</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">데이터 백업</CardTitle>
                    <CardDescription>현재 데이터를 파일로 저장합니다</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button onClick={backupData} className="w-full">
                      <Download className="mr-2 h-4 w-4" /> 백업 다운로드
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">데이터 복원</CardTitle>
                    <CardDescription>백업 파일에서 데이터를 복원합니다</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <div className="w-full">
                      <Label htmlFor="restore-file" className="w-full">
                        <div className="flex items-center justify-center w-full h-9 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" /> 백업 파일 선택
                        </div>
                      </Label>
                      <Input
                        id="restore-file"
                        type="file"
                        accept=".json"
                        onChange={handleRestoreData}
                        className="hidden"
                      />
                    </div>
                  </CardFooter>
                </Card>
              </div>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">데이터 초기화</CardTitle>
                  <CardDescription>모든 데이터를 삭제하고 앱을 초기화합니다</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" /> 모든 데이터 초기화
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>데이터 초기화 확인</DialogTitle>
                        <DialogDescription>
                          모든 거래 내역, 카드 정보, 설정이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="p-4 bg-muted rounded-md text-sm">
                        삭제될 데이터:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>거래 내역 ({transactions.length}개)</li>
                          <li>카드 정보 ({cards.length}개)</li>
                          <li>카테고리 설정</li>
                          <li>사용자 설정</li>
                        </ul>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                          취소
                        </Button>
                        <Button variant="destructive" onClick={handleResetData}>
                          초기화 확인
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
