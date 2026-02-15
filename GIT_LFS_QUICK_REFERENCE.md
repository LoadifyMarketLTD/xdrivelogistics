# Git LFS - Quick Reference / Referință Rapidă

## 🚀 Quick Start / Început Rapid

```bash
# Install LFS locally / Instalează LFS local
git lfs install

# Clone repository / Clonează repository-ul
git clone https://github.com/LoadifyMarketLTD/xdrivelogistics.git

# Add large file / Adaugă fișier mare
git add your-large-file.mp4
git commit -m "Add large file"
git push
```

## 📋 Common Commands / Comenzi Uzuale

### Check what's tracked / Verifică ce este urmărit
```bash
git lfs track
```

### List LFS files / Listează fișierele LFS
```bash
git lfs ls-files
```

### Track new file type / Urmărește un nou tip de fișier
```bash
git lfs track "*.custom-extension"
git add .gitattributes
git commit -m "Track new file type"
```

### Check LFS status / Verifică status-ul LFS
```bash
git lfs status
```

### Migrate existing files / Migrează fișiere existente
```bash
git lfs migrate import --include="*.mp4"
```

## 📦 File Types Already Configured / Tipuri de Fișiere Deja Configurate

✅ **Videos**: mp4, mov, avi, mkv, wmv, flv, webm
✅ **Images**: psd, ai, tiff, tif
✅ **Archives**: zip, rar, 7z, tar.gz, tgz
✅ **Audio**: mp3, wav, flac
✅ **Documents**: pdf
✅ **Databases**: sql, db
✅ **3D Models**: obj, fbx, blend
✅ **Binaries**: bin, exe, dmg, iso

## ❗ Important / Important

- GitHub Free: 1GB storage + 1GB bandwidth/month
- Files > 100MB must use LFS
- LFS files count towards repository size
- Additional storage: $5/month for 50GB

## 🆘 Troubleshooting / Probleme

### File not tracked / Fișier ne-urmărit
```bash
git lfs track "*.your-extension"
git add .gitattributes
```

### Need to convert existing file / Trebuie să convertesc un fișier existent
```bash
git rm --cached large-file.mp4
git add large-file.mp4
```

### Check file is using LFS / Verifică că fișierul folosește LFS
```bash
git lfs ls-files | grep your-file
```

## 🔗 Links / Link-uri

- Git LFS Documentation: https://git-lfs.github.com/
- GitHub LFS Pricing: https://docs.github.com/billing/managing-billing-for-git-large-file-storage
- Detailed Romanian Guide: [GIT_LFS_GUIDE_RO.md](GIT_LFS_GUIDE_RO.md)

## 💡 Tips / Sfaturi

1. **Always install LFS before cloning** / Instalează întotdeauna LFS înainte de clonare
2. **Check file extensions match** / Verifică că extensiile fișierelor se potrivesc
3. **Test with small file first** / Testează mai întâi cu un fișier mic
4. **Monitor your LFS quota** / Monitorizează-ți quota LFS
5. **Consider CDN for very large files** / Ia în considerare CDN pentru fișiere foarte mari
