
'use client';

import { useEffect } from 'react';
import { storage } from '@/lib/storage';
import { User } from '@/types';

export function useInitializeData() {
  useEffect(() => {
    const users = storage.getUsers();
    if (users.length === 0) {
      const adminUser: User = {
        id: '1',
        email: 'admin@sporthelem.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin',
        isAdmin: true,
        createdAt: new Date().toISOString(),
      };

      storage.setUsers([adminUser]);
    }

  }, []);
}
