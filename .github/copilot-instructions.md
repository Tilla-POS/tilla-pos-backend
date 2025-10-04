# Tilla POS Backend - AI Agent Instructions

## Project Overview
Tilla POS is a point-of-sale system backend built with NestJS. It provides APIs for managing businesses, items, categories, modifiers, users, and authentication.

## Architecture

### Core Components
- **NestJS Modules**: Each feature is encapsulated in its own module with controller, service, entities, and DTOs
- **Authentication**: JWT-based with access tokens, using guards for protection
- **Database**: PostgreSQL with TypeORM for ORM
- **File Storage**: AWS S3 integration for file uploads (images)
- **API Documentation**: Swagger/OpenAPI for API documentation

### Key Modules
- **Auth**: Handles authentication, JWT tokens, and guards
- **Users**: Manages user accounts and profiles
- **Items**: Manages products with variants and SKUs
- **Business**: Manages business entities
- **Category**: Organizes items into categories
- **Modifier**: Handles item modifiers
- **Uploads**: Manages file uploads to AWS S3

## Development Workflow

### Environment Setup
1. Create `.env` file based on environment variables in `src/config/environment.validation.ts`
2. Required env variables include database connection, JWT config, and AWS credentials

### Running the Application
```bash
# Install dependencies
yarn install

# Development mode with hot reload
yarn run start:dev

# Production build
yarn run build
yarn run start:prod
```

### Testing
```bash
# Run unit tests
yarn run test

# Run e2e tests
yarn run test:e2e
```

## Code Patterns

### Module Structure
Each feature module follows this structure:
```
feature/
  ├── feature.controller.ts
  ├── feature.service.ts
  ├── feature.module.ts
  ├── dto/
  │   ├── create-feature.dto.ts
  │   └── update-feature.dto.ts
  └── entities/
      └── feature.entity.ts
```

### Authentication Pattern
1. Guards protect routes (`@UseGuards(AccessTokenGuard)`)
2. Active user accessed via decorator: `@ActiveUser() user: ActiveUserInterface`
3. Example in controller methods: 
   ```typescript
   @Post()
   create(
     @Body() createDto: CreateDto,
     @ActiveUser() user: ActiveUserInterface,
   ) {
     return this.service.create(createDto, user);
   }
   ```

### Entity Relationships
- Entities use TypeORM decorators for relationships
- Common pattern: `@ManyToOne()` with `@JoinColumn()` for foreign keys
- Soft deletes via `@DeleteDateColumn({ name: 'deleted_at' })`
- Example from `item.entity.ts`:
  ```typescript
  @ManyToOne(() => Category, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;
  ```

### API Documentation
- Swagger decorators are used extensively
- Example:
  ```typescript
  @ApiTags('items')
  @ApiBearerAuth('Bearer')
  @ApiOperation({
    summary: 'Create a new item',
    description: 'Creates a new item with variants and SKUs',
  })
  ```

### File Uploads
Files are uploaded to AWS S3 using the UploadsService:
```typescript
// Example usage
const result = await this.uploadsService.upload({
  Bucket: bucketName,
  Key: fileName,
  Body: fileBuffer,
  ContentType: mimeType,
});
```

## Configuration
- Environment variables loaded via NestJS ConfigModule
- Configuration registered with `registerAs` pattern in `src/config/`
- Database config in `src/config/database.config.ts`
- JWT config in `src/auth/config/jwt.config.ts`

## Common Gotchas
- Always include `@ActiveUser()` decorator when accessing user in authenticated routes
- Entity relationships cascade delete by default (`onDelete: 'CASCADE'`)
- Always validate DTOs using class-validator decorators
- Use the interceptors for consistent response formatting