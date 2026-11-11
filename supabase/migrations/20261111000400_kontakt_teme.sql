-- Nove teme kontakt forme (odluka V 11. 11. 2026): utisci i predlozi, drugo,
-- i saradnja (dolazi sa stranice za biznise).
alter type public.contact_topic add value if not exists 'utisci';
alter type public.contact_topic add value if not exists 'drugo';
alter type public.contact_topic add value if not exists 'saradnja';
