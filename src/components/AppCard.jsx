import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';

const AppCard = ({ title, subtitle, actions, children, ...props }) => (
  <Card {...props}>
    {(title || subtitle || actions) && (
      <CardHeader
        title={title}
        subheader={subtitle}
        action={actions}
        sx={{ pb: 1 }}
      />
    )}
    <CardContent>{children}</CardContent>
  </Card>
);

export default AppCard;
