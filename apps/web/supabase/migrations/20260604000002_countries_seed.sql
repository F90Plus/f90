-- =============================================================================
-- F90+ — countries seed (Phase 1) — migration 0002
--
-- The 48 WC2026 nations. Derived from lib/football/teams.ts (code / accent_color
-- / strength) + Spanish names. Hosts (is_host = true): USA, Mexico, Canada.
-- Every nation in the field is is_qualified = true.
--
-- Kept in sync with teams.ts by a coherence test
-- (src/lib/football/__tests__/countries-seed.test.ts): codes and strengths must
-- match teams.ts exactly, hosts must be USA/MEX/CAN, and all 48 must be present.
-- Idempotent: re-running updates the reference fields.
-- =============================================================================

insert into public.countries
  (code, name_en, name_es, accent_color, is_host, is_qualified, strength)
values
  ('ESP','Spain','España','#E63946', false, true, 2090),
  ('ARG','Argentina','Argentina','#74ACE6', false, true, 2080),
  ('FRA','France','Francia','#3D74FF', false, true, 2050),
  ('BRA','Brazil','Brasil','#EFC400', false, true, 2050),
  ('ENG','England','Inglaterra','#5B8CFF', false, true, 2010),
  ('POR','Portugal','Portugal','#1FA85C', false, true, 2000),
  ('NED','Netherlands','Países Bajos','#FF8A3D', false, true, 1990),
  ('GER','Germany','Alemania','#E8B500', false, true, 1980),
  ('BEL','Belgium','Bélgica','#E8B500', false, true, 1970),
  ('COL','Colombia','Colombia','#EFC400', false, true, 1950),
  ('URU','Uruguay','Uruguay','#74ACE6', false, true, 1930),
  ('CRO','Croatia','Croacia','#E63946', false, true, 1920),
  ('MAR','Morocco','Marruecos','#C0392B', false, true, 1900),
  ('JPN','Japan','Japón','#E6486A', false, true, 1880),
  ('SUI','Switzerland','Suiza','#E63946', false, true, 1865),
  ('CIV','Ivory Coast','Costa de Marfil','#FF8A3D', false, true, 1860),
  ('ECU','Ecuador','Ecuador','#EFC400', false, true, 1860),
  ('SEN','Senegal','Senegal','#1FA85C', false, true, 1860),
  ('SWE','Sweden','Suecia','#5B8CFF', false, true, 1855),
  ('USA','USA','Estados Unidos','#5B8CFF', true,  true, 1850),
  ('TUR','Turkey','Turquía','#E63946', false, true, 1850),
  ('NOR','Norway','Noruega','#C8102E', false, true, 1845),
  ('MEX','Mexico','México','#15D389', true,  true, 1835),
  ('IRN','Iran','Irán','#1FA85C', false, true, 1830),
  ('KOR','South Korea','Corea del Sur','#3D74FF', false, true, 1825),
  ('CZE','Czech Republic','República Checa','#5B8CFF', false, true, 1820),
  ('EGY','Egypt','Egipto','#C0392B', false, true, 1820),
  ('AUT','Austria','Austria','#ED2939', false, true, 1820),
  ('CAN','Canada','Canadá','#E63946', true,  true, 1810),
  ('SCO','Scotland','Escocia','#3D74FF', false, true, 1800),
  ('PAR','Paraguay','Paraguay','#E63946', false, true, 1795),
  ('ALG','Algeria','Argelia','#0B7A3E', false, true, 1795),
  ('TUN','Tunisia','Túnez','#C0392B', false, true, 1790),
  ('BIH','Bosnia & Herzegovina','Bosnia y Herzegovina','#3D74FF', false, true, 1785),
  ('GHA','Ghana','Ghana','#CE1126', false, true, 1775),
  ('AUS','Australia','Australia','#EFC400', false, true, 1765),
  ('COD','DR Congo','RD Congo','#3DA0E6', false, true, 1760),
  ('KSA','Saudi Arabia','Arabia Saudí','#15803D', false, true, 1740),
  ('UZB','Uzbekistan','Uzbekistán','#3D74FF', false, true, 1720),
  ('IRQ','Iraq','Irak','#1FA85C', false, true, 1710),
  ('QAT','Qatar','Catar','#7A1F3D', false, true, 1705),
  ('RSA','South Africa','Sudáfrica','#1FA85C', false, true, 1700),
  ('JOR','Jordan','Jordania','#C8102E', false, true, 1700),
  ('PAN','Panama','Panamá','#DA121A', false, true, 1690),
  ('NZL','New Zealand','Nueva Zelanda','#5B8CFF', false, true, 1655),
  ('CPV','Cape Verde','Cabo Verde','#1FA85C', false, true, 1650),
  ('CUW','Curaçao','Curazao','#3D74FF', false, true, 1610),
  ('HAI','Haiti','Haití','#5B8CFF', false, true, 1560)
on conflict (code) do update set
  name_en      = excluded.name_en,
  name_es      = excluded.name_es,
  accent_color = excluded.accent_color,
  is_host      = excluded.is_host,
  is_qualified = excluded.is_qualified,
  strength     = excluded.strength,
  updated_at   = now();
