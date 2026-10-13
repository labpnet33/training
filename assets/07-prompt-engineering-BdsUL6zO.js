var e={id:`prompts`,h:{en:`Prompt engineering for network tasks: good and bad prompts`,hi:`Network tasks ke liye prompt engineering: achhe aur bure prompts`},body:{en:`
<p>Imagine calling a colleague at another site and saying only "the network is slow, fix it". They will ask twenty questions before they can help: which site, which users, since when, what changed, what do the counters say? An AI assistant cannot always ask those questions, so it guesses. <b>Prompt engineering</b> is simply giving the assistant, up front, what a good colleague would need: context, a clear task, constraints, the evidence, and the format you want back.</p>

<h3>The anatomy of a good network prompt</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Six parts of a good prompt">
<rect x="10" y="15" width="200" height="75" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">1. Role and goal</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="12">"act as a CCNP reviewer"</text>
<rect x="220" y="15" width="200" height="75" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">2. Context</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">platform, version, topology</text>
<rect x="430" y="15" width="200" height="75" rx="8" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">3. Evidence</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="12">real show output, logs</text>
<rect x="10" y="110" width="200" height="75" rx="8" fill="#fde68a"/><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="14">4. Task</text><text x="110" y="163" text-anchor="middle" class="svg-muted" font-size="12">one clear question</text>
<rect x="220" y="110" width="200" height="75" rx="8" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="14">5. Constraints</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="12">read-only, no reload</text>
<rect x="430" y="110" width="200" height="75" rx="8" fill="#e2e8f0"/><text x="530" y="140" text-anchor="middle" class="svg-ink" font-size="14">6. Output format</text><text x="530" y="163" text-anchor="middle" class="svg-muted" font-size="12">table, steps, cite lines</text>
</svg><p class="cap">Not every prompt needs all six, but troubleshooting prompts usually do.</p></div>
<ul>
<li><b>Role and goal</b>: what kind of expert you want and why ("you are reviewing a change for a production branch router").</li>
<li><b>Context</b>: platform and software (IOS XE 17.x, NX-OS), device roles, addressing, what changed recently.</li>
<li><b>Evidence</b>: paste the relevant, sanitised show output and log lines. This is <b>grounding</b>: the answer is based on your data, not on the model's memory.</li>
<li><b>Task</b>: one clear question or deliverable.</li>
<li><b>Constraints</b>: "read-only commands only", "do not suggest reloading or clearing processes", "IOS syntax only".</li>
<li><b>Output format</b>: "numbered hypotheses with the exact line of evidence for each", "a table", "a MOP with pre-checks, steps, post-checks and rollback".</li>
</ul>

<h3>Bad prompts and better prompts</h3>
<table class="cmp"><tr><th>Bad prompt</th><th>Why it is weak</th><th>Better prompt</th></tr>
<tr><td>"Why is OSPF not working?"</td><td>No platform, no data; invites a generic checklist or a guess</td><td>"Two IOS XE routers on 10.23.0.0/30 are stuck in EXSTART. Below are show ip ospf neighbor, show ip ospf interface and show ip interface from both. List the likely causes ranked, quote the line that supports each, and say what else you would check."</td></tr>
<tr><td>"Write an ACL to secure the server."</td><td>"Secure" is undefined; direction, source and services unknown</td><td>"Write a named extended IOS ACL applied inbound on Gi0/2. Permit 192.168.50.0/24 to host 10.30.30.50 TCP 443 only, deny other traffic to that host, permit all other traffic. Explain each line and the implicit deny."</td></tr>
<tr><td>"Summarise these logs." (40,000 lines pasted)</td><td>Too much input; no format; important lines may be lost</td><td>"Here are 250 severity 0-4 messages from 02:00-03:00. Give a timeline table: time, device, message code, meaning. Then the single most likely root event, and which lines you could not explain."</td></tr>
<tr><td>"Fix the network."</td><td>No scope; an agent could take this as permission to change anything</td><td>"Propose, do not apply. Read-only analysis of R1 and R2 only. Output a plan with confidence and evidence per step."</td></tr>
</table>

<h3>A reusable troubleshooting prompt</h3>
<pre class="code">Role: senior network engineer reviewing a P1 ticket. Be precise; say "unknown" if the data does not show it.
Context: Cisco IOS XE routers. CORE Gi0/2 (10.23.0.2/30) connects to DC Gi0/0 (10.23.0.1/30), OSPF area 0.
         No changes recorded in the last 24 h.
Evidence (sanitised):
  [paste: show ip ospf neighbor on CORE]
  [paste: show ip ospf interface Gi0/2 on CORE and Gi0/0 on DC]
  [paste: show ip interface Gi0/2 on CORE and Gi0/0 on DC]
Task: explain why the adjacency is not FULL.
Constraints: read-only suggestions only. Do not suggest clearing OSPF or reloading.
Output: 1) ranked hypotheses, each with the exact evidence line
        2) one verification command per hypothesis
        3) what you did NOT check</pre>
<p>Notice the last line. Asking the model to list what it did not check is one of the most powerful habits you can build: it exposes gaps before they become outages. NK Copilot does the same with <code>copilot explain N</code>, which prints a "not checked" section.</p>

<div class="eg"><p><b>Worked example.</b> With the weak prompt "OSPF stuck in EXSTART, what do I do?" a typical answer lists five generic causes and suggests <code>clear ip ospf process</code>. With the grounded prompt above, containing both <code>show ip interface</code> outputs, the answer points at the two different lines "MTU is 1500 bytes" and "MTU is 1400 bytes" and says "MTU mismatch: DBD packets are rejected; set matching MTU". Same model, same temperature: the difference is the evidence in the context window.</p></div>

<h3>More techniques that work</h3>
<ul>
<li><b>Give an example</b> of the output you want (few-shot prompting): one sample row of the table, one sample interface description.</li>
<li><b>Break big jobs into steps</b>: first summarise, then hypothesise, then draft a fix. Check each step.</li>
<li><b>Ask for assumptions</b>: "state every assumption you made about the platform and topology".</li>
<li><b>Iterate</b>: if the answer is vague, add the missing evidence rather than asking the same question louder.</li>
<li><b>Set the tone for uncertainty</b>: "if the data is insufficient, say so and list what you need".</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Vague prompts with no platform or data. Pasting raw configs with passwords, SNMP communities and public IPs (sanitise first). Asking leading questions ("it is the firewall, right?"), which models tend to agree with. Believing a longer prompt is always better: irrelevant data dilutes attention.</p></div>
<div class="exam"><p><b>Exam trap.</b> A good prompt provides context, a specific task, constraints and an output format. Grounding the prompt with real device output reduces hallucination but does not eliminate it. Prompt engineering improves answers; it never replaces verification.</p></div>

<div class="scn"><h4>The leading question</h4><p>During an outage an engineer asked an assistant: "The new firewall rule is blocking the ERP, isn't it? Give me the command to remove it." The assistant agreed and produced the command. A colleague instead pasted the firewall hit counters and the router's routing table and asked neutrally for the most likely cause. The answer: the rule had zero hits; a static route to the ERP subnet pointed to a decommissioned next hop. Removing the firewall rule would have opened a security hole and fixed nothing.</p><p><b>Lesson:</b> ask neutral questions and supply evidence. A model will often follow the story you hand it.</p></div>

<div class="iv"><p class="q">"Show me how you would prompt an AI assistant to help troubleshoot an OSPF adjacency."</p><p>Strong answer: describe the structure: role, context (platform, interfaces, area, recent changes), sanitised evidence from both routers (neighbor, OSPF interface, IP interface), a single task, constraints (read-only, no clearing processes), and an output format with ranked hypotheses, the evidence line for each, a verification command, and a list of what was not checked. Then say you would verify each hypothesis yourself before any change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A strong prompt has role, context, evidence, task, constraints and output format.</li>
<li>Grounding with real, sanitised show output changes the answer more than clever wording.</li>
<li>Always ask for the evidence per claim, the assumptions, and what was not checked.</li>
<li>Avoid leading questions and oversized pastes; split big jobs into steps.</li>
<li>Good prompts improve answers; verification is still required.</li>
</ul></div>
`,hi:`
<p>Socho aap doosri site ke colleague ko call karke sirf itna bolte ho "network slow hai, theek karo". Madad karne se pehle woh bees sawaal poochega: kaunsi site, kaunse users, kab se, kya badla, counters kya bolte hain? AI assistant hamesha woh sawaal nahi pooch sakta, isliye woh guess karta hai. <b>Prompt engineering</b> bas itna hai ki assistant ko shuru mein hi woh sab do jo ek achhe colleague ko chahiye: context, saaf task, constraints, evidence, aur jis format mein aapko jawab chahiye.</p>

<h3>Achhe network prompt ki anatomy</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Achhe prompt ke chhe hisse">
<rect x="10" y="15" width="200" height="75" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">1. Role aur goal</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="12">"CCNP reviewer bano"</text>
<rect x="220" y="15" width="200" height="75" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">2. Context</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">platform, version, topology</text>
<rect x="430" y="15" width="200" height="75" rx="8" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">3. Evidence</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="12">real show output, logs</text>
<rect x="10" y="110" width="200" height="75" rx="8" fill="#fde68a"/><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="14">4. Task</text><text x="110" y="163" text-anchor="middle" class="svg-muted" font-size="12">ek saaf sawaal</text>
<rect x="220" y="110" width="200" height="75" rx="8" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="14">5. Constraints</text><text x="320" y="163" text-anchor="middle" class="svg-muted" font-size="12">read-only, reload nahi</text>
<rect x="430" y="110" width="200" height="75" rx="8" fill="#e2e8f0"/><text x="530" y="140" text-anchor="middle" class="svg-ink" font-size="14">6. Output format</text><text x="530" y="163" text-anchor="middle" class="svg-muted" font-size="12">table, steps, lines cite</text>
</svg><p class="cap">Har prompt ko chhe ke chhe nahi chahiye, lekin troubleshooting prompts ko aam taur par chahiye.</p></div>
<ul>
<li><b>Role aur goal</b>: kaisa expert chahiye aur kyun ("aap production branch router ka change review kar rahe ho").</li>
<li><b>Context</b>: platform aur software (IOS XE 17.x, NX-OS), device roles, addressing, haal mein kya badla.</li>
<li><b>Evidence</b>: relevant, sanitised show output aur log lines paste karo. Yahi <b>grounding</b> hai: jawab aapke data par based hai, model ki memory par nahi.</li>
<li><b>Task</b>: ek saaf sawaal ya deliverable.</li>
<li><b>Constraints</b>: "sirf read-only commands", "reload ya process clear karna suggest mat karo", "sirf IOS syntax".</li>
<li><b>Output format</b>: "numbered hypotheses, har ek ke saath evidence ki exact line", "ek table", "pre-checks, steps, post-checks aur rollback wala MOP".</li>
</ul>

<h3>Bure prompts aur behtar prompts</h3>
<table class="cmp"><tr><th>Bura prompt</th><th>Kamzor kyun hai</th><th>Behtar prompt</th></tr>
<tr><td>"OSPF kaam kyun nahi kar raha?"</td><td>Na platform, na data; generic checklist ya guess ko nyota</td><td>"10.23.0.0/30 par do IOS XE routers EXSTART mein atke hain. Neeche dono ke show ip ospf neighbor, show ip ospf interface aur show ip interface hain. Likely causes rank karke list karo, har ek ko support karne wali line quote karo, aur batao aur kya check karoge."</td></tr>
<tr><td>"Server secure karne ke liye ACL likho."</td><td>"Secure" defined nahi; direction, source aur services pata nahi</td><td>"Gi0/2 par inbound apply hone wala named extended IOS ACL likho. 192.168.50.0/24 ko host 10.30.30.50 par sirf TCP 443 permit karo, us host par baaki traffic deny karo, baaki saara traffic permit karo. Har line aur implicit deny explain karo."</td></tr>
<tr><td>"In logs ko summarise karo." (40,000 lines paste)</td><td>Bahut zyada input; format nahi; important lines kho sakti hain</td><td>"Yeh 02:00-03:00 ke 250 severity 0-4 messages hain. Timeline table do: time, device, message code, matlab. Phir sabse likely root event, aur kaunsi lines aap explain nahi kar paaye."</td></tr>
<tr><td>"Network theek karo."</td><td>Scope nahi; agent ise kuch bhi badalne ki permission samajh sakta hai</td><td>"Propose karo, apply mat karo. Sirf R1 aur R2 ka read-only analysis. Har step ke confidence aur evidence ke saath plan do."</td></tr>
</table>

<h3>Ek reusable troubleshooting prompt</h3>
<pre class="code">Role: senior network engineer reviewing a P1 ticket. Be precise; say "unknown" if the data does not show it.
Context: Cisco IOS XE routers. CORE Gi0/2 (10.23.0.2/30) connects to DC Gi0/0 (10.23.0.1/30), OSPF area 0.
         No changes recorded in the last 24 h.
Evidence (sanitised):
  [paste: show ip ospf neighbor on CORE]
  [paste: show ip ospf interface Gi0/2 on CORE and Gi0/0 on DC]
  [paste: show ip interface Gi0/2 on CORE and Gi0/0 on DC]
Task: explain why the adjacency is not FULL.
Constraints: read-only suggestions only. Do not suggest clearing OSPF or reloading.
Output: 1) ranked hypotheses, each with the exact evidence line
        2) one verification command per hypothesis
        3) what you did NOT check</pre>
<p>Aakhri line dekho. Model se yeh list karwana ki usne kya check nahi kiya, sabse powerful aadaton mein se ek hai: yeh gaps ko outage banne se pehle dikha deta hai. NK Copilot bhi <code>copilot explain N</code> se yahi karta hai, jo "not checked" section print karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Kamzor prompt "OSPF EXSTART mein atka hai, kya karun?" par typical jawab paanch generic causes list karta hai aur <code>clear ip ospf process</code> suggest karta hai. Upar wale grounded prompt ke saath, jismein dono <code>show ip interface</code> outputs hain, jawab do alag lines "MTU is 1500 bytes" aur "MTU is 1400 bytes" ki taraf ishaara karta hai aur kehta hai "MTU mismatch: DBD packets reject ho rahe hain; MTU match karo". Same model, same temperature: farak context window mein evidence ka hai.</p></div>

<h3>Aur techniques jo kaam karti hain</h3>
<ul>
<li><b>Example do</b> jaisa output chahiye (few-shot prompting): table ki ek sample row, ek sample interface description.</li>
<li><b>Bade kaam ko steps mein todo</b>: pehle summarise, phir hypothesise, phir fix draft. Har step check karo.</li>
<li><b>Assumptions maango</b>: "platform aur topology ke baare mein apna har assumption batao".</li>
<li><b>Iterate karo</b>: jawab vague ho to wahi sawaal zor se poochne ki jagah missing evidence jodo.</li>
<li><b>Uncertainty ka tone set karo</b>: "agar data kaafi nahi hai, to bolo aur list karo kya chahiye".</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Bina platform ya data ke vague prompts. Passwords, SNMP communities aur public IPs wale raw configs paste karna (pehle sanitise karo). Leading questions poochna ("firewall hi hai na?"), jinse models aksar sehmat ho jaate hain. Yeh maanna ki lamba prompt hamesha behtar hai: irrelevant data dhyan ko patla karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Achha prompt context, specific task, constraints aur output format deta hai. Real device output se prompt ko ground karna hallucination kam karta hai lekin khatam nahi karta. Prompt engineering jawab behtar karti hai; verification ki jagah kabhi nahi leti.</p></div>

<div class="scn"><h4>Leading question</h4><p>Outage ke dauraan ek engineer ne assistant se poocha: "Naya firewall rule ERP ko block kar raha hai na? Use hatane ki command do." Assistant sehmat hua aur command de di. Ek colleague ne iski jagah firewall hit counters aur router ki routing table paste ki aur neutral tareeke se sabse likely cause poocha. Jawab: rule par zero hits the; ERP subnet ka static route ek decommissioned next hop ki taraf point kar raha tha. Firewall rule hatane se security hole khul jaata aur kuch theek nahi hota.</p><p><b>Seekh:</b> neutral sawaal poocho aur evidence do. Model aksar wahi kahani follow karta hai jo aap use thamaate ho.</p></div>

<div class="iv"><p class="q">"Dikhao ki OSPF adjacency troubleshoot karne ke liye aap AI assistant ko kaise prompt karoge."</p><p>Strong answer: structure describe karo: role, context (platform, interfaces, area, recent changes), dono routers se sanitised evidence (neighbor, OSPF interface, IP interface), ek task, constraints (read-only, processes clear nahi), aur output format jismein ranked hypotheses, har ek ki evidence line, ek verification command, aur jo check nahi hua uski list ho. Phir bolo ki kisi bhi change se pehle aap har hypothesis khud verify karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Strong prompt mein role, context, evidence, task, constraints aur output format hota hai.</li>
<li>Real, sanitised show output se grounding clever wording se zyada jawab badalti hai.</li>
<li>Hamesha har claim ka evidence, assumptions, aur jo check nahi hua woh maango.</li>
<li>Leading questions aur bahut bade pastes se bacho; bade kaam steps mein todo.</li>
<li>Achhe prompts jawab behtar karte hain; verification phir bhi zaroori hai.</li>
</ul></div>
`}};export{e as default};