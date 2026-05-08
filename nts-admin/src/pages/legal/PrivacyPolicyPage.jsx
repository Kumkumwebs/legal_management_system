
// ═══════════════════════════════════════════════════════════════
// FILE: src/pages/legal/PrivacyPolicyPage.jsx
// ═══════════════════════════════════════════════════════════════
import { Box, Typography, Divider } from '@mui/material';
import { GavelRounded } from '@mui/icons-material';
 
const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0D1B2A', mb: 1.5 }}>{title}</Typography>
    <Box sx={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8 }}>{children}</Box>
  </Box>
);
 
export function PrivacyPolicyPage() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 3, md: 5 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: '20px', p: { xs: 3, md: 5 }, border: '1px solid #F0EDE5' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box sx={{ width: 40, height: 40, bgcolor: '#0D1B2A', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GavelRounded sx={{ color: '#C9A84C', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Legal</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#0D1B2A' }}>Privacy Policy</Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: 13, color: '#9CA3AF', mb: 4 }}>Last updated: May 2026</Typography>
        <Divider sx={{ mb: 4 }} />
 
        <Section title="1. Information We Collect">
          <p>We collect information you provide directly to us, including your name, email address, phone number, firm details, and payment information when you register for or use our services.</p>
          <p style={{ marginTop: 8 }}>We automatically collect certain technical information including IP addresses, browser type, pages visited, and usage patterns through cookies and similar tracking technologies.</p>
        </Section>
 
        <Section title="2. How We Use Your Information">
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>To provide, maintain, and improve our legal case management services</li>
            <li style={{ marginBottom: 8 }}>To process payments and send transaction confirmations</li>
            <li style={{ marginBottom: 8 }}>To send hearing reminders, task notifications, and system alerts</li>
            <li style={{ marginBottom: 8 }}>To respond to your questions and provide customer support</li>
            <li style={{ marginBottom: 8 }}>To comply with legal obligations and enforce our terms</li>
          </ul>
        </Section>
 
        <Section title="3. Data Sharing">
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 8 }}>Payment processors (Razorpay) for billing purposes</li>
            <li style={{ marginBottom: 8 }}>Communication services (email, WhatsApp) for notifications</li>
            <li style={{ marginBottom: 8 }}>Law enforcement when required by applicable law</li>
          </ul>
        </Section>
 
        <Section title="4. Data Security">
          <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. All data is encrypted in transit using TLS/SSL. Client data is stored in isolated firm-specific database schemas.</p>
        </Section>
 
        <Section title="5. Data Retention">
          <p>We retain your data for as long as your account is active or as needed to provide services. Upon account termination, data is retained for 90 days before permanent deletion, unless a longer retention period is required by law.</p>
        </Section>
 
        <Section title="6. Your Rights">
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>Access and obtain a copy of your personal data</li>
            <li style={{ marginBottom: 8 }}>Request correction of inaccurate data</li>
            <li style={{ marginBottom: 8 }}>Request deletion of your data (right to be forgotten)</li>
            <li style={{ marginBottom: 8 }}>Object to processing of your data</li>
            <li style={{ marginBottom: 8 }}>Data portability in a machine-readable format</li>
          </ul>
        </Section>
 
        <Section title="7. Cookies">
          <p>We use essential cookies for authentication and session management. You may disable non-essential cookies through your browser settings without affecting core functionality.</p>
        </Section>
 
        <Section title="8. Contact Us">
          <p>For privacy-related enquiries, contact our Data Protection Officer at: <strong>privacy@hphcms.in</strong></p>
          <p style={{ marginTop: 8 }}>HP HCMS · Legal Management Platform · India</p>
        </Section>
      </Box>
    </Box>
  );
}
 