---
title: "The Agent Does the Planning Now. Someone Still Has to Know When It's Wrong."
slug: agentic-planning-supervision
date: "⟦YYYY-MM-DD⟧"
excerpt: "The supervision trap: the tool removes exactly the practice that supervising the tool requires."
tags: [Automation, Adoption, Planner Role]
readingTime: 5
wordCount: 1100
draft: false
position: "Deployed agentic planning degrades the judgment needed to catch its own errors, because the organization that bought it to cut planning cost holds the authority to raise the escalation threshold."
---

# The Agent Does the Planning Now. Someone Still Has to Know When It's Wrong.

Every agentic AI pitch to a planning organization makes the same promise: the system stops recommending and starts doing. It places the releases, files the expedites, reallocates the shortage, and the planner is freed from the routine to work on what matters. Gartner put agentic AI at the front of its 2026 supply chain technology list, published in late June, describing a virtual workforce of agents that move past insight into execution. The promise is real. The freed planner is the part worth examining.

## What review actually costs

The promise assumes that reviewing a decision is cheaper than making it. In routine planning the opposite is closer to true. On the high volume vehicle programs I planned, the releases the system generated on its own still passed a human eye before commit, and the exceptions worth catching were catchable only because I had worked the routine ones the week before and knew what a normal week looked like. Judgment about a plan is built by making plans. Take the plan making away and the judgment goes with it, on a lag long enough that nobody connects the two events when it finally shows up.

## The supervision trap

This is neither new nor specific to supply chain. Lisanne Bainbridge named it in 1983, in a paper called the ironies of automation: the more a system automates, the more it depends on a human to catch the cases it cannot handle, and the less equipped that human is to catch them, because they no longer do the work that built the skill. Automate the uncontested 80 percent of releases and the planner sees only the hard 20 percent, stripped of the daily contact that made the hard ones legible in the first place. Call it the supervision trap. The tool removes exactly the practice that supervising the tool requires.

Aviation has spent forty years inside this problem. Autopilot flies the routine cruise better than a human hand, and the pilots who ride it lose the manual proficiency they need in the minutes it disengages, which is why the FAA, as far back as a 2013 safety alert, urged operators to put manual flying back into normal line operations that the automation had made technically unnecessary. A planning agent that runs the routine releases occupies the same seat. The organization has bought the autopilot and quietly assumed the pilot stays sharp.

## The human on the loop answer

The serious response from the agentic side is that this describes a design no competent vendor ships. Modern agentic planning runs on a human on the loop model. The agent acts autonomously only inside a confidence band the organization sets, escalates every ambiguous case to a planner, and writes a full decision log for the rest. The planner, in this account, is not deskilled but concentrated: pulled off the uncontested majority and pointed at exactly the decisions that need a person. The log makes every autonomous action reconstructable after the fact. Nothing is silent and nothing is unaccountable, and the workload figures the vendors publish, which should be read as best case ceilings rather than typical results, show planners carrying far more parts per head than before.

The design is right. The incentives around it are the problem. The escalation threshold is the whole game, and it is set by the same organization that bought the tool to cut planning cost. Every case escalated to a human is a planner minute the purchase was meant to remove, so the standing economic pressure runs one direction: raise the confidence band, escalate less, let the agent act on more. The log survives that pressure and stops mattering under it. A record of thousands of autonomous actions a day is reviewable by a supervisor who has been cut to one only after something has already broken, which is forensics, not supervision. The artifact exists. The attention it assumes does not.

## Where this holds and where it stops

The trap bites in proportion to the ratio of autonomous actions to human reviewers, so it is worst exactly where volume is highest and the planning bench is thinnest: high volume consumer hardware, automotive, anywhere the transaction count per planner is already high before the agent arrives. It is weakest in low volume, high mix production, in aerospace and defense and industrial capital equipment, where the release count is low enough that a planner can still meaningfully touch each one and the agent has less to take away. There is a real irony in that distribution. The environments most eager to be sold full autonomy are the ones where the supervision it strands is cheapest to lose, and the environments where losing it hurts most have the least to hand over. My own vantage is high volume vehicle planning, four years of it, which is enough to describe how routine review actually happens and not enough to say how fast true execution, as opposed to decision support with a human commit, is arriving across the high volume world. As of 2026 most deployments are still the latter.

## What follows

The check is cheap and rarely run before signing. Before an organization deploys an agent that executes rather than recommends, two numbers settle most of the risk: the escalation rate the model produces on the organization's actual parts, not the demo set, and who holds the authority to raise the confidence band after go live. When planning headcount is cut on the strength of the tool before the escalation rate is measured on real data, the supervision the design depends on is being removed before anyone has confirmed how much of it the design still needs.

A prediction, dated so it can be checked. By 2028 the axis these vendors compete on will not be how much the agent does alone but how fast a human can reconstruct why it acted, because the first well publicized shortage or overbuy traced to an autonomous release nobody could explain in time will move the market from autonomy percentage to reviewability. Autonomy is what gets sold in 2026. Reviewability is what gets bought after the first failure.

The pitch frees the planner from the routine. The routine is where the planner learned to tell a good plan from a bad one. Before you accept the first half of that trade, price the second, because the bill arrives on a lag, and it arrives as the one plan the agent got wrong that no one you kept still had the practice to catch.
