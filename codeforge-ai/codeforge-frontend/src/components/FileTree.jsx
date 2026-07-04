export default function FileTree({ files, activeFile, onSelect }) {
  return (
    <div className="card w-64 shrink-0">
      <h3 className="font-semibold text-sm text-slate-500 mb-2">Files</h3>
      <ul className="space-y-1">
        {files.map((file) => (
          <li key={file.fileName}>
            <button
              onClick={() => onSelect(file)}
              className={`w-full text-left px-2 py-1 rounded text-sm truncate ${
                activeFile?.fileName === file.fileName
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'hover:bg-slate-100'
              }`}
            >
              {file.filePath}{file.fileName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
