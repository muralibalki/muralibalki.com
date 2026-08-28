---
date: 2026-08-27
---

Last time, I waxed un-lyrical about my industry keynote at [AIDB 2026](https://sites.google.com/view/aidb2026/) (still haven't been ejected for being sus). As always, but particularly today and here, opinions expressed are solely my own and do not indicate the views or opinions of my employer, or likely anyone at all.

![Mind the gap warning beside an open train door](/mind-the-gap.jpeg)

We have entered the age of AI and agents. Frontier models can plan, use tools, write code, summarize documents, compose poetry in iambic pentameter or haiku. Every day we see new [articles](https://mitsloan.mit.edu/ideas-made-to-matter/how-to-navigate-age-agentic-ai) and [posts](https://blogs.microsoft.com/blog/2025/05/19/microsoft-build-2025-the-age-of-ai-agents-and-building-the-open-agentic-web/) about it. And anyone who has used these agents can vouch for how amazing they sometimes are.

At the same time, it's clear to even the most AI-pilled among us that we aren't there yet. Some of us, to paraphrase Terry Pratchett, are being dragged kicking and screaming into the century of the agent. “It was a puzzle why things were always dragged kicking and screaming. No one ever seemed to want to, for example, lead them gently by the hand.”

It isn't because the agents aren't good. They are often existential-crisis-inducingly good. But there is a chasm - or at least a gap - between a model that sometimes-but-not-always has a capability and a product. A gap stuffed with edge cases, product constraints, user expectations that shifted since I started writing this sentence, and more. As models get better, the goalposts shift and sometimes even change shape. Users see that a model got better, or solved an Erdős problem, and expect the product to do something harder that 'obviously' should work now.

Why? The world (including the models) moved faster than the system. The capabilities are there, but reliable outcomes in products need a higher '9' of reliability, and as a result we have two stories.

| **‘Capability’ story** says        | **‘Outcomes’ story** says                          |
| ---------------------------------- | -------------------------------------------------- |
| AI can plan and use tools          | Context is *incomplete* and *changing*             |
| AI can generalize                  | Conventions are product specific and *evolving*    |
| Actions can be automated           | Authority and effects are bounded and *varying*    |
| AI trajectories produce experience | Useful feedback is *noisy*, *sparse* and *delayed* |
| Stronger AI needs smaller harnesses | Products have stable contracts                     |
| AI follows instructions            | User expectations are ill-defined and *contextual* |

Looking at all the 'dynamics' - changing, evolving, delayed. The outcomes story is about things that need to stay the same, while the things it is built on *move* - and not just move, but move in different directions and at different timescales.

So, what do we need? Not just models, not just prompts - but *systems*. We need systems that can keep doing what they were designed to do even as the things around them - users, models, expectations - change. I think that this systems gap is deeply interesting, hard to concretize, and also selfishly the thing that keeps me employed - so I have some motivation to convince others that it matters. If you are a systems researcher looking for hard problems that really matter - problems where the solution isn't just 'use a better model' - it may be fun to not just mind the gap, but embrace it! I'd warn you, though: the view down here is terrible, the problems are messy, the benchmarks don't exist, you'll spend half your time arguing about what *correct* even means and the company - the company is people like me. I'll bring snacks. Maybe.
