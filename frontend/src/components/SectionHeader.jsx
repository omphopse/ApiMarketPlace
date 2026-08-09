import { Box, Typography } from '@mui/material';

const SectionHeader = ({ title, subtitle, action }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
    <Box>
      <Typography variant="h6" fontWeight={700}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
);

export default SectionHeader;
