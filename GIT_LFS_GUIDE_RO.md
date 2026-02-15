# Cum să adaugi fișiere mari (278MB+) în proiect

## Problemă
GitHub are o limită de 100MB pentru fișierele individuale. Dacă încerci să adaugi fișiere mai mari, vei primi o eroare și nu vei putea să faci push.

## Soluție: Git LFS (Large File Storage)

Git LFS este o extensie Git care înlocuiește fișierele mari cu pointeri mici în repository-ul Git, în timp ce conținutul real al fișierelor este stocat pe un server separat.

## Ce am configurat pentru tine

✅ Git LFS este acum instalat și configurat în acest repository
✅ Am creat fișierul `.gitattributes` care specifică ce tipuri de fișiere folosesc LFS
✅ Următoarele tipuri de fișiere sunt configurate automat pentru LFS:
   - Video: mp4, mov, avi, mkv, webm
   - Imagini mari: psd, ai, tiff
   - Arhive: zip, rar, 7z, tar.gz
   - Audio: mp3, wav, flac
   - PDF-uri mari
   - Database dumps: sql, db
   - Și altele...

## Cum să adaugi fișierele tale mari

### Pas 1: Verifică că Git LFS este instalat local
```bash
git lfs version
```

Dacă nu este instalat, instalează-l:
- **Windows**: Descarcă de la https://git-lfs.github.com/
- **Mac**: `brew install git-lfs`
- **Linux**: `sudo apt-get install git-lfs` sau `sudo yum install git-lfs`

### Pas 2: Clonează repository-ul cu LFS
```bash
git lfs install
git clone https://github.com/LoadifyMarketLTD/xdrivelogistics.git
cd xdrivelogistics
```

### Pas 3: Adaugă fișierele tale mari
```bash
# Copiază fișierele în directorul proiectului
# Apoi adaugă-le la Git normal:
git add numele-fisierului-mare.mp4
git commit -m "Adaugă video mare"
git push origin main
```

**Important**: Git LFS va detecta automat fișierele configurate în `.gitattributes` și le va gestiona corect!

## Verificare

Pentru a verifica ce fișiere sunt gestionate de LFS:
```bash
git lfs ls-files
```

## Limite GitHub LFS

GitHub oferă gratuit:
- **1 GB** de storage LFS
- **1 GB** de bandwidth lunar

Pentru fișiere mai mari sau mai multe fișiere:
- Poți cumpăra pachete suplimentare de la GitHub ($5/lună pentru 50GB storage + 50GB bandwidth)
- Sau poți folosi un serviciu alternativ de hosting pentru fișierele mari

## Alternative pentru fișiere foarte mari

Dacă ai multe fișiere peste 278MB sau vrei să eviți costurile LFS:

### 1. CDN extern (Recomandat pentru site-uri web)
- **Cloudflare R2** (gratuit pentru 10GB/lună)
- **AWS S3** + CloudFront
- **Backblaze B2** (foarte ieftin)
- **Bunny CDN** (performanță excelentă)

### 2. Servicii specializate pentru media
- **Vimeo** sau **YouTube** pentru video-uri
- **Cloudinary** pentru imagini și video
- **ImageKit** pentru imagini

### 3. Păstrează fișierele locale
Dacă fișierele nu sunt necesare pentru deployment (ex: fișiere de design originale), poți să:
- Le păstrezi local sau pe Google Drive/Dropbox
- Adaugă extensiile în `.gitignore` pentru a le exclude din Git

## Exemplu: Adăugare video mare

```bash
# 1. Asigură-te că ești în directorul proiectului
cd /path/to/xdrivelogistics

# 2. Copiază fișierul tău mare
cp /path/to/video-mare.mp4 ./assets/

# 3. Adaugă și commit (LFS o va gestiona automat)
git add assets/video-mare.mp4
git commit -m "Adaugă video promotional"

# 4. Push (poate dura mai mult pentru fișiere mari)
git push origin main
```

## Troubleshooting

### Eroare: "this exceeds GitHub's file size limit of 100 MB"
- Verifică că Git LFS este instalat local: `git lfs install`
- Verifică că extensia fișierului este în `.gitattributes`
- Dacă nu este, adaugă-o manual:
  ```bash
  git lfs track "*.extensia-ta"
  git add .gitattributes
  git commit -m "Track new file type with LFS"
  ```

### Fișierul meu nu este în lista de extensii
Adaugă manual tipul de fișier:
```bash
git lfs track "*.extensia-ta"
git add .gitattributes
git commit -m "Track *.extensia-ta with LFS"
```

### Vreau să convertesc fișiere existente la LFS
```bash
git lfs migrate import --include="*.mp4" --everything
git push origin main --force
```

## Ajutor suplimentar

Pentru mai multe informații:
- Documentație Git LFS: https://git-lfs.github.com/
- GitHub LFS Guide: https://docs.github.com/en/repositories/working-with-files/managing-large-files

## Contact

Dacă ai nevoie de ajutor suplimentar, contactează echipa de dezvoltare sau deschide un issue pe GitHub.
