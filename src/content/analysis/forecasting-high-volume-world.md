---
title: "The Forecasting AI Narrative Was Written by the High Volume World"
slug: forecasting-high-volume-world
date: "⟦YYYY-MM-DD⟧"
excerpt: "Data starvation: a model does not learn a demand pattern from a part. It learns from the number of times that part has been demanded."
tags: [Uncertainty, Demand Signal]
readingTime: 4
wordCount: 931
draft: false
position: "The published accuracy gains from machine learning demand models do not transfer to production parts in high mix, low volume manufacturing, because the observation count per part is too low for the methods to apply."
---

# The Forecasting AI Narrative Was Written by the High Volume World

Demand forecasting is the most heavily marketed application of AI in supply chain, and the case for it is genuinely strong. Models trained on point of sale data, weather, promotions, and web traffic beat the statistical baselines most companies still run on. Nearly all of the published evidence for that comes from consumer goods, grocery, and high volume automotive. Almost none of it comes from anywhere else.

## Where the evidence comes from

The evidence has a shape. The most rigorous public benchmark in the field, the M5 forecasting competition run by Spyros Makridakis and colleagues with results published between 2020 and 2022, ran on Walmart retail data: tens of thousands of items, several years of daily history. Machine learning methods, gradient boosted trees in particular, beat the classical statistical baselines that had held the field for decades. That is a real result and worth having. It is also a result about a particular data regime, and every case study in its class shares the same shape: thousands of items, noisy but continuous demand, a dense record to learn from. Notice what the dataset is not. It is not a catalog of engineered parts ordered a handful of times a year against a schedule that keeps changing, and no public benchmark of that second kind carries anything like the same authority, because none of the size and rigor exists.

It is also a result the vendors selling into every other regime rarely qualify. When a platform markets a 30 percent inventory reduction, that figure is a marketing ceiling drawn from the friendliest deployment in the friendliest dataset, not a median outcome. Nobody publishes the median outcome.

## The data starves

Call it data starvation. A forecasting model does not learn a demand pattern from a part. It learns from the number of times that part has been demanded. On the high volume vehicle demand I planned, the history was dense enough that the models had something real to learn, and that is the world the narrative was written in. Move the same model onto a part demanded eleven times in six years, in quantities between two and forty, driven by a customer release schedule that is itself revised quarterly, and most of the mathematics simply stops applying. The interface gives no indication of the difference.

Weather forecasting works because the station has a hundred years of records. Install a station in April and ask it about August, and it will still return a number, formatted identically, carrying none of the same meaning. That is the position a demand sensing model occupies on an aerospace part number, and nothing in the output tells the planner which of the two situations they are holding. The failure is not that the model is inaccurate. It is that the model is confidently inaccurate in a format indistinguishable from the case where it works.

## The strongest version of the other side

The serious answer to this is not more data, because there is no more data. It is hierarchical and transfer methods: forecast at the platform or commodity family level where the observation count is adequate, then disaggregate; borrow structure from parts with similar demand drivers; feed the model the customer's own release schedule rather than inferring demand from history at all. Several vendors have shipped versions of this since roughly 2024, and in aggregate planning it works.

The answer is real, and it is narrower than it sounds. Aggregate forecasts are consumed by sales and operations planning, which sets capacity and revenue expectations. MRP is consumed by purchasing, and it runs on the individual part number. A family level forecast that is 90 percent accurate can still be wrong on every individual member of the family, and the purchase release is written against the member, not the family. The gap between those two facts is where the expedite budget lives.

## Where this holds and where it stops

The claim is bounded to production parts in high mix, low volume manufacturing with engineered configurations and long lead times: aerospace structures, defense, industrial capital equipment, medical devices in the same profile. It does not extend to the aftermarket, where spares demand across a large installed fleet is often dense enough to behave like the consumer case, and it does not extend to raw material and commodity buys, which aggregate cleanly. My vantage is the high volume side, four years of it, where the data was dense enough that the models earned their keep. That is enough to describe why they starve on thin data and not a claim to have run them there myself.

## What follows

The check is available to anyone who wants to run it before a purchase decision. Pull the twenty part numbers that drove the most expedite cost last year, count the historical orders on each, and take that count to the vendor's technical team rather than the sales team. Ask what the minimum observation count is for the accuracy figure in the deck, and ask what the model returns below it.

A prediction, dated so it can be checked. By 2028 the platforms selling into low volume manufacturing will market on data efficiency and on how the model behaves when it is starved, rather than on headline accuracy, because accuracy is the wrong axis in that regime and the buyers are working that out.

The forecasting narrative is true where it was written. The question is what it costs to import a true story from a place that does not look like yours.
