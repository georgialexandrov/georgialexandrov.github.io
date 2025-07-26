---
title: "AI Resistance is Just the Latest Rerun of an Old Show"
date: 2025-07-26 14:30 +0200
---

In 2007, a colleague told me that using an IDE made me a bad developer. She wrote Java in Notepad, manually indented every line, and built projects by hand. "Real developers," she insisted, "need to understand every aspect of their code." Fast forward to 2025, and I'm hearing familiar refrains about AI coding assistants. "The output is unreliable," developers tell me. "It writes code I wouldn't trust." Companies pay for Copilot licenses that sit unused, not because the tool doesn't work, but because developers either resist the change, don't see the value, or haven't learned to use them effectively.

This isn't about AI. This is about a pattern as old as technological progress itself—and more importantly, it's about how our professional identity becomes tied to our methods.

Every generation fights the new tool, convinced that shortcuts will destroy their craft. But professional value has never come from doing things the hard way—it comes from solving problems efficiently while maintaining quality. The developers who recognize this pattern early don't just survive technological shifts; they understand that their identity must evolve with their tools.

## When Methods Become Identity

I've noticed a pattern when skilled professionals resist obviously beneficial tools: sometimes our sense of professional worth becomes tied to our methods, not our outcomes. You've probably seen this—someone insists on using a specific library or language, trying to convince others it's "the best." But often "the best" reflects familiarity bias rather than rational evaluation. The same psychology applies to how we code. When I write code by hand, I'm not just solving problems—I'm demonstrating my worth, my intelligence, my craft. The AI threatens not just my productivity advantage, but my sense of professional self.

This creates a defensive feedback loop:

**Identity → Skill Pride → Tool Resistance → Skill Gap → Threatened Identity → Stronger Resistance**. 

The very resistance that feels like protecting our expertise actually prevents us from developing the skills that would truly protect our careers.

There's a familiar pattern in software development that exposes a psychological vulnerability. You've likely seen this: an experienced developer who dominated technical discussions at their previous company joins a new team and struggles to contribute at the same level. What they believed was universal technical mastery was actually context-dependent expertise—deep knowledge of specific tools and workflows rather than transferable problem-solving skills. Perhaps some AI resistance stems from a related anxiety: if AI handles the routine implementation work that currently validates our expertise, we might need to demonstrate problem-solving skills at a higher architectural level, potentially exposing the same gap between perceived and actual capabilities.

While this concern is natural, professional survival requires a kind of intentional self-transformation. We must be willing to let go of the expert we were to become the expert we need to be next. In technology, this evolution isn't a philosophical luxury—it's how we stay relevant as the tools change around us.

## The Eternal Resistance Pattern

I've seen this cycle repeat throughout my career, and the arguments never change—only the technology does. But this pattern extends far beyond software development.

Remember the shift to digital photography? For many professionals, their identity was tied to the physical craft: the smell of chemicals, manual exposure mastery, watching images appear in the darkroom. When digital cameras arrived, the resistance was fierce: "It's soulless button-pushing for amateurs—not real artists." But when photographers needed to deliver hundreds of edited photos on tight deadlines, digital photography's speed became the deciding factor.

The same applies to software development. Elegant, hand-crafted code remains valuable for core algorithms and complex business logic. However, when provided with proper context, LLMs can produce code of similar quality. For generic tasks like CRUD operations and form validation, the patterns are predictable, making them ideal for AI assistance.

Here are three cycles I've witnessed:

**Early 2000s: The Framework Wars**
When I started programming, using frameworks was considered cheating. "Real developers write everything from scratch," the purists declared. "Frameworks give you too much ready-made code—you don't understand the architecture. Plus, they make programs slower." The resistance was passionate, the adoption inevitable.

**Late 2000s: The Stack Overflow Stigma**
Stack Overflow launched in 2008, but by 2010-2011, when it had grown to industry-changing scale, we suddenly had a new crisis: "There are no real developers anymore. These kids just copy and paste code they don't understand." The fear was that easy access to solutions would create lazy developers who couldn't think for themselves.

**The Type System Resistance**
I was one of these resisters myself. For years, I insisted that TypeScript was unnecessary overhead. "Good functional code with comprehensive test coverage is way better," I'd argue. "It's native JavaScript—no transpilation needed, no build step complications." I genuinely believed that dynamic typing with proper tests was superior to any static type system.

Then I actually tried TypeScript in 2019. The revelation wasn't immediate—it came gradually as I discovered it wasn't the rigid, Java-like type system I'd imagined. TypeScript uses structural typing rather than nominal typing—it focuses on the shape of objects, not their declared types. Type inference meant I wasn't constantly declaring types. The tooling caught errors before tests even ran. Now I can't imagine going back to plain JavaScript. The very thing I resisted became essential to my workflow.

**2025: The AI Panic**
Today, I talk to friends and colleagues across the industry who refuse to touch coding assistants. Many use ChatGPT as a Stack Overflow replacement, but most dismiss AI entirely. Some treat it like fancy autocomplete, never investing in prompt engineering, let alone context engineering. "It can't handle complex tasks," they say. "Vibe coding takes longer to fix than building from scratch."

The pattern is identical. The resistance is predictable. And history tells us exactly how this ends.

## Technical Objections and Abstraction Reality

The most common resistance to AI in development isn't philosophical or about professional identity threats—it's practical. These aren't just complaints to dismiss; they reveal where human-AI collaboration is breaking down. The three main objections I hear are worth examining.

**"The Code Is Unreliable"** The issue isn't that AI writes bad code—it writes incomplete code when it's missing context. When developers complain about hallucinations, they're often describing a prompting issue, not a model flaw.

Reliability in AI output isn't a fixed trait—it's shaped by how clearly you define the problem. Bad inputs lead to bad results. Clear structure and intent lead to useful outcomes. That's not a bug; that's how collaboration works—with AI or with junior teammates.

**"It's an Unpredictable Black Box"** This is a trust issue. Developers worry about relying on code they didn't write or fully understand. But that concern is based on a false binary: either full control or blind faith.

In reality, AI collaboration operates in different modes. You choose the level of delegation—from autocomplete to implementation. Treat it like a junior engineer: provide structure, review the output, and guide as needed. You remain the architect, deciding how much to offload and when to step in.

**"This Will Lead to Skill Erosion"** This concern comes from worrying that widespread AI reliance will cause the industry to lose the ability to write code from scratch, similar to how calculators might affect mental math skills across society.

What's ironic is that developers already rely on massive abstractions they don't fully control—frameworks, garbage collectors, cloud platforms. The resistance isn't to abstraction itself—it's to unfamiliar abstraction not yet mastered. Like a surgeon who uses robotic assistance for precision but retains manual skills for emergencies, developers maintain core competencies while using AI for efficiency. Developer value doesn't disappear with AI—it moves up the abstraction stack. When AI handles routine implementation, mental energy shifts to problems that genuinely require human insight. 
Software engineering expertise evolves from keystrokes to architecture, from implementation to orchestration.

## The AI Interaction Modes

Most resistance comes from thinking AI adoption is an all-or-nothing decision. But that's a false choice.

Think back to the early days of frameworks. The developers who adopted them early didn't just save time—they learned to think differently. With boilerplate delegated to the framework, less time was spent on plumbing and more on architecture. Crucially, using a framework didn't prevent developers from dropping down to write custom, low-level code when necessary; it simply automated most of the predictable work, freeing their energy for where it mattered most.

The same compound effect is happening now with AI, only faster. When routine tasks are handled by AI, a developer naturally starts writing clearer specifications. The very act of preparing good context is an act of design, forcing a more structured implementation plan and clearer architectural thinking upfront. This leads to stronger design instincts, and feedback becomes a daily loop, not a final step.

This higher level of thinking is enabled by a toolkit of new collaborative modes. Understanding these interaction modes is the key, because it reveals that AI adoption isn't an "all-or-nothing" choice. It's about matching the right tool to the task, like a craftsman selecting the right tool from their workshop, while always remaining in control of the process.

- **Autocomplete Mode:** AI suggests completions as you type — translates your brief intent (e.g., a function name) into immediate implementation.
- **Chat Mode:** Conversational problem-solving with AI — acts as an interactive rubber duck, not just listening but helping to sharpen your logic.
- **Edit Mode:** AI modifies existing code within files — applies targeted changes directly, eliminating the friction of copy-pasting from a chat.
- **Agent Mode:** AI performs multi-step tasks with oversight — handles entire implementation loops, including debugging and self-correction.
- **Autonomous Mode:** AI implements complete features from specification — reduces setup cost for rapid prototyping with minimal human scaffolding.


This progression isn't about "worse" or "better"—it's about fit. Skeptical about reliability? Start with autocomplete. Need to explore architecture? Use chat mode. Have clear requirements? Try agent mode.

You don't lose control—you gain productivity.

The skill that makes all of this work isn't tool mastery—it's learning to collaborate systematically with AI through clear context and intent. This emerging discipline, called Context Engineering, is becoming the foundational skill for effective human-AI collaboration.

Tobi Lütke describes it as “the art of providing all the context for the task to be plausibly solvable by the LLM.”

Andrej Karpathy goes further, calling it “the delicate art and science of filling the context window with just the right information for the next step.” Not too little. Not too much. Just enough—and in the right form—to shape useful, reliable outputs.

That skill—context engineering—is what separates tooling users from true AI collaborators.

And it’s the focus of the next article.
