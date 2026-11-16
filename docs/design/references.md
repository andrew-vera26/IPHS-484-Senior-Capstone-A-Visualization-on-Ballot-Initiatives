# Design references

Researched November 15, 2026 from each site's own descriptive pages. The descriptions below come from page text, not from looking at the interfaces. **Open each one yourself before relying on it.** None of these is to be copied. The point is to borrow ideas.

## 1. Constitute (constituteproject.org)
Built by the Comparative Constitutions Project. Passages of the world's constitutions are tagged with 300+ topics. Users search by topic, filter by region and period, and read in a List view or a **Compare view that puts two constitutions side by side**. Excerpts can be pinned and exported to Google Docs, PDF or CSV. Every search, comparison and provision has a deep link.
- Closest match to what we are building: tagged legal text, side by side.
- Borrow: topic tags as a way in, deep links to a single provision, pinning and export.
- Avoid: a search-first design. Ours should let the eye find hot spots before any search.

## 2. V-Dem Graphing Tools (v-dem.net/graphingtools.html)
Expert-coded democracy indicators, shown through many views: map, line graph, radar, scatter, **heat map**, regional and thematic comparison between two years.
- Borrow: the idea of several views over one dataset, and a before-and-after comparison between two points in time. This maps onto comparing a law before and after an amending bill.
- Avoid: a menu of a dozen chart types. We need one primary view done very well.

## 3. Voteview (voteview.com)
UCLA's tool for every congressional roll call vote in history, shown on a US map and on an ideological map of legislators. Search and download tools are included.
- Borrow: one spatial picture that makes a whole dataset legible at a glance, with every point clickable down to the underlying record.
- Avoid: abstract scaling that readers must trust. Our encodings should be readable without a methods paper.

## 4. Comparative Agendas Project (comparativeagendas.net)
Policy activity coded into 20 major topics and 200+ subtopics, with a Trends Tool for graphing coded series over time for one country or several.
- Borrow: a coded dataset that non-specialists can explore, and an honest codebook linked from the tool.
- Avoid: a codebook that readers must leave the tool to understand.

## 5. Juxta Commons (digital humanities text collation)
A tool for comparing versions of a text. It offers three views: a **heat map** that overlays the texts and colors differences, a **side-by-side view with lines connecting points of difference**, and a **histogram** showing which portions changed most.
- Borrow: the heat map as the first view, with the histogram idea as an at-a-glance summary of where change concentrated. This is closest to the Frankenstein Variorum approach.
- Caution: the page describes a 2013 poster abstract. Check juxtasoftware.org for whether the tool is still available.

## Bonus: Legislative Influence Detector (DSSG fellowship)
Finds text reused between state bills and model legislation. Results appear side by side with matching passages highlighted.
- Borrow: highlighted overlap between two legal texts.
- Caution: the page is a project writeup from about 2015 to 2018, and I could not confirm the live tool still works.

## What these suggest for our site
- Lead with an at-a-glance picture (heat map or strip), with detail one click away.
- Make the side-by-side comparison of two legal texts the core reading view.
- Give every provision a stable link.
- Keep the codebook one click from every coded value.
- Show how change concentrates, not only whether it occurred.

## Notes added during the build
(Fable or any later model records here what was actually borrowed.)
