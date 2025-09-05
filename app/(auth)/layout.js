import React, { Children } from 'react'

const AuthLayout= ({children}) => {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">{children}</div>
  )
}

export default AuthLayout
