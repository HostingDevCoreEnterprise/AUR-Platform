CREATE TABLE users (
  id uuid NOT NULL,
  email character varying(255) NOT NULL,
  password_hash character varying(255) NOT NULL,
  first_name character varying(100) NOT NULL,
  last_name character varying(100) NOT NULL,
  county character varying(100) NOT NULL,
  phone_number character varying(20),
  birth_date date,
  high_school character varying(255),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE universities (
  id uuid NOT NULL,
  name character varying(255) NOT NULL,
  acronym character varying(50),
  type character varying(50),
  county character varying(100),
  city character varying(100),
  address text,
  url character varying(255),
  logo_path character varying(255),
  description text,
  founded_year integer,
  total_students integer,
  contact_email character varying(100),
  contact_phone character varying(50)
);

CREATE TABLE applications (
  id uuid NOT NULL,
  user_id uuid,
  university_name character varying(255) NOT NULL,
  program_name character varying(255) NOT NULL,
  status character varying(50) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  grade character varying(10),
  university_url character varying(255),
  faculty_name character varying(255)
);

CREATE TABLE simulations (
  id uuid NOT NULL,
  user_id uuid,
  title character varying(255) NOT NULL,
  formula text NOT NULL,
  final_grade numeric NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

