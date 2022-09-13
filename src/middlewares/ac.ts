// @ts-ignore
import AccessControlMiddleware from 'accesscontrol-middleware';
import ac from '../utils/accesscontrol';

// pass access control object to the access control middleware to create a middleware
const accessControlMiddleware = new AccessControlMiddleware(ac);

export default accessControlMiddleware;
