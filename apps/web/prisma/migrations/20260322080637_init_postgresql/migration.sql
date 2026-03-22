-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('person', 'company', 'admin');

-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('warehouse', 'construction', 'hospitality', 'retail', 'transport', 'cleaning', 'manufacturing', 'agriculture', 'office', 'other');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('active', 'paused', 'closed', 'expired', 'blocked');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('hourly', 'daily', 'monthly');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'viewed', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('person_reviews_company', 'company_reviews_person');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('person_company', 'person_person');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "city" TEXT,
    "bio" TEXT,
    "cv_url" TEXT,
    "skills" TEXT,
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "available_from" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_seekers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "person_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT NOT NULL,
    "skills" TEXT,
    "expected_salary" INTEGER,
    "salary_type" TEXT NOT NULL DEFAULT 'hourly',
    "available_from" TIMESTAMP(3),
    "driving_license" BOOLEAN NOT NULL DEFAULT false,
    "experience_years" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "job_seekers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_logo_url" TEXT,
    "description" TEXT,
    "website" TEXT,
    "nip" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" TEXT NOT NULL,
    "company_id" TEXT,
    "person_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "JobCategory" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'active',
    "city" TEXT NOT NULL,
    "address" TEXT,
    "postal_code" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "salary_min" DOUBLE PRECISION,
    "salary_max" DOUBLE PRECISION,
    "salary_type" "SalaryType" NOT NULL DEFAULT 'hourly',
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "hours_per_week" INTEGER,
    "requirements" TEXT,
    "min_age" INTEGER NOT NULL DEFAULT 18,
    "driving_license" BOOLEAN NOT NULL DEFAULT false,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "applications_count" INTEGER NOT NULL DEFAULT 0,
    "voivodeship" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "cover_letter" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_offers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offer_id" TEXT NOT NULL,
    "person_id" TEXT,
    "company_id" TEXT,

    CONSTRAINT "saved_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "type" "ReviewType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_person_id" TEXT,
    "author_company_id" TEXT,
    "target_person_id" TEXT,
    "target_company_id" TEXT,
    "job_offer_id" TEXT,
    "company_reply" TEXT,
    "company_replied_at" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "person_id" TEXT,
    "company_id" TEXT,
    "job_offer_id" TEXT,
    "person_a_id" TEXT,
    "person_b_id" TEXT,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "sender_person_id" TEXT,
    "sender_company_id" TEXT,
    "sender_target_person_id" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "person_profiles_user_id_key" ON "person_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "job_seekers_person_id_key" ON "job_seekers"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_user_id_key" ON "company_profiles"("user_id");

-- CreateIndex
CREATE INDEX "job_offers_city_idx" ON "job_offers"("city");

-- CreateIndex
CREATE INDEX "job_offers_category_idx" ON "job_offers"("category");

-- CreateIndex
CREATE INDEX "job_offers_status_idx" ON "job_offers"("status");

-- CreateIndex
CREATE INDEX "job_offers_company_id_idx" ON "job_offers"("company_id");

-- CreateIndex
CREATE INDEX "job_offers_person_id_idx" ON "job_offers"("person_id");

-- CreateIndex
CREATE INDEX "applications_offer_id_idx" ON "applications"("offer_id");

-- CreateIndex
CREATE INDEX "applications_applicant_id_idx" ON "applications"("applicant_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_offer_id_applicant_id_key" ON "applications"("offer_id", "applicant_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_offers_person_id_offer_id_key" ON "saved_offers"("person_id", "offer_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_offers_company_id_offer_id_key" ON "saved_offers"("company_id", "offer_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "reviews_target_company_id_idx" ON "reviews"("target_company_id");

-- CreateIndex
CREATE INDEX "reviews_target_person_id_idx" ON "reviews"("target_person_id");

-- CreateIndex
CREATE INDEX "conversations_person_id_idx" ON "conversations"("person_id");

-- CreateIndex
CREATE INDEX "conversations_company_id_idx" ON "conversations"("company_id");

-- CreateIndex
CREATE INDEX "conversations_person_a_id_idx" ON "conversations"("person_a_id");

-- CreateIndex
CREATE INDEX "conversations_person_b_id_idx" ON "conversations"("person_b_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- AddForeignKey
ALTER TABLE "person_profiles" ADD CONSTRAINT "person_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_seekers" ADD CONSTRAINT "job_seekers_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_offers" ADD CONSTRAINT "saved_offers_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_offers" ADD CONSTRAINT "saved_offers_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_offers" ADD CONSTRAINT "saved_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_person_id_fkey" FOREIGN KEY ("author_person_id") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_company_id_fkey" FOREIGN KEY ("author_company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_target_person_id_fkey" FOREIGN KEY ("target_person_id") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_person_a_id_fkey" FOREIGN KEY ("person_a_id") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_person_b_id_fkey" FOREIGN KEY ("person_b_id") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_person_id_fkey" FOREIGN KEY ("sender_person_id") REFERENCES "person_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_company_id_fkey" FOREIGN KEY ("sender_company_id") REFERENCES "company_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_target_person_id_fkey" FOREIGN KEY ("sender_target_person_id") REFERENCES "person_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
