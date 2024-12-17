# HopeCare Project Debugging Guide

## Project Analysis and Debugging Prompt

When encountering issues with the HopeCare project, use this structured approach to analyze and fix problems:

### 1. Initial Project Assessment
```
Please analyze the HopeCare project for potential issues. Focus on:
1. Project structure and file organization
2. Dependencies and version compatibility
3. Configuration files (package.json, tsconfig.json, etc.)
4. Build and compilation settings
5. Environment variables and configuration
```

### 2. Error Analysis
```
For the current error "[ERROR_MESSAGE]", please:
1. Identify the error type and location
2. Check related component dependencies
3. Verify import/export statements
4. Review TypeScript type definitions
5. Examine component props and state management
6. Check for circular dependencies
```

### 3. Code Review Checklist
```
Please review the following aspects of the codebase:
1. Component Architecture:
   - Component hierarchy
   - Props drilling issues
   - Context usage
   - State management

2. Type Definitions:
   - Interface definitions
   - Type imports
   - Generic type usage
   - Custom type declarations

3. Routing and Navigation:
   - Route configurations
   - Navigation guards
   - Protected routes
   - Route parameters

4. Authentication:
   - Auth context setup
   - Token management
   - Protected routes
   - User role handling

5. API Integration:
   - API endpoint configuration
   - Error handling
   - Response typing
   - Request interceptors
```

### 4. Common Issues to Check
```
Please verify these common issues:
1. Missing or incorrect imports
2. Incompatible dependency versions
3. TypeScript configuration issues
4. Environment variable setup
5. Build configuration problems
6. Route configuration errors
7. Context provider wrapping
8. Authentication flow issues
```

### 5. Performance Optimization
```
Please analyze and optimize:
1. Component rendering efficiency
2. State management patterns
3. Data fetching strategies
4. Code splitting implementation
5. Bundle size optimization
6. Memory leak prevention
7. Error boundary implementation
```

### 6. Code Fix Implementation
```
When implementing fixes, please:
1. Document all changes made
2. Explain the reasoning behind each fix
3. Test the changes thoroughly
4. Consider side effects
5. Update related documentation
6. Add necessary error handling
7. Implement proper TypeScript types
```

### 7. Testing Instructions
```
After implementing fixes, please:
1. Test all affected components
2. Verify route navigation
3. Check authentication flows
4. Test error handling
5. Validate form submissions
6. Check responsive design
7. Verify API integrations
```

## Common Error Solutions

### TypeScript Errors
- Check `tsconfig.json` settings
- Verify type definitions
- Update @types packages
- Check for missing type declarations

### Build Errors
- Clear node_modules and reinstall
- Update package versions
- Check build configuration
- Verify environment variables

### Runtime Errors
- Check component lifecycle
- Verify state management
- Review async operations
- Check error boundaries

### Authentication Errors
- Verify token management
- Check auth context setup
- Review protected routes
- Validate user roles

## Project-Specific Notes

### Key Dependencies
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Stripe Integration

### Important Files to Check
- src/App.tsx
- src/contexts/AuthContext.tsx
- src/pages/About.tsx
- src/components/admin/AboutEditor.tsx
- package.json
- tsconfig.json

### Environment Setup
1. Verify .env files
2. Check API endpoints
3. Validate build scripts
4. Review deployment config

## Debugging Commands

### Development
```bash
npm run dev
npm run build
npm run lint
npm run type-check
```

### Troubleshooting
```bash
npm clean-install
npm run build -- --debug
npm run dev -- --debug
```

Remember to document any fixes and update this guide with new solutions as they are discovered.
