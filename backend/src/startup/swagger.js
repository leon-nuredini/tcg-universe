const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const express = require('express');

module.exports = function(app){
    const swaggerOptions = {
        swaggerDefinition: {
            openapi: '3.1.1',
            info: {
                title: 'TCG Universe Marketplace API',
                version: '1.0.0',
                description: 'TCG Universe Markeplace API documentation using Swagger',
            },
            servers: [
                {
                    url: `http://localhost:5001`,
                },
            ],
       components: {
         securitySchemes: {
             bearerAuth: {
                 type: 'http',
                 scheme: 'bearer',
                 bearerFormat: 'JWT', 
             },
         },
     },
     security: [{
        bearerAuth: []
      }]
    },
        apis: ['./src/routes/*.js'], // Path to your API docs
    };
 
    const swaggerDocs = swaggerJSDoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}