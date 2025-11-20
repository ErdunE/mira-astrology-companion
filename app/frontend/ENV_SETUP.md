# Environment Variables Setup

## Creating Your .env File

Create a `.env` file in the root of the frontend directory with the following content:

```env
# Backend API Configuration
# Replace with your AWS backend URL
VITE_API_BASE_URL=http://localhost:3000/api
```

## For Different Environments

### Local Development
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Production
```env
VITE_API_BASE_URL=https://api.your-domain.com/api
```

### Staging
```env
VITE_API_BASE_URL=https://staging-api.your-domain.com/api
```

## Important Notes

1. **Never commit the `.env` file** - It's in `.gitignore`
2. **Environment variables must start with `VITE_`** - This is required by Vite
3. **Restart dev server after changing `.env`** - Changes won't apply until restart
4. **Share the URL with your team** - But don't commit sensitive values

## Testing Your Configuration

After creating your `.env` file, test it:

```bash
npm run dev
```

Then check the browser console. If you see connection errors, verify:
- The backend URL is correct
- The backend server is running
- CORS is properly configured on the backend

