var e={id:`agentic`,h:{en:`Agentic AI: tools, planning, loops and MCP-style tool access`,hi:`Agentic AI: tools, planning, loops aur MCP-style tool access`},body:{en:`
<p>A consultant on the phone can tell you which cable to check. A contractor with the building keys can walk in, check the cable and replace it. A chat assistant is the consultant; an <b>AI agent</b> is the contractor. It does not just answer: it decides on a sequence of steps, uses tools to gather data and make changes, looks at the results, and keeps going until the goal is reached or something stops it. Giving an AI the keys is exactly why this chapter and the next two belong together.</p>

<h3>What makes AI "agentic"</h3>
<ul>
<li><b>A goal</b> rather than a single question: "find out why Pune users cannot reach the ERP and propose a fix".</li>
<li><b>Tools</b> it can call: run a show command, query the monitoring system, read the source of truth, open a ticket, push a config.</li>
<li><b>Planning</b>: breaking the goal into steps and choosing which tool to use next.</li>
<li><b>A loop</b>: act, observe the result, update the plan, repeat.</li>
<li><b>Memory</b> of what it has done so far in this task (kept in the context window or an external store).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Agent loop: plan, act with a tool, observe, decide">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="14">Goal</text>
<rect x="60" y="90" width="140" height="44" rx="8" fill="#bae6fd"/><text x="130" y="117" text-anchor="middle" class="svg-ink" font-size="14">Plan / reason</text>
<rect x="250" y="90" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">Act: call a tool</text>
<rect x="440" y="90" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="510" y="117" text-anchor="middle" class="svg-ink" font-size="14">Observe result</text>
<rect x="250" y="175" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="14">Done or stop?</text>
<line x1="320" y1="54" x2="130" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="112" x2="250" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="112" x2="440" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="134" x2="390" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="190" x2="130" y2="134" stroke="#64748b" stroke-width="2"/>
<text x="150" y="172" class="svg-muted" font-size="12">not done: loop</text>
</svg><p class="cap">The agent loops until the goal is met, a guardrail stops it, or a human says stop.</p></div>

<h3>How tool calling works</h3>
<p>The model itself cannot SSH anywhere. The application around it (the <b>host</b> or agent framework) describes the available tools to the model: a name, a description and the parameters, usually as a JSON schema. When the model decides a tool is needed, it outputs a structured <b>tool call</b>. The host checks it, runs the real code, and puts the result back into the context window. The model reads the result and decides the next step.</p>
<pre class="code"><span class="c">! a read-only tool, described to the model (JSON)</span>
{ "name": "run_show_command",
  "description": "Run a read-only show command on a network device",
  "input_schema": { "type": "object",
    "properties": { "device":  { "type": "string" },
                    "command": { "type": "string", "pattern": "^show " } },
    "required": ["device", "command"] } }

<span class="c">! what the model emits when it wants to use it</span>
{ "tool": "run_show_command",
  "input": { "device": "CORE", "command": "show ip ospf neighbor" } }</pre>
<p>Look at the <code>"pattern": "^show "</code> line: the tool itself only accepts commands that start with "show". That is a guardrail built into the tool, not a polite request in a prompt. Safety that lives in code is far stronger than safety that lives in words.</p>

<h3>MCP: a standard plug for tools</h3>
<p>Every AI application used to invent its own way of connecting to tools. The <b>Model Context Protocol (MCP)</b> is an open standard that defines one way. An <b>MCP server</b> exposes tools (actions), resources (data to read) and prompts for a system, for example your monitoring platform, your source of truth or a read-only device gateway. An <b>MCP client</b> inside the AI application discovers what the server offers and calls it. Think of it as a universal adapter: build one MCP server for your network inventory, and any MCP-capable assistant can use it, with the permissions that server allows. A later automation module builds one that exposes show commands as tools; at CCNA level you only need the concept.</p>
<table class="cmp"><tr><th>Tool type</th><th>Examples</th><th>Risk</th><th>Default policy</th></tr>
<tr><td><b>Read</b></td><td>show commands, telemetry queries, inventory lookup, ticket search</td><td>Low (but can leak data)</td><td>Allowed, logged</td></tr>
<tr><td><b>Write</b></td><td>push config, shut/no shut, clear a process, close a ticket</td><td>High</td><td>Human approval, scope limits, change window</td></tr>
</table>

<div class="eg"><p><b>Worked example: an agent trace.</b> Goal: "Pune users cannot reach 10.30.30.50". A well-behaved agent: (1) calls <code>run_show_command(PUNE-EDGE, "show ip interface brief")</code> and sees the users' port administratively down; (2) calls <code>run_show_command(CORE, "show ip ospf neighbor")</code> and sees DC stuck in EXSTART; (3) proposes two steps: "no shutdown on Gi0/2" and a fix for OSPF; (4) stops and asks for approval because both are write actions. A badly designed agent with write access and no guardrails might execute "clear ip ospf process" on CORE at step 3, drop every adjacency on CORE for a few seconds, and still not fix the problem.</p></div>

<h3>Levels of autonomy</h3>
<ol>
<li><b>Suggest only</b>: the agent investigates with read tools and writes a plan. Humans do everything else.</li>
<li><b>Human-approved actions</b>: the agent may execute, but every write step needs an explicit "yes" (human-in-the-loop).</li>
<li><b>Autonomous within policy</b>: pre-approved low-risk actions run automatically (for example re-enabling an err-disabled access port after the cause is cleared), everything else needs approval. This is often called <b>closed-loop</b> automation.</li>
</ol>
<p>Organisations move up these levels slowly, per action type, as evidence builds that the agent is reliable.</p>

<div class="warn"><p><b>Common mistakes.</b> Giving an agent one admin account for everything. Relying on a prompt ("please do not reload") instead of tool-level restrictions. Letting an agent loop without a step or change limit. Forgetting that tool results (log lines, ticket text) are untrusted input that can contain instructions (prompt injection, chapter 9).</p></div>
<div class="exam"><p><b>Exam trap.</b> Generative AI produces content; agentic AI plans and <b>executes actions through tools</b>. The LLM does not run commands itself; the host runs tool calls. MCP standardises how AI applications connect to tools and data; it does not make a tool safe by itself.</p></div>

<div class="scn"><h4>The agent that kept trying</h4><p>A pilot agent was allowed to "restore connectivity" for branch VPN tunnels. One night a provider outage took down the internet link at a branch. The agent saw the tunnel down, bounced the tunnel interface, saw it still down, cleared the crypto sessions, bounced again, and repeated for 40 minutes, filling the logs and resetting the other healthy tunnel on the same router several times. There was no change budget and no rule to stop when the underlying link was down.</p><p><b>Lesson:</b> agents need a maximum number of actions, a check of the preconditions, and a rule to stop and hand over to a human when the fix does not work.</p></div>

<div class="iv"><p class="q">"What is an AI agent, and how is it different from a chatbot?"</p><p>Strong answer: a chatbot answers a prompt with generated text; an agent works towards a goal by planning steps, calling tools (show commands, APIs, ticketing) through a host application, observing the results and looping. Explain tool calling with a schema, mention MCP as a standard way to expose tools and data to AI applications, and distinguish read tools from write tools. Finish with the controls: least privilege, approval for writes, scope and change limits, audit logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An agent has a goal, tools, a plan and a loop: act, observe, decide, repeat.</li>
<li>The model emits structured tool calls; the host application executes them and returns results.</li>
<li>MCP is an open standard for exposing tools, resources and prompts to AI applications through servers.</li>
<li>Separate read tools from write tools; enforce limits in code, not only in prompts.</li>
<li>Autonomy grows in stages: suggest only, human-approved, autonomous within policy.</li>
</ul></div>
`,hi:`
<p>Phone par consultant aapko bata sakta hai ki kaunsa cable check karo. Building ki chaabiyon wala contractor andar aakar cable check karke badal sakta hai. Chat assistant consultant hai; <b>AI agent</b> contractor hai. Woh sirf jawab nahi deta: steps ka sequence decide karta hai, data jama karne aur changes karne ke liye tools use karta hai, results dekhta hai, aur tab tak chalta rehta hai jab tak goal poora na ho ya koi use rok na de. AI ko chaabiyan dena hi wajah hai ki yeh chapter aur agle do saath hain.</p>

<h3>AI ko "agentic" kya banata hai</h3>
<ul>
<li>Ek sawaal ki jagah <b>ek goal</b>: "pata karo Pune users ERP tak kyun nahi pahunch pa rahe aur fix propose karo".</li>
<li><b>Tools</b> jinhe woh call kar sakta hai: show command chalana, monitoring system query karna, source of truth padhna, ticket kholna, config push karna.</li>
<li><b>Planning</b>: goal ko steps mein todna aur chunna ki agla kaunsa tool use ho.</li>
<li><b>Ek loop</b>: act karo, result dekho, plan update karo, repeat.</li>
<li>Is task mein ab tak kya kiya uski <b>memory</b> (context window ya external store mein).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Agent loop: plan, tool se act, observe, decide">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="14">Goal</text>
<rect x="60" y="90" width="140" height="44" rx="8" fill="#bae6fd"/><text x="130" y="117" text-anchor="middle" class="svg-ink" font-size="14">Plan / reason</text>
<rect x="250" y="90" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">Act: tool call</text>
<rect x="440" y="90" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="510" y="117" text-anchor="middle" class="svg-ink" font-size="14">Result dekho</text>
<rect x="250" y="175" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="14">Done ya stop?</text>
<line x1="320" y1="54" x2="130" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="112" x2="250" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="112" x2="440" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="134" x2="390" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="190" x2="130" y2="134" stroke="#64748b" stroke-width="2"/>
<text x="150" y="172" class="svg-muted" font-size="12">done nahi: loop</text>
</svg><p class="cap">Agent tab tak loop karta hai jab tak goal poora na ho, guardrail na roke, ya insaan stop na bole.</p></div>

<h3>Tool calling kaise kaam karta hai</h3>
<p>Model khud kahin SSH nahi kar sakta. Uske aas-paas ki application (<b>host</b> ya agent framework) model ko available tools describe karti hai: naam, description aur parameters, aam taur par JSON schema ke roop mein. Jab model decide karta hai ki tool chahiye, woh ek structured <b>tool call</b> output karta hai. Host use check karta hai, real code chalata hai, aur result wapas context window mein daalta hai. Model result padhta hai aur agla step decide karta hai.</p>
<pre class="code"><span class="c">! ek read-only tool, model ko describe kiya gaya (JSON)</span>
{ "name": "run_show_command",
  "description": "Run a read-only show command on a network device",
  "input_schema": { "type": "object",
    "properties": { "device":  { "type": "string" },
                    "command": { "type": "string", "pattern": "^show " } },
    "required": ["device", "command"] } }

<span class="c">! jab model ise use karna chahta hai to kya emit karta hai</span>
{ "tool": "run_show_command",
  "input": { "device": "CORE", "command": "show ip ospf neighbor" } }</pre>
<p><code>"pattern": "^show "</code> line dekho: tool khud sirf "show" se shuru hone wali commands accept karta hai. Yeh tool mein bana guardrail hai, prompt mein vinamra request nahi. Code mein rehne wali safety shabdon mein rehne wali safety se kahin zyada mazboot hai.</p>

<h3>MCP: tools ke liye standard plug</h3>
<p>Pehle har AI application tools se judne ka apna tareeka banati thi. <b>Model Context Protocol (MCP)</b> ek open standard hai jo ek tareeka define karta hai. <b>MCP server</b> kisi system ke liye tools (actions), resources (padhne wala data) aur prompts expose karta hai, jaise aapka monitoring platform, source of truth ya read-only device gateway. AI application ke andar ka <b>MCP client</b> discover karta hai ki server kya offer karta hai aur use call karta hai. Ise universal adapter samjho: apni network inventory ke liye ek MCP server banao, aur koi bhi MCP-capable assistant use use kar sakta hai, un permissions ke saath jo server allow kare. Aage ka ek automation module aisa server banata hai jo show commands ko tools ki tarah expose karta hai; CCNA level par sirf concept chahiye.</p>
<table class="cmp"><tr><th>Tool type</th><th>Examples</th><th>Risk</th><th>Default policy</th></tr>
<tr><td><b>Read</b></td><td>show commands, telemetry queries, inventory lookup, ticket search</td><td>Kam (lekin data leak ho sakta hai)</td><td>Allowed, logged</td></tr>
<tr><td><b>Write</b></td><td>config push, shut/no shut, process clear, ticket close</td><td>Zyada</td><td>Human approval, scope limits, change window</td></tr>
</table>

<div class="eg"><p><b>Worked example: ek agent trace.</b> Goal: "Pune users 10.30.30.50 tak nahi pahunch pa rahe". Ek achha agent: (1) <code>run_show_command(PUNE-EDGE, "show ip interface brief")</code> call karta hai aur users ka port administratively down dekhta hai; (2) <code>run_show_command(CORE, "show ip ospf neighbor")</code> call karta hai aur DC ko EXSTART mein atka dekhta hai; (3) do steps propose karta hai: "Gi0/2 par no shutdown" aur OSPF ka fix; (4) ruk kar approval maangta hai kyunki dono write actions hain. Write access wala aur bina guardrails ka kharab design kiya agent step 3 par CORE par "clear ip ospf process" chala sakta hai, kuch seconds ke liye CORE ki har adjacency gira sakta hai, aur phir bhi problem theek nahi karta.</p></div>

<h3>Autonomy ke levels</h3>
<ol>
<li><b>Sirf suggest</b>: agent read tools se investigate karta hai aur plan likhta hai. Baaki sab insaan karte hain.</li>
<li><b>Human-approved actions</b>: agent execute kar sakta hai, lekin har write step ko explicit "yes" chahiye (human-in-the-loop).</li>
<li><b>Policy ke andar autonomous</b>: pehle se approved low-risk actions automatic chalte hain (jaise cause clear hone ke baad err-disabled access port dobara enable karna), baaki sab ko approval chahiye. Ise aksar <b>closed-loop</b> automation kehte hain.</li>
</ol>
<p>Organisations in levels par dheere-dheere, har action type ke hisaab se, upar jaati hain jaise-jaise evidence banta hai ki agent reliable hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Agent ko sab kuch ke liye ek admin account dena. Tool-level restrictions ki jagah prompt par bharosa karna ("please reload mat karna"). Agent ko bina step ya change limit ke loop karne dena. Bhoolna ki tool results (log lines, ticket text) untrusted input hain jismein instructions ho sakte hain (prompt injection, chapter 9).</p></div>
<div class="exam"><p><b>Exam trap.</b> Generative AI content banata hai; agentic AI plan karta hai aur <b>tools ke through actions execute karta hai</b>. LLM khud commands nahi chalata; host tool calls chalata hai. MCP standardise karta hai ki AI applications tools aur data se kaise judein; yeh khud kisi tool ko safe nahi banata.</p></div>

<div class="scn"><h4>Woh agent jo koshish karta raha</h4><p>Ek pilot agent ko branch VPN tunnels ke liye "connectivity restore" karne ki permission thi. Ek raat provider outage ne ek branch ka internet link gira diya. Agent ne tunnel down dekha, tunnel interface bounce kiya, phir bhi down dekha, crypto sessions clear kiye, phir bounce kiya, aur 40 minute tak repeat karta raha, logs bhar diye aur usi router par doosra healthy tunnel kai baar reset kar diya. Na change budget tha, na yeh rule ki neeche wala link down ho to ruk jao.</p><p><b>Seekh:</b> agents ko actions ki maximum sankhya, preconditions ka check, aur fix kaam na kare to ruk kar insaan ko handover karne ka rule chahiye.</p></div>

<div class="iv"><p class="q">"AI agent kya hai, aur chatbot se kaise alag hai?"</p><p>Strong answer: chatbot prompt ka jawab generated text se deta hai; agent goal ki taraf kaam karta hai, steps plan karta hai, host application ke through tools (show commands, APIs, ticketing) call karta hai, results dekhta hai aur loop karta hai. Schema ke saath tool calling explain karo, MCP ko AI applications ko tools aur data expose karne ke standard tareeke ki tarah batao, aur read tools ko write tools se alag karo. Controls ke saath khatam karo: least privilege, writes ke liye approval, scope aur change limits, audit logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Agent ke paas goal, tools, plan aur loop hota hai: act, observe, decide, repeat.</li>
<li>Model structured tool calls emit karta hai; host application unhe execute karke results lautati hai.</li>
<li>MCP servers ke through AI applications ko tools, resources aur prompts expose karne ka open standard hai.</li>
<li>Read tools ko write tools se alag rakho; limits sirf prompts mein nahi, code mein enforce karo.</li>
<li>Autonomy stages mein badhti hai: sirf suggest, human-approved, policy ke andar autonomous.</li>
</ul></div>
`}};export{e as default};