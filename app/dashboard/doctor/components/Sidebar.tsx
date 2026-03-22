'use client'
import Link from 'next/link'
import Image from 'next/image'
import { SignOutButton } from '@clerk/nextjs'
import { LayoutDashboard, Users, Calendar, Stethoscope, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard/doctor', icon: LayoutDashboard },
  { label: 'My Patients', href: '/dashboard/doctor/patients', icon: Users },
  { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: Calendar },
  { label: 'Treatments', href: '/dashboard/doctor/treatments', icon: Stethoscope },
]

export default function DoctorSidebar({ active, doctorName, specialization }: {
  active: string
  doctorName?: string
  specialization?: string
}) {
  return (
    <div className="w-64 border-r border-gray-800 flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-800">
        <Image src="/logo.png" alt="Cosmediq" width={120} height={40} className="object-contain" />
        <p className="text-xs text-gray-500 mt-1">Doctor Portal</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active === item.label ? 'bg-gray-800 text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}>
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium">Dr. {doctorName ?? 'Karthik'}</p>
          <p className="text-xs text-gray-500">{specialization ?? 'Hair & Skin'}</p>
        </div>
        <SignOutButton>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <LogOut size={17} />
            Sign out
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}