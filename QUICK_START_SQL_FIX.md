# QUICK START - SQL SCHEMA FIX / PORNIRE RAPIDĂ

## English Version

### What's the Problem?
Your application expects specific column names in the `drivers` and `vehicles` tables, but the database has different column names. This causes errors like:
- "Could not find the 'full_name' column of 'drivers' in the schema cache"
- "Could not find the 'make' column of 'vehicles' in the schema cache"

### How to Fix It

**Step 1:** Open Supabase Dashboard
- Go to your project at https://supabase.com
- Click on "SQL Editor" in the left menu

**Step 2:** Run the Fix Script
- Open the file: `RUN_THIS_SQL_FIX.sql`
- Copy ALL the content (the entire file)
- Paste it into the Supabase SQL Editor
- Click "Run" button

**Step 3:** Verify the Fix
After running, you should see two tables showing the column schemas:
- DRIVERS TABLE SCHEMA
- VEHICLES TABLE SCHEMA

Check that these columns exist:
- **drivers**: `full_name`, `license_number`, `email`, `notes`, `is_active`
- **vehicles**: `vehicle_type`, `registration`, `make`, `model`, `year`, `capacity_kg`, `notes`, `is_available`

**Step 4:** Test Your Application
- Refresh your application
- Try adding a driver or vehicle
- The errors should be gone!

---

## Versiunea în Română

### Care este Problema?
Aplicația ta așteaptă anumite nume de coloane în tabelele `drivers` și `vehicles`, dar baza de date are alte nume de coloane. Aceasta cauzează erori precum:
- "Could not find the 'full_name' column of 'drivers' in the schema cache"
- "Could not find the 'make' column of 'vehicles' in the schema cache"

### Cum să Rezolvi

**Pasul 1:** Deschide Dashboard-ul Supabase
- Mergi la proiectul tău pe https://supabase.com
- Click pe "SQL Editor" în meniul din stânga

**Pasul 2:** Rulează Script-ul de Corecție
- Deschide fișierul: `RUN_THIS_SQL_FIX.sql`
- Copiază TOT conținutul (întregul fișier)
- Lipește-l în Supabase SQL Editor
- Click pe butonul "Run"

**Pasul 3:** Verifică Corecția
După rulare, ar trebui să vezi două tabele care arată schemele coloanelor:
- DRIVERS TABLE SCHEMA
- VEHICLES TABLE SCHEMA

Verifică că aceste coloane există:
- **drivers**: `full_name`, `license_number`, `email`, `notes`, `is_active`
- **vehicles**: `vehicle_type`, `registration`, `make`, `model`, `year`, `capacity_kg`, `notes`, `is_available`

**Pasul 4:** Testează Aplicația
- Reîmprospătează aplicația
- Încearcă să adaugi un șofer sau un vehicul
- Erorile ar trebui să dispară!

---

## What Changes Are Made / Ce Modificări se Fac

### DRIVERS Table Changes:
| Old Column / Coloană Veche | New Column / Coloană Nouă | Action / Acțiune |
|---------------------------|---------------------------|------------------|
| `name` | `full_name` | Renamed / Redenumit |
| `licence` | `license_number` | Renamed / Redenumit |
| `status` | `is_active` | Changed type / Tip schimbat |
| - | `email` | Added / Adăugat |
| - | `notes` | Added / Adăugat |

### VEHICLES Table Changes:
| Old Column / Coloană Veche | New Column / Coloană Nouă | Action / Acțiune |
|---------------------------|---------------------------|------------------|
| `reg` | `registration` | Renamed / Redenumit |
| `type` | `vehicle_type` | Renamed / Redenumit |
| `payload_kg` | `capacity_kg` | Renamed / Redenumit |
| `status` | `is_available` | Changed type / Tip schimbat |
| - | `make` | Added / Adăugat |
| - | `model` | Added / Adăugat |
| - | `year` | Added / Adăugat |
| - | `notes` | Added / Adăugat |

---

## Important Notes / Note Importante

✅ **Safe to Run / Sigur de Rulat**: This script checks for existing columns before making changes
✅ **No Data Loss / Fără Pierderi de Date**: Existing data is preserved and migrated
✅ **Idempotent / Idempotent**: Can be run multiple times safely

⚠️ **Backup Recommendation / Recomandare Backup**: Although safe, it's always good practice to backup your database before running migrations.

---

## Troubleshooting / Depanare

**Problem:** Script fails with "permission denied"
**Solution:** Make sure you're logged in as the project owner or have admin access

**Problemă:** Script-ul eșuează cu "permission denied"
**Soluție:** Asigură-te că ești autentificat ca proprietar al proiectului sau ai acces de administrator

---

**Problem:** Columns still not found after running
**Solution:** Clear your browser cache and refresh the application

**Problemă:** Coloanele încă nu sunt găsite după rulare
**Soluție:** Șterge cache-ul browserului și reîmprospătează aplicația

---

## Need Help? / Ai nevoie de ajutor?

If you encounter any issues, the error messages from the SQL Editor will tell you exactly what went wrong.

Dacă întâmpini probleme, mesajele de eroare din SQL Editor îți vor spune exact ce a mers prost.
