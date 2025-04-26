"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { useTheme } from "next-themes"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: "javascript" | "typescript"
}

export default function CodeEditor({ value, onChange, language = "javascript" }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { resolvedTheme } = useTheme()

  // Auto-resize the textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.max(400, textarea.scrollHeight)}px`
    }

    adjustHeight()

    // Add event listener for future changes
    textarea.addEventListener("input", adjustHeight)

    return () => {
      textarea.removeEventListener("input", adjustHeight)
    }
  }, [value])

  // Handle tab key to insert spaces instead of changing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()

      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      // Insert 2 spaces at cursor position
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)

      // Move cursor after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  return (
    <div className="code-editor-container relative border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="code-editor-header px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex items-center">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{language}</span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full min-h-[400px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none resize-none"
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        data-gramm="false"
      />
      <style jsx>{`
        textarea {
          tab-size: 2;
        }
      `}</style>
    </div>
  )
}
