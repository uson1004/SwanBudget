"use client"

import { useState, useEffect } from "react"
import { Save, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFinance } from "@/context/finance-context"
import { useTheme } from "next-themes"

export default function MyPage() {
  const { userSettings, updateUserSettings } = useFinance()
  const { theme, setTheme } = useTheme()

  const [userName, setUserName] = useState(userSettings.userName)
  const [email, setEmail] = useState(userSettings.email)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 사용자 설정이 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    setUserName(userSettings.userName)
    setEmail(userSettings.email)
  }, [userSettings])

  // 사용자 정보 저장 함수
  const saveUserInfo = () => {
    if (!userName.trim()) {
      setError("이름을 입력해주세요.")
      setTimeout(() => setError(null), 3000)
      return
    }

    if (!email.trim()) {
      setError("이메일을 입력해주세요.")
      setTimeout(() => setError(null), 3000)
      return
    }

    updateUserSettings({
      userName,
      email,
    })
    setSuccess("사용자 정보가 저장되었습니다.")
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
        <p className="text-muted-foreground">개인 설정을 관리하세요</p>
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

      <div className="grid gap-6 max-w-2xl mx-auto">
        {/* 프로필 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>프로필 정보</CardTitle>
            <CardDescription>개인 정보를 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveUserInfo}>
              <Save className="mr-2 h-4 w-4" /> 저장
            </Button>
          </CardFooter>
        </Card>

        {/* 테마 설정 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>테마 설정</CardTitle>
            <CardDescription>앱 테마를 변경하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">다크 모드</Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setTheme("light")}
              >
                <div className="w-4 h-4 rounded-full bg-white border mr-2"></div>
                라이트 모드
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setTheme("dark")}
              >
                <div className="w-4 h-4 rounded-full bg-slate-900 border mr-2"></div>
                다크 모드
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setTheme("system")}
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-white to-slate-900 border mr-2"></div>
                시스템 설정
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
