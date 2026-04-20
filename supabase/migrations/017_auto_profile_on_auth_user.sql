-- ═══════════════════════════════════════════════════════════
-- Migration 017: Auto-Create profile bei neuem auth.users-Eintrag
-- Zweck: Jeder (auch anonymer) User bekommt sofort ein public.profiles-
--        Zeile mit 10 Start-Coins. Behebt Voice-Config-Bot-Fehler
--        "Profil nicht gefunden" + RPC insufficient_coins_or_user_not_found.
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, coin_balance, created_at, updated_at)
  VALUES (NEW.id, 10, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill für bestehende User ohne Profile
INSERT INTO public.profiles (id, coin_balance, created_at, updated_at)
SELECT u.id, 10, now(), now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
