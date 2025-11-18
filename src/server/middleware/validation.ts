import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation middleware factory
export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { [key: string]: string } = {};

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        error.details.forEach((detail) => {
          const key = detail.path.join('.');
          errors[key] = detail.message;
        });
      }
    }

    // Validate request params
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        error.details.forEach((detail) => {
          const key = `params.${detail.path.join('.')}`;
          errors[key] = detail.message;
        });
      }
    }

    // Validate request query
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        error.details.forEach((detail) => {
          const key = `query.${detail.path.join('.')}`;
          errors[key] = detail.message;
        });
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
      return;
    }

    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  // ObjectId validation
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required'
  }),

  // Email validation
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),

  // Password validation
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  }),

  // Name validation
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),

  // Phone validation
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),

  // Date validation
  date: Joi.date().optional(),

  // Boolean validation
  boolean: Joi.boolean().optional(),

  // Pagination
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  },

  // Sorting
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('desc')
};

// Specific validation schemas
export const validationSchemas = {
  // User registration
  register: {
    body: Joi.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      firstName: commonSchemas.name,
      lastName: commonSchemas.name,
      dateOfBirth: commonSchemas.date.required().messages({
        'any.required': 'Date of birth is required'
      }),
      phone: commonSchemas.phone
    })
  },

  // User login
  login: {
    body: Joi.object({
      email: commonSchemas.email,
      password: Joi.string().required().messages({
        'any.required': 'Password is required'
      })
    })
  },

  // Google OAuth
  googleAuth: {
    body: Joi.object({
      idToken: Joi.string().required().messages({
        'any.required': 'Google ID token is required'
      })
    })
  },

  // Firebase Auth
  firebaseAuth: {
    body: Joi.object({
      firebaseToken: Joi.string().required().messages({
        'any.required': 'Firebase token is required'
      })
    })
  },

  // Email verification
  verifyEmail: {
    body: Joi.object({
      token: Joi.string().required().messages({
        'any.required': 'Verification token is required'
      })
    })
  },

  // Password reset request
  forgotPassword: {
    body: Joi.object({
      email: commonSchemas.email
    })
  },

  // Password reset
  resetPassword: {
    body: Joi.object({
      token: Joi.string().required().messages({
        'any.required': 'Reset token is required'
      }),
      newPassword: commonSchemas.password
    })
  },

  // User profile update
  updateProfile: {
    body: Joi.object({
      firstName: commonSchemas.name.optional(),
      lastName: commonSchemas.name.optional(),
      phone: commonSchemas.phone,
      dateOfBirth: commonSchemas.date
    }).min(1).messages({
      'object.min': 'At least one field must be provided'
    })
  },

  // User preferences
  updatePreferences: {
    body: Joi.object({
      timezone: Joi.string().optional(),
      units: Joi.object({
        weight: Joi.string().valid('kg', 'lbs').optional(),
        height: Joi.string().valid('cm', 'ft').optional(),
        temperature: Joi.string().valid('celsius', 'fahrenheit').optional()
      }).optional(),
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
        medicationReminders: Joi.boolean().optional(),
        healthAlerts: Joi.boolean().optional()
      }).optional(),
      privacy: Joi.object({
        shareHealthData: Joi.boolean().optional(),
        allowAnalytics: Joi.boolean().optional()
      }).optional()
    })
  },

  // Medication creation
  createMedication: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(100).required().messages({
        'any.required': 'Medication name is required'
      }),
      dosage: Joi.string().trim().min(1).max(50).required().messages({
        'any.required': 'Dosage is required'
      }),
      frequency: Joi.string().valid('once', 'twice', 'three_times', 'four_times', 'as_needed').required().messages({
        'any.required': 'Frequency is required'
      }),
      startDate: Joi.date().required().messages({
        'any.required': 'Start date is required'
      }),
      endDate: Joi.date().greater(Joi.ref('startDate')).optional().messages({
        'date.greater': 'End date must be after start date'
      }),
      notes: Joi.string().max(500).optional(),
      rxNormId: Joi.string().optional()
    })
  },

  // Medication update
  updateMedication: {
    params: Joi.object({
      id: commonSchemas.objectId
    }),
    body: Joi.object({
      name: Joi.string().trim().min(2).max(100).optional(),
      dosage: Joi.string().trim().min(1).max(50).optional(),
      frequency: Joi.string().valid('once', 'twice', 'three_times', 'four_times', 'as_needed').optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      notes: Joi.string().max(500).optional(),
      active: Joi.boolean().optional()
    }).min(1).messages({
      'object.min': 'At least one field must be provided'
    })
  },

  // Health metric creation
  createHealthMetric: {
    body: Joi.object({
      type: Joi.string().valid('bloodPressure', 'weight', 'heartRate', 'bloodSugar', 'temperature').required().messages({
        'any.required': 'Metric type is required'
      }),
      value: Joi.number().required().messages({
        'any.required': 'Value is required'
      }),
      unit: Joi.string().required().messages({
        'any.required': 'Unit is required'
      }),
      timestamp: Joi.date().optional(),
      notes: Joi.string().max(500).optional(),
      source: Joi.string().valid('manual', 'device', 'automatic').default('manual')
    })
  },

  // Health metric query
  getHealthMetrics: {
    query: Joi.object({
      type: Joi.string().valid('bloodPressure', 'weight', 'heartRate', 'bloodSugar', 'temperature').optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().greater(Joi.ref('startDate')).optional().messages({
        'date.greater': 'End date must be after start date'
      }),
      ...commonSchemas.pagination
    })
  },

  // Diet plan creation
  createDietPlan: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(100).required().messages({
        'any.required': 'Plan name is required'
      }),
      targetCalories: Joi.number().integer().min(800).max(5000).required().messages({
        'any.required': 'Target calories is required'
      }),
      dietaryRestrictions: Joi.array().items(Joi.string()).optional(),
      preferences: Joi.object({
        vegetarian: Joi.boolean().optional(),
        vegan: Joi.boolean().optional(),
        glutenFree: Joi.boolean().optional(),
        dairyFree: Joi.boolean().optional(),
        lowCarb: Joi.boolean().optional(),
        lowSodium: Joi.boolean().optional()
      }).optional()
    })
  },

  // Diet calculator
  calculateDiet: {
    query: Joi.object({
      weight: Joi.number().min(20).max(500).required().messages({
        'any.required': 'Weight is required'
      }),
      height: Joi.number().min(50).max(300).required().messages({
        'any.required': 'Height is required'
      }),
      age: Joi.number().integer().min(1).max(120).required().messages({
        'any.required': 'Age is required'
      }),
      gender: Joi.string().valid('male', 'female', 'other').required().messages({
        'any.required': 'Gender is required'
      }),
      activityLevel: Joi.string().valid('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active').required().messages({
        'any.required': 'Activity level is required'
      })
    })
  },

  // Meal logging
  logMeal: {
    body: Joi.object({
      meal: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required().messages({
        'any.required': 'Meal type is required'
      }),
      foods: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
        unit: Joi.string().required(),
        calories: Joi.number().min(0).optional()
      })).min(1).required().messages({
        'any.required': 'At least one food item is required'
      }),
      calories: Joi.number().min(0).optional(),
      timestamp: Joi.date().optional()
    })
  },

  // File upload
  uploadFile: {
    body: Joi.object({
      type: Joi.string().valid('profile_picture', 'medical_document', 'prescription', 'lab_result').required().messages({
        'any.required': 'File type is required'
      })
    })
  },

  // Common pagination for list endpoints
  pagination: {
    query: Joi.object(commonSchemas.pagination)
  },

  // ID parameter validation
  idParam: {
    params: Joi.object({
      id: commonSchemas.objectId
    })
  }
};

export default validateRequest;