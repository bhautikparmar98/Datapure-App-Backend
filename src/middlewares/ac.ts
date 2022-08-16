// @ts-ignore
import AccessControlMiddleware from 'accesscontrol-middleware';
import ac from '../utils/accesscontrol';

const accessControlMiddleware = new AccessControlMiddleware(ac);

export default accessControlMiddleware;
