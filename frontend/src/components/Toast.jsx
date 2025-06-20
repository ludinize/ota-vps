import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react'

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: AlertCircle
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  const Icon = icons[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`${colors[type]} border rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 ${iconColors[type]} flex-shrink-0 mt-0.5`} />
          <p className="text-sm font-medium flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast 