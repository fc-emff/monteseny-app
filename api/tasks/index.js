import { listCreateHandler } from '../_lib/crud.js';

export default listCreateHandler('tasks', { requireAdminForRead: true });
