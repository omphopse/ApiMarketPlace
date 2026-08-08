import { Box, IconButton, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';

const CodeBlock = ({ language = 'text', code, title }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Copied to clipboard.');
    } catch {
      toast.error('Unable to copy.');
    }
  };

  return (
    <Box sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: '#0F172A' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.2, bgcolor: 'rgba(255,255,255,0.06)' }}>
        <Typography variant="caption" sx={{ color: 'common.white', fontFamily: 'monospace' }}>{title || language}</Typography>
        <IconButton size="small" onClick={handleCopy} aria-label="Copy code">
          <ContentCopyIcon fontSize="small" sx={{ color: 'common.white' }} />
        </IconButton>
      </Stack>
      <Box component="pre" sx={{ m: 0, p: 2, overflowX: 'auto', color: 'common.white', fontFamily: 'monospace', fontSize: 13 }}>
        {code}
      </Box>
    </Box>
  );
};

export default CodeBlock;
