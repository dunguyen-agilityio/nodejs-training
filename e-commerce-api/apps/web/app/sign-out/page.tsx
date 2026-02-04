import React from 'react'

import Redirect from './Redirect'

async function SignOut() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-28 w-28 border-b-6 border-t-4 border-blue-500 flex justify-center items-center mb-6">
        <div className="animate-spin rounded-full h-24 w-24 border-l-4 border-r-6 border-blue-500"></div>
      </div>
      <p className="text-lg font-semibold text-foreground">Signing out...</p>
      <Redirect />
    </div>
  )
}

export default SignOut
