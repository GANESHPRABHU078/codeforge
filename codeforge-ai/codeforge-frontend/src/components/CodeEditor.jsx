import Editor from '@monaco-editor/react'

const LANGUAGE_MAP = {
  java: 'java',
  javascript: 'javascript',
  jsx: 'javascript',
  python: 'python',
  json: 'json',
  html: 'html',
  css: 'css',
  yaml: 'yaml',
}

export default function CodeEditor({ file }) {
  if (!file) {
    return (
      <div className="card flex-1 flex items-center justify-center text-slate-400">
        Select a file to view its content
      </div>
    )
  }

  return (
    <div className="card flex-1 p-0 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-200 text-sm font-mono text-slate-600">
        {file.filePath}{file.fileName}
      </div>
      <Editor
        height="70vh"
        language={LANGUAGE_MAP[file.language?.toLowerCase()] || 'plaintext'}
        value={file.content}
        theme="vs-light"
        options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
      />
    </div>
  )
}
