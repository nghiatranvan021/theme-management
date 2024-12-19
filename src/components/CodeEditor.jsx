import React, { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import './CodeEditor.css';
import { FaSave } from 'react-icons/fa';

const CodeEditor = ({ code, fileName, onChange, onSave, isModified }) => {
  const decodeContent = (content) => {
    if (!content) return '';
    try {
      const parsed = JSON.parse(content);
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  };

  const getLanguage = (fileName) => {
    if (!fileName) return [];
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return [javascript()];
      case 'css':
        return [css()];
      case 'html':
      case 'liquid':
        return [html()];
      case 'json':
        return [json()];
      default:
        return [];
    }
  };

  const decodedContent = decodeContent(code);

  const handleChange = React.useCallback((value) => {
    console.log('CodeEditor onChange:', value);
    onChange(value);
  }, [onChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave && onSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <span className="file-name">{fileName}</span>
        <div className="editor-actions">
          <button 
            className={`save-button ${isModified ? 'modified' : ''}`}
            onClick={onSave}
            title="Save (Ctrl+S)"
          >
            <FaSave />
            <span>Save</span>
          </button>
        </div>
      </div>
      <div className="editor-content">
        <div className="editor-main">
          <CodeMirror
            value={decodedContent}
            height="100%"
            width="100%"
            theme={vscodeDark}
            extensions={getLanguage(fileName)}
            onChange={handleChange}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              history: true,
              bracketMatching: true,
              autocompletion: true,
              closeBrackets: true,
              indentOnInput: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor; 