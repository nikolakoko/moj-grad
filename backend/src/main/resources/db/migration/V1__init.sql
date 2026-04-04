create type role_type as enum (
    'CITIZEN',
    'ADMINISTRATION_WORKER',
    'ADMIN'
);

create type user_status_type as enum (
    'INVITED',
    'REGISTERED'
);

create type complaint_status_type as enum (
    'PENDING',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED'
);

create type priority_type as enum (
    'LOW',
    'MEDIUM',
    'HIGH'
);

create table departments
(
    id          bigserial primary key,
    name        text      not null,
    created_at  timestamp not null,
    modified_at timestamp not null
);

create table users
(
    id            bigserial primary key,
    name          text             not null,
    email         text             not null unique,
    password      text             not null,
    role          role_type        not null,
    enabled       boolean          not null default false,
    user_status   user_status_type not null,
    department_id bigint,
    created_at    timestamp        not null,
    modified_at   timestamp        not null,

    constraint fk_user_department
        foreign key (department_id) references departments (id)
);

create table complaints
(
    id               bigserial primary key,
    title            text                  not null,
    description      text,
    latitude         double precision,
    longitude        double precision,
    complaint_status complaint_status_type not null,
    priority         priority_type         not null,
    photo            text,
    department_id    bigint                not null,
    created_at       timestamp             not null,
    modified_at      timestamp             not null,

    constraint fk_complaint_department
        foreign key (department_id) references departments (id)
);

create index idx_complaint_department on complaints (department_id);
create index idx_complaint_status on complaints (complaint_status);
create index idx_complaint_priority on complaints (priority);
create index idx_user_email      on users (email);
create index idx_user_role       on users (role);
create index idx_user_department on users (department_id);