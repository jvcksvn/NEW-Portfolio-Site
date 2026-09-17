---
title: "The Deterministic Hangover"
slug: deterministic-hangover
date: "⟦YYYY-MM-DD⟧"
excerpt: "Fifty years of practice taught planners to deliver a number and defend it. The tools now ask them to deliver a range and be judged on it."
tags: [Uncertainty, Metrics, Planner Role]
readingTime: 2
wordCount: 388
draft: false
position: "Probabilistic planning output is discarded by organizations that still score attainment against one committed date, so changing the metric has to precede changing the system."
---

# The Deterministic Hangover

MRP produces one number. Joseph Orlicky formalized the method in 1975, and the shape of its output has not changed since: ask it what to release and when, and it returns a quantity and a date, computed from a fixed lead time and a firm demand signal, with nothing anywhere in the output admitting that either input was an estimate. That single number is the artifact fifty years of planning practice has been built around.

AI native planning tools do not return one number. They return a distribution: an eighty percent confidence band, a probability of stockout at a given coverage level, a range of arrival dates weighted by supplier history. Vendors present this as a straightforward upgrade, and mathematically it is. On the programs I planned, the system returned a single firm date for a lead time that in reality ran weeks longer and varied by supplier, and no field anywhere in the record held that uncertainty. The distribution is the honest version of what was always true.

## Where it breaks

The output changed. The organization consuming it did not. Call it the deterministic hangover.

Every downstream process still expects a scalar. The purchase order carries one date. The customer commitment carries one date. The schedule attainment metric scores against one date, and no metric in a standard planning function knows what to do with a planner who was correctly uncertain. Handing a distribution to a system that measures a point estimate does not transfer the information. It keeps the median, discards everything else, and then blames the planner when the median misses. The concession is straightforward: this is a transition cost rather than a defect, and the tools are ahead of the practice, not wrong.

## What follows

The organizations that get value from probabilistic planning first will be the ones that change a metric before they change a system, and almost nobody sequences it that way. If your planning function still scores attainment against a single committed date, the confidence band your new tool produces is rounded off before it reaches anyone who could act on it.

Fifty years of practice taught planners to deliver a number and defend it. The tools now ask them to deliver a range and be judged on it, which is a different job wearing the same title.
