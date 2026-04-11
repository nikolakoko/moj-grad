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
    role          varchar(50)      not null,
    enabled       boolean          not null default false,
    user_status   varchar(50)      not null,
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
    complaint_status varchar(50)           not null,
    priority         varchar(50)           not null,
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