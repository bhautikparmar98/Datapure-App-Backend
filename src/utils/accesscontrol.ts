import { AccessControl } from 'accesscontrol';
import { grantList } from '../config/grantsList';

const ac = new AccessControl(grantList);

export default ac;
