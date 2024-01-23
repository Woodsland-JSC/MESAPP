select * from WOODSLAND."@G_SAY2"
select * from WOODSLAND_TEST."@G_SAY1"

insert into WOODSLAND_UAT2024."@G_SAY4"
select * from WOODSLAND."@G_SAY4"

alter table WOODSLAND_UAT2."@G_SAY1"
add U_Alias varchar(255) NULL;

ALTER TABLE "WOODSLAND_UAT2"."@G_SAY1"
ADD ("U_Alias" VARCHAR(255) NULL);

delete from WOODSLAND_UAT2024."@G_SAY4"