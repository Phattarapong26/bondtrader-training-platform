import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

// Define the Swagger schema components manually
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API ระบบบริหารจัดการการเรียนรู้",
      version: "1.0.0",
      description: "API สำหรับระบบการจัดการผู้ใช้และคอร์สเรียน",
      contact: {
        name: "ทีมพัฒนา",
        email: "support@example.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server"
      }
    ],
    security: [
      {
        bearerAuth: []
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            company: { type: "string" },
            citizen_id: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            profilePicture: { type: "string" },
            bond_status: {
              type: "object",
              properties: {
                start_date: { type: "string", format: "date" },
                end_date: { type: "string", format: "date" },
                status: { type: "string" },
              },
            },
            courses_enrolled: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  course_id: { type: "string" },
                  status: { type: "string" },
                  progress: { type: "number" },
                  start_date: { type: "string", format: "date" },
                  completion_date: {
                    type: "string",
                    format: "date",
                    nullable: true,
                  },
                },
              },
            },
            password: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            role: { type: "string" },
            resetPasswordToken: { type: "string", nullable: true },
            resetPasswordExpires: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            otp: { type: "string", nullable: true },
            otpExpiration: { type: "integer", nullable: true },
          },
        },
        Course: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            details: { type: "string" },
            duration_hours: { type: "number" },
            max_seats: { type: "number" },
            start_date: { type: "string", format: "date" },
            thumbnail: { type: "string" },
            video: { type: "string" },
            qr_code: { type: "string" },
            trainingLocation: { type: "string" },
          },
        },
        Admin: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            idCard: { type: "string" },
            employeeId: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            roles: {
              type: "array",
              items: { type: "string" },
            },
            password: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            status: { type: "integer" },
          }
        },
        LoginResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            user: { 
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                role: { type: "string" },
              }
            },
            redirectInfo: { type: "object" },
            token: { type: "string" },
            refreshToken: { type: "string" }
          }
        },
        OTPResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            success: { type: "boolean" },
            otpExpiration: { type: "integer" }
          }
        },
        PasswordResetResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            success: { type: "boolean" }
          }
        },
        CourseResponse: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            duration_hours: { type: "number" },
            participants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  status: { type: "string" }
                }
              }
            }
          }
        },
        ProfileUpdateResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            success: { type: "boolean" },
            user: { 
              $ref: '#/components/schemas/User'
            }
          }
        }
      },
    },
  },
  apis: ["src/routes/*.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true
    }
  }));
  console.log("Swagger docs available at http://localhost:3000/api-docs");
}