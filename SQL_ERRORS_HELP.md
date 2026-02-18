# ⚠️ IMPORTANT: Erori SQL Comune și Cum să le Eviți

## Ai Primit o Eroare SQL? Citește Aici! 👇

### Eroare: "syntax error at or near '..'"

**Cauză**: Ai copiat cod cu placeholder-e (`...`) în loc de SQL complet.

**Soluție**: Nu copia fragmente din documentație! Folosește fișierele SQL complete:
- `INVOICE_SQL_WITH_CHECKS.sql` (recomandat)
- `INVOICE_SQL_QUICK.sql` (rapid)

---

### Eroare: "syntax error at or near 'IF'"

**Cauză**: IF statements în PostgreSQL trebuie să fie în DO blocks.

**GREȘIT** ❌:
```sql
IF EXISTS (SELECT 1 FROM ...) THEN
  ALTER TABLE ...
END IF;
```

**CORECT** ✅:
```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM ...) THEN
    ALTER TABLE ...;
  END IF;
END $$;
```

---

### Unde Să Găsești Ajutor?

1. **README_SQL_EXAMPLES.md** - Ghid complet cu toate erorile comune
2. **SQL_INSTALLATION_GUIDE.md** - Ghid de instalare pas cu pas
3. **INVOICE_SQL_WITH_CHECKS.sql** - SQL complet și testat

---

**REGULA DE AUR**: 
- ✅ Copiază fișiere SQL complete (.sql)
- ❌ NU copia fragmente din documentație (.md)

---
