import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-gray-900 border-r border-gray-800">
        <div className="flex items-center gap-3">

        {/* Logo */}
        <Image src="/logo.png" alt="Cosmediq" width={160} height={55} className="object-contain" />
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Modern clinic<br />management for<br />
            <span className="text-blue-400">cosmetic care</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-12">
            Manage patients, treatments, appointments and payments — all in one place.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: '👥', text: 'Patient treatment tracking with sitting progress' },
              { icon: '📅', text: 'Smart appointment scheduling across branches' },
              { icon: '💳', text: 'Payment management with UPI, Card & Cash' },
              { icon: '🏥', text: 'Multi-branch support for growing clinics' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm">
                  {f.icon}
                </div>
                <p className="text-gray-300 text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <p className="text-gray-500 text-sm">All systems operational</p>
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 6C8.69 6 6 8.69 6 12s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 className="text-white font-bold text-xl">Cosmediq</h1>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-gray-400">Sign in to your Cosmediq account</p>
          </div>
          <SignIn
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-gray-900 border border-gray-800 shadow-xl rounded-2xl',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700',
                formFieldInput: 'bg-gray-800 border-gray-700 text-white',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-500',
                footerActionLink: 'text-blue-400',
                identityPreviewText: 'text-white',
                identityPreviewEditButton: 'text-blue-400',
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}