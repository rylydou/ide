ALTER TABLE "token" RENAME TO "session";--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "expires" timestamp NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "secret";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "max_age";--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group-secret" UNIQUE("secret");