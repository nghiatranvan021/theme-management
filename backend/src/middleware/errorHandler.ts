import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Type guard để kiểm tra error
  const err = error as CustomError;
  const statusCode = err.statusCode || 500;
  
  // Log error
  console.error({
    message: err instanceof Error ? err.message : 'Unknown error occurred',
    stack: err instanceof Error ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: err instanceof Error ? err.message : 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err instanceof Error ? err.stack : undefined 
      }),
      ...(err instanceof Error && 'errors' in err && { errors: err.errors })
    }
  });
};

// Custom error class
export class AppError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }
} 