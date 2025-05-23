

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."delete_user_if_no_display_name"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.raw_user_meta_data->>'display_name' is null then
    delete from auth.users where id = new.id;
    raise exception 'Signup blocked: display_name is required. User deleted.';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."delete_user_if_no_display_name"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."chat" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "chat_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL
);


ALTER TABLE "public"."chat" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "insight" "json" NOT NULL
);


ALTER TABLE "public"."profile" OWNER TO "postgres";


ALTER TABLE ONLY "public"."chat"
    ADD CONSTRAINT "chat_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "chat_id_index" ON "public"."chat" USING "btree" ("chat_id");



CREATE INDEX "user_id_index" ON "public"."chat" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."chat"
    ADD CONSTRAINT "chat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can insert their own chats" ON "public"."chat" FOR INSERT WITH CHECK ((NOT (EXISTS ( SELECT 1
   FROM "public"."chat" "c"
  WHERE (("c"."chat_id" = "c"."chat_id") AND ("c"."user_id" <> "c"."user_id"))))));



CREATE POLICY "Users can view their own chats" ON "public"."chat" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."chat" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "limit" ON "public"."chat" FOR SELECT USING (((( SELECT "count"(*) AS "count"
   FROM "public"."chat" "c"
  WHERE ("c"."user_id" = "c"."user_id")) < 100) OR ("user_id" = '51bf297e-fe8c-45de-9945-9b62a0a50e83'::"uuid")));



ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."delete_user_if_no_display_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_if_no_display_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_if_no_display_name"() TO "service_role";


















GRANT ALL ON TABLE "public"."chat" TO "anon";
GRANT ALL ON TABLE "public"."chat" TO "authenticated";
GRANT ALL ON TABLE "public"."chat" TO "service_role";



GRANT ALL ON TABLE "public"."profile" TO "anon";
GRANT ALL ON TABLE "public"."profile" TO "authenticated";
GRANT ALL ON TABLE "public"."profile" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "delete_if_display_name_missing" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."delete_user_if_no_display_name"();



