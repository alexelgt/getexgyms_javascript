# **Get EX gyms (JavaScript)**

**Updated with new changes from October 10th, 2019.**

Instructions to use this website will be included soon.

## **Index**
* [How to get GeoJSON files](#how-to-get-geojson-files)
    * [EX areas query](#ex-areas-query)
    * [Exclusion areas query](#exclusion-areas-query)
* [References](#references)

# **How to get GeoJSON files**
To get each file you'll have to run a specific query in the website overpass-turbo.eu. In the folder _overpass-turbo_queries_ of this repo there are 2 txt files with the queries for EX and exclusion areas but you can also use the following links:

## **EX areas query**
Query: https://overpass-turbo.eu/s/N3E

Run the query and then download (export) as a GeoJSON file.

*Note: this is a modified version of the query found in reference 3 (by reddit user /u/Tntnnbltn).*

## **Exclusion areas query**
Query: https://overpass-turbo.eu/s/N3G

Run the query and then download (export) as a GeoJSON file.

*Note: this is a modified version of the query found in reference 4 (by reddit user /u/Tntnnbltn).*

*Note 2: if you check reference 5, in that post from reddit user u/NicoisLost it's included a query that happens to be the same as mine. I came across that reddit post after doing this project (while checking for references that might help anyone). In any case I think is worth mentioning him and the work he has done.*

# **References**

[1] [GitHub - Daplie/s2-geometry.js](https://github.com/Daplie/s2-geometry.js/)
* [1.1] [GitHub - jonatkins/s2-geometry-javascript](https://github.com/jonatkins/s2-geometry-javascript)

[2] [GitHub - Turfjs/turf](https://github.com/Turfjs/turf)

[3] [How to determine which gyms are eligible from EX Raids: Findings from a worldwide analysis of 1000+ EX Raid locations](https://www.reddit.com/r/TheSilphRoad/comments/7ojuoi/how_to_determine_which_gyms_are_eligible_from_ex/)

[4] [The Death of New EX Raid Eligible Gyms: Changes to Niantic’s EX Eligibility Detection System since July 2018.](https://www.reddit.com/r/TheSilphRoad/comments/akcel3/the_death_of_new_ex_raid_eligible_gyms_changes_to/)

[5] [New evidence on tag-blocked park gyms](https://www.reddit.com/r/TheSilphRoad/comments/9iie5g/new_evidence_on_tagblocked_park_gyms/)