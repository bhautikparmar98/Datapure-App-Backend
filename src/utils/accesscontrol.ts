import { AccessControl } from 'accesscontrol';
import { grantList } from '../config/grantsList';

// create singleton object for access control
const ac = new AccessControl(grantList);

// export singleton object from access control
export default ac;
