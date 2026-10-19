---
title: How BetterBARMM brings the records together
summary: Budget acts, bills, contracts, election results, office directories and incident reports sit on dozens of sites, in dozens of formats. Here is where each record on BetterBARMM comes from, how it is read and checked, how the pieces are joined, and what we still cannot see.
category: transparency
tags: transparency, methods, data, sources
date: 2026-10-19
author: betterbarmm
---

## The problem it solves

Almost everything BetterBARMM shows is already public. The Bangsamoro Parliament posts its bills and passes the region's budget every year as an appropriations act. COMELEC releases the canvass. Ministries post their officials, their hotlines and their Citizen's Charters. The Bangsamoro Information Office writes about all of it, every day.

Public is not the same as findable. These records sit on dozens of websites, in PDFs, in scanned pages, in press releases and in social media posts. They use different names for the same office and different spellings for the same town. A list of officials on one page may be two years older than the press release on another, and nothing on either page says so. Answering a simple question, such as who heads a ministry today and how to reach it, can mean opening ten pages and deciding which of them to believe.

BetterBARMM does that work once, in the open, and keeps doing it. It gathers the records into one place, reads them into a common shape, ties each fact to the page it came from and the date on that page, and joins the pieces so that a town, an office or a law can be followed from one record to the next.

## Where the records come from

Every record on the site starts on someone else's page. We do not collect information from people directly, and we do not publish anything we could not point a reader to.

The sources fall into five groups.

- **The Bangsamoro Government.** The Parliament's bills, resolutions and member profiles; the ministries' own websites, officials lists and Citizen's Charters; and the Bangsamoro Information Office's news releases, which are often the most recent dated record of who holds a post. The Bangsamoro Administrative Code, and the other laws Parliament has passed, tell us how each office is meant to be organised.
- **National agencies.** COMELEC's canvass for election results; the DILG's directories of local officials; the Philippine Statistics Authority's standard codes for every province, town and barangay; DBM and Commission on Audit reports; PhilGEPS, the government's procurement system, for bids and contracts; and the Official Gazette for laws as published.
- **Official documents.** Budget acts, bills, audit reports, charters and plans, usually as PDF files. Some carry their text inside them. Others are photographs of paper and have to be read before they can be searched.
- **News reports.** For Incident Watch, which counts road crashes and other incidents in the region, there is no official register to read. The records come from news outlets and the reports they carry, each one linked.
- **Open collections.** For photographs: Wikimedia Commons and other freely licensed collections, and photographs published by government offices, such as the Bangsamoro Information Office, the Department of Tourism and the National Museum.

When two kinds of source say different things, we prefer, in order: the office's own record over a report about it; a dated page over an undated one; and the newer date over the older.

## From a page to a record

Each record on the site passes through the same six steps.

{{figure:pipeline}}

**Collect.** We fetch the page or the document and keep a copy, with the address and the date we read it. Where an office publishes in a regular place, such as a news feed, a procurement system or a list of officials, we go back to it again and again rather than once.

**Read.** A web page or a PDF with text inside can be read as it is. A scanned document cannot: it is a picture of words. For those we use optical character recognition, which turns the picture back into text, and then check the result against the scan, because a misread digit in a budget line is worse than no figure at all.

**Extract.** The text is pulled into named fields: an office's head, title, phone numbers and address; a bill's number, title and status; a contract's amount, date and winning bidder. A field we cannot fill from the source stays empty. It is never filled in by guesswork.

**Match.** The same thing is often written many ways. "MILG", "Ministry of the Interior and Local Government" and "Ministry of Interior and Local Government – BARMM" are one office. A town may be spelled three ways across three documents. Each office, province, town and barangay gets one identity on the site, and every spelling found in a source is matched to it. For places we use the Philippine Statistics Authority's codes, so that a barangay in one dataset is the same barangay in another.

**Check.** Records are compared with each other. If an officials page names one minister and a newer press release names another, the newer dated record wins, and the change is kept. If two sources disagree and neither is clearly newer, the record says so rather than quietly choosing. A figure that does not add up is held back until it does.

**Publish.** The record goes up with its source and its date beside it, in a form a reader can check.

### Where AI comes in

Much of the collecting, reading and extracting is done by software, including AI tools. Scripts fetch pages and documents. AI agents search official sites for a particular record, such as an office's phone numbers or a town's official email, read long documents, and draft the fields from what they find, each with the address of the page it came from.

That makes it possible for a small team to cover a whole region, but it does not decide what gets published. The tools work under fixed rules, set out below. Every fact they return must carry a source that can be opened and read. Photographs are looked at, one by one, to confirm they show the place they claim to. Doubtful finds are flagged and set aside rather than published, and the BetterBARMM team reviews what goes up. Where an editor has confirmed an entry against its sources, the page says so and gives the date.

## The rules we follow

These rules apply to every record on the site, however it was gathered.

- **Every fact carries its source and its date.** A reader should be able to open the page we read and find the same thing there.
- **Official over unofficial, dated over undated, newer over older.** And when sources disagree, we say so.
- **No guessing.** If a source does not say who heads an office, the page says "Not named in an official source". We do not fill the gap with what is likely.
- **Old records are kept, not overwritten.** When a head of office changes, the old name moves into the office's history with its dates, so the record shows who was in charge when.
- **Emails only where an official page shows them as text.** Many government sites hide their email addresses from automated readers. We respect that: we do not decode a hidden address, rebuild one from a pattern, or recover one from a page's code.
- **No personal contacts of officials.** We publish an office's numbers and email, not a person's. Barangay officials are named, as the DILG names them, but their personal contact details are not published.
- **Photographs only where we may use them.** Freely licensed photographs, credited to their authors, and photographs published by government offices, which are not covered by copyright under the Intellectual Property Code. A photograph posted by a private person or business is used only with permission.

{{figure:record}}

## Joining the pieces

A record is most useful next to the others. BetterBARMM is built as a set of workspaces on the same foundation: Election, Legislation, Budget, Local Government and Procurement, with projects such as the Directory, Incident Watch, Crafts and Places alongside them.

Because each office, province, town and barangay has one identity across all of them, the workspaces can point to each other. An office's page in the Directory links to its budget, year by year. A town's officials sit beside its emergency numbers, its barangays and its election results. A contract in Procurement belongs to the same office whose head appears in the Directory, and an office's past heads, with their dates, can be read against its budget, so it is clear who ran the office when its money was spent.

None of this needs new information. It is the same public records, put where they can be read together.

## Keeping it current

Records go out of date. Officials are appointed and replaced, offices change their numbers, new bills are filed and old ones become law.

- **Sources are read again.** Procurement notices, news reports and officials lists are fetched again, and anything new is compared against what the site already holds.
- **Every head of office has an "as of" date.** It is the date of the newest official record that names them, so a reader can see how fresh it is.
- **Changes become history.** A replaced head moves into the office's list of past heads, with the dates the sources support. Where a source shows only that someone was in a post at a given time, the history says "at least" rather than inventing an end date.
- **Readers' corrections are checked against sources.** When someone tells us a head has changed, we look for the official record that says so before the page changes.

## What we can't see yet

The site can only be as complete as what is published, and what we are able to read.

- **Some sites block automated reading.** Several government websites sit behind security checks meant to stop bots. We do not try to get around them. Records that only appear there may be missing or out of date.
- **Some information lives only on Facebook.** Many offices and towns announce appointments, hotlines and events only on their Facebook pages, which software cannot reliably read. Those records reach the site later, if at all, unless a reader sends them in.
- **Scanned documents take longer.** Every scanned page has to be read and checked before it can be used.
- **Listings date.** A hotel or an eatery named in a 2019 listing may have closed. A list of officials may be older than it looks. Where we know a record's age, we show it.
- **Gaps are shown, not hidden.** An office with no public number says "No public number or email found". A place without a usable photograph shows a plain card that says so. A town with no seal on record shows its outline on the map.

## How you can help

If you see a number that no longer works, a head who has changed, a place we are missing or a photograph you took and are willing to share, use Contribute on any page. Send the source if you have one: a link, a document, or a post from an official page. We check it, and when it holds, the record changes and the source goes beside it.

## Sources

- Bangsamoro Information Office, official website of the Bangsamoro Autonomous Region in Muslim Mindanao, bangsamoro.gov.ph
- Bangsamoro Parliament, parliament.bangsamoro.gov.ph
- Commission on Elections, comelec.gov.ph
- Department of the Interior and Local Government, dilg.gov.ph
- Philippine Statistics Authority, Philippine Standard Geographic Code, psa.gov.ph
- Philippine Government Electronic Procurement System, philgeps.gov.ph
- Official Gazette of the Philippines, officialgazette.gov.ph
- Republic Act No. 8293, the Intellectual Property Code of the Philippines, Section 176 (works of the Government)
- Wikimedia Commons, commons.wikimedia.org
