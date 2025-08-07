#!/bin/bash

# Root folder
mkdir -p src/{config,controllers,middlewares,models,routes,services,utils,types}

# Create files in config
touch src/config/env.ts

# Create files in controllers
touch src/controllers/user.controller.ts

# Create files in middlewares
touch src/middlewares/error.middleware.ts
touch src/middlewares/notFound.middleware.ts

# Create files in models
touch src/models/user.model.ts

# Create files in routes
touch src/routes/user.routes.ts

# Create files in services
touch src/services/user.service.ts

# Create files in utils
touch src/utils/logger.ts

# Create files in types
touch src/types/user.interface.ts

# Create app and server entry files
touch src/app.ts
touch src/server.ts

# Create root files
# touch .env
# touch tsconfig.json
# touch package.json

echo "Project structure created under ./"
