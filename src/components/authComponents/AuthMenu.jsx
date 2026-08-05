import { useState } from 'react';
import { Avatar, Menu, MenuItem, Typography, Tooltip, IconButton, Button } from '@mui/material';
import useAuthStore from '../../stores/useAuthStore.ts';
import { AuthModal } from './AuthModal';

export const AuthMenu = () => {
  const { user, signOut, openAuthModal } = useAuthStore();
  const [menuAnchor, setMenuAnchor] = useState(null);

  if (!user) {
    return (
      <>
        <Button
          color="inherit"
          onClick={() => openAuthModal()}
          sx={{
            ml: 1,
            fontSize: '0.8rem',
            textTransform: 'none',
            color: 'white',
          }}
        >
          Log in
        </Button>
      </>
    );
  }

  const initial = user.email?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      <Tooltip title={user.email}>
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ ml: 1 }}>
          <Avatar sx={{ width: 30, height: 30, fontSize: '0.85rem', bgcolor: '#7a2632' }}>
            {initial}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem disabled>
          <Typography variant="body2" noWrap>{user.email}</Typography>
        </MenuItem>
        <MenuItem onClick={() => { signOut(); setMenuAnchor(null); }}>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
};