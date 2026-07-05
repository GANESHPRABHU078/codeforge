import { useState, useEffect, useRef } from 'react'

// Simple SVG Icons
const Icons = {
  Desktop: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Tablet: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Mobile: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Reload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  ),
}

export default function VisualSandbox({ files = [] }) {
  const [viewport, setViewport] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'
  const [reloadKey, setReloadKey] = useState(0)
  const [activeTab, setActiveTab] = useState('preview') // 'preview' | 'console'
  const [logs, setLogs] = useState([])
  const [mockEndpointResponse, setMockEndpointResponse] = useState(null)
  const [activeEndpointPath, setActiveEndpointPath] = useState('')
  const [executingEndpoint, setExecutingEndpoint] = useState(false)
  const [requestBodyInput, setRequestBodyInput] = useState('{\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}')

  const iframeRef = useRef(null)

  // 1. Detect if this contains front-end files
  const htmlFile = files.find(f => f.fileName.endsWith('.html'))
  const cssFiles = files.filter(f => f.fileName.endsWith('.css'))
  const jsFiles = files.filter(f => f.fileName.endsWith('.js') || f.fileName.endsWith('.jsx'))
  const isFrontend = htmlFile || cssFiles.length > 0 || jsFiles.some(f => f.fileName.includes('App') || f.fileName.includes('index') || f.fileName.includes('main'))

  // Parse Spring Boot/Java controller endpoints if it's a backend project
  const endpoints = parseJavaEndpoints(files)

  // Clear logs on reload
  useEffect(() => {
    setLogs([])
  }, [reloadKey])

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.source === 'sandbox-console') {
        setLogs(prev => [...prev, { type: e.data.type, text: e.data.text, time: new Date().toLocaleTimeString() }])
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 2. Build sandbox HTML content for iframe
  const compileSandboxContent = () => {
    const cssContent = cssFiles.map(f => f.content).join('\n')
    
    // Process scripts: remove local ES imports/exports so Babel can run them all in one scope
    const jsContent = jsFiles.map(f => {
      const cleanContent = f.content
        .replace(/import\s+[\s\S]*?\s+from\s+['"].*?['"]/g, '') // remove imports
        .replace(/export\s+default\s+/g, '') // remove export default
        .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ') // remove inline export keywords
      return `/* File: ${f.fileName} */\n${cleanContent}`
    }).join('\n\n')

    const hasReact = jsFiles.some(f => f.fileName.endsWith('.jsx') || f.content.includes('React') || f.content.includes('useState'))

    let baseHtml = ''
    if (htmlFile) {
      baseHtml = htmlFile.content
    } else {
      // Default HTML template if no html file exists
      baseHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sandbox Preview</title>
</head>
<body class="bg-slate-900 text-white min-h-screen">
  <div id="root"></div>
</body>
</html>
      `
    }

    // Inject styles and scripts into HTML
    const fontLink = `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`
    const lucideScript = `<script src="https://unpkg.com/lucide@latest"></script>`
    const tailwindScript = `<script src="https://cdn.tailwindcss.com"></script>`
    const tailwindConfig = `
      <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
              }
            }
          }
        }
      </script>
    `

    // Custom dark visual styling reset for sandboxed elements
    const customGlobalStyles = `
      <style>
        body {
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        }
        /* Custom scrollbars inside the sandbox */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.4); }
        
        ${cssContent}
      </style>
    `

    // Setup iframe console capture
    const consoleInterceptorScript = `
      <script>
        const _log = console.log;
        const _error = console.error;
        const _warn = console.warn;
        
        console.log = (...args) => {
          _log(...args);
          window.parent.postMessage({ source: 'sandbox-console', type: 'log', text: args.join(' ') }, '*');
        };
        console.error = (...args) => {
          _error(...args);
          window.parent.postMessage({ source: 'sandbox-console', type: 'error', text: args.join(' ') }, '*');
        };
        console.warn = (...args) => {
          _warn(...args);
          window.parent.postMessage({ source: 'sandbox-console', type: 'warning', text: args.join(' ') }, '*');
        };
      </script>
    `

    let scriptTag = ''
    if (hasReact) {
      scriptTag = `
        <!-- Load React -->
        <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
        <!-- Load Babel Standalone for JSX compilation -->
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        
        <script type="text/babel">
          ${jsContent}
          
          // Auto-mount React App component if not mounted
          setTimeout(() => {
            if (typeof ReactDOM !== 'undefined') {
              const rootEl = document.getElementById('root') || document.getElementById('app') || document.body;
              if (rootEl && !rootEl.hasChildNodes()) {
                let componentToMount = null;
                if (typeof App !== 'undefined') {
                  componentToMount = App;
                } else {
                  // Find any capitalized function in global namespace
                  for (let key in window) {
                    if (typeof window[key] === 'function' && /^[A-Z]/.test(key) && key !== 'React' && key !== 'ReactDOM') {
                      componentToMount = window[key];
                      break;
                    }
                  }
                }
                
                if (componentToMount) {
                  const root = ReactDOM.createRoot(rootEl);
                  root.render(React.createElement(componentToMount));
                }
              }
            }
          }, 150);
        </script>
      `
    } else {
      scriptTag = `
        <script>
          ${jsContent}
          
          // Auto-run Lucide Icons if available
          window.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }
          });
        </script>
      `
    }

    // Insert style, font, icons, scripts into baseHtml
    let compiled = baseHtml;
    // Insert scripts, stylesheets and CDN libraries
    const headInsertions = `
      ${consoleInterceptorScript}
      ${fontLink}
      ${lucideScript}
      ${tailwindScript}
      ${tailwindConfig}
      ${customGlobalStyles}
    `
    
    if (compiled.includes('</head>')) {
      compiled = compiled.replace('</head>', `${headInsertions}</head>`)
    } else {
      compiled = headInsertions + compiled
    }

    if (compiled.includes('</body>')) {
      compiled = compiled.replace('</body>', `${scriptTag}</body>`)
    } else {
      compiled = compiled + scriptTag
    }

    return compiled
  }

  // Helper to open sandbox in new browser tab
  const handleOpenNewTab = () => {
    const code = compileSandboxContent()
    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  // Parse Spring Boot backend controllers
  function parseJavaEndpoints(allFiles) {
    const endpointsList = []
    allFiles.forEach(file => {
      if (file.fileName.endsWith('Controller.java')) {
        const content = file.content
        let classMapping = ''
        const classMappingMatch = content.match(/@RequestMapping\((?:value\s*=\s*)?"([^"]+)"\)/)
        if (classMappingMatch) {
          classMapping = classMappingMatch[1]
        }

        // Method parsing
        const mappingRegex = /@(Get|Post|Put|Delete)Mapping\((?:value\s*=\s*)?"([^"]+)"\)\s+public\s+\S+\s+(\w+)\(/g
        let match
        while ((match = mappingRegex.exec(content)) !== null) {
          const method = match[1].toUpperCase()
          let path = classMapping + match[2]
          const handler = match[3]
          if (!path.startsWith('/')) path = '/' + path
          path = path.replace(/\/+/g, '/')
          endpointsList.push({ method, path, handler, fileName: file.fileName })
        }
      }
    })
    return endpointsList
  }

  // Mock API service execution logic
  const handleExecuteEndpoint = (endpoint) => {
    setExecutingEndpoint(true)
    setActiveEndpointPath(endpoint.path)
    setMockEndpointResponse(null)

    setTimeout(() => {
      setExecutingEndpoint(false)
      // Generate realistic responses based on controller endpoint
      let res = {}
      const pathLower = endpoint.path.toLowerCase()

      if (pathLower.includes('auth/login') || pathLower.includes('auth/register')) {
        res = {
          success: true,
          message: "Authentication successful",
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.qS-O1FqX2tI...",
          expiresIn: 3600,
          user: { id: "u-984", name: "Jane Doe", email: "jane@example.com", role: "ADMIN" }
        }
      } else if (pathLower.includes('users') || pathLower.includes('profile')) {
        if (endpoint.method === 'GET') {
          res = {
            id: pathLower.split('/').pop() || "u-984",
            name: "Jane Doe",
            email: "jane@example.com",
            role: "MEMBER",
            createdAt: "2026-04-12T08:30:00Z",
            status: "ACTIVE"
          }
        } else {
          res = { success: true, message: "User record successfully updated", userId: "u-984" }
        }
      } else if (pathLower.includes('appointments') || pathLower.includes('schedules')) {
        res = [
          { id: "apt-1", doctor: "Dr. Gregory House", patient: "John Smith", time: "2026-07-06T10:00:00Z", status: "CONFIRMED" },
          { id: "apt-2", doctor: "Dr. Lisa Cuddy", patient: "Sarah Connor", time: "2026-07-07T14:30:00Z", status: "PENDING" }
        ]
      } else if (pathLower.includes('products') || pathLower.includes('items')) {
        res = {
          items: [
            { id: "p-01", name: "Wireless Ergonomic Mouse", price: 59.99, rating: 4.8, stock: 124 },
            { id: "p-02", name: "Mechanical Gaming Keyboard", price: 129.99, rating: 4.9, stock: 45 }
          ],
          totalResults: 2,
          page: 1
        }
      } else {
        // Generic dynamic data generator
        res = {
          success: true,
          timestamp: new Date().toISOString(),
          requestedPath: endpoint.path,
          method: endpoint.method,
          data: {
            message: `Mock response for backend method ${endpoint.handler}()`,
            status: "success",
            payload: {
              info: "Spring Boot controller mock endpoint test successful"
            }
          }
        }
      }
      setMockEndpointResponse(JSON.stringify(res, null, 2))
    }, 900)
  }

  // RENDER PURE BACKEND UI MONITOR
  if (!isFrontend) {
    return (
      <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden text-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white">Backend Sandbox Console</h3>
              <p className="text-[10px] text-slate-500 font-mono">Status: Connected to Spring Boot Mock Engine</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            REST API Dashboard
          </span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden h-[450px]">
          {/* Endpoints List */}
          <div className="border-r border-slate-800/60 flex flex-col overflow-y-auto p-4 space-y-3 font-sans">
            <h4 className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Discovered REST Endpoints</h4>
            {endpoints.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-4 text-center">
                No controllers or endpoints found in target files.
              </div>
            ) : (
              endpoints.map((ep, idx) => {
                const colors = {
                  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
                  POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
                  PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
                  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
                }
                const methodColor = colors[ep.method] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                return (
                  <div key={idx} className="bg-slate-950/40 border border-slate-900 hover:border-slate-800/80 rounded-xl p-3 flex flex-col space-y-2 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${methodColor}`}>{ep.method}</span>
                        <code className="text-xs font-mono text-slate-300 font-bold truncate max-w-[200px]">{ep.path}</code>
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono">{ep.fileName.replace('.java','')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-900/60 text-[10px]">
                      <span className="text-slate-500">Method: <strong className="text-slate-400 font-mono">{ep.handler}()</strong></span>
                      <button
                        onClick={() => handleExecuteEndpoint(ep)}
                        className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition-all"
                      >
                        Send Request →
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Test Runner Output Console */}
          <div className="flex flex-col bg-slate-950/20 overflow-hidden p-4 space-y-3 font-sans">
            <h4 className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">REST Client Output</h4>
            
            {/* Request parameters input for POST requests */}
            {activeEndpointPath && activeEndpointPath.toLowerCase().includes('auth') && (
              <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-2.5 space-y-1.5">
                <label className="text-[10px] text-slate-400 font-semibold font-mono">Mock Request Body (JSON)</label>
                <textarea
                  className="w-full h-14 bg-slate-950 text-[10px] font-mono text-emerald-400 border border-slate-800 rounded p-1.5 focus:outline-none focus:border-slate-700"
                  value={requestBodyInput}
                  onChange={(e) => setRequestBodyInput(e.target.value)}
                />
              </div>
            )}

            <div className="flex-1 bg-slate-950/80 border border-slate-900 rounded-xl overflow-hidden flex flex-col">
              <div className="px-3.5 py-1.5 bg-slate-900/70 border-b border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Response Panel</span>
                <span className="text-emerald-500 font-semibold">HTTP 200 OK</span>
              </div>
              <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto leading-relaxed text-slate-300">
                {executingEndpoint ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400">
                    <svg className="animate-spin h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending payload to {activeEndpointPath}...</span>
                  </div>
                ) : mockEndpointResponse ? (
                  <pre className="text-emerald-400/90 whitespace-pre-wrap">{mockEndpointResponse}</pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-600 italic text-center p-6">
                    Click "Send Request" next to any endpoints on the left panel to test and review controller operations.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // FRONTEND PREVIEW PRESETS
  const viewportStyles = {
    desktop: 'w-full h-full border border-slate-800/50 rounded-b-xl',
    tablet: 'w-[768px] h-[450px] border-[10px] border-slate-800 rounded-3xl shadow-2xl mx-auto my-3 bg-slate-950 self-center',
    mobile: 'w-[360px] h-[450px] border-[14px] border-slate-800 rounded-[32px] shadow-2xl mx-auto my-3 bg-slate-950 relative self-center'
  }

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden text-slate-200">
      
      {/* ── Sandbox Browser Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/80">
        
        {/* Navigation & Tab Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors" disabled>
              <Icons.ChevronLeft />
            </button>
            <button className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors" disabled>
              <Icons.ChevronRight />
            </button>
            <button
              onClick={() => setReloadKey(prev => prev + 1)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Reload sandbox preview"
            >
              <Icons.Reload />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                activeTab === 'preview' ? 'bg-slate-800 text-teal-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                activeTab === 'console' ? 'bg-slate-800 text-teal-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Console
              {logs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 text-[8px] font-bold">
                  {logs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mock Browser URL Address Bar */}
        <div className="flex-1 max-w-md hidden md:flex items-center bg-slate-950/80 border border-slate-800/80 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-500 select-all">
          <span className="text-teal-500/50 mr-1">http://</span>
          <span className="text-slate-300">localhost:3000</span>
          <span className="text-slate-500">/preview/{htmlFile ? htmlFile.fileName : ''}</span>
        </div>

        {/* Viewport size buttons & external open */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            {[
              { id: 'desktop', title: 'Desktop View', icon: Icons.Desktop },
              { id: 'tablet',  title: 'Tablet View',  icon: Icons.Tablet },
              { id: 'mobile',  title: 'Mobile View',  icon: Icons.Mobile }
            ].map(({ id, title, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewport(id)}
                className={`p-1 rounded-md transition-all ${
                  viewport === id ? 'bg-slate-800 text-teal-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={title}
              >
                <Icon />
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenNewTab}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open preview in new tab"
          >
            <Icons.ExternalLink />
          </button>
        </div>
      </div>

      {/* ── Sandbox Main Screen ─────────────────────────────────────────── */}
      <div className="flex-1 bg-slate-950/20 flex flex-col justify-center overflow-y-auto h-[480px]">
        {activeTab === 'preview' ? (
          <div className={`relative ${viewportStyles[viewport]} flex flex-col`}>
            
            {/* If Mobile view: show iPhone speaker notch graphic */}
            {viewport === 'mobile' && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-900 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-2" />
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              key={reloadKey}
              srcDoc={compileSandboxContent()}
              title="Code Preview Sandbox"
              sandbox="allow-scripts allow-modals"
              className="w-full h-full bg-white flex-1 border-0"
            />
          </div>
        ) : (
          /* Console Terminal View */
          <div className="flex-1 bg-slate-950/90 font-mono text-xs p-4 flex flex-col space-y-1.5 overflow-y-auto h-full text-slate-300">
            <div className="text-[10px] text-slate-600 border-b border-slate-900 pb-2 mb-2 uppercase font-bold tracking-wider">
              Developer Tools Sandbox Console
            </div>
            {logs.length === 0 ? (
              <div className="text-slate-500 italic py-6 text-center">
                No logs printed to console. Reload preview or interact with the page to trigger logs.
              </div>
            ) : (
              logs.map((log, idx) => {
                const styles = {
                  error: 'text-rose-400 bg-rose-500/5',
                  warning: 'text-amber-400 bg-amber-500/5',
                  log: 'text-slate-300'
                }
                return (
                  <div key={idx} className={`p-1.5 rounded border border-transparent font-mono flex items-start gap-3 ${styles[log.type]}`}>
                    <span className="text-[9px] text-slate-600 select-none font-semibold flex-shrink-0 mt-0.5">[{log.time}]</span>
                    <span className="text-[9.5px] font-extrabold uppercase select-none w-12 flex-shrink-0">
                      {log.type}:
                    </span>
                    <span className="flex-1 break-all leading-normal">{log.text}</span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
