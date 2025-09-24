# Best Practices for AI Coding Agents
You are an expert in TypeScript, Nest, and scalable REST API development. You write maintainable, performant, and accessible code following Nest and TypeScript best practices.

## Code Quality & Validation

## TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

### Always Validate Code Changes
- **Run tests immediately** after any substantive code change using `yarn run test`
- **Run linting** after changes using `yarn run lint`
- **Build the project** to ensure no compilation errors: `yarn run build`
- **Test endpoints** manually if creating/modifying API routes
- Never commit code with failing tests or lint errors

### Error Handling Patterns
- Use appropriate NestJS exceptions (`BadRequestException`, `NotFoundException`, `ConflictException`, etc.)
- Include descriptive error messages for API consumers
- Log errors with context using the Logger service
- Handle database constraint violations (e.g., unique constraints return `23505`)

### Database Operations
- Always validate foreign key relationships before creating/updating entities
- Use transactions for multi-step operations that must succeed together
- Handle soft deletes properly (`deletedAt` field)
- Validate data integrity constraints in service layer

## Development Workflow

### Before Making Changes
1. **Read existing code** to understand current patterns and conventions
2. **Check related files** (entities, DTOs, services, controllers) for context
3. **Understand relationships** between entities and modules
4. **Review existing tests** to understand expected behavior

### During Development
- **Follow established patterns** from existing codebase
- **Use consistent naming** conventions (camelCase for methods, PascalCase for classes)
- **Add proper TypeScript types** - avoid `any` type
- **Include JSDoc comments** for complex business logic
- **Use dependency injection** properly in NestJS modules

### After Making Changes
- **Run full test suite**: `yarn run test`
- **Run e2e tests** if modifying API endpoints: `yarn run test:e2e`
- **Verify API documentation** updates if changing endpoints
- **Check for linting issues**: `yarn run lint`

## API Design Principles

### RESTful Conventions
- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Follow resource naming conventions (`/items`, `/items/:id`)
- Use query parameters for filtering/pagination
- Return appropriate HTTP status codes

### DTO Validation
- Always use class-validator decorators on DTOs
- Include meaningful validation messages
- Use appropriate validation rules (`@IsString()`, `@IsUUID()`, `@IsOptional()`, etc.)
- Transform input data using `class-transformer`

### Response Formatting
- Use consistent response structure across all endpoints
- Include proper error responses with meaningful messages
- Use interceptors for consistent response formatting

## Security Considerations

### Authentication & Authorization
- Always protect routes with appropriate guards (`@UseGuards(AccessTokenGuard)`)
- Use `@ActiveUser()` decorator to access authenticated user context
- Validate user permissions for business-specific operations
- Never expose sensitive data in API responses

### Input Validation
- Validate all user inputs using DTOs with class-validator
- Sanitize file uploads and validate file types
- Use parameterized queries (handled automatically by TypeORM)
- Implement rate limiting for public endpoints

## Testing Guidelines

### Unit Tests
- Test service methods with mocked dependencies
- Cover happy path and error scenarios
- Mock external services (AWS S3, database operations)
- Use meaningful test descriptions

### E2E Tests
- Test complete API workflows
- Include authentication in tests
- Test error scenarios and edge cases
- Use test database with proper cleanup

### Test Data
- Use factories for consistent test data creation
- Avoid hard-coded IDs in tests
- Clean up test data between test runs

## File Upload & Storage

### AWS S3 Integration
- Validate file types and sizes before upload
- Generate unique file names to prevent conflicts
- Handle upload failures gracefully
- Provide proper URLs for accessing uploaded files

### Image Management
- Store image URLs in database, not binary data
- Implement proper cleanup when entities are deleted
- Use consistent image naming conventions

## Code Organization

### Module Structure
- Keep modules focused on single responsibilities
- Import only necessary dependencies in modules
- Export services that other modules might need
- Follow the established folder structure

### Entity Design
- Use UUID primary keys for all entities
- Include audit fields (`createdAt`, `updatedAt`, `deletedAt`)
- Define proper relationships with cascade options
- Use meaningful column names and constraints

## Performance Considerations

### Database Queries
- Use `select` options to limit returned fields
- Include only necessary `relations` in queries
- Consider pagination for large result sets
- Use indexes on frequently queried columns

### API Responses
- Avoid N+1 query problems with proper relation loading
- Use DTOs to control response structure
- Implement caching where appropriate
- Optimize image loading and delivery

## Documentation

### API Documentation
- Use comprehensive Swagger decorators (`@ApiOperation`, `@ApiResponse`, etc.)
- Include examples in API documentation
- Document authentication requirements
- Keep documentation synchronized with code changes

### Code Comments
- Add comments for complex business logic
- Document public methods and their parameters
- Explain non-obvious decisions or workarounds
- Keep comments up-to-date with code changes

## Deployment & Environment

### Environment Variables
- Never commit sensitive data to version control
- Use `.env` files for local development
- Validate all required environment variables
- Document required environment variables

### Production Considerations
- Disable database synchronization in production
- Use proper logging levels
- Implement health checks
- Configure CORS properly for production domains

## Communication

### Commit Messages
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Group related changes in single commits
- Use conventional commit format when possible

### Code Reviews
- Explain complex changes clearly
- Provide context for architectural decisions
- Address reviewer feedback promptly
- Test changes thoroughly before requesting review

## Tool Usage Guidelines

### When to Use Tools
- **Read files** before making changes to understand context
- **Search codebase** for existing patterns and implementations
- **Run tests** after any code modification
- **Check errors** after editing files
- **Use terminal** for running commands, not for editing files

### Validation Steps
1. Read relevant existing code
2. Make changes following established patterns
3. Run tests and linting
4. Verify functionality manually if needed
5. Check for any breaking changes

Remember: Quality over speed. Always ensure code works correctly and follows project conventions before considering a task complete.</content>
<parameter name="filePath">/Users/villamyo/workspace/tilla-pos/tilla-pos-backend/.github/best-practice.md