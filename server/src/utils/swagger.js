import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from "swagger-ui-express";


const swaggerDefinition = {
  openapi: '3.0.0', 
  info: {
    title: 'Echo chat API', 
    version: '1.0.0', 
    description: 'Echo chat API documentation', 
  },
  servers: [
    {
      url: 'http://localhost:8000', 
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};