# Deployment Guide

## Deploy to Render

Your app is ready to deploy! Follow these simple steps:

### Quick Deploy

1. **Sign up/Login to Render**
   - Go to [render.com](https://render.com)
   - Sign in with your GitHub account

2. **Create New Static Site**
   - Click the "New +" button in the top right
   - Select "Static Site"
   - Select the `vibe-devops-portal` repository
   - Render will automatically detect the `render.yaml` configuration file

3. **Configure (Optional)**
   - The settings are pre-configured in `render.yaml`
   - If you need to add environment variables:
     - Go to "Environment" tab
     - Add `SLACK_WEBHOOK_URL` (from `.env.example`)
     - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if using Supabase

4. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy your site
   - Your site will be live at `https://vibe-devops-portal.onrender.com`

### Custom Domain (Optional)

1. In your Render dashboard, go to your site
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `devops.yourdomain.com`)
4. Update your DNS records as instructed by Render
5. Render will automatically provision SSL certificates

### Auto Deployments

Every time you push to the `master` branch on GitHub, Render will automatically rebuild and deploy your site.

### Build Configuration

The following is automatically configured via `render.yaml`:

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `./build`
- **Node Version**: 18.0.0
- **Security Headers**: Enabled
- **SPA Routing**: Configured (all routes redirect to index.html)

### Environment Variables

Create these in your Render dashboard if needed:

```env
SLACK_WEBHOOK_URL=your-slack-webhook-url
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Monitoring

- Check build logs in the Render dashboard
- Monitor performance and uptime
- Set up notifications for deployment failures

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Site Not Loading
- Check that the publish directory is set to `build`
- Verify the build command completed successfully
- Check browser console for errors

### Need Help?
- [Render Documentation](https://render.com/docs/static-sites)
- [Render Community](https://community.render.com/)
