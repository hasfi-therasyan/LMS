# GitHub Profile README Setup Guide

## 📋 Quick Setup Steps

### 1. Create the Special Repository
- Go to GitHub and create a **new repository**
- Repository name must be: `hasfi-therasyan` (exactly your GitHub username)
- Make it **public**
- **DO NOT** initialize with README, .gitignore, or license
- Click "Create repository"

### 2. Clone and Setup
```bash
git clone https://github.com/hasfi-therasyan/hasfi-therasyan.git
cd hasfi-therasyan
```

### 3. Copy the README
- Copy the contents from `GITHUB_PROFILE_README.md`
- Create a new file: `README.md` in the repository
- Paste the content

### 4. Customize Your Profile

#### Replace Placeholders:
- ✅ `hasfi-therasyan` → Already updated! (appears multiple times)
- `[Your Name]` → Your actual name
- `your.email@example.com` → Your email
- Update social media links in the "Connect with Me" section
- Update project names in "Featured Projects" section
- Customize the "About Me" section with your details

#### Update Tech Stack:
- Remove badges for technologies you don't use
- Add badges for technologies you do use
- You can find more badges at: https://shields.io/

### 5. Commit and Push
```bash
git add README.md
git commit -m "Add profile README"
git push origin main
```

### 6. Verify
- Visit `https://github.com/hasfi-therasyan`
- Your profile README should appear at the top!

## 🎨 Customization Tips

### Adding Snake Animation (Optional)
1. Create `.github/workflows/snake.yml` in your profile repo:
```yaml
name: Generate Snake

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: Platane/snk@master
        id: snake-gif
        with:
          github_user_name: hasfi-therasyan
          svg_out_path: dist/github-contribution-grid-snake.svg

      - name: Push to output branch
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. Update the snake image URL in README.md to:
```markdown
<img src="https://raw.githubusercontent.com/hasfi-therasyan/hasfi-therasyan/output/github-contribution-grid-snake.svg" alt="Snake animation" />
```

### Finding Your Repository Stats
- ✅ All `hasfi-therasyan` placeholders have been updated
- The stats will automatically pull from your GitHub account

### Adding More Sections
You can add:
- 📚 Blog posts
- 🏆 Achievements
- 📈 Contribution graph
- 🎯 Goals
- 💼 Work experience
- 📝 Certifications

## 🔗 Useful Resources

- **Badges**: https://shields.io/
- **Icons**: https://skillicons.dev/
- **Stats**: https://github.com/anuraghazra/github-readme-stats
- **Typing Animation**: https://readme-typing-svg.herokuapp.com/
- **Activity Graph**: https://github.com/Ashutosh00710/github-readme-activity-graph

## ⚠️ Important Notes

1. The repository name **must** match your username exactly
2. The README.md file **must** be in the root of the repository
3. Changes may take a few minutes to appear on your profile
4. Make sure all URLs are updated with your actual username

## 🎯 Quick Checklist

- [ ] Created repository with username as name
- [ ] Copied README content
- [ ] Replaced all `yourusername` placeholders
- [ ] Updated personal information
- [ ] Updated social media links
- [ ] Updated tech stack badges
- [ ] Updated project names
- [ ] Committed and pushed to GitHub
- [ ] Verified profile looks good

Enjoy your new professional GitHub profile! 🚀
