import React from 'react';
import { CheckCircle2, Circle, ExternalLink, User, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { getPriorityColor } from '@/lib/utils';
import type { ActionItem } from '@/types';

interface ActionItemCardProps {
  item: ActionItem;
  onCreateIssue?: (item: ActionItem) => void;
  onApprove?: (itemId: string) => void;
  onAssigneeChange?: (itemId: string, assignee: string) => void;
}

export const ActionItemCard: React.FC<ActionItemCardProps> = ({
  item,
  onCreateIssue,
  onApprove,
  onAssigneeChange
}) => {
  const [showContext, setShowContext] = React.useState(false);
  const priorityColors = getPriorityColor(item.priority);
  const isApproved = item.status === 'approved';
  const isCreated = item.status === 'created';

  return (
    <Card
      className={`border-l-4 ${priorityColors.border} ${
        isApproved ? 'border-2 border-white/20' : ''
      }`}
      hover
    >
      <CardContent>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2 flex-1">
            {isCreated ? (
              <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            ) : isApproved ? (
              <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-white leading-relaxed">{item.text}</p>
          </div>

          <Badge
            variant={
              item.priority === 'high'
                ? 'primary'
                : item.priority === 'medium'
                ? 'secondary'
                : 'ghost'
            }
          >
            {item.priority}
          </Badge>
        </div>

        {/* Context toggle */}
        {item.context && (
          <>
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-xs text-gray-500 hover:text-white transition-colors mb-2 uppercase tracking-wider"
            >
              {showContext ? 'Hide' : 'Show'} context
            </button>

            {/* Context */}
            {showContext && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 p-3 bg-black border border-gray-800 text-xs text-gray-500 italic"
              >
                "{item.context}"
              </motion.div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-800">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-600" />
            {item.assignee ? (
              <span className="text-xs text-gray-400">{item.assignee}</span>
            ) : (
              <span className="text-xs text-gray-600">Unassigned</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isApproved && !isCreated && onApprove && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onApprove(item.id)}
                icon={<Check className="w-3 h-3" />}
              >
                Approve
              </Button>
            )}

            {isCreated && item.githubIssue ? (
              <a
                href={item.githubIssue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white hover:text-gray-300 transition-colors px-3 py-1.5 border border-gray-800 hover:border-gray-700"
              >
                #{item.githubIssue.number}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : isApproved && onCreateIssue ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onCreateIssue(item)}
                loading={item.status === 'creating'}
                disabled={item.status === 'creating'}
              >
                Create Issue
              </Button>
            ) : null}
          </div>
        </div>

        {/* Status indicator */}
        {isApproved && !isCreated && (
          <div className="mt-2 text-xs text-white/60 uppercase tracking-wider">
            ✓ Approved • Ready to create issue
          </div>
        )}
      </CardContent>
    </Card>
  );
};
