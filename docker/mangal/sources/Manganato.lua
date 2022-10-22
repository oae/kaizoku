----------------------------------
-- @name    Manganato
-- @url     https://manganato.com/
-- @author  alperen
-- @license MIT
----------------------------------




----- IMPORTS -----
Html = require("html")
Http = require("http")
HttpUtil = require("http_util")
Inspect = require('inspect')
--- END IMPORTS ---




----- VARIABLES -----
Client = Http.client()
Base = "https://readmanganato.com/"
--- END VARIABLES ---



----- MAIN -----

--- Searches for manga with given query.
--[[
Manga fields:
	name - string, required
 	url - string, required
	author - string, optional
	genres - string (multiple genres are divided by comma ','), optional
	summary - string, optional
--]]
-- @param query Query to search for
-- @return Table of mangas
function SearchManga(query)
	local request = Http.request("GET", Base .. "/search/story/" .. query:gsub(" ", "_"))
	local result = Client:do_request(request)

	local doc = Html.parse(result.body)
	local mangas = {}

	doc:find(".search-story-item"):each(function(i, s)
		local manga = { name = s:find('.item-title'):first():text(), url = s:find('.item-img'):first():attr("href") }
		mangas[i + 1] = manga
	end)

	return mangas
end

--- Gets the list of all manga chapters.
--[[
Chapter fields:
	name - string, required
	url - string, required
	volume - string, optional
	manga_summary - string, optional (in case you can't get it from search page)
	manga_author - string, optional 
	manga_genres - string (multiple genres are divided by comma ','), optional
--]]
-- @param mangaURL URL of the manga
-- @return Table of chapters
function MangaChapters(mangaURL)
	local request = Http.request("GET", mangaURL)
	local result = Client:do_request(request)
	local doc = Html.parse(result.body)

	local chapters = {}

	doc:find(".chapter-name"):each(function(i, s)
		local chapter = { name = s:text(), url = s:attr("href") }
		chapters[i + 1] = chapter
	end)

	Reverse(chapters)

	return chapters
end

--- Gets the list of all pages of a chapter.
--[[
Page fields:
	url - string, required
	index - uint, required
--]]
-- @param chapterURL URL of the chapter
-- @return Table of pages
function ChapterPages(chapterURL)
	local request = Http.request("GET", chapterURL)
	local result = Client:do_request(request)
	local doc = Html.parse(result.body)

	local pages = {}

	doc:find(".container-chapter-reader img"):each(function(i, s)
		local page = { index = i, url = s:attr("src") }
		pages[i + 1] = page
	end)

	return pages
end

--- END MAIN ---


----- HELPERS -----
function Reverse(t)
	local n = #t
	local i = 1
	while i < n do
		t[i], t[n] = t[n], t[i]
		i = i + 1
		n = n - 1
	end
end

--- END HELPERS ---

-- ex: ts=4 sw=4 et filetype=lua
