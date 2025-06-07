import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';

interface PendingResponse {
  id: string;
  user_id: string;
  context: string;
  ai_response: string;
  response_type: string;
  priority: number;
  created_at: string;
}

interface DmNotification {
  id: number;
  pending_response_id: string;
  notification_type: string;
  message: string;
  created_at: string;
}

interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface PendingResponsesData {
  items: PendingResponse[];
  pagination: Pagination;
}

interface Analytics {
  queue_status: {
    pending_count: number;
    high_priority_count: number;
  };
  review_stats: {
    total_reviewed: number;
    approved_count: number;
    rejected_count: number;
    edited_count: number;
    approval_rate: number;
    avg_review_time_minutes: number;
  };
  notifications: {
    unread_count: number;
  };
}

interface DmDashboardProps {
  sessionId: string;
  isVisible: boolean;
  onClose: () => void;
}

type TabType = 'pending' | 'notifications' | 'analytics';

const API_BASE_URL = 'http://localhost:5000';

export default function DmDashboard({ sessionId, isVisible, onClose }: DmDashboardProps) {
  const { user } = useUser();
  const [pendingResponsesData, setPendingResponsesData] = useState<PendingResponsesData>({
    items: [],
    pagination: { page: 1, per_page: 20, total: 0, pages: 0, has_next: false, has_prev: false }
  });
  const [notifications, setNotifications] = useState<DmNotification[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<PendingResponse | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [editedResponse, setEditedResponse] = useState('');
  const [dmNotes, setDmNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);
  const [responseTypeFilter, setResponseTypeFilter] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isVisible && user) {
        fetchPendingResponses();
        fetchNotifications();
        fetchAnalytics();
      }
    }, 5000); // Poll every 5 seconds
  }, [isVisible, user, sessionId, currentPage, priorityFilter, responseTypeFilter]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isVisible && user) {
      fetchPendingResponses();
      fetchNotifications();
      fetchAnalytics();
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isVisible, user, sessionId, currentPage, priorityFilter, responseTypeFilter, startPolling, stopPolling]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isVisible || !selectedResponse) return;

      if (e.key === 'a' && e.altKey) {
        e.preventDefault();
        handleReview('approve');
      } else if (e.key === 'r' && e.altKey) {
        e.preventDefault();
        handleReview('reject');
      } else if (e.key === 'e' && e.altKey) {
        e.preventDefault();
        handleReview('edit');
      } else if (e.key === 'Escape') {
        setSelectedResponse(null);
        setSelectedResponses(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, selectedResponse]);

  const fetchPendingResponses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        user_id: user?.id || '',
        page: currentPage.toString(),
        per_page: '20'
      });

      if (priorityFilter) params.append('priority', priorityFilter.toString());
      if (responseTypeFilter) params.append('response_type', responseTypeFilter);

      const response = await axios.get(
        `${API_BASE_URL}/api/session/${sessionId}/pending-responses?${params}`
      );
      setPendingResponsesData(response.data);
    } catch (error) {
      console.error('Error fetching pending responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/session/${sessionId}/dm/notifications?user_id=${user?.id}`
      );
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/session/${sessionId}/dm/analytics?user_id=${user?.id}`
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleReview = async (action: 'approve' | 'reject' | 'edit') => {
    if (!selectedResponse || !user) return;

    try {
      setIsLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/session/${sessionId}/pending-response/${selectedResponse.id}/review`,
        {
          user_id: user.id,
          action,
          final_response: action === 'edit' ? editedResponse : undefined,
          dm_notes: dmNotes
        }
      );

      // Refresh data
      await fetchPendingResponses();
      await fetchNotifications();
      await fetchAnalytics();
      
      // Clear selection
      setSelectedResponse(null);
      setEditedResponse('');
      setDmNotes('');
    } catch (error) {
      console.error('Error reviewing response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReview = async (action: 'approve' | 'reject') => {
    if (selectedResponses.size === 0 || !user) return;

    try {
      setIsLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/session/${sessionId}/pending-responses/bulk`,
        {
          user_id: user.id,
          action,
          response_ids: Array.from(selectedResponses),
          dm_notes: dmNotes
        }
      );

      // Refresh data
      await fetchPendingResponses();
      await fetchNotifications();
      await fetchAnalytics();
      
      // Clear selections
      setSelectedResponses(new Set());
      setDmNotes('');
    } catch (error) {
      console.error('Error bulk reviewing responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationRead = async (notificationId: number) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/session/${sessionId}/dm/notifications/${notificationId}/mark-read`,
        { user_id: user?.id }
      );
      await fetchNotifications();
      await fetchAnalytics();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const toggleResponseSelection = (responseId: string) => {
    const newSelected = new Set(selectedResponses);
    if (newSelected.has(responseId)) {
      newSelected.delete(responseId);
    } else {
      newSelected.add(responseId);
    }
    setSelectedResponses(newSelected);
  };

  const selectAllResponses = () => {
    if (selectedResponses.size === pendingResponsesData.items.length) {
      setSelectedResponses(new Set());
    } else {
      setSelectedResponses(new Set(pendingResponsesData.items.map(r => r.id)));
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'text-red-400 bg-red-900';
      case 2: return 'text-yellow-400 bg-yellow-900';
      default: return 'text-green-400 bg-green-900';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'HIGH';
      case 2: return 'MEDIUM';
      default: return 'LOW';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-green-400 p-6 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-400">DM REVIEW DASHBOARD</h2>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            className={`px-4 py-2 font-mono ${
              activeTab === 'pending' 
                ? 'text-green-400 border-b-2 border-green-400' 
                : 'text-gray-400 hover:text-green-400'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            PENDING RESPONSES ({pendingResponsesData.items.length})
          </button>
          <button
            className={`px-4 py-2 font-mono ${
              activeTab === 'notifications' 
                ? 'text-green-400 border-b-2 border-green-400' 
                : 'text-gray-400 hover:text-green-400'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            NOTIFICATIONS ({notifications.length})
          </button>
          <button
            className={`px-4 py-2 font-mono ${
              activeTab === 'analytics' 
                ? 'text-green-400 border-b-2 border-green-400' 
                : 'text-gray-400 hover:text-green-400'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            ANALYTICS
          </button>
        </div>

        {/* Pending Responses Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {/* Filters and Controls */}
            <div className="bg-gray-800 p-4 rounded border border-gray-600">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">PRIORITY FILTER</label>
                    <select
                      value={priorityFilter || ''}
                      onChange={(e) => {
                        setPriorityFilter(e.target.value ? parseInt(e.target.value) : null);
                        setCurrentPage(1);
                      }}
                      className="bg-gray-700 text-green-400 p-2 rounded border border-gray-600 text-sm"
                    >
                      <option value="">ALL</option>
                      <option value="3">HIGH</option>
                      <option value="2">MEDIUM</option>
                      <option value="1">LOW</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">TYPE FILTER</label>
                    <select
                      value={responseTypeFilter}
                      onChange={(e) => {
                        setResponseTypeFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-gray-700 text-green-400 p-2 rounded border border-gray-600 text-sm"
                    >
                      <option value="">ALL TYPES</option>
                      <option value="narrative">NARRATIVE</option>
                      <option value="dice_roll">DICE ROLL</option>
                      <option value="npc_action">NPC ACTION</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Operations */}
                {selectedResponses.size > 0 && (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-400">
                      {selectedResponses.size} selected
                    </span>
                    <button
                      onClick={() => handleBulkReview('approve')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                    >
                      Bulk Approve
                    </button>
                    <button
                      onClick={() => handleBulkReview('reject')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                    >
                      Bulk Reject
                    </button>
                  </div>
                )}
              </div>
              
              {/* Keyboard Shortcuts Help */}
              <div className="mt-2 text-xs text-gray-500">
                Shortcuts: Alt+A (approve), Alt+R (reject), Alt+E (edit), Esc (clear selection)
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Responses List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-mono text-yellow-400">PENDING REVIEWS</h3>
                  {pendingResponsesData.items.length > 0 && (
                    <button
                      onClick={selectAllResponses}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {selectedResponses.size === pendingResponsesData.items.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="text-green-400">Loading...</div>
                  </div>
                ) : pendingResponsesData.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No pending responses to review
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingResponsesData.items.map((response) => (
                      <div
                        key={response.id}
                        className={`p-4 border rounded transition-colors ${
                          selectedResponse?.id === response.id
                            ? 'border-green-400 bg-green-900 bg-opacity-20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedResponses.has(response.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleResponseSelection(response.id);
                            }}
                            className="mt-1 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                          />
                          
                          {/* Response Content */}
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              setSelectedResponse(response);
                              setEditedResponse(response.ai_response);
                              setDmNotes('');
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(response.priority)}`}>
                                  {getPriorityLabel(response.priority)}
                                </span>
                                <span className="text-blue-400 text-sm font-mono">
                                  {response.response_type.toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(response.created_at)}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-300 mb-2">
                              <strong>Player:</strong> {response.user_id}
                            </div>
                            
                            <div className="text-sm text-gray-300">
                              <strong>Context:</strong> {response.context.substring(0, 100)}...
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {pendingResponsesData.pagination.pages > 1 && (
                  <div className="mt-4 flex justify-between items-center text-sm">
                    <div className="text-gray-400">
                      Page {pendingResponsesData.pagination.page} of {pendingResponsesData.pagination.pages} 
                      ({pendingResponsesData.pagination.total} total)
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pendingResponsesData.pagination.has_prev}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-green-400 rounded"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pendingResponsesData.pagination.has_next}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-green-400 rounded"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Panel */}
              <div>
                <h3 className="text-lg font-mono mb-4 text-yellow-400">REVIEW PANEL</h3>
                
                {selectedResponse ? (
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-600 rounded">
                      <h4 className="text-green-400 font-mono mb-2">AI RESPONSE</h4>
                      <div className="text-gray-300 text-sm max-h-40 overflow-y-auto">
                        {selectedResponse.ai_response}
                      </div>
                    </div>

                    <div className="p-4 border border-gray-600 rounded">
                      <h4 className="text-green-400 font-mono mb-2">EDIT RESPONSE</h4>
                      <textarea
                        value={editedResponse}
                        onChange={(e) => setEditedResponse(e.target.value)}
                        className="w-full h-32 bg-gray-700 text-green-400 p-2 rounded border border-gray-600 text-sm"
                        placeholder="Edit the AI response..."
                      />
                    </div>

                    <div className="p-4 border border-gray-600 rounded">
                      <h4 className="text-green-400 font-mono mb-2">DM NOTES</h4>
                      <textarea
                        value={dmNotes}
                        onChange={(e) => setDmNotes(e.target.value)}
                        className="w-full h-20 bg-gray-700 text-green-400 p-2 rounded border border-gray-600 text-sm"
                        placeholder="Add notes about this review..."
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReview('approve')}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-mono"
                        disabled={isLoading}
                      >
                        APPROVE (Alt+A)
                      </button>
                      <button
                        onClick={() => handleReview('edit')}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono"
                        disabled={isLoading}
                      >
                        EDIT (Alt+E)
                      </button>
                      <button
                        onClick={() => handleReview('reject')}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-mono"
                        disabled={isLoading}
                      >
                        REJECT (Alt+R)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Select a response to review
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <h3 className="text-lg font-mono mb-4 text-yellow-400">NOTIFICATIONS</h3>
            
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No notifications
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border border-gray-600 rounded cursor-pointer hover:border-gray-500"
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-blue-400 text-sm font-mono">
                        {notification.notification_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(notification.created_at)}
                      </span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {notification.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h3 className="text-lg font-mono mb-4 text-yellow-400">ANALYTICS</h3>
            
            {analytics ? (
              <div className="space-y-4">
                <div className="p-4 border border-gray-600 rounded">
                  <h4 className="text-green-400 font-mono mb-2">QUEUE STATUS</h4>
                  <div className="text-gray-300 text-sm">
                    <strong>Pending:</strong> {analytics.queue_status.pending_count}
                  </div>
                  <div className="text-gray-300 text-sm">
                    <strong>High Priority:</strong> {analytics.queue_status.high_priority_count}
                  </div>
                </div>

                <div className="p-4 border border-gray-600 rounded">
                  <h4 className="text-green-400 font-mono mb-2">REVIEW STATISTICS</h4>
                  <div className="text-gray-300 text-sm">
                    <strong>Total Reviewed:</strong> {analytics.review_stats.total_reviewed}
                  </div>
                  <div className="text-gray-300 text-sm">
                    <strong>Approved:</strong> {analytics.review_stats.approved_count}
                  </div>
                  <div className="text-gray-300 text-sm">
                    <strong>Rejected:</strong> {analytics.review_stats.rejected_count}
                  </div>
                  <div className="text-gray-300 text-sm">
                    <strong>Edited:</strong> {analytics.review_stats.edited_count}
                  </div>
                  <div className="text-gray-300 text-sm">
                    <strong>Approval Rate:</strong> {analytics.review_stats.approval_rate.toFixed(2)}%
                  </div>
                  <div className="text-gray-300 text-sm">
                    <strong>Average Review Time:</strong> {analytics.review_stats.avg_review_time_minutes.toFixed(2)} minutes
                  </div>
                </div>

                <div className="p-4 border border-gray-600 rounded">
                  <h4 className="text-green-400 font-mono mb-2">NOTIFICATIONS</h4>
                  <div className="text-gray-300 text-sm">
                    <strong>Unread:</strong> {analytics.notifications.unread_count}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Loading analytics...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}