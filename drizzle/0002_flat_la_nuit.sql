ALTER TABLE "group" ADD COLUMN "teacher_ids" integer[] NOT NULL;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "student_ids" integer[] NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "projects" integer[] NOT NULL;