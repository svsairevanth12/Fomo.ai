import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Clock, Download, Share2, FileText, FileJson, Copy, Mail, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { ActionItemCard } from '@/components/actionItems/ActionItemCard';
import { useMeetingStore } from '@/stores/meetingStore';
import { useActionItems } from '@/hooks/useActionItems';
import { formatDuration, getSpeakerColor, formatTimestamp } from '@/lib/utils';
import {
  exportAsMarkdown,
  exportAsJSON,
  exportAsText,
  downloadFile,
  copyToClipboard,
  sanitizeFilename,
  createEmailBody,
  generateShareableSummary
} from '@/lib/exportUtils';
import type { Meeting, TranscriptSegment } from '@/types';

interface MeetingDetailProps {
  meetingId: string;
  onBack: () => void;
}

export const MeetingDetail: React.FC<MeetingDetailProps> = ({ meetingId, onBack }) => {
  const { loadMeeting, updateTranscriptSegment, approveActionItem } = useMeetingStore();
  const { createGitHubIssue } = useActionItems();
  const meeting = loadMeeting(meetingId);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'markdown' | 'json' | 'text') => {
    if (!meeting) return;

    let content: string;
    let extension: string;
    let mimeType: string;

    switch (format) {
      case 'markdown':
        content = exportAsMarkdown(meeting);
        extension = 'md';
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = exportAsJSON(meeting);
        extension = 'json';
        mimeType = 'application/json';
        break;
      case 'text':
        content = exportAsText(meeting);
        extension = 'txt';
        mimeType = 'text/plain';
        break;
    }

    const filename = sanitizeFilename(meeting.title, extension);
    downloadFile(content, filename, mimeType);
    setShowExportMenu(false);
  };

  const handleCopyTranscript = async () => {
    if (!meeting) return;

    const content = exportAsMarkdown(meeting);
    const success = await copyToClipboard(content);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  };

  const handleCopySummary = async () => {
    if (!meeting) return;

    const summary = generateShareableSummary(meeting);
    const success = await copyToClipboard(summary);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    if (!meeting) return;

    const emailUrl = createEmailBody(meeting);
    window.location.href = emailUrl;
    setShowShareMenu(false);
  };

  if (!meeting) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black uppercase">Meeting Not Found</h2>
          <Button onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="border-2 border-gray-800 hover:border-white"
          >
            Back
          </Button>

          <div className="flex items-center gap-2 relative">
            {/* Export Menu */}
            <div className="relative" ref={exportMenuRef}>
              <Button
                variant="ghost"
                icon={<Download className="w-4 h-4" />}
                className="border-2 border-gray-800 hover:border-white"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                Export
              </Button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-black border-2 border-white shadow-lg z-50"
                  >
                    <button
                      onClick={() => handleExport('markdown')}
                      className="w-full px-4 py-3 text-left hover:bg-white hover:text-black transition-all flex items-center gap-3 border-b border-gray-800"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="font-bold uppercase text-sm">Markdown</span>
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full px-4 py-3 text-left hover:bg-white hover:text-black transition-all flex items-center gap-3 border-b border-gray-800"
                    >
                      <FileJson className="w-4 h-4" />
                      <span className="font-bold uppercase text-sm">JSON</span>
                    </button>
                    <button
                      onClick={() => handleExport('text')}
                      className="w-full px-4 py-3 text-left hover:bg-white hover:text-black transition-all flex items-center gap-3"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="font-bold uppercase text-sm">Plain Text</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Share Menu */}
            <div className="relative" ref={shareMenuRef}>
              <Button
                variant="ghost"
                icon={copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                className={`border-2 ${copied ? 'border-green-500 text-green-500' : 'border-gray-800 hover:border-white'}`}
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                {copied ? 'Copied!' : 'Share'}
              </Button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-black border-2 border-white shadow-lg z-50"
                  >
                    <button
                      onClick={handleCopyTranscript}
                      className="w-full px-4 py-3 text-left hover:bg-white hover:text-black transition-all flex items-center gap-3 border-b border-gray-800"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="font-bold uppercase text-sm">Copy Full Transcript</span>
                    </button>
                    <button
                      onClick={handleCopySummary}
                      className="w-full px-4 py-3 text-left hover:bg-white hover:text-black transition-all flex items-center gap-3 border-b border-gray-800"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="font-bold uppercase text-sm">Copy Summary</span>
                    </button>
                    <button
                      onClick={handleEmailShare}
                      className="w-full px-4 py-3 text-left hover:bg-white hover:text-black transition-all flex items-center gap-3"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="font-bold uppercase text-sm">Email Transcript</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase">{meeting.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(meeting.startTime).toLocaleString()}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDuration(meeting.duration)}
            </span>
            <Badge className="uppercase">{meeting.status}</Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-xs text-gray-600 uppercase tracking-wider">
          <span>{meeting.transcript.length} transcript segments</span>
          <span>•</span>
          <span>{meeting.actionItems.length} action items</span>
          {meeting.participants.length > 0 && (
            <>
              <span>•</span>
              <span>{meeting.participants.length} participants</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Transcript */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-neutral-100">Transcript</h2>
            <p className="text-sm text-neutral-400">{meeting.transcript.length} segments</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {meeting.transcript.length === 0 ? (
              <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
                No transcript available for this meeting
              </div>
            ) : (
              meeting.transcript.map((segment) => (
                <TranscriptSegmentCard
                  key={segment.id}
                  segment={segment}
                  onEdit={(id, text) => updateTranscriptSegment(id, text)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Action Items & Summary */}
        <div className="w-96 border-l border-gray-800 flex flex-col overflow-hidden bg-black">
          {/* Action Items */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-black uppercase">Action Items</h2>
              <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">
                {meeting.actionItems.length} detected
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {meeting.actionItems.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-700 text-xs">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-black">[ EMPTY ]</div>
                    <div className="uppercase tracking-widest">No action items</div>
                  </div>
                </div>
              ) : (
                meeting.actionItems.map((item) => (
                  <ActionItemCard
                    key={item.id}
                    item={item}
                    onCreateIssue={createGitHubIssue}
                    onApprove={() => approveActionItem(item.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Summary */}
          {meeting.summary && (
            <div className="border-t border-gray-800 p-6 space-y-4 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-black uppercase">Summary</h3>
              
              {meeting.summary.keyDecisions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase text-gray-400">Key Decisions</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {meeting.summary.keyDecisions.map((decision, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gray-600">•</span>
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {meeting.summary.nextSteps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase text-gray-400">Next Steps</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {meeting.summary.nextSteps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gray-600">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {meeting.summary.blockers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase text-gray-400">Blockers</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {meeting.summary.blockers.map((blocker, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-red-600">⚠</span>
                        <span>{blocker}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TranscriptSegmentCardProps {
  segment: TranscriptSegment;
  onEdit?: (segmentId: string, newText: string) => void;
}

const TranscriptSegmentCard: React.FC<TranscriptSegmentCardProps> = ({ segment, onEdit }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(segment.text);

  const handleSave = () => {
    if (onEdit && editText !== segment.text) {
      onEdit(segment.id, editText);
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card>
        <div className="flex items-start gap-3">
          {/* Speaker badge */}
          <Badge className={getSpeakerColor(segment.speaker)}>
            {segment.speaker}
          </Badge>

          <div className="flex-1">
            {/* Text */}
            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSave();
                  }
                  if (e.key === 'Escape') {
                    setEditText(segment.text);
                    setIsEditing(false);
                  }
                }}
                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                autoFocus
              />
            ) : (
              <p className="text-sm text-neutral-200">{segment.text}</p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
              <span>{formatTimestamp(segment.startTime)}</span>
              {segment.confidence < 0.9 && (
                <span className="text-warning-500">Low confidence ({Math.round(segment.confidence * 100)}%)</span>
              )}
            </div>
          </div>

          {/* Edit button */}
          {onEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-neutral-800 rounded text-xs uppercase tracking-wider text-gray-500 hover:text-white"
            >
              Edit
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

