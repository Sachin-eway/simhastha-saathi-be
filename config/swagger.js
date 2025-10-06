module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Simhastha Saathi API',
    version: '1.0.0',
    description: 'API documentation for Simhastha Saathi backend'
  },
  servers: [
    { url: window.location.origin, description: 'Local' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      SendSOSRequest: {
        type: 'object',
        required: ['userId', 'groupId'],
        properties: {
          userId: { type: 'integer', example: 123 },
          groupId: { type: 'string', example: 'GR0001' }
        }
      },
      SendSOSResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'SOS alert sent' },
          data: {
            type: 'object',
            properties: {
              alertId: { type: 'integer', example: 45 },
              userId: { type: 'integer', example: 123 },
              groupId: { type: 'string', example: 'GR0001' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      GetAlertsRequest: {
        type: 'object',
        required: ['groupId'],
        properties: {
          groupId: { type: 'string', example: 'GR0001' }
        }
      },
      GetAlertsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Alerts fetched' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 45 },
                user_id: { type: 'integer', example: 123 },
                group_id: { type: 'string', example: 'GR0001' },
                created_at: { type: 'string', format: 'date-time' },
                full_name: { type: 'string', example: 'John Doe' },
                mobile_number: { type: 'string', example: '9876543210' }
              }
            }
          }
        }
      }
    ,
      // Auth schemas
      RegisterUserRequest: {
        type: 'object',
        required: ['fullName', 'mobileNumber', 'age'],
        properties: {
          fullName: { type: 'string', example: 'John Doe' },
          mobileNumber: { type: 'string', example: '9876543210' },
          age: { type: 'integer', example: 30 }
        }
      },
      RegisterUserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User registered successfully. OTP sent to mobile number.' },
          data: {
            type: 'object',
            properties: { userId: { type: 'integer', example: 101 } }
          }
        }
      },
      CreateGroupRequest: {
        type: 'object',
        properties: { adminId: { type: 'integer', example: 101 } },
      },
      CreateGroupResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Group created successfully' },
          data: { type: 'object', properties: { groupId: { type: 'string', example: 'GR0001' } } }
        }
      },
      JoinExistingGroupRequest: {
        type: 'object',
        required: ['groupId'],
        properties: { groupId: { type: 'string', example: 'GR0001' } }
      },
      JoinExistingGroupResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Joined group' } }
      },
      LoginUserRequest: {
        type: 'object',
        required: ['mobileNumber'],
        properties: { mobileNumber: { type: 'string', example: '9876543210' } }
      },
      LoginUserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              userId: { type: 'integer', example: 101 },
              isAdmin: { type: 'boolean', example: true },
              groupId: { type: 'string', example: 'GR0001' }
            }
          }
        }
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['userId', 'otp'],
        properties: { userId: { type: 'integer', example: 101 }, otp: { type: 'integer', example: 123456 } }
      },
      VerifyOtpResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'OTP verified successfully' } }
      },
      GetGroupUsersRequest: {
        type: 'object',
        required: ['groupId'],
        properties: { groupId: { type: 'string', example: 'GR0001' } }
      },
      GetGroupUsersResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Group users fetched successfully' },
          data: {
            type: 'array',
            items: { type: 'object', properties: { id: { type: 'integer', example: 201 }, full_name: { type: 'string', example: 'Member Name' }, mobile_number: { type: 'string', example: '9999999999' } } }
          }
        }
      },
      // Location schemas
      UpdateLocationRequest: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: { latitude: { type: 'number', format: 'float', example: 22.7196 }, longitude: { type: 'number', format: 'float', example: 75.8577 } }
      },
      UpdateLocationResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Location updated successfully' } }
      },
      GetGroupLocationsRequest: {
        type: 'object',
        required: ['groupId'],
        properties: { groupId: { type: 'string', example: 'GR0001' } }
      },
      GetGroupLocationsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Group locations fetched' },
          data: { type: 'array', items: { type: 'object', properties: { id: { type: 'integer', example: 201 }, full_name: { type: 'string', example: 'Member Name' }, latitude: { type: 'number', example: 22.7196 }, longitude: { type: 'number', example: 75.8577 }, created_at: { type: 'string', format: 'date-time' } } } }
        }
      },
      // QR schemas
      GenerateQRResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'QR code generated successfully' }, data: { type: 'object', properties: { qrId: { type: 'integer', example: 5001 }, createdAt: { type: 'string', format: 'date-time' } } } }
      },
      BulkGenerateRequest: {
        type: 'object',
        properties: { count: { type: 'integer', example: 100 } }
      },
      QRBindRequest: {
        type: 'object',
        required: ['qrId', 'userId'],
        properties: { qrId: { type: 'integer', example: 5001 }, userId: { type: 'integer', example: 101 } }
      },
      QRUserResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'QR bound successfully' } }
      },
      QRScanResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'QR scanned successfully' }, data: { type: 'object', properties: { userId: { type: 'integer', example: 101 }, fullName: { type: 'string', example: 'John Doe' }, mobileNumber: { type: 'string', example: '9876543210' } } } }
      },
      GetQRsResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { type: 'object', properties: { id: { type: 'integer', example: 5001 }, created_at: { type: 'string', format: 'date-time' } } } } }
      },
      SearchQRsQuery: {
        type: 'object',
        properties: { q: { type: 'string', example: 'John' } }
      },
      UnbindQRResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'QR unbound successfully' } }
      },
      QRStatsResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, data: { type: 'object', properties: { total: { type: 'integer', example: 1000 } } } }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/sosAlert/send-alert': {
      post: {
        tags: ['SOS'],
        summary: 'Send SOS alert',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendSOSRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Alert sent',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SendSOSResponse' }
              }
            }
          },
          '400': { description: 'Bad request' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/sosAlert/get-alerts': {
      post: {
        tags: ['SOS'],
        summary: 'Get SOS alerts for a group',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GetAlertsRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Alerts list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GetAlertsResponse' }
              }
            }
          },
          '400': { description: 'Bad request' },
          '401': { description: 'Unauthorized' }
        }
      }
    }
  ,
    // Auth routes
    '/api/auth/register-user': {
      post: {
        tags: ['Auth'],
        summary: 'Register admin user',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterUserRequest' } } } },
        responses: { '200': { description: 'Registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterUserResponse' } } } } }
      }
    },
    '/api/auth/create-group': {
      post: {
        tags: ['Auth'],
        summary: 'Create a new group',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateGroupRequest' } } } },
        responses: { '200': { description: 'Group created', content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateGroupResponse' } } } } }
      }
    },
    '/api/auth/join-existing-group': {
      post: {
        tags: ['Auth'],
        summary: 'Join existing group',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JoinExistingGroupRequest' } } } },
        responses: { '200': { description: 'Joined', content: { 'application/json': { schema: { $ref: '#/components/schemas/JoinExistingGroupResponse' } } } } }
      }
    },
    '/api/auth/login-user': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginUserRequest' } } } },
        responses: { '200': { description: 'Logged in', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginUserResponse' } } } } }
      }
    },
    '/api/auth/verify-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } } } },
        responses: { '200': { description: 'Verified', content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpResponse' } } } } }
      }
    },
    '/api/auth/get-group-users': {
      post: {
        tags: ['Auth'],
        summary: 'Get users of a group',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/GetGroupUsersRequest' } } } },
        responses: { '200': { description: 'Users', content: { 'application/json': { schema: { $ref: '#/components/schemas/GetGroupUsersResponse' } } } } }
      }
    },
    // Location routes
    '/api/location/update': {
      post: {
        tags: ['Location'],
        summary: 'Update user location',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateLocationRequest' } } } },
        responses: { '200': { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateLocationResponse' } } } } }
      }
    },
    '/api/location/group': {
      post: {
        tags: ['Location'],
        summary: 'Get group locations',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/GetGroupLocationsRequest' } } } },
        responses: { '200': { description: 'Locations', content: { 'application/json': { schema: { $ref: '#/components/schemas/GetGroupLocationsResponse' } } } } }
      }
    },
    // QR routes
    '/api/qr/generate': {
      post: {
        tags: ['QR'],
        summary: 'Generate QR (admin)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Generated', content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateQRResponse' } } } } }
      }
    },
    '/api/qr/bulk-generate': {
      post: {
        tags: ['QR'],
        summary: 'Bulk generate QRs (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkGenerateRequest' } } } },
        responses: { '200': { description: 'Bulk generated', content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateQRResponse' } } } } }
      }
    },
    '/api/qr/bind': {
      post: {
        tags: ['QR'],
        summary: 'Bind QR to user',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/QRBindRequest' } } } },
        responses: { '200': { description: 'Bound', content: { 'application/json': { schema: { $ref: '#/components/schemas/QRUserResponse' } } } } }
      }
    },
    '/api/qr/scan/{qrId}': {
      get: {
        tags: ['QR'],
        summary: 'Scan QR and get user',
        parameters: [ { name: 'qrId', in: 'path', required: true, schema: { type: 'integer' }, example: 5001 } ],
        responses: { '200': { description: 'Scan result', content: { 'application/json': { schema: { $ref: '#/components/schemas/QRScanResponse' } } } } }
      }
    },
    '/api/qr': {
      get: {
        tags: ['QR'],
        summary: 'Get QRs (admin)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'QRs', content: { 'application/json': { schema: { $ref: '#/components/schemas/GetQRsResponse' } } } } }
      }
    },
    '/api/qr/search': {
      get: {
        tags: ['QR'],
        summary: 'Search QRs (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'q', in: 'query', required: true, schema: { type: 'string' }, example: 'John' } ],
        responses: { '200': { description: 'Search results', content: { 'application/json': { schema: { $ref: '#/components/schemas/GetQRsResponse' } } } } }
      }
    },
    '/api/qr/my-qrs': {
      get: {
        tags: ['QR'],
        summary: 'Get my QRs',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'My QRs', content: { 'application/json': { schema: { $ref: '#/components/schemas/GetQRsResponse' } } } } }
      }
    },
    '/api/qr/unbind/{qrId}': {
      delete: {
        tags: ['QR'],
        summary: 'Unbind QR (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'qrId', in: 'path', required: true, schema: { type: 'integer' }, example: 5001 } ],
        responses: { '200': { description: 'Unbound', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnbindQRResponse' } } } } }
      }
    },
    '/api/qr/stats': {
      get: {
        tags: ['QR'],
        summary: 'QR statistics (admin)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Stats', content: { 'application/json': { schema: { $ref: '#/components/schemas/QRStatsResponse' } } } } }
      }
    }
  }
};


