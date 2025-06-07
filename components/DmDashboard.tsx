import { useState, useEffect } from 'react';
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

interface DmDashboardProps {
  sessionId: string;
  isVisible: boolean;
  onClose: () => void;
}

const API_BASE_URL = 'http://localhost:5000';

export default function DmDashboard({ sessionId, isVisible, onClose }: DmDashboardProps) {
  const { user } = useUser();
  const [pendingResponses, setPendingResponses] = useState<PendingResponse[]>([]);
  const [notifications, setNotifications] = useState<DmNotification[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<PendingResponse | null>(null);
  const [editedResponse, setEditedResponse] = useState('');
  const [dmNotes, setDmNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'notifications'>('pending');

  useEffect(() => {
    if (isVisible && user) {
      fetchPendingResponses();
      fetchNotifications();
    }
  }, [isVisible, user, sessionId]);

  const fetchPendingResponses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/session/${sessionId}/pending-responses?user_id=${user?.id}`
      );
      setPendingResponses(response.data);
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

  const markNotificationRead = async (notificationId: number) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/session/${sessionId}/dm/notifications/${notificationId}/mark-read`,
        { user_id: user?.id }
      );
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
            PENDING RESPONSES ({pendingResponses.length})
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
        </div>

        {/* Pending Responses Tab */}
        {activeTab === 'pending' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Responses List */}
            <div>
              <h3 className="text-lg font-mono mb-4 text-yellow-400">PENDING REVIEWS</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-green-400">Loading...</div>
                </div>
              ) : pendingResponses.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No pending responses to review
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingResponses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-4 border rounded cursor-pointer transition-colors ${
                        selectedResponse?.id === response.id
                          ? 'border-green-400 bg-green-900 bg-opacity-20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
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
                  ))}
                </div>
              )}
            </div>

            {/* Review Panel */}
            <div>
              <h3 className="text-lg font-mono mb-4 text-yellow-400">REVIEW PANEL</h3>
              
              {selectedResponse ? (
                <div className="space-y-4">
                  <div className="p-4 border border-gray-600 rounded">
                    <h4 className="text-green-400 font-mono mb-2">PLAYER CONTEXT</h4>
                    <div className="text-gray-300 text-sm bg-gray-800 p-3 rounded">
                      {selectedResponse.context}
                    </div>
                  </div>

                  <div className="p-4 border border-gray-600 rounded">
                    <h4 className="text-green-400 font-mono mb-2">AI RESPONSE</h4>
                    <div className="text-gray-300 text-sm bg-gray-800 p-3 rounded">
                      {selectedResponse.ai_response}
                    </div>
                  </div>

                  <div className="p-4 border border-gray-600 rounded">
                    <h4 className="text-green-400 font-mono mb-2">EDIT RESPONSE (Optional)</h4>
                    <textarea
                      value={editedResponse}
                      onChange={(e) => setEditedResponse(e.target.value)}
                      className="w-full h-32 bg-gray-800 text-gray-300 p-3 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-sm"
                      placeholder="Edit the AI response or leave as-is to approve..."
                    />
                  </div>

                  <div className="p-4 border border-gray-600 rounded">
                    <h4 className="text-green-400 font-mono mb-2">DM NOTES (Optional)</h4>
                    <textarea
                      value={dmNotes}
                      onChange={(e) => setDmNotes(e.target.value)}
                      className="w-full h-20 bg-gray-800 text-gray-300 p-3 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-sm"
                      placeholder="Add notes for the player..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleReview('approve')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded font-mono disabled:opacity-50"
                    >
                      APPROVE
                    </button>
                    <button
                      onClick={() => handleReview('edit')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded font-mono disabled:opacity-50"
                    >
                      EDIT & APPROVE
                    </button>
                    <button
                      onClick={() => handleReview('reject')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded font-mono disabled:opacity-50"
                    >
                      REJECT
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Select a pending response to review
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <h3 className="text-lg font-mono mb-4 text-yellow-400">NOTIFICATIONS</h3>
            
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No unread notifications
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border border-gray-600 rounded hover:border-gray-500 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            notification.notification_type === 'urgent_review' 
                              ? 'bg-red-900 text-red-400' 
                              : 'bg-blue-900 text-blue-400'
                          }`}>
                            {notification.notification_type.toUpperCase().replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(notification.created_at)}
                          </span>
                        </div>
                        
                        <div className="text-gray-300 text-sm">
                          {notification.message}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="text-green-400 hover:text-green-300 text-sm font-mono"
                      >
                        MARK READ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 