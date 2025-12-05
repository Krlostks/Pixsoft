"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

type Step = "form" | "verification"

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("form")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [id_usuario, setId_usuario] = useState<number | null>(null)
  const { authenticated, admin } = useAuth()
  const router = useRouter()
  
    // Redirigir si ya está autenticado
    useEffect(() => {
      if (authenticated) {
        if (admin) {
          router.push("/admin/")
        } else {
          router.push("/")
        }
      }
    }, [authenticated, admin, router])

  // Form data
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    acceptTerms: false,
  })

  // Verification code
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    const newCode = [...verificationCode]
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newCode[i] = pastedData[i]
      }
    }
    setVerificationCode(newCode)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    if (!formData.acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones")
      return
    }
    setIsLoading(true)
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/usuarios/register", {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono
      });
      if (response.data.userId) {
        setId_usuario(response.data.userId);
        setStep("verification")
        toast.success("Registro exitoso. Por favor verifica tu correo.")
      }
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join("")
    if (code.length !== 6) {
      alert("Ingresa el código completo")
      return
    }
    setIsLoading(true)
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/usuarios/verify-email", {
        code: code,
        userId: id_usuario 
      })
      if (response.data.token) {
        window.location.href = "/"
        Cookies.set("token", response.data.token, { expires: 7 });
        toast.success("¡Cuenta verificada con éxito! Ya puedes iniciar sesión.")
      }
    } catch (error) {
      toast.error("Error during code verification:", axios.isAxiosError(error) && error.response ? error.response.data : "Error");
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Register Card */}
      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {step === "form" ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-white to-cyan-200 flex items-center justify-center shadow-lg">
                  <Icons.userPlus className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Crear cuenta</h1>
                <p className="text-muted-foreground">Únete a PixSoft y disfruta de ofertas exclusivas</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitForm} className="space-y-4">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-foreground font-medium">
                      Nombre
                    </Label>
                    <div className="relative">
                      <Icons.user className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Juan"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="pl-9 h-11 bg-secondary/50 border-border/50 rounded-xl focus:bg-background transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos" className="text-foreground font-medium">
                      Apellidos
                    </Label>
                    <Input
                      id="apellidos"
                      name="apellidos"
                      type="text"
                      placeholder="Pérez García"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      className="h-11 bg-secondary/50 border-border/50 rounded-xl focus:bg-background transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Icons.mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-9 h-11 bg-secondary/50 border-border/50 rounded-xl focus:bg-background transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-foreground font-medium">
                    Teléfono
                  </Label>
                  <div className="relative">
                    <Icons.phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      placeholder="555 123 4567"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="pl-9 h-11 bg-secondary/50 border-border/50 rounded-xl focus:bg-background transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Icons.lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-9 pr-10 h-11 bg-secondary/50 border-border/50 rounded-xl focus:bg-background transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <Icons.eyeOff className="w-4 h-4" /> : <Icons.eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Icons.lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-9 pr-10 h-11 bg-secondary/50 border-border/50 rounded-xl focus:bg-background transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <Icons.eyeOff className="w-4 h-4" /> : <Icons.eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, acceptTerms: checked as boolean }))}
                    className="mt-0.5 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    Acepto los{" "}
                    <Link href="/terms" className="text-primary hover:text-accent transition-colors">
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacy" className="text-primary hover:text-accent transition-colors">
                      Política de Privacidad
                    </Link>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-linear-to-r from-cyan-50 to-white hover:opacity-90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Creando cuenta...</span>
                    </div>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <p className="text-center mt-6 text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary hover:text-accent font-semibold transition-colors">
                  Iniciar sesión
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Verification Step */}
              <div className="text-center mb-8">
                <button
                  onClick={() => setStep("form")}
                  className="absolute top-8 left-8 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary/50"
                >
                  <Icons.arrowLeft className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Icons.shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Verificar correo</h1>
                <p className="text-muted-foreground">
                  Enviamos un código de 6 dígitos a<br />
                  <span className="text-foreground font-medium">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                {/* Code Input */}
                <div className="flex justify-center gap-2">
                  {verificationCode.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={handleCodePaste}
                      className="w-12 h-14 text-center text-xl font-bold bg-secondary/50 border-border/50 rounded-xl focus:bg-background focus:border-primary transition-all duration-300"
                    />
                  ))}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || verificationCode.some((d) => !d)}
                  className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Verificando...</span>
                    </div>
                  ) : (
                    "Verificar código"
                  )}
                </Button>

                {/* Resend Code */}
                <p className="text-center text-muted-foreground">
                  ¿No recibiste el código?{" "}
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={isLoading}
                    className="text-primary hover:text-accent font-semibold transition-colors disabled:opacity-50"
                  >
                    Reenviar
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
