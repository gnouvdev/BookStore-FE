import React from 'react'
import { Link } from 'react-router-dom'

const ThanksPage = () => {
  return (
    <div className="flex flex-col items-center text-center p-[100px]">
    <h1 className="text-3xl font-bold text-green-600">
      Thank you for your order!
    </h1>
    <p className="text-lg text-gray-600 mt-2">
      We will process your order as soon as possible.
    </p>
    <Link
      to="/"
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
    >
      Return to home page
    </Link>
  </div>
  )
}

export default ThanksPage
