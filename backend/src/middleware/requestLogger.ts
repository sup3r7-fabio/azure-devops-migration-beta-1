import morgan from 'morgan';

// Minimal request logger (custom tokens could be added later)
export const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms');
