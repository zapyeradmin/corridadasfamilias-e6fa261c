ALTER TYPE public.gender RENAME TO gender_old;
CREATE TYPE public.gender AS ENUM ('M', 'F');
ALTER TABLE public.registrations
  ALTER COLUMN gender TYPE public.gender USING gender::text::public.gender;
DROP TYPE public.gender_old;