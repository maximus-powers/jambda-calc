"use client"

import { useState, useRef, useEffect } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

interface CodeCommandProps {
  code: string
  className?: string
}

export default function CodeCommand({ code, className }: CodeCommandProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()

  // Clean up any existing timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true)

        // Clear any existing timer
        if (timerRef.current) clearTimeout(timerRef.current)

        // Reset copied state after 2 seconds
        timerRef.current = setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
      .catch((err) => {
        console.error("Failed to copy command: ", err)
      })
  }

  return (
    <div
      className={`code-card command-card my-4 rounded-lg overflow-hidden shadow-md bg-gray-50 dark:bg-gray-800 ${className}`}
    >
      <div className="code-card-header flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <span className="code-card-lang text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">bash</span>
        <button
          onClick={copyToClipboard}
          className="code-card-copy flex items-center justify-center w-8 h-8 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Copy to clipboard"
          aria-label="Copy command to clipboard"
        >
          {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
        </button>
      </div>
      <div className="code-card-content">
        <pre className="command-pre m-0 p-3 bg-[#1e1e1e] overflow-x-auto">
          <code className="language-bash">{code}</code>
        </pre>
      </div>
    </div>
  )
}
