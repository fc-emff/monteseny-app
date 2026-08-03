import { itemHandler } from '../_lib/crud.js';

export default itemHandler('tasks', { requireAdminForRead: true });
