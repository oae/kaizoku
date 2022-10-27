update "Manga" set interval = '0 0 * * *' where interval = 'daily';
update "Manga" set interval = '0 * * * *' where interval = 'hourly';
update "Manga" set interval = '0 0 * * 7' where interval = 'weekly';