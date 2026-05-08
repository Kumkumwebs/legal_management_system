import {
  Box,
  Typography,
  Divider,
} from '@mui/material';

import {
  GavelRounded,
} from '@mui/icons-material';


// ─────────────────────────────────────────────
// Reusable Section Component
// ─────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 4 }}>

      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 700,
          color: '#0D1B2A',
          mb: 1.5,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          fontSize: 14,
          color: '#475569',
          lineHeight: 1.8,

          '& p': {
            margin: 0,
          },

          '& ul': {
            margin: 0,
          },

          '& li': {
            marginBottom: '8px',
          },
        }}
      >
        {children}
      </Box>

    </Box>
  );
}


// ─────────────────────────────────────────────
// Terms Page
// ─────────────────────────────────────────────

export default function TermsPage() {

  return (

    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        p: { xs: 3, md: 5 },
        bgcolor: '#F5F4F0',
        minHeight: '100vh',
      }}
    >

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: '20px',
          p: { xs: 3, md: 5 },
          border: '1px solid #F0EDE5',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >

        {/* Header */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 1.5,
          }}
        >

          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#0D1B2A',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GavelRounded
              sx={{
                color: '#C9A84C',
                fontSize: 20,
              }}
            />
          </Box>

          <Box>

            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: '#C9A84C',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Legal
            </Typography>

            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 800,
                color: '#0D1B2A',
              }}
            >
              Terms & Conditions
            </Typography>

          </Box>
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            color: '#9CA3AF',
            mb: 4,
          }}
        >
          Last updated: May 2026
        </Typography>

        <Divider sx={{ mb: 4 }} />


        {/* Sections */}

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using HP HCMS
            ("Service"), you agree to be
            bound by these Terms and
            Conditions. If you do not agree
            to all terms, do not use the
            Service.
          </p>
        </Section>


        <Section title="2. Description of Service">
          <p>
            HP HCMS is a cloud-based legal
            case management platform
            designed for law firms in India.
            The Service includes client
            management, case tracking,
            document storage, hearing
            management, payment records,
            and team collaboration tools.
          </p>
        </Section>


        <Section title="3. Subscription Plans & Billing">
          <ul style={{ paddingLeft: 20 }}>
            <li>
              Subscriptions are billed
              monthly or annually in advance
            </li>

            <li>
              All prices are in Indian
              Rupees (INR) and inclusive
              of GST
            </li>

            <li>
              Payments are processed
              securely
            </li>

            <li>
              No refunds are provided
              for partial subscription
              periods
            </li>

            <li>
              Plan upgrades take effect
              immediately
            </li>
          </ul>
        </Section>


        <Section title="4. Client Data & Confidentiality">
          <p>
            You retain full ownership of
            all client data entered into
            the platform. We maintain
            strict confidentiality of all
            legal matters and client
            information.
          </p>
        </Section>


        <Section title="5. Acceptable Use">
          <p>
            You agree not to use the
            Service to:
          </p>

          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              Store or transmit unlawful
              content
            </li>

            <li>
              Attempt unauthorised access
              to systems or accounts
            </li>

            <li>
              Reverse engineer or copy
              the platform
            </li>

            <li>
              Use the service for illegal
              activities
            </li>
          </ul>
        </Section>


        <Section title="6. Service Availability">
          <p>
            We target 99.5% uptime.
            Scheduled maintenance may
            occur periodically.
          </p>
        </Section>


        <Section title="7. Limitation of Liability">
          <p>
            HP HCMS shall not be liable
            for indirect, incidental,
            or consequential damages.
          </p>
        </Section>


        <Section title="8. Termination">
          <p>
            Either party may terminate
            the subscription with notice.
            Data export will remain
            available for a limited time.
          </p>
        </Section>


        <Section title="9. Governing Law">
          <p>
            These Terms are governed by
            the laws of India.
          </p>
        </Section>


        <Section title="10. Contact">
          <p>
            For legal enquiries:
            <strong> legal@hphcms.in</strong>
          </p>
        </Section>

      </Box>
    </Box>
  );
}