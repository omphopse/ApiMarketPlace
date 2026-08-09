import { Box, IconButton, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';

const CodeBlock = ({ language = 'text', code = '', title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Box sx={{ borderRadius: 1.25, border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: 'rgba(12,18,28,0.95)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>{title || language}</Typography>
        <IconButton size="small" onClick={handleCopy} aria-label="Copy code">
          {copied ? <CheckIcon fontSize="small" sx={{ color: 'success.main' }} /> : <ContentCopyIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />}
        </IconButton>
      </Stack>
      <Box component="pre" sx={{ m: 0, p: 2, overflowX: 'auto', color: 'rgba(255,255,255,0.95)', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6, bgcolor: 'transparent' }}>
        {code}
      </Box>
    </Box>
  );
};

export default CodeBlock;
