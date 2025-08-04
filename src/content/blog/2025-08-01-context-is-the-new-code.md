---
title: "Context is the New Code"
date: 2025-08-01 11:13 +0200
---

"Learning to use AI well is an unobvious skill," Shopify CEO Tobi Lütke wrote in his [now-famous memo](https://x.com/tobi/status/1909251946235437514) to employees. "My sense is that a lot of people give up after writing a prompt and not getting the ideal thing back immediately."

Lütke wasn't just talking about productivity—he was describing a fundamental shift happening across the industry. In April 2025, he told his 8,000+ employees that before asking for any new hires, teams must first prove AI can't do the job. But what exactly is this "unobvious skill" that separates successful AI adoption from expensive license waste?

The answer lies in understanding that the problem was never about only finding the right prompt—it was about providing the right context. Context engineering is emerging as the foundational skill that transforms unreliable AI experiments into systematic development practices.

## The Manual Problem

Working with AI without proper context feels like trying to assemble IKEA furniture without instructions. You have all the right pieces, but you waste hours guessing which screw goes where, how parts connect, and what the final result should look like. Sometimes you might manage to build a working result from the first try, but you could also end up with furniture that wobbles and falls apart under pressure.

Most developers approach AI exactly this way. They write a prompt, get a mediocre result, tweak the wording, try again, get frustrated, and conclude that AI "doesn't work for complex tasks." Meanwhile, teams that understand context engineering are building production systems that work reliably.

What's interesting is that LLMs weren't designed for how we actually use them. When OpenAI released GPT-3 in 2020, prompt engineering emerged organically as users discovered through trial and error that certain phrases worked better than others. "Let's think step by step" improved reasoning. "You are an expert in..." activated domain knowledge. These weren't documented features—they were user discoveries about system behavior that eventually influenced how OpenAI designed ChatGPT's conversational interface two years later in 2022.

By February 2025, Andrej Karpathy was coining terms like "vibe coding" to describe developers who trust AI suggestions wholesale rather than carefully reviewing output. Karpathy helped build these systems, yet was still discovering usage patterns years later. This shows how effective AI collaboration patterns aren't designed by creators—they're discovered through real-world application.

But we've moved beyond discovery into systematic practice. Industry leaders realized that reliable AI output requires more than better prompts—it requires engineering the entire context that shapes AI understanding. As Andrej Karpathy later described it, context engineering is "the delicate art and science of filling the context window with just the right information for the next step."

## Building Shared Understanding

Creating shared understanding between humans and machines presents a unique challenge. When you work with an experienced developer, you don't explain your entire codebase with every request. You rely on accumulated context: they know project goals, understand the architecture, and are familiar with coding standards.

Current LLMs are stateless pure functions—they keep no context and every conversation starts from zero unless you explicitly engineer that shared context. This is why expensive Copilot licenses sit unused while teams complain about inconsistent results. They're treating AI like magic autocomplete instead of a collaborator that needs proper onboarding. But context engineering has precision requirements too—over-contextualizing can overwhelm AI systems and lead to worse outcomes, as Karpathy noted when describing the need for "just the right information."

Creating a shared vocabulary that works for business stakeholders, developers, and AI systems simultaneously requires systematic approaches. We need a way to define software that is easy to understand by all stakeholders—including our newest stakeholder, the LLM.

Domain-driven design provides exactly this structured approach to capturing business knowledge in forms that both humans and AI can understand. DDD uses "ubiquitous language" where the same terms flow from business requirements through code implementation, eliminating the linguistic chaos where business says "customers," databases show "users," code refers to "accounts," and documentation mentions "clients."

This linguistic alignment eliminates translation overhead and creates clearer context for AI systems. Since LLMs are trained on vast amounts of text including DDD concepts, they understand this approach naturally.

Having this shared understanding is why DDD became popular over the past decades, but now we can reuse it in a new, more powerful way—by using it to create better specifications for our coding assistants. Change management can be presented as a specification for the change, and this specification using DDD becomes easier to understand by every stakeholder. When business requirements flow through domain language into technical specifications, AI systems can interpret and act on these requirements more reliably.

Specification-driven development represents the systematic evolution of this approach. Rather than the traditional cycle of vague requirements leading to misunderstood implementations, specifications become living documents that maintain connection between business goals and technical execution.

But what is the difference between specifications and documentation? Context engineering operates differently from traditional documentation. Documentation is written for humans to read and understand. Context engineering designs information for both humans and AI to act upon systematically. The same knowledge needs to be structured to support reliable automated interpretation while remaining comprehensible to human collaborators.

## Systematic Context Architecture

Context engineering operates at multiple levels simultaneously, each serving different purposes in creating reliable AI collaboration. The same domain knowledge needs to be expressed differently depending on who—or what—is consuming it.

Consider a simple user preference feature, expressed from different perspectives:

- **Functional Context**: "User can save display preferences that persist across sessions"
- **QA Context**: "Preferences survive browser restarts, handle malformed data gracefully, and provide clear error messages for edge cases"
- **UI/UX Context**: "Settings panel with immediate visual feedback, accessible keyboard navigation, and intuitive grouping of related options"
- **Architecture Context**: "Preference service with Redis caching layer, event-driven updates to dependent components, and consistent API patterns"
- **Development Context**: "REST endpoints for CRUD operations, validation schemas, and database migration scripts"

Same business capability, but five different context engineering challenges. Each perspective requires different levels of detail, different vocabulary, and different success criteria. When these context layers align and reinforce each other, they create coherent understanding across the entire system.

This multi-perspective approach reveals why traditional documentation often fails AI collaboration. Documents written for human consumption typically blend these perspectives inconsistently, making it difficult for AI to understand which context applies when. Systematic context engineering separates these concerns while maintaining their connections.

Project-level context establishes the foundation—what the software does, core architectural patterns, and technology choices. Domain-level context provides vocabulary through business concepts, rules, and constraints. Compliance-level context ensures organizational standards around security, performance, and regulatory requirements flow through every AI interaction. Module-level context defines component responsibilities and dependencies, while task-level context provides immediate guidance for current work.

Combining all these layers creates compound effects that extend far beyond individual productivity gains. Context flows systematically from strategic business goals down to implementation details, with each layer informing and constraining the others. In practice, teams are developing concrete techniques to manage this complexity—from structured rules files that define context inheritance patterns to context templates that ensure consistency across AI interactions. The most advanced teams are experimenting with development environments that automatically surface relevant context based on the current task, making context engineering reliable and repeatable.


## The Strategic Transformation

Context engineering doesn't just improve AI output—it improves human output too. When you invest in proper context engineering, you're forced to articulate previously implicit knowledge. Architecture decisions get documented. Domain understanding gets captured. Patterns get formalized.

The compound effect works through a simple feedback loop: better context leads to better AI output. This reduces cognitive load on humans, which frees mental energy for higher-level thinking. That higher-level thinking leads to better context engineering, and the cycle continues. Teams that master this cycle see productivity gains that compound over time.

Having well-structured context gives you more time to explore aspects of development that were previously neglected. Instead of spending hours on routine implementation, you can focus on architecture, optimization, and innovation. The AI handles the predictable work while you tackle the problems that genuinely require human insight.

This transformation extends beyond individual productivity. Context architecture becomes organizational memory. New team members can understand complex systems faster because the context captures not just what the code does, but why decisions were made. Knowledge transfer happens through structured context rather than tribal wisdom.

Consider the maintenance impact: with systematic context engineering, updating for new requirements or technology changes becomes significantly cheaper. When context is machine-readable and well-structured, you can adapt implementations for new frameworks or compliance requirements by updating the context and regenerating code. This autonomous refactoring potential could dramatically reduce the cost of technical evolution and keeping systems up to date.

We're moving toward a world where context engineering becomes as fundamental as version control or testing. This transition requires systematic approaches and proper tooling—from structured rules files to integration patterns that expose different context layers. Organizations that treat context as a strategic asset and engineer the conditions for reliable AI collaboration will move faster and maintain higher quality standards, while those hoping AI will guess correctly often end up with expensive license waste. Context engineering represents the maturation from experimental AI usage to systematic practice.


Moving from theory to practice raises an obvious question: how do you actually build context systems that work reliably? The next article in this series explores the concrete techniques and tools that make context engineering systematic rather than ad-hoc—from better rules files to practical workflows that let context flow naturally through your development process.