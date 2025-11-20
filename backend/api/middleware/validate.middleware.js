import { z } from 'zod';


export const validate = (schema) => (req, res, next) => {
  try {
    // Parse and validate the request body
    schema.parse(req.body);
    // If successful, move to the next middleware or controller
    next();
  } catch (error) {
    // If validation fails, send a 400 error with details
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error during validation' });
  }
};
