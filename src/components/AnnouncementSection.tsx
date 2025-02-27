import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Download, FileText, Image, Video, X, ChevronLeft, ChevronRight, ExternalLink, Edit, Save, MapPin, User, Flag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'image' | 'video';
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  venue?: string;
  event_date?: string;
  sender_name?: string;
  created_at: string;
  created_by: string;
  attachments: Attachment[];
  is_pinned: boolean;
  priority: 'low' | 'medium' | 'high';
}

const AnnouncementSection: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    venue: '',
    event_date: '',
    sender_name: '',
    is_pinned: false,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [files, setFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    venue: '',
    event_date: '',
    sender_name: '',
    is_pinned: false,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [error, setError] = useState<string | null>(null);

  const announcementsPerPage = 3;

  useEffect(() => {
    checkAdminStatus();
    loadAnnouncements();
    
    // Mark announcements as read when component mounts
    localStorage.setItem('lastViewedAnnouncements', new Date().toISOString());
  }, []);

  useEffect(() => {
    // Create object URLs for file previews
    const urls: Record<string, string> = {};
    files.forEach(file => {
      urls[file.name] = URL.createObjectURL(file);
    });
    setPreviewUrls(urls);

    // Clean up URLs when component unmounts or files change
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('check_admin_status');
      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is configured
      if (!supabase || !supabase.from) {
        setError('Database connection not available');
        setLoading(false);
        return;
      }
      
      // First get announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (announcementsError) {
        console.error('Error fetching announcements:', announcementsError);
        setError('Failed to load announcements');
        setLoading(false);
        return;
      }

      if (!announcementsData || announcementsData.length === 0) {
        setAnnouncements([]);
        setLoading(false);
        return;
      }

      // Then get attachments for each announcement
      const announcementIds = announcementsData.map(a => a.id);
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('announcement_attachments')
        .select('*')
        .in('announcement_id', announcementIds);

      if (attachmentsError) {
        console.error('Error fetching attachments:', attachmentsError);
        // Continue with announcements even if attachments fail
      }

      // Combine the data
      const formattedAnnouncements = announcementsData.map(announcement => {
        const announcementAttachments = attachmentsData?.filter(
          attachment => attachment.announcement_id === announcement.id
        ) || [];

        return {
          ...announcement,
          attachments: announcementAttachments
        };
      });

      setAnnouncements(formattedAnnouncements);
    } catch (error: any) {
      console.error('Error in loadAnnouncements:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast.error('Please enter both title and content');
      return;
    }

    try {
      setLoading(true);
      // Insert announcement
      const { data: announcementData, error: announcementError } = await supabase
        .from('announcements')
        .insert([{
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          venue: newAnnouncement.venue,
          event_date: newAnnouncement.event_date,
          sender_name: newAnnouncement.sender_name,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          is_pinned: newAnnouncement.is_pinned,
          priority: newAnnouncement.priority
        }])
        .select()
        .single();

      if (announcementError) throw announcementError;

      // Upload files and create attachments
      if (files.length > 0) {
        for (const file of files) {
          // Determine file type
          let fileType: 'document' | 'image' | 'video' = 'document';
          if (file.type.startsWith('image/')) fileType = 'image';
          if (file.type.startsWith('video/')) fileType = 'video';

          // Upload file to storage
          const filePath = `announcements/${announcementData.id}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('attachments')
            .getPublicUrl(filePath);

          // Create attachment record
          const { error: attachmentError } = await supabase
            .from('announcement_attachments')
            .insert([{
              announcement_id: announcementData.id,
              name: file.name,
              url: urlData.publicUrl,
              type: fileType
            }]);

          if (attachmentError) throw attachmentError;
        }
      }

      toast.success('Announcement added successfully');
      setNewAnnouncement({ 
        title: '', 
        content: '', 
        venue: '', 
        event_date: '', 
        sender_name: '', 
        is_pinned: false, 
        priority: 'medium' 
      });
      setFiles([]);
      setShowAddForm(false);
      loadAnnouncements();
    } catch (error: any) {
      console.error('Error adding announcement:', error);
      toast.error('Error adding announcement: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    if (previewUrls[fileName]) {
      URL.revokeObjectURL(previewUrls[fileName]);
      setPreviewUrls(prev => {
        const updated = { ...prev };
        delete updated[fileName];
        return updated;
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setLoading(true);
      // Delete announcement (cascade will handle attachments)
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete files from storage
      try {
        await supabase.storage
          .from('attachments')
          .remove([`announcements/${id}`]);
      } catch (storageError) {
        // Continue even if storage deletion fails
        console.error('Error deleting files from storage:', storageError);
      }

      toast.success('Announcement deleted successfully');
      loadAnnouncements();
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast.error('Error deleting announcement: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const startEditingAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement.id);
    setEditFormData({
      title: announcement.title,
      content: announcement.content,
      venue: announcement.venue || '',
      event_date: announcement.event_date || '',
      sender_name: announcement.sender_name || '',
      is_pinned: announcement.is_pinned,
      priority: announcement.priority || 'medium'
    });
    setExpandedAnnouncement(announcement.id);
  };

  const cancelEditing = () => {
    setEditingAnnouncement(null);
    setEditFormData({
      title: '',
      content: '',
      venue: '',
      event_date: '',
      sender_name: '',
      is_pinned: false,
      priority: 'medium'
    });
  };

  const handleUpdateAnnouncement = async (id: string) => {
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      toast.error('Please enter both title and content');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('announcements')
        .update({
          title: editFormData.title,
          content: editFormData.content,
          venue: editFormData.venue,
          event_date: editFormData.event_date,
          sender_name: editFormData.sender_name,
          is_pinned: editFormData.is_pinned,
          priority: editFormData.priority
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Announcement updated successfully');
      setEditingAnnouncement(null);
      loadAnnouncements();
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      toast.error('Error updating announcement: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandAnnouncement = (id: string) => {
    if (editingAnnouncement === id) return; // Don't collapse while editing
    setExpandedAnnouncement(prev => prev === id ? null : id);
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadUrl);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-green-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">High Priority</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Medium Priority</span>;
      case 'low':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Low Priority</span>;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(announcements.length / announcementsPerPage);
  const paginatedAnnouncements = announcements.slice(
    currentPage * announcementsPerPage,
    (currentPage + 1) * announcementsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-12"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-2xl font-bold flex items-center text-current"
        >
          <Bell className="w-6 h-6 mr-2 text-blue-500" />
          Announcements & Updates
        </motion.h2>
        
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Announcement'}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-current">New Announcement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title*
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Announcement title"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement({ 
                        ...newAnnouncement, 
                        priority: e.target.value as 'low' | 'medium' | 'high' 
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={newAnnouncement.event_date}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, event_date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.venue}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, venue: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Event venue (if applicable)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content*
                  </label>
                  <textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Announcement content"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.sender_name}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, sender_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Name of the sender"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pin-announcement"
                    checked={newAnnouncement.is_pinned}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="pin-announcement" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pin this announcement
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Attachments
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      <span>Add Files</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Upload documents, images, or videos
                    </span>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Files:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                            <div className="flex items-center space-x-2 overflow-hidden">
                              {file.type.startsWith('image/') ? (
                                <img 
                                  src={previewUrls[file.name]} 
                                  alt={file.name} 
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : file.type.startsWith('video/') ? (
                                <Video className="w-5 h-5 text-red-500" />
                              ) : (
                                <FileText className="w-5 h-5 text-blue-500" />
                              )}
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                                {file.name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(file.name)}
                              className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddAnnouncement}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Posting...' : 'Post Announcement'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && announcements.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading announcements...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={loadAnnouncements}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No announcements yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {paginatedAnnouncements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`border dark:border-gray-700 rounded-lg overflow-hidden ${
                    announcement.is_pinned ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                  }`}
                >
                  <div className="p-4">
                    {editingAnnouncement === announcement.id ? (
                      // Edit form
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title*
                          </label>
                          <input
                            type="text"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Priority
                            </label>
                            <select
                              value={editFormData.priority}
                              onChange={(e) => setEditFormData({ 
                                ...editFormData, 
                                priority: e.target.value as 'low' | 'medium' | 'high' 
                              })}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Event Date
                            </label>
                            <input
                              type="date"
                              value={editFormData.event_date}
                              onChange={(e) => setEditFormData({ ...editFormData, event_date: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Venue
                          </label>
                          <input
                            type="text"
                            value={editFormData.venue}
                            onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Event venue (if applicable)"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Content*
                          </label>
                          <textarea
                            value={editFormData.content}
                            onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sender Name
                          </label>
                          <input
                            type="text"
                            value={editFormData.sender_name}
                            onChange={(e) => setEditFormData({ ...editFormData, sender_name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Name of the sender"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`pin-edit-${announcement.id}`}
                            checked={editFormData.is_pinned}
                            onChange={(e) => setEditFormData({ ...editFormData, is_pinned: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor={`pin-edit-${announcement.id}`} className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pin this announcement
                          </label>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateAnnouncement(announcement.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                          >
                            <Save size={16} className="mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display announcement
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              {announcement.is_pinned && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  Pinned
                                </span>
                              )}
                              {getPriorityBadge(announcement.priority)}
                              <h3 className="text-lg font-semibold text-current">{announcement.title}</h3>
                            </div>
                            
                            <div className="flex flex-wrap items-center mt-2 gap-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>
                                  {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              
                              {announcement.event_date && (
                                <div className="flex items-center">
                                  <Flag className="w-4 h-4 mr-1" />
                                  <span>Event: {new Date(announcement.event_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}</span>
                                </div>
                              )}
                              
                              {announcement.venue && (
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span>{announcement.venue}</span>
                                </div>
                              )}
                              
                              {announcement.sender_name && (
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  <span>From: {announcement.sender_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {isAdmin && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditingAnnouncement(announcement)}
                                className="p-1 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div 
                          className={`mt-3 text-gray-700 dark:text-gray-300 ${
                            expandedAnnouncement !== announcement.id && announcement.content.length > 150 
                              ? 'line-clamp-3' 
                              : ''
                          }`}
                        >
                          {announcement.content}
                        </div>
                        
                        {announcement.content.length > 150 && (
                          <button
                            onClick={() => toggleExpandAnnouncement(announcement.id)}
                            className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline focus:outline-none"
                          >
                            {expandedAnnouncement === announcement.id ? 'Show less' : 'Read more'}
                          </button>
                        )}
                        
                        {announcement.attachments && announcement.attachments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {announcement.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
                                >
                                  <div className="flex items-center space-x-2 overflow-hidden">
                                    {getFileIcon(attachment.type)}
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                      {attachment.name}
                                    </span>
                                  </div>
                                  <div className="flex space-x-1">
                                    {attachment.type === 'image' && (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                      >
                                        <ExternalLink size={16} />
                                      </a>
                                    )}
                                    <button
                                      onClick={() => handleDownload(attachment.url, attachment.name)}
                                      className="p-1 text-green-500 hover:text-green-700 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20"
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevPage}
                disabled={currentPage === 0}
                className={`p-2 rounded-full ${
                  currentPage === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                }`}
              >
                <ChevronLeft size={20} />
              </motion.button>
              
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
                className={`p-2 rounded-full ${
                  currentPage >= totalPages - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                }`}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default AnnouncementSection;