import React from 'react'
import PersonalInformation from '../components/PersonalInformation'

export default function PersonalPage() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#210F61] via-[#3b2f86] to-[#5b4fb3] text-white rounded-3xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold">Kişisel Bilgiler</h1>
        <p className="text-white/80 text-sm mt-1">Bilgilerinizi görüntüleyin ve güncel tutun.</p>
      </div>
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <PersonalInformation />
      </div>
    </div>
  )
}
