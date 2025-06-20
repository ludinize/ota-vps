import React from 'react'
import { Download, Copy, Trash2, Calendar, HardDrive } from 'lucide-react'

const FirmwareList = ({ firmwares, onDelete, onCopyUrl }) => {
  return (
    <div className="space-y-4">
      {firmwares.map((firmware) => (
        <div
          key={firmware.filename}
          className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* 固件信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <HardDrive className="h-5 w-5 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {firmware.version}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {firmware.filename}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <HardDrive className="h-4 w-4" />
                  <span>{firmware.sizeFormatted}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{firmware.uploadTime}</span>
                </div>
              </div>
            </div>

            {/* OTA 下载链接 */}
            <div className="lg:max-w-md">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                OTA 下载链接
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={firmware.downloadUrl}
                  readOnly
                  className="flex-1 text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 font-mono"
                />
                <button
                  onClick={() => onCopyUrl(firmware.downloadUrl)}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="复制链接"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-2">
              <a
                href={firmware.downloadUrl}
                download
                className="inline-flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                title="下载固件"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">下载</span>
              </a>
              <button
                onClick={() => onDelete(firmware.filename)}
                className="inline-flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                title="删除固件"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">删除</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FirmwareList 