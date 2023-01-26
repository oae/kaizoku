------------------------------------
-- @name    Mangasee
-- @url     https://mangasee123.com/
-- @author  alperen
-- @license MIT
------------------------------------




----- IMPORTS -----
Html = require("html")
Http = require("http")
HttpUtil = require("http_util")
Inspect = require('inspect')
Headless = require("headless")
Strings = require("strings")
Regexp = require("regexp")
--- END IMPORTS ---




----- VARIABLES -----
Client = Http.client()
Browser = Headless.browser()
Base = "https://mangasee123.com"
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
	local page = Browser:page()
	page:navigate(Base .. "/search/?name=" .. HttpUtil.query_escape(query))
	page:waitLoad()
  while page:has('button[ng-click="vm.NextPage()"]') == true do
    page:element('button[ng-click="vm.NextPage()"]'):click()
  end


	local doc = Html.parse(page:html())
	local mangas = {}

	doc:find(".top-15.ng-scope"):each(function(i, s)
		local manga = { name = s:find('.SeriesName[ng-bind-html="Series.s"]'):first():text(),
			url = Base .. s:find('.SeriesName[ng-bind-html="Series.s"]'):first():attr("href") }
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
	local page = Browser:page()
	page:navigate(mangaURL)
	page:waitLoad()
	if page:has('.ShowAllChapters') == true then
		page:element('.ShowAllChapters'):click()
	end

	local doc = Html.parse(page:html())

	local chapters = {}

	doc:find(".ChapterLink"):each(function(i, s)
		local name = s:find('span'):first():text()
		name = Strings.trim(name:gsub("[\r\t\n]+", " "), " ")
		local chapter = { name = name, url = Base .. s:attr("href") }
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
	local page = Browser:page()
	page:navigate(chapterURL)
	page:waitLoad()
	page:element('.DesktopNav > div > div:nth-child(4) > button'):click()
	local doc = Html.parse(page:html())

	local pages = {}

	local images = {}
	doc:find('.img-fluid'):each(function(i, s)
		images[i+1] = tostring(s:attr('src'))
	end)

	local modal = doc:find("#PageModal"):first()
	modal:find('button[ng-click="vm.GoToPage(Page)"]'):each(function(i, s)

		local index = tonumber(Strings.trim(s:text():gsub("[\r\t\n]+", " "), " "))
		if index ~= nil then
			local chapterPage = { index = index, url = images[index] }
			pages[index] = chapterPage
		end
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
