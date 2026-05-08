// ═══════════════════════════════════════════════════════════════
// FRONTEND: src/components/NotificationBell.jsx
// Fully Fixed Version
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Typography,
  IconButton,
  Badge,
  Popover,
  CircularProgress,
  Button,
  Tooltip,
} from '@mui/material';

import {
  NotificationsRounded,
  DoneAllRounded,
  GavelRounded,
  AssignmentRounded,
  PaymentRounded,
  SupportAgentRounded,
  NotificationsNoneRounded,
  FiberManualRecordRounded,
} from '@mui/icons-material';

import api from '../api/client';
import { onMessageListener } from '../firebase';


// ─────────────────────────────────────────────
// Notification Type Config
// ─────────────────────────────────────────────

const TYPE_CONFIG = {
  hearing: {
    icon: GavelRounded,
    color: '#3B82F6',
    bg: '#EFF6FF',
  },

  task: {
    icon: AssignmentRounded,
    color: '#F59E0B',
    bg: '#FFFBEB',
  },

  payment: {
    icon: PaymentRounded,
    color: '#10B981',
    bg: '#ECFDF5',
  },

  support: {
    icon: SupportAgentRounded,
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },

  default: {
    icon: NotificationsRounded,
    color: '#6B7280',
    bg: '#F9FAFB',
  },
};

const getConfig = (type) =>
  TYPE_CONFIG[type] || TYPE_CONFIG.default;


// ─────────────────────────────────────────────
// Relative Time Formatter
// ─────────────────────────────────────────────

const timeAgo = (dateStr) => {
  if (!dateStr) return '';

  const diff =
    Date.now() - new Date(dateStr).getTime();

  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'just now';

  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  return new Date(dateStr).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
    }
  );
};


// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function NotificationBell() {

  const [anchor, setAnchor] = useState(null);

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [newToast, setNewToast] =
    useState(null);


  // ─────────────────────────────────────────
  // Fetch Notifications
  // ─────────────────────────────────────────

  const fetchNotifications = useCallback(
    async () => {

      setLoading(true);

      try {

        const res =
          await api.get('/notifications/');

        console.log(
          'Notifications API:',
          res.data
        );

        const raw =
          res.data?.results ??
          res.data?.data ??
          res.data ??
          [];

        const list =
          Array.isArray(raw) ? raw : [];

        setNotifications(list);

        setUnreadCount(
          list.filter((n) => !n.is_read).length
        );

      } catch (err) {

        console.error(
          'Notification fetch failed:',
          err
        );

        setNotifications([]);
        setUnreadCount(0);

      } finally {

        setLoading(false);

      }
    },
    []
  );


  // ─────────────────────────────────────────
  // Initial Load + Polling
  // ─────────────────────────────────────────

  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(
      fetchNotifications,
      60000
    );

    return () => clearInterval(interval);

  }, [fetchNotifications]);


  // ─────────────────────────────────────────
  // Firebase Foreground Listener
  // ─────────────────────────────────────────

  useEffect(() => {

    let active = true;

    const listen = async () => {

      try {

        const payload =
          await onMessageListener();

        if (!active) return;

        const n = {
          id: Date.now(),
          title:
            payload?.notification?.title ||
            'New Notification',

          message:
            payload?.notification?.body || '',

          is_read: false,

          created_at:
            new Date().toISOString(),

          notification_type:
            payload?.data?.type || 'default',
        };

        setNewToast(n);

        setTimeout(() => {
          setNewToast(null);
        }, 5000);

        fetchNotifications();

      } catch {
        // silent
      }
    };

    listen();

    return () => {
      active = false;
    };

  }, [fetchNotifications]);


  // ─────────────────────────────────────────
  // Mark All Read
  // ─────────────────────────────────────────

  const handleMarkAllRead = async () => {

    try {

      await api.post(
        '/notifications/mark_all_as_read/'
      );

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
        }))
      );

      setUnreadCount(0);

    } catch (err) {

      console.error(err);

    }
  };


  // ─────────────────────────────────────────
  // Mark Single Read
  // ─────────────────────────────────────────

  const handleMarkRead = async (id) => {

    try {

      await api.post(
        `/notifications/${id}/mark_as_read/`
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true }
            : n
        )
      );

      setUnreadCount((prev) =>
        Math.max(0, prev - 1)
      );

    } catch (err) {

      console.error(err);

    }
  };


  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  return (
    <>

      {/* ───────────────────────────────── */}
      {/* Bell Button */}
      {/* ───────────────────────────────── */}

      <Tooltip title="Notifications">

        <IconButton
          onClick={(e) => {
            setAnchor(e.currentTarget);
            fetchNotifications();
          }}
          sx={{
            position: 'relative',
            color: '#64748B',

            '&:hover': {
              bgcolor: '#F5F4F0',
            },
          }}
        >

          <Badge
            badgeContent={unreadCount}
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#EF4444',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
              },
            }}
          >

            <NotificationsRounded
              sx={{ fontSize: 22 }}
            />

          </Badge>
        </IconButton>
      </Tooltip>


      {/* ───────────────────────────────── */}
      {/* Popover */}
      {/* ───────────────────────────────── */}

      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            borderRadius: '16px',
            boxShadow:
              '0 16px 48px rgba(0,0,0,0.15)',
            border: '1px solid #F0EDE5',
            overflow: 'hidden',
          },
        }}
      >

        {/* Header */}

        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom:
              '1px solid #F0EDE5',
            bgcolor: '#FAFAF8',
          }}
        >

          <Box>

            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 15,
                color: '#0D1B2A',
              }}
            >
              Notifications
            </Typography>

            {unreadCount > 0 && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: '#9CA3AF',
                }}
              >
                {unreadCount} unread
              </Typography>
            )}
          </Box>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              startIcon={
                <DoneAllRounded
                  sx={{ fontSize: 14 }}
                />
              }
              size="small"
              sx={{
                textTransform: 'none',
                fontSize: 12,
                color: '#3B82F6',
                fontWeight: 600,
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>


        {/* Notifications List */}

        <Box
          sx={{
            maxHeight: 420,
            overflowY: 'auto',
          }}
        >

          {loading ? (

            <Box
              sx={{
                p: 4,
                textAlign: 'center',
              }}
            >
              <CircularProgress
                size={20}
              />
            </Box>

          ) : notifications.length === 0 ? (

            <Box
              sx={{
                p: 5,
                textAlign: 'center',
              }}
            >

              <NotificationsNoneRounded
                sx={{
                  fontSize: 32,
                  color: '#D0CEC7',
                  mb: 1,
                }}
              />

              <Typography
                sx={{
                  fontSize: 13,
                  color: '#9CA3AF',
                }}
              >
                No notifications yet
              </Typography>

            </Box>

          ) : Array.isArray(notifications) ? (

            notifications.map((n, idx) => {

              const cfg =
                getConfig(
                  n.notification_type
                );

              const Icon = cfg.icon;

              return (

                <Box
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read)
                      handleMarkRead(n.id);
                  }}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    px: 3,
                    py: 2,
                    borderBottom:
                      idx === notifications.length - 1
                        ? 'none'
                        : '1px solid #F5F4F0',

                    bgcolor: n.is_read
                      ? '#fff'
                      : '#F8F7FF',

                    cursor: n.is_read
                      ? 'default'
                      : 'pointer',

                    '&:hover': {
                      bgcolor: '#FAFAF8',
                    },
                  }}
                >

                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: cfg.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 17,
                        color: cfg.color,
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>

                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight:
                          n.is_read
                            ? 500
                            : 700,
                      }}
                    >
                      {n.title}
                    </Typography>

                    {n.message && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: '#64748B',
                          mt: 0.3,
                        }}
                      >
                        {n.message}
                      </Typography>
                    )}

                    <Typography
                      sx={{
                        fontSize: 10,
                        color: '#9CA3AF',
                        mt: 0.5,
                      }}
                    >
                      {timeAgo(n.created_at)}
                    </Typography>

                  </Box>
                </Box>
              );
            })

          ) : (

            <Box
              sx={{
                p: 5,
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: '#9CA3AF',
                }}
              >
                Invalid notification data
              </Typography>
            </Box>

          )}

        </Box>
      </Popover>


      {/* ───────────────────────────────── */}
      {/* Floating Toast */}
      {/* ───────────────────────────────── */}

      {newToast && (() => {

        const cfg =
          getConfig(
            newToast.notification_type
          );

        const Icon = cfg.icon;

        return (

          <Box
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 24,
              zIndex: 9999,
              bgcolor: '#0D1B2A',
              borderRadius: '14px',
              px: 2.5,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >

            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: cfg.bg,
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                sx={{
                  fontSize: 16,
                  color: cfg.color,
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {newToast.title}
              </Typography>

              {newToast.message && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color:
                      'rgba(255,255,255,0.6)',
                  }}
                >
                  {newToast.message}
                </Typography>
              )}

            </Box>

            <IconButton
              size="small"
              onClick={() =>
                setNewToast(null)
              }
              sx={{
                color:
                  'rgba(255,255,255,0.5)',
              }}
            >
              ✕
            </IconButton>

          </Box>
        );

      })()}

    </>
  );
}