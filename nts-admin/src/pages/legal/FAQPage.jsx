import { useState } from 'react';

import {
  Box,
  Typography,
  Collapse,
} from '@mui/material';

import {
  ExpandMoreRounded,
  HelpRounded,
} from '@mui/icons-material';


// ─────────────────────────────────────────────
// FAQ DATA
// ─────────────────────────────────────────────

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I set up my firm on HP HCMS?',
        a: 'After signing up, complete your firm profile in Settings → Firm Profile. Add your logo, GSTIN, bar registration number, and contact details.',
      },

      {
        q: 'Can I import existing client data?',
        a: 'Yes. You can import clients and cases via CSV from the Clients page.',
      },

      {
        q: 'How many users can I add to my firm?',
        a: 'The number of team members depends on your subscription plan.',
      },
    ],
  },

  {
    category: 'Cases & Hearings',
    items: [
      {
        q: 'How do I track upcoming hearings?',
        a: 'All upcoming hearings appear on your dashboard and hearing calendar.',
      },

      {
        q: 'Can I get automatic reminders for hearings?',
        a: 'Yes. Automatic reminders are sent via email and WhatsApp.',
      },

      {
        q: 'Can I attach documents to cases?',
        a: 'Yes. Documents can be linked to specific cases.',
      },
    ],
  },

  {
    category: 'Billing & Payments',
    items: [
      {
        q: 'How does billing work?',
        a: 'Subscriptions are billed monthly or annually.',
      },

      {
        q: 'Can I get GST invoices?',
        a: 'Yes. GST invoices are available for every payment.',
      },

      {
        q: 'What happens if payment fails?',
        a: 'The system retries failed payments automatically.',
      },
    ],
  },

  {
    category: 'Security & Privacy',
    items: [
      {
        q: 'Is my client data secure?',
        a: 'All data is encrypted and securely stored.',
      },

      {
        q: 'Who can access my data?',
        a: 'Only authorised team members can access firm data.',
      },
    ],
  },
];


// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function FAQPage() {

  const [open, setOpen] = useState({});

  const toggle = (key) => {
    setOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };


  return (

    <Box
      sx={{
        maxWidth: 850,
        mx: 'auto',
        p: { xs: 3, md: 5 },
        bgcolor: '#F5F4F0',
        minHeight: '100vh',
      }}
    >

      {/* Header */}

      <Box
        sx={{
          textAlign: 'center',
          mb: 5,
        }}
      >

        <Box
          sx={{
            width: 60,
            height: 60,
            bgcolor: '#0D1B2A',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <HelpRounded
            sx={{
              color: '#C9A84C',
              fontSize: 30,
            }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: 30,
            fontWeight: 800,
            color: '#0D1B2A',
            mb: 0.5,
          }}
        >
          Frequently Asked Questions
        </Typography>

        <Typography
          sx={{
            fontSize: 14,
            color: '#9CA3AF',
          }}
        >
          Everything you need to know
          about HP HCMS
        </Typography>

      </Box>


      {/* FAQ Sections */}

      {faqs.map((section) => (

        <Box
          key={section.category}
          sx={{ mb: 4 }}
        >

          {/* Category */}

          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: '#C9A84C',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              mb: 2,
            }}
          >
            {section.category}
          </Typography>


          {/* Questions */}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >

            {section.items.map((item, idx) => {

              const key =
                `${section.category}-${idx}`;

              const isOpen =
                !!open[key];

              return (

                <Box
                  key={key}
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: '16px',

                    border:
                      isOpen
                        ? '1px solid #C9A84C60'
                        : '1px solid #F0EDE5',

                    overflow: 'hidden',

                    transition:
                      'all 0.2s ease',
                  }}
                >

                  {/* Question */}

                  <Box
                    onClick={() => toggle(key)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'space-between',

                      px: 3,
                      py: 2.2,

                      cursor: 'pointer',
                      gap: 2,

                      '&:hover': {
                        bgcolor: '#FAFAF8',
                      },
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0D1B2A',
                      }}
                    >
                      {item.q}
                    </Typography>

                    <ExpandMoreRounded
                      sx={{
                        color: '#9CA3AF',
                        flexShrink: 0,
                        fontSize: 22,

                        transform: isOpen
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',

                        transition:
                          'transform 0.25s',
                      }}
                    />

                  </Box>


                  {/* Answer */}

                  <Collapse in={isOpen}>

                    <Box
                      sx={{
                        px: 3,
                        pb: 2.5,
                        borderTop:
                          '1px solid #F5F4F0',
                      }}
                    >

                      <Typography
                        sx={{
                          fontSize: 13,
                          color: '#4B5563',
                          lineHeight: 1.8,
                          pt: 1.5,
                        }}
                      >
                        {item.a}
                      </Typography>

                    </Box>

                  </Collapse>

                </Box>
              );
            })}

          </Box>

        </Box>
      ))}


      {/* Footer CTA */}

      <Box
        sx={{
          bgcolor: '#0D1B2A',
          borderRadius: '22px',
          p: 4,
          textAlign: 'center',
          mt: 5,
        }}
      >

        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            color: '#fff',
            mb: 0.5,
          }}
        >
          Still have questions?
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
            mb: 3,
          }}
        >
          Our support team is available
          Mon–Sat, 9am–7pm IST
        </Typography>


        {/* Buttons */}

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >

          {/* Email */}

          <Box
            component="a"
            href="mailto:support@hphcms.in"
            sx={{
              display: 'inline-block',

              px: 3,
              py: 1.3,

              bgcolor: '#C9A84C',
              color: '#0D1B2A',

              borderRadius: '10px',

              fontWeight: 700,
              fontSize: 13,

              textDecoration: 'none',

              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            Email Support
          </Box>


          {/* WhatsApp */}

          <Box
            component="a"
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-block',

              px: 3,
              py: 1.3,

              bgcolor: '#25D366',
              color: '#fff',

              borderRadius: '10px',

              fontWeight: 700,
              fontSize: 13,

              textDecoration: 'none',

              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            WhatsApp Chat
          </Box>

        </Box>

      </Box>

    </Box>
  );
}