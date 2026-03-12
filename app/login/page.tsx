import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Cosmediq</h1>
          <p className="text-gray-400 mt-1">Clinic Management Platform</p>
        </div>
        <SignIn routing="hash" />
      </div>
    </div>
  )
}