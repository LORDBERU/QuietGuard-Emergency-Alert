CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE alert_contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  enabled boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled_events jsonb DEFAULT '["smoke_alarm", "glass_break", "distress"]'::jsonb NOT NULL,
  thresholds jsonb DEFAULT '{"smoke_alarm": 0.7, "glass_break": 0.7, "distress": 0.7, "loud_impact": 0.8}'::jsonb NOT NULL,
  cooldown_seconds integer DEFAULT 300 NOT NULL,
  location_sharing boolean DEFAULT false NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE alert_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  source text NOT NULL,
  confidence real,
  occurred_at timestamp with time zone NOT NULL,
  delivery_status text DEFAULT 'pending' NOT NULL,
  provider_message_id text,
  error_summary text,
  location_lat real,
  location_lng real,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE session (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid)
);
CREATE INDEX IDX_session_expire ON session (expire);

CREATE INDEX users_email_idx ON users(email);
CREATE INDEX alert_contacts_user_id_idx ON alert_contacts(user_id);
CREATE INDEX alert_events_user_id_idx ON alert_events(user_id);
CREATE INDEX alert_events_occurred_at_idx ON alert_events(occurred_at);
