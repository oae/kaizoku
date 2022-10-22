---------------------------------
-- @name    MangaDex
-- @url     https://mangadex.org/
-- @author  alperen
-- @license MIT
---------------------------------




----- IMPORTS -----
Http = require("http")
Json = require('json')
Inspect = require('inspect')
HttpUtil = require("http_util")
Strings = require("strings")

--- END IMPORTS ---




----- VARIABLES -----
Client = Http.client()
ApiBase = "https://api.mangadex.org"
Base = "https://mangadex.org"
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
	local request = Http.request("GET",
		ApiBase ..
		"/manga?limit=100&offset=0&order[relevance]=desc&availableTranslatedLanguage[]=en&title=" ..
		HttpUtil.query_escape(query))
	local result = Client:do_request(request)
	local result_body = Json.decode(result['body'])
	local mangas = {}

	local i = 1

	for _, val in pairs(result_body['data']) do
		local title = val['attributes']['title']['en']
		local description = val['attributes']['description']['en']

		if title ~= nil then
			local id = val['id']
			local url = Base .. '/title/' .. tostring(id)
			local manga = { url = url, name = title, summary = description }

			mangas[i] = manga
			i = i + 1
		end
	end

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
	local splitResult = Strings.split(mangaURL, "title/")
	local mangaId = splitResult[#splitResult]
	local request = Http.request("GET",
		ApiBase .. "/manga/" .. mangaId .. "/feed?translatedLanguage[]=en&limit=500&offset=0&order[chapter]=asc")
	local result = Client:do_request(request)
	local result_body = Json.decode(result['body'])
	local chapters = {}

	local i = 1

	for _, val in pairs(result_body['data']) do
		local name = val['attributes']['title']

		if name == nil or name == '' then
			name = val['attributes']['chapter']
		end

		if name ~= nil then
			local id = val['id']
			local url = Base .. '/chapter/' .. tostring(id)
			local chapter = { url = url, name = name, chapter = val['attributes']['chapter'] }

			chapters[i] = chapter
			i = i + 1
		end
	end

	-- table.sort(chapters, function(a, b) return tonumber(a['chapter']) < tonumber(b['chapter']) end)

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
	local splitResult = Strings.split(chapterURL, "chapter/")
	local chapterId = splitResult[#splitResult]
	local request = Http.request("GET", ApiBase .. "/at-home/server/" .. chapterId)
	local result = Client:do_request(request)
	local result_body = Json.decode(result['body'])
	local pages = {}

	local i = 1

	for _, val in pairs(result_body['chapter']['data']) do

		local page = { index = i, url = result_body['baseUrl'] .. "/data/" .. result_body['chapter']['hash'] .. "/" .. val }
		pages[i] = page
		i = i + 1
	end

	return pages
end

--- END MAIN ---




----- HELPERS -----
--- END HELPERS ---

-- ex: ts=4 sw=4 et filetype=lua
