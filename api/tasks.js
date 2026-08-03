import { resourceHandler } from './_lib/crud.js';

export default resourceHandler('tasks', { requireAdminForRead: true });
