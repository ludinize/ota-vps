import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle } from 'lucide-react'

const UploadZone = ({ onUploadSuccess, onError }) => {
  const [uploading, setUploading] = useState(false)
  const [version, setVersion] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  // 文件拖拽处理
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      onError('仅支持 .bin 格式的固件文件', 'error')
      return
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }, [onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.bin']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  // 上传文件
  const handleUpload = async () => {
    if (!selectedFile) {
      onError('请先选择文件', 'error')
      return
    }

    if (!version.trim()) {
      onError('请输入版本号', 'error')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('firmware', selectedFile)
      formData.append('version', version.trim())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        onUploadSuccess(data.data)
        setSelectedFile(null)
        setVersion('')
      } else {
        onError(data.error || '上传失败', 'error')
      }
    } catch (error) {
      console.error('上传失败:', error)
      onError('网络错误，上传失败', 'error')
    } finally {
      setUploading(false)
    }
  }

  // 清除选择
  const handleClear = () => {
    setSelectedFile(null)
    setVersion('')
  }

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        {selectedFile ? (
          <div className="space-y-3">
            <FileText className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <p className="text-lg font-medium text-green-700">
                {selectedFile.name}
              </p>
              <p className="text-sm text-green-600">
                大小: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? '释放文件到此处' : '拖拽固件文件到此处'}
              </p>
              <p className="text-sm text-gray-500">
                或点击选择文件 • 仅支持 .bin 格式 • 最大 50MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 版本输入和操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            版本号 *
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="例如: v1.0.0, firmware_2024_01"
            className="input-field"
            disabled={uploading}
          />
        </div>
        <div className="flex gap-2 sm:self-end">
          <button
            onClick={handleClear}
            disabled={uploading || !selectedFile}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            清除
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !version.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>上传中...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>开始上传</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">上传说明：</p>
            <ul className="space-y-1 text-blue-600">
              <li>• 仅支持 .bin 格式的固件文件</li>
              <li>• 文件大小限制 50MB 以内</li>
              <li>• 版本号将用于生成唯一的文件名</li>
              <li>• 上传后可获得 OTA 下载链接</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadZone 