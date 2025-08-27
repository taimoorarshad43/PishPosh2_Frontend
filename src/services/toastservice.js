import { toast } from 'react-toastify';

const toastService = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast.info(msg),
  warn: (msg) => toast.warn(msg),
};

export default toastService;