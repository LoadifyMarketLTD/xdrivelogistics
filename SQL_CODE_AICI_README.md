# 🎯 SQL CODE AICI - COPIAZĂ ȘI RULEAZĂ

## 📁 FIȘIERUL CU COD SQL

Deschide acest fișier și copiază tot conținutul:

### ➡️ **`SQL_CODE_AICI.sql`** ⬅️

---

## 🚀 CUM SĂ RULEZI

### Pasul 1: Deschide fișierul
```
SQL_CODE_AICI.sql
```

### Pasul 2: Copiază TOT codul SQL
- Selectează tot (Ctrl+A sau Cmd+A)
- Copiază (Ctrl+C sau Cmd+C)

### Pasul 3: Deschide Supabase
- Mergi pe https://supabase.com
- Selectează proiectul tău
- Click pe "SQL Editor" în meniul din stânga

### Pasul 4: Rulează codul
- Lipește codul în SQL Editor (Ctrl+V sau Cmd+V)
- Click pe butonul "Run" (sau F5)
- Așteaptă să termine

### Pasul 5: Verifică succesul
- Ar trebui să vezi: "Success!" sau mesaje de confirmare
- Tabelul `invoices` este acum creat în baza ta de date

---

## ✅ CE VA FACE ACEST COD

1. **Creează tabelul `invoices`** cu:
   - Câmpuri pentru facturi (număr, sumă, TVA, status)
   - Link către companii și joburi
   - Date de emitere și scadență

2. **Auto-generează numere de facturi**:
   - Format: INV-2026-1001, INV-2026-1002, etc.
   - Automat la fiecare factură nouă

3. **Adaugă securitate (RLS)**:
   - Fiecare companie vede doar propriile facturi
   - Protecție automată a datelor

4. **Optimizează performanța**:
   - Indexuri pentru căutări rapide
   - Funcționează eficient cu multe facturi

---

## 🆘 DACĂ AI ERORI

### Eroare: "column company_id does not exist"
**Soluție**: Rulează mai întâi schema principală (`supabase-schema.sql`)

### Eroare: "relation companies does not exist"
**Soluție**: Trebuie să existe tabelul `companies` mai întâi

### Eroare: "syntax error"
**Soluție**: Verifică că ai copiat TOT codul, de la început până la sfârșit

---

## 📞 AJUTOR

Dacă întâmpini probleme:
1. Verifică că ai copiat ÎNTREG fișierul `SQL_CODE_AICI.sql`
2. Verifică că există deja tabelele `companies` și `profiles`
3. Verifică că ești logat în Supabase cu contul corect

---

## 🎉 SUCCES!

După ce rulezi cu succes, vei putea:
- ✅ Crea facturi în aplicație
- ✅ Urmări statusul facturilor
- ✅ Genera automat numere de facturi
- ✅ Lega facturi de joburi

---

**Numele fișierului: `SQL_CODE_AICI.sql`**
**Acțiune: Copiază TOT și rulează în Supabase SQL Editor**
