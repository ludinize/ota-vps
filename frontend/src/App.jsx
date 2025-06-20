import React, { useState, useEffect } from 'react'
import { Upload, Download, Trash2, Copy, RefreshCw, Wifi, AlertCircle } from 'lucide-react'
import UploadZone from './components/UploadZone'
import FirmwareList from './components/FirmwareList'
import Toast from './components/Toast'

function App() {
  const [firmwares, setFirmwares] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // 获取固件列表
  const fetchFirmwares = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/firmwares')
      const data = await response.json()
      
      if (data.success) {
        setFirmwares(data.data)
      } else {
        showToast('获取固件列表失败', 'error')
      }
    } catch (error) {
      console.error('获取固件列表失败:', error)
      showToast('网络错误，请检查连接', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 显示提示信息
  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // 上传成功回调
  const handleUploadSuccess = (newFirmware) => {
    setFirmwares(prev => [newFirmware, ...prev])
    showToast('固件上传成功！', 'success')
  }

  // 删除固件
  const handleDelete = async (filename) => {
    if (!confirm('确定要删除这个固件吗？')) return

    try {
      const response = await fetch(`/api/delete/${filename}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setFirmwares(prev => prev.filter(fw => fw.filename !== filename))
        showToast('固件删除成功', 'success')
      } else {
        showToast(data.error || '删除失败', 'error')
      }
    } catch (error) {
      console.error('删除失败:', error)
      showToast('删除失败，请重试', 'error')
    }
  }

  // 复制下载链接
  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      showToast('下载链接已复制到剪贴板', 'success')
    }).catch(() => {
      showToast('复制失败，请手动复制', 'error')
    })
  }

  // 组件挂载时获取数据
  useEffect(() => {
    fetchFirmwares()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OTA 固件管理平台</h1>
                <p className="text-sm text-gray-500">Over-The-Air 固件更新管理系统</p>
              </div>
            </div>
            <button
              onClick={fetchFirmwares}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>刷新</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 上传区域 */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-primary-500" />
              固件上传
            </h2>
            <UploadZone onUploadSuccess={handleUploadSuccess} onError={showToast} />
          </div>

          {/* 固件列表 */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Download className="h-5 w-5 mr-2 text-primary-500" />
                固件列表
                <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {firmwares.length} 个文件
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary-500" />
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : firmwares.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">暂无固件文件</p>
                <p className="text-gray-400 text-sm">上传您的第一个 .bin 固件文件开始使用</p>
              </div>
            ) : (
              <FirmwareList
                firmwares={firmwares}
                onDelete={handleDelete}
                onCopyUrl={handleCopyUrl}
              />
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 OTA 固件管理平台 | 专为 IoT 设备固件管理而生
          </p>
        </div>
      </footer>

      {/* Toast 提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App 