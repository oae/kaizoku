--------------------------------------
-- @name    Mangakatana
-- @url     https://mangakatana.com/
-- @author  mpiva
-- @license MIT
--------------------------------------




----- IMPORTS -----
Html = require("html")
Headless = require('headless')
Time = require("time")
Http = require("http")
HttpUtil = require("http_util")
--- END IMPORTS ---




----- VARIABLES -----
Client = Http.client()
Browser = Headless.browser()
Page = Browser:page()
Base = "https://mangakatana.com"
Delay = 1 -- seconds
--- END VARIABLES ---


----- MAIN -----

--- Searches for manga with given query.
-- @param query Query to search for
-- @return Table of tables with the following fields: name, url
function SearchManga(query)
    local forms = "s=" .. HttpUtil.query_escape(query) .. "&search_by=book_name";
    local request = Http.request("POST", Base, forms)
    request:header_set("Content-Type", "application/x-www-form-urlencoded")
    local result = Client:do_request(request)
    local doc = Html.parse(result.body)
    local mangas = {}

    doc:find(".text > a"):each(function (i, s)
        local manga = { name = s:text(), url = s:attr("href") }
        mangas[i+1] = manga
    end)
    return mangas
end


--- Gets the list of all manga chapters.
-- @param mangaURL URL of the manga
-- @return Table of tables with the following fields: name, url
function MangaChapters(mangaURL)
    local request = Http.request("GET", mangaURL)
    local result = Client:do_request(request)
    local doc = Html.parse(result.body)

    local chapters = {}
    local doc2 = doc:find(".uk-table"):first()
    doc2:find(".chapter > a"):each(function (i, s)
        local chapter = { name = s:text(), url = s:attr("href") }
        chapters[i+1] = chapter
    end)

    Reverse(chapters)

    return chapters
end


--- Gets the list of all pages of a chapter.
-- @param chapterURL URL of the chapter
-- @return Table of tables with the following fields: url, index
function ChapterPages(chapterURL)
    local request = Http.request("GET", chapterURL)
    local result = Client:do_request(request)
    local doc = Html.parse(result.body)
    local pages = {}
    local text= doc:find("body"):first():text()
    local v1 = text:find("thzq=")
    local v2 = text:find(";function", v1)
    local list = string.sub(text, v1+6, v2-2)
    local cnt = 0;
    for word in string.gmatch(list, '([^,]+)') do
        local p = { index = cnt, url = string.sub(word,2,word:len()-1) }
        pages[cnt + 1] = p
        cnt = cnt +1
    end

    return pages
end





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
