'use client';

import { useState, useEffect, useRef } from 'react';

// Define document type
type Document = {
  name: string;
  size: string;
  date: string;
  url: string;
};

// Supported translation languages type
type Language = {
  label: string;
  value: string;
};

export default function AISummaryApp() {
  // Core state management
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [activeAIFeature, setActiveAIFeature] = useState<'summarize' | 'translate'>('summarize');
  const [targetLang, setTargetLang] = useState<string>("zh"); 
  const [result, setResult] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Ref for bottom file list scroll container
  const fileListRef = useRef<HTMLDivElement>(null);

  // Language options (KEEP multilingual labels for translation)
  const languageOptions: Language[] = [
    { label: "中文", value: "zh" },
    { label: "English", value: "en" },
    { label: "日本語", value: "ja" },
    { label: "한국어", value: "ko" },
    { label: "Français", value: "fr" },
    { label: "Deutsch", value: "de" }
  ];

  // Check backend status
  const checkBackend = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setBackendStatus("✅ Connected");
    } catch (err) {
      setBackendStatus("❌ Disconnected");
    }
  };

  // Initial backend check
  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // File selection logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(`Selected: ${file.name}`);
    } else {
      setSelectedFile(null);
      setUploadStatus("No file selected");
    }
  };

  // File upload logic
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first!");
      return;
    }

    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.ok) {
        const newDoc: Document = {
          name: selectedFile.name,
          size: formatFileSize(selectedFile.size),
          date: new Date().toLocaleDateString('en-US'),
          url: data.fileUrl
        };
        setDocuments(prev => [...prev, newDoc]);
        setUploadStatus(`✅ Upload successful: ${selectedFile.name}`);
        setSelectedFile(null);
      } else {
        setUploadStatus(`❌ Upload failed: ${data.error}`);
      }
    } catch (err) {
      setUploadStatus(`❌ Upload error: ${(err as Error).message}`);
    }
  };

  // Delete document logic
  const handleDeleteDoc = (docUrl: string) => {
    setDocuments(prev => prev.filter(doc => doc.url !== docUrl));
    if (selectedDoc?.url === docUrl) {
      setSelectedDoc(null);
      setResult("");
    }
  };

  // Select document logic
  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setResult("");
  };

  // Generate summary logic
  const handleSummarize = async () => {
    if (!selectedDoc) return;
    setIsProcessing(true);
    setResult("Generating summary...");
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: selectedDoc.url })
      });

      const rawText = await res.text();
      const data = JSON.parse(rawText);

      if (data.ok) {
        setResult(data.summary);
      } else {
        setResult(`❌ Summary generation failed: ${data.error}`);
      }
    } catch (err) {
      setResult(`❌ Summary generation error: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Translation logic
  const handleTranslate = async () => {
    if (!selectedDoc) {
      setResult("Please select an uploaded file from the left panel first!");
      return;
    }

    setIsProcessing(true);
    const targetLangLabel = languageOptions.find(item => item.value === targetLang)?.label;
    setResult(`Translating to ${targetLangLabel}...`);
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileUrl: selectedDoc.url,
          targetLang: targetLang
        })
      });
      const data = await res.json();

      if (data.ok) {
        setResult(data.translation);
      } else {
        setResult(`❌ Translation failed: ${data.error}`);
      }
    } catch (err) {
      setResult(`❌ Translation error: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f7ff', // Light blue background (overall theme)
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Top Right: Small Backend Status */}
      <div style={{ 
        position: 'absolute', 
        top: '8px', 
        right: '16px', 
        zIndex: 100 
      }}>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 500, 
          color: backendStatus.includes("✅") ? '#15803d' : '#b91c1c',
          backgroundColor: '#ffffff',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid #dbeafe'
        }}>
          {backendStatus}
        </span>
        <button 
          onClick={checkBackend}
          style={{ 
            marginLeft: '4px', 
            fontSize: '10px', 
            color: '#2563eb', 
            cursor: 'pointer',
            backgroundColor: 'transparent', 
            border: 'none', 
            padding: 0 
          }}
        >
          Refresh
        </button>
      </div>

      {/* Main split-screen layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', marginTop: '8px' }}>
        {/* Left Panel: Upload Area + Bottom File List (All Blue) */}
        <aside style={{ 
          width: '320px', 
          backgroundColor: '#ffffff',
          borderRight: '1px solid #bfdbfe',
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)'
        }}>
          {/* Upload Area (Top Left) */}
          <div style={{ marginBottom: '20px', flex: '0 0 auto' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: '#1e40af', // Dark blue for title
              marginBottom: '16px',
              borderBottom: '2px solid #3b82f6',
              paddingBottom: '8px'
            }}>Add Documents</h3>
            
            {/* File selection button (Blue Theme) */}
            <label style={{ 
              display: 'block', 
              width: '100%', 
              backgroundColor: '#eff6ff', 
              color: '#1d4ed8', 
              padding: '10px 16px', 
              borderRadius: '8px', 
              textAlign: 'center', 
              cursor: 'pointer', 
              marginBottom: '12px',
              border: '1px solid #93c5fd',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dbeafe';
              e.currentTarget.style.borderColor = '#60a5fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
              e.currentTarget.style.borderColor = '#93c5fd';
            }}>
              Select Document
              <input
                type="file"
                accept=".txt,.md,.docx,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
            
            {/* Upload button (Primary Blue) */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              style={{ 
                width: '100%',
                backgroundColor: !selectedFile ? '#93c5fd' : '#2563eb',
                color: 'white',
                fontWeight: 600,
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: !selectedFile ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedFile) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFile) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
            >
              Upload Document
            </button>
            
            {/* Upload status prompt */}
            <p style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#475569',
              textAlign: 'center'
            }}>{uploadStatus}</p>
          </div>

          {/* Uploaded File List (Bottom Left - Scrollable) */}
          <div style={{ flex: 1, marginTop: '16px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: '#1e40af',
              marginBottom: '12px',
              paddingBottom: '4px',
              borderBottom: '1px solid #dbeafe'
            }}>Uploaded Documents</h3>
            
            {/* Scrollable container (Bottom Left) */}
            <div 
              ref={fileListRef}
              style={{ 
                height: 'calc(100vh - 280px)', // Fixed height for scroll
                overflowY: 'auto', 
                paddingRight: '4px', 
                scrollbarWidth: 'thin',
                scrollbarColor: '#3b82f6 #eff6ff'
              }}
            >
              {documents.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#94a3b8', 
                  padding: '40px 0',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1'
                }}>
                  No uploaded documents
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.url}
                      onClick={() => handleSelectDoc(doc)}
                      style={{ 
                        padding: '12px 10px', 
                        borderRadius: '8px', 
                        border: selectedDoc?.url === doc.url ? '1px solid #2563eb' : '1px solid #e0e7ff',
                        backgroundColor: selectedDoc?.url === doc.url ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: selectedDoc?.url === doc.url ? '0 2px 4px rgba(37, 99, 235, 0.1)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedDoc?.url !== doc.url) {
                          e.currentTarget.style.border = '1px solid #93c5fd';
                          e.currentTarget.style.backgroundColor = '#f0f7ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedDoc?.url !== doc.url) {
                          e.currentTarget.style.border = '1px solid #e0e7ff';
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }
                      }}
                    >
                      {/* File information */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ 
                            fontWeight: 500, 
                            color: '#1e293b', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            marginBottom: '4px'
                          }}>{doc.name}</p>
                          <p style={{ fontSize: '11px', color: '#64748b' }}>{doc.size} · {doc.date}</p>
                        </div>
                        
                        {/* Delete button (Blue Theme) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDoc(doc.url);
                          }}
                          style={{ 
                            color: '#dc2626', 
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#b91c1c';
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Panel: AI Summary/Translation (All Blue Theme) */}
        <main style={{ 
          flex: 1, 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f8fafc'
        }}>
          {/* AI Feature Toggle Bar (Blue Theme) */}
          <div style={{ 
            marginBottom: '24px', 
            borderBottom: '2px solid #3b82f6',
            paddingBottom: '12px'
          }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button
                onClick={() => setActiveAIFeature('summarize')}
                style={{ 
                  padding: '10px 28px', 
                  borderRadius: '8px 8px 0 0', 
                  fontSize: '18px', 
                  fontWeight: 600,
                  borderBottom: activeAIFeature === 'summarize' ? '3px solid #1e40af' : 'none',
                  color: activeAIFeature === 'summarize' ? '#1e40af' : '#64748b',
                  backgroundColor: activeAIFeature === 'summarize' ? '#eff6ff' : 'transparent',
                  borderLeft: '1px solid transparent',
                  borderRight: '1px solid transparent',
                  borderTop: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeAIFeature !== 'summarize') {
                    e.currentTarget.style.color = '#2563eb';
                    e.currentTarget.style.backgroundColor = '#f0f7ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeAIFeature !== 'summarize') {
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                AI Summary
              </button>
              <button
                onClick={() => setActiveAIFeature('translate')}
                style={{ 
                  padding: '10px 28px', 
                  borderRadius: '8px 8px 0 0', 
                  fontSize: '18px', 
                  fontWeight: 600,
                  borderBottom: activeAIFeature === 'translate' ? '3px solid #1e40af' : 'none',
                  color: activeAIFeature === 'translate' ? '#1e40af' : '#64748b',
                  backgroundColor: activeAIFeature === 'translate' ? '#eff6ff' : 'transparent',
                  borderLeft: '1px solid transparent',
                  borderRight: '1px solid transparent',
                  borderTop: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeAIFeature !== 'translate') {
                    e.currentTarget.style.color = '#2563eb';
                    e.currentTarget.style.backgroundColor = '#f0f7ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeAIFeature !== 'translate') {
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                AI Translation
              </button>
            </div>

            {/* Translation Language Selection (Blue Theme) - KEEP multilingual labels */}
            {activeAIFeature === 'translate' && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  color: '#1e40af', 
                  marginRight: '10px',
                  fontWeight: 500
                }}>Target Language:</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  style={{ 
                    padding: '6px 14px', 
                    border: '1px solid #93c5fd', 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    color: '#1e40af',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#93c5fd';
                  }}
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value} style={{ color: '#1e293b' }}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Selected File Prompt (Blue Theme) */}
          <div style={{ 
            marginBottom: '20px', 
            fontSize: '14px', 
            color: '#1e40af',
            fontWeight: 500,
            backgroundColor: '#eff6ff',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #dbeafe'
          }}>
            Selected Document: {selectedDoc ? selectedDoc.name : "None"}
          </div>

          {/* Execute Button (Primary Blue) */}
          <button
            onClick={activeAIFeature === 'summarize' ? handleSummarize : handleTranslate}
            disabled={!selectedDoc || isProcessing}
            style={{ 
              width: 'fit-content', 
              padding: '12px 32px', 
              borderRadius: '8px', 
              color: 'white', 
              fontWeight: 600,
              fontSize: '16px',
              backgroundColor: (!selectedDoc || isProcessing) ? '#93c5fd' : '#2563eb',
              cursor: (!selectedDoc || isProcessing) ? 'not-allowed' : 'pointer',
              border: 'none',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (selectedDoc && !isProcessing) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedDoc && !isProcessing) {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(37, 99, 235, 0.2)';
              }
            }}
          >
            {isProcessing ? "Processing..." : (
              activeAIFeature === 'summarize' ? "Generate Summary" : "Start Translation"
            )}
          </button>

          {/* Result Display Area (Blue Theme) */}
          <div style={{ 
            marginTop: '24px', 
            flex: 1, 
            border: '1px solid #93c5fd', 
            borderRadius: '8px', 
            padding: '20px', 
            backgroundColor: '#ffffff', 
            overflow: 'auto',
            boxShadow: '0 1px 4px rgba(59, 130, 246, 0.1)'
          }}>
            {result ? (
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                color: '#1e293b', 
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.6'
              }}>{result}</pre>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#64748b', 
                padding: '60px 0',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1'
              }}>
                {selectedDoc 
                  ? `Click the "${activeAIFeature === 'summarize' ? "Generate Summary" : "Start Translation"}" button to process the document`
                  : "Please select an uploaded document from the left panel first"}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}