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
    role: roles.ADMIN,
    resource: 'project',
    action: 'read:any',
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
    action: 'create:any',
    attributes: '*',
  },
];
