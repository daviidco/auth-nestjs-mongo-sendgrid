import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Auth Microservice API')
  .setDescription(
    'Microservicio de autenticación con NestJS, MongoDB, JWT, verificación de correo electrónico y recuperación de contraseña usando SendGrid',
  )
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addTag('Authentication', 'Endpoints para autenticación de usuarios (v1)')
  .addTag('Users', 'Endpoints para gestión de usuarios (v1)')
  .addTag(
    'Email Verification',
    'Endpoints para verificación de correo electrónico y recuperación de contraseña con SendGrid (v1)',
  )
  .build();
