-- ═══════════════════════════════════════════════════════════
-- Migration 016: increment_coins RPC (atomar, RLS-safe)
-- Zweck: Coin-Abzug/-Gutschrift für Features wie Voice Config Bot
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.increment_coins(
  target_user_id uuid,
  amount integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  -- Atomarer Update mit Balance-Check (kein negativer Stand möglich bei Abzug)
  UPDATE public.profiles
  SET coin_balance = coin_balance + amount
  WHERE id = target_user_id
    AND (amount >= 0 OR coin_balance + amount >= 0)
  RETURNING coin_balance INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_coins_or_user_not_found'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN new_balance;
END;
$$;

-- Execute-Rechte: authentifizierte User + Service-Role
REVOKE ALL ON FUNCTION public.increment_coins(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_coins(uuid, integer) TO authenticated, service_role;

COMMENT ON FUNCTION public.increment_coins(uuid, integer) IS
  'Atomarer Coin-Abzug/-Gutschrift. Negative amount = Abzug, positiv = Gutschrift. Raised insufficient_coins_or_user_not_found bei zu wenig Coins oder unbekanntem User.';
