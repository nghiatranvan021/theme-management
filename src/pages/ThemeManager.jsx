import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { themeService } from '../services/themeService';
import { FaFolder, FaFolderOpen, FaFile, FaSun, FaMoon, FaSync, FaSave } from 'react-icons/fa';
import { IoMdArrowDropdown, IoMdArrowDropright } from 'react-icons/io';
import { useTheme } from '../hooks/useTheme';
import CodeEditor from '../components/CodeEditor';
import EditorTabs from '../components/EditorTabs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ThemeManager = () => {
  const { shopId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const saved = sessionStorage.getItem(`selectedTheme_${shopId}`);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedTheme) {
      sessionStorage.setItem(`selectedTheme_${shopId}`, JSON.stringify(selectedTheme));
    }
  }, [selectedTheme, shopId]);

  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const [activeFile, setActiveFile] = useState(null);
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({
    themes: false,
    files: false,
    content: false
  });
  const [tabs, setTabs] = useState(() => {
    const saved = sessionStorage.getItem(`tabs_${shopId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem(`activeTab_${shopId}`) || null;
  });
  const [modifiedTabs, setModifiedTabs] = useState(new Set());
  const [openFiles, setOpenFiles] = useState(() => {
    const saved = sessionStorage.getItem(`openFiles_${shopId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentContentRef = useRef({});

  const fetchThemes = async () => {
    setLoading(prev => ({ ...prev, themes: true }));
    try {
      const {status, themes} = await themeService.getThemes(parseInt(shopId));
      if (!status) {
        throw new Error('Error fetching themes');
      }
      setThemes(themes ?? []);
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(prev => ({ ...prev, themes: false }));
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchThemes();
    }
  }, [shopId]);

  const handleRefreshThemes = async () => {
    if (loading.themes) return;
    await fetchThemes();
  };

  const fetchFiles = async () => {
    if (!selectedTheme) return;
    
    setLoading(prev => ({ ...prev, files: true }));
    try {
      const {status, files} = await themeService.getThemeFiles(parseInt(shopId), selectedTheme.id);
      if (!status) {
        throw new Error('Error fetching files');
      }
      setFiles(files ?? []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedTheme, shopId]);

  const handleThemeSelect = async (theme) => {
    if (modifiedTabs.size > 0) {
      const isConfirmed = window.confirm(
        'You have unsaved changes in some files. Do you want to switch theme without saving?'
      );
      if (!isConfirmed) {
        return;
      }
    }

    setSelectedTheme(theme);
    setFileContent('');
    setActiveFile(null);
    setFiles([]);
    
    setTabs([]);
    setModifiedTabs(new Set());
    setOpenFiles([]);
    setActiveTab(null);

    console.log('Selected theme:', theme);
    if (!theme) return;

    setLoading(prev => ({ ...prev, files: true }));
    try {
      const {status, files} = await themeService.getThemeFiles(parseInt(shopId), theme.id);
      if (!status) {
        throw new Error('Error fetching files');
      }
      setFiles(files ?? []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  };

  const handleFileSelect = async (filename) => {
    if (isLoadingFile) return;

    const existingFile = openFiles.find(file => file.filename === filename);
    if (existingFile) {
      setActiveFile(filename);
      setActiveTab(filename);
      return;
    }

    try {
      setIsLoadingFile(true);
      setLoading(prev => ({ ...prev, content: true }));
      
      const response = await themeService.getFileContent(parseInt(shopId), selectedTheme.id, filename);
      
      if (!response || !response.content) {
        throw new Error('Invalid file content response');
      }

      const newFile = {
        filename,
        content: response.content,
        isDirty: false
      };

      setOpenFiles(prev => [...prev, newFile]);
      setTabs(prev => [...prev, {
        id: filename,
        fileName: filename,
        content: response.content
      }]);

      setActiveFile(filename);
      setActiveTab(filename);

    } catch (error) {
      console.error('Error loading file content:', error);
    } finally {
      setLoading(prev => ({ ...prev, content: false }));
      setTimeout(() => {
        setIsLoadingFile(false);
      }, 300);
    }
  };

  const toggleFolder = (folderPath) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const folderOrder = [
    'layout',
    'templates',
    'sections',
    'blocks',
    'snippets',
    'config',
    'assets',
    'locales'
  ];

  const groupFilesByFolder = (files) => {
    if (!files || !Array.isArray(files)) return {};
    
    const groups = {};
    
    // Khởi tạo các folder theo thứ tự định sẵn
    folderOrder.forEach(folder => {
      groups[folder] = [];
    });

    // Phân loại files vào các folder
    files.forEach(file => {
      if (!file || !file.filename) return;
      
      const parts = file.filename.split('/');
      const folder = parts.length > 1 ? parts[0] : 'root';
      
      if (groups[folder] !== undefined) {
        groups[folder].push(file);
      } else {
        // Các folder khác không nằm trong folderOrder sẽ được thêm vào cuối
        groups[folder] = [file];
      }
    });

    // Sắp xếp files trong mỗi folder theo tên
    Object.keys(groups).forEach(folder => {
      groups[folder].sort((a, b) => a.filename.localeCompare(b.filename));
    });

    // Trả về object với các folder theo thứ tự đã định nghĩa
    const orderedGroups = {};
    folderOrder.forEach(folder => {
      if (groups[folder]?.length > 0) {
        orderedGroups[folder] = groups[folder];
      }
    });

    // Thêm các folder khác vào cuối (nếu có)
    Object.keys(groups).forEach(folder => {
      if (!folderOrder.includes(folder) && groups[folder]?.length > 0) {
        orderedGroups[folder] = groups[folder];
      }
    });

    return orderedGroups;
  };

  const filterFiles = (files) => {
    if (!files) return [];
    
    return files.filter(file => {
      if (!file || !file.filename) return false;
      
      const fileName = file.filename.toLowerCase();
      return !fileName.includes('.git/') && 
             !fileName.includes('node_modules/') &&
             !fileName.includes('.idea/');
    });
  };

  const filterFilesBySearch = (files, searchTerm) => {
    if (!searchTerm.trim()) return files;
    
    const searchLower = searchTerm.toLowerCase();
    return files.filter(file => {
      if (!file || !file.filename) return false;
      
      const fileName = file.filename.toLowerCase();
      // Tìm kiếm theo tên file và đường dẫn
      return fileName.includes(searchLower);
    });
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleTabClose = async (tabId) => {
    if (modifiedTabs.has(tabId)) {
      const isConfirmed = window.confirm(
        'You have unsaved changes. Do you want to close this file without saving?'
      );
      if (!isConfirmed) {
        return;
      }
    }

    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    
    const newModifiedTabs = new Set(modifiedTabs);
    newModifiedTabs.delete(tabId);
    setModifiedTabs(newModifiedTabs);

    setOpenFiles(prev => prev.filter(file => file.filename !== tabId));
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));

    if (activeTab === tabId) {
      const newActiveTab = tabs[tabIndex - 1]?.id || tabs[tabIndex + 1]?.id;
      setActiveTab(newActiveTab);
      setActiveFile(newActiveTab);
    }
  };

  const handleContentChange = (tabId, newContent) => {
    console.log('Content changed:', { tabId, newContent });
    
    currentContentRef.current[tabId] = newContent;
    
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, content: newContent } : tab
    ));

    const originalFile = openFiles.find(file => file.filename === tabId);
    const hasChanges = originalFile && originalFile.content !== newContent;

    if (hasChanges) {
      setModifiedTabs(prev => new Set(prev).add(tabId));
    } else {
      setModifiedTabs(prev => {
        const newSet = new Set(prev);
        newSet.delete(tabId);
        return newSet;
      });
    }
  };

  const handleSave = async (tabId) => {
    const currentContent = currentContentRef.current[tabId];
    console.log('Current content from ref:', currentContent);

    if (!currentContent) {
      console.error('No content found for tab:', tabId);
      return;
    }

    setIsSaving(true);
    try {
      const response = await themeService.saveFile(
        parseInt(shopId),
        selectedTheme.id,
        tabId,
        currentContent
      );

      if (response.status) {
        setOpenFiles(prev => prev.map(file => 
          file.filename === tabId ? { ...file, content: currentContent } : file
        ));

        setTabs(prev => prev.map(tab =>
          tab.id === tabId ? { ...tab, content: currentContent } : tab
        ));

        setModifiedTabs(prev => {
          const next = new Set(prev);
          next.delete(tabId);
          return next;
        });
        
        toast.success('File saved successfully!');
      } else {
        toast.error(response.message || 'Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Failed to save file. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeTab) {
          handleSave(activeTab);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  useEffect(() => {
    if (files && files.length > 0) {
      const folders = [...new Set(files.map(file => {
        const parts = file.filename.split('/');
        return parts.length > 1 ? parts[0] : 'root';
      }))];
      
      setCollapsedFolders(folders.reduce((acc, folder) => {
        acc[folder] = true; // true means collapsed
        return acc;
      }, {}));
    }
  }, [files]);

  useEffect(() => {
    if (tabs.length) {
      sessionStorage.setItem(`tabs_${shopId}`, JSON.stringify(tabs));
    }
    if (openFiles.length) {
      sessionStorage.setItem(`openFiles_${shopId}`, JSON.stringify(openFiles));
    }
    if (activeTab) {
      sessionStorage.setItem(`activeTab_${shopId}`, activeTab);
    }
  }, [tabs, openFiles, activeTab, shopId]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem(`selectedTheme_${shopId}`);
      sessionStorage.removeItem(`tabs_${shopId}`);
      sessionStorage.removeItem(`openFiles_${shopId}`);
      sessionStorage.removeItem(`activeTab_${shopId}`);
    };
  }, [shopId]);

  return (
    <div className="theme-manager" data-theme={theme}>
      <div className="theme-header">
        <div className="theme-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        <div className="theme-selector">
          <select 
            value={selectedTheme?.id || ''} 
            onChange={(e) => {
              const selectedThemeId = e.target.value;
              const theme = themes.find(t => t.id == selectedThemeId);
                handleThemeSelect(theme);
            }}
            className="theme-select"
            disabled={loading.themes}
          >
            <option value="">Select a theme</option>
            {themes && themes.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.name} - {theme.role}
              </option>
            ))}
          </select>
          <button 
            className="refresh-btn"
            onClick={handleRefreshThemes}
            disabled={loading.themes}
            title="Refresh themes"
          >
            <FaSync className={loading.themes ? 'spinning' : ''} />
          </button>
        </div>
    
        {activeTab && modifiedTabs.has(activeTab) && (
          <button 
            className="header-save-button"
            onClick={() => handleSave(activeTab)}
            title="Save (Ctrl+S)"
            disabled={isSaving}
          >
            <FaSave />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        )}
      </div>

      <div className="content-container">
        <div className="file-explorer">
          {loading.files ? (
            <div className="loading">Loading files...</div>
          ) : files && files.length > 0 ? (
            <div className="file-tree">
              {Object.entries(groupFilesByFolder(filterFiles(filterFilesBySearch(files, searchTerm)))).map(([folder, folderFiles]) => (
                <div key={folder} className="folder">
                  <div 
                    className="folder-header"
                    onClick={() => toggleFolder(folder)}
                  >
                    <span className="folder-icon">
                      {collapsedFolders[folder] ? <IoMdArrowDropright /> : <IoMdArrowDropdown />}
                      {collapsedFolders[folder] ? <FaFolder /> : <FaFolderOpen />}
                    </span>
                    <span className="folder-name">{folder}</span>
                  </div>
                  {!collapsedFolders[folder] && folderFiles && (
                    <div className="folder-content">
                      {folderFiles.map(file => (
                        <div
                          key={file.filename}
                          className={`file ${activeFile === file.filename ? 'active' : ''}`}
                          onClick={() => handleFileSelect(file.filename)}
                        >
                          <FaFile className="file-icon" />
                          <span className="file-name">{file.filename.split('/').pop()}</span>
                          <span className="file-meta">
                            {new Date(file.updated_at).toLocaleString('en-US', { 
                              timeZone: 'Asia/Bangkok',
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-files">No files found</div>
          )}
        </div>

        <div className="editor-wrapper">
          {tabs.length > 0 ? (
            <>
              <EditorTabs
                tabs={tabs.map(tab => ({
                  ...tab,
                  isModified: modifiedTabs.has(tab.id)
                }))}
                activeTab={activeTab}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
                onSave={handleSave}
              />
              <div className="editors-container">
                {tabs.map(tab => (
                  <div 
                    key={tab.id}
                    className={`editor-pane ${activeTab === tab.id ? 'active' : ''}`}
                    style={{ display: activeTab === tab.id ? 'block' : 'none' }}
                  >
                    <CodeEditor 
                      key={tab.id}
                      code={tab.content} 
                      fileName={tab.fileName}
                      onChange={(newContent) => handleContentChange(tab.id, newContent)}
                      onSave={() => handleSave(tab.id)}
                      isModified={modifiedTabs.has(tab.id)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="editor-placeholder">
              Select a file to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeManager; 