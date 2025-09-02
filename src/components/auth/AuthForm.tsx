"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import ReCAPTCHA from "react-google-recaptcha"

interface AuthFormProps {
    mode: "login" | "register"
    onSuccess?: () => void
    onError?: (error: string) => void
}

export function AuthForm({ mode, onSuccess, onError }: AuthFormProps) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [recaptchaToken, setRecaptchaToken] = useState<string>("")
    const recaptchaRef = useRef<ReCAPTCHA>(null)

    const { login, register, isLoading } = useAuth()

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const handleRecaptchaChange = (token: string | null) => {
        setRecaptchaToken(token || "")
        if (errors.recaptchaToken) {
            setErrors(prev => ({ ...prev, recaptchaToken: "" }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        try {
            if (mode === "login") {
                const result = await login(formData.email, formData.password)
                if (result?.success) {
                    onSuccess?.()
                } else {
                    setErrors({ general: result?.error || "Login failed" })
                    onError?.(result?.error || "Login failed")
                }
            } else {
                // Client-side password validation
                if (formData.password !== formData.confirmPassword) {
                    setErrors({ confirmPassword: "Passwords don't match" })
                    return
                }

                // reCAPTCHA validation
                if (!recaptchaToken) {
                    setErrors({ recaptchaToken: "Please complete the reCAPTCHA verification" })
                    return
                }

                const result = await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    recaptchaToken: recaptchaToken
                })
                if (result?.success) {
                    // Reset reCAPTCHA on success
                    if (recaptchaRef.current) {
                        recaptchaRef.current.reset();
                    }
                    setRecaptchaToken("")
                    onSuccess?.()
                } else {
                    // Reset reCAPTCHA on error
                    if (recaptchaRef.current) {
                        recaptchaRef.current.reset();
                    }
                    setRecaptchaToken("")
                    setErrors({ general: result?.error || "Registration failed" })
                    onError?.(result?.error || "Registration failed")
                }
            }
        } catch (error) {
            // Reset reCAPTCHA on error
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            setRecaptchaToken("")
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
            setErrors({ general: errorMessage })
            onError?.(errorMessage)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut" as const,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" as const }
        }
    }

    const isLogin = mode === "login"

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
        >
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-4">
                    <motion.div variants={itemVariants}>
                        <CardTitle className="font-heading text-gray-900 dark:text-gray-400 text-2xl font-bold text-center uppercase">
                            {isLogin ? "Welcome back" : "Create account"}
                        </CardTitle>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <CardDescription className="text-center text-muted-foreground dark:text-gray-400">
                            {isLogin
                                ? "Enter your credentials to access your account"
                                : "Fill in the details below to create your account"
                            }
                        </CardDescription>
                    </motion.div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <motion.div variants={itemVariants}>
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Full Name
                                </Label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                        required={!isLogin}
                                    />
                                </div>
                                {errors.name && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-600 mt-1 dark:text-red-400"
                                    >
                                        {errors.name}
                                    </motion.p>
                                )}
                            </motion.div>
                        )}

                        <motion.div variants={itemVariants}>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-600 mt-1 dark:text-red-400"
                                >
                                    {errors.email}
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </Label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-400 dark:hover:text-gray-300 dark:hover:text-gray-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-600 mt-1 dark:text-red-400"
                                >
                                    {errors.password}
                                </motion.p>
                            )}
                        </motion.div>

                        {!isLogin && (
                            <motion.div variants={itemVariants}>
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm Password
                                </Label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                        required={!isLogin}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-600 mt-1 dark:text-red-400"
                                    >
                                        {errors.confirmPassword}
                                    </motion.p>
                                )}
                            </motion.div>
                        )}

                        {!isLogin && (
                            <motion.div variants={itemVariants}>
                                <div className="flex justify-center">
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                        onChange={handleRecaptchaChange}
                                        theme="light"
                                        size="normal"
                                    />
                                </div>
                                {errors.recaptchaToken && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-600 mt-1 dark:text-red-400 text-center"
                                    >
                                        {errors.recaptchaToken}
                                    </motion.p>
                                )}
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {errors.general && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-900 dark:border-red-800"
                                >
                                    <p className="text-sm text-red-600 text-center">{errors.general}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div variants={itemVariants} className="pt-2">
                            <LoadingButton
                                type="submit"
                                className="w-full text-white font-medium py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                loading={isLoading}
                                loadingText={isLogin ? "Signing in..." : "Creating account..."}
                            >
                                {isLogin ? "Sign In" : "Create Account"}
                            </LoadingButton>
                        </motion.div>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center pt-0">
                    <motion.p variants={itemVariants} className="text-sm text-gray-600 dark:text-gray-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Button
                            variant="link"
                            className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => window.location.href = isLogin ? "/auth/register" : "/auth/signin"}
                        >
                            {isLogin ? "Sign up" : "Sign in"}
                        </Button>
                    </motion.p>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
