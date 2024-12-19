import React from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import classNames from 'classnames';

const EditorTabs = ({ tabs, activeTab, onTabClick, onTabClose, onSave }) => {
  const handleTabClose = async (e, tab) => {
    e.stopPropagation();
    if (tab.isModified) {
      const confirm = window.confirm('File has unsaved changes. Do you want to save before closing?');
      if (confirm) {
        await onSave(tab.id);
      }
    }
    onTabClose(tab.id);
  };

  return (
    <div className="editor-tabs">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={classNames('editor-tab', {
            'active': activeTab === tab.id,
            'modified': tab.isModified
          })}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="tab-name">{tab.fileName}</span>
          <div className="tab-actions">
            {tab.isModified && (
              <span className="modified-indicator" title="Unsaved changes">
              </span>
            )}
            <button
              className="close-button"
              onClick={(e) => handleTabClose(e, tab)}
              title="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EditorTabs; 