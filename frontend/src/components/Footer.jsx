import React from 'react';
import { Box, Container, Typography, IconButton, Stack, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, Email } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)',
        color: 'white',
        mt: 6,
        py: 4,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="center">
          {/* Brand */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Nendopop
          </Typography>

          {/* Tagline */}
          <Typography
            variant="body1"
            sx={{
              maxWidth: 500,
              opacity: 0.95,
              fontWeight: 500,
            }}
          >
            Bringing the cutest Nendoroids to your collection.
          </Typography>

          {/* Social Media Icons */}
          <Stack direction="row" spacing={1}>
            <IconButton
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-3px)',
                  transition: 'all 0.3s ease',
                },
              }}
              aria-label="Facebook"
            >
              <Facebook />
            </IconButton>
            <IconButton
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-3px)',
                  transition: 'all 0.3s ease',
                },
              }}
              aria-label="Twitter"
            >
              <Twitter />
            </IconButton>
            <IconButton
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-3px)',
                  transition: 'all 0.3s ease',
                },
              }}
              aria-label="Instagram"
            >
              <Instagram />
            </IconButton>
            <IconButton
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-3px)',
                  transition: 'all 0.3s ease',
                },
              }}
              aria-label="Email"
            >
              <Email />
            </IconButton>
          </Stack>

          {/* Divider */}
          <Divider
            sx={{
              width: '80%',
              maxWidth: 400,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />

          {/* Copyright */}
          <Typography
            variant="body2"
            sx={{
              opacity: 0.85,
              fontSize: '0.875rem',
            }}
          >
            © {new Date().getFullYear()} Nendopop. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}