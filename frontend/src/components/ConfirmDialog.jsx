import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

const ConfirmDialog = ({ open, title, description, confirmLabel = 'Confirm', onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary">{description}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" color="error" onClick={onConfirm}>{confirmLabel}</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
