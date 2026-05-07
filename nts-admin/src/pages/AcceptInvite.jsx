import { useSearchParams, useNavigate } from "react-router-dom";
import { requestPermission } from "../firebase";
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import api from "../api/client";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async () => {
    setError("");

    if (!username || !password) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // ✅ Create account
      await api.post("/auth/accept-invite/", {
        token,
        username,
        password
      });

      // 🔔 Get FCM token
      const fcmToken = await requestPermission();

      // ✅ Save token to backend
      if (fcmToken) {
        await api.post("/notifications/save-token/", {
          token: fcmToken
        });
      }

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Invalid or expired invite link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #0f1d2f 0%, #1a2e4a 40%, #2d4a72 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,74,114,0.4) 0%, transparent 70%)',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 2,
          borderRadius: 4,
          bgcolor: '#fff',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Gold accent bar */}
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #c9a84c, #dfc070, #c9a84c)' }} />

        <Box sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1a2e4a, #2d4a72)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 24px rgba(26,46,74,0.3)',
              }}
            >
              <Typography sx={{ fontSize: '1.4rem' }}>🤝</Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: '#1a2e4a',
                letterSpacing: '-0.3px',
              }}
            >
              Join Your Team
            </Typography>
            <Typography variant="body2" sx={{ color: '#546e7a', mt: 0.5 }}>
              Set up your account to get started
            </Typography>
          </Box>

          {/* Error inline */}
          {error && (
            <Box sx={{
              mb: 2.5, p: 1.5, borderRadius: 2,
              bgcolor: '#ffebee', border: '1px solid #ffcdd2',
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#c62828', fontWeight: 500 }}>
                {error}
              </Typography>
            </Box>
          )}

          {/* Success inline */}
          {success && (
            <Box sx={{
              mb: 2.5, p: 1.5, borderRadius: 2,
              bgcolor: '#e8f5e9', border: '1px solid #c8e6c9',
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 500 }}>
                {success}
              </Typography>
            </Box>
          )}

          {/* Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1a2e4a' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a2e4a', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1a2e4a' },
              }}
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1a2e4a' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a2e4a', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1a2e4a' },
              }}
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1a2e4a' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a2e4a', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1a2e4a' },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={submit}
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: 2,
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #1a2e4a 0%, #2d4a72 100%)',
                boxShadow: '0 4px 14px rgba(26,46,74,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0f1d2f 0%, #1a2e4a 100%)',
                  boxShadow: '0 6px 20px rgba(26,46,74,0.45)',
                },
                '&:disabled': {
                  background: '#c5cad3',
                },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : "Create Account"}
            </Button>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            display="block"
            textAlign="center"
            sx={{ mt: 3, color: '#90a4ae' }}
          >
            © {new Date().getFullYear()} NTS Legal Pro. All rights reserved.
          </Typography>
        </Box>
      </Box>

      {/* Snackbars kept for backwards compat */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError("")}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
}