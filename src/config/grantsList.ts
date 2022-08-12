import { AccessControl } from 'accesscontrol';
import { Actions, Resources } from '../constants';
import * as roles from '../constants/roles';

export const grantList = [
  {
    role: roles.SUPER_ADMIN,
    resource: Resources.PROJECT,
    action: 'read:any',
    attributes: '*',
  },

  {
    role: roles.SUPER_ADMIN,
    resource: Resources.PROJECT,
    action: 'update:any',
    attributes: '*',
  },
  {
    role: roles.SUPER_ADMIN,
    resource: Resources.PROJECT,
    action: 'delete:any',
    attributes: '*',
  },
  {
    role: roles.SUPER_ADMIN,
    resource: Resources.PROJECT,
    action: 'create:any',
    attributes: '*',
  },
  {
    role: roles.ADMIN,
    resource: Resources.PROJECT,
    action: Actions.READ_OWN,
    attributes: '*',
  },
  {
    role: roles.ADMIN,
    resource: Resources.PROJECT,
    action: Actions.UPDATE_OWN,
    attributes: '*',
  },
  {
    role: roles.QA,
    resource: Resources.PROJECT,
    action: Actions.READ_OWN,
    attributes: '*',
  },

  {
    role: roles.ANNOTATOR,
    resource: Resources.PROJECT,
    action: Actions.READ_OWN,
    attributes: '*',
  },

  {
    role: roles.CLIENT,
    resource: Resources.PROJECT,
    action: Actions.READ_OWN,
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: Resources.PROJECT,
    action: 'update:own',
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: Resources.PROJECT,
    action: 'delete:own',
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: Resources.PROJECT,
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
    role: roles.ADMIN,
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
    action: Actions.READ_OWN,
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

  // QA & Annotators
  {
    role: roles.SUPER_ADMIN,
    resource: Resources.QA,
    action: Actions.READ_ANY,
    attributes: '*',
  },
  {
    role: roles.SUPER_ADMIN,
    resource: Resources.ANNOTATOR,
    action: Actions.READ_ANY,
    attributes: '*',
  },
  {
    role: roles.ADMIN,
    resource: Resources.QA,
    action: Actions.READ_ANY,
    attributes: '*',
  },
  {
    role: roles.ADMIN,
    resource: Resources.ANNOTATOR,
    action: Actions.READ_ANY,
    attributes: '*',
  },

  // Annotation
  {
    role: roles.ANNOTATOR,
    resource: Resources.ANNOTATION,
    action: Actions.CREATE_OWN,
    attributes: '*',
  },
  {
    role: roles.QA,
    resource: Resources.ANNOTATION,
    action: Actions.READ_OWN,
    attributes: '*',
  },
  {
    role: roles.CLIENT,
    resource: Resources.ANNOTATION,
    action: Actions.CREATE_OWN,
    attributes: '*',
  },
];
