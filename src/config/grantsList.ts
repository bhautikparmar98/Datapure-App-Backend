import { AccessControl } from 'accesscontrol';
import * as roles from '../constants/roles';

export const grantList = [
  {
    role: roles.SUPER_ADMIN,
    resource: 'project',
    action: 'read:any',
    attributes: '*',
  },
  {
    role: roles.SUPER_ADMIN,
    resource: 'project',
    action: 'update:any',
    attributes: '*',
  },
  {
    role: roles.SUPER_ADMIN,
    resource: 'project',
    action: 'delete:any',
    attributes: '*',
  },
  {
    role: roles.SUPER_ADMIN,
    resource: 'project',
    action: 'create:any',
    attributes: '*',
  },
  {
    role: roles.QA,
    resource: 'project',
    action: 'read:any',
    attributes: '*',
  },

  {
    role: roles.ANNATATOR,
    resource: 'project',
    action: 'read:any',
    attributes: '*',
  },

  {
    role: roles.CLIENT,
    resource: 'project',
    action: 'read:own',
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: 'project',
    action: 'update:own',
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: 'project',
    action: 'delete:own',
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: 'project',
    action: 'create:own',
    attributes: '*',
  },

  // User section
  {
    role: roles.SUPER_ADMIN,
    resource: 'user',
    action: 'read:any',
    attributes: '*',
  },
  {
    role: roles.SUPER_ADMIN,
    resource: 'user',
    action: 'create:any',
    attributes: '*',
  },

  // Image section
  {
    role: roles.SUPER_ADMIN,
    resource: 'image',
    action: 'read:any',
    attributes: '*',
  },
  {
    role: roles.SUPER_ADMIN,
    resource: 'image',
    action: 'create:any',
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: 'image',
    action: 'read:own',
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: 'image',
    action: 'create:own',
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: 'image',
    action: 'delete:own',
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: 'image',
    action: 'update:own',
    attributes: '*',
  },

  // ADMIN section
  {
    role: roles.SUPER_ADMIN,
    resource: 'admin',
    action: 'read:any',
    attributes: '*',
  },
];
