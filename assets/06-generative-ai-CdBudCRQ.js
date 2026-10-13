var e={id:`genai`,h:{en:`Generative AI for engineers: config drafts, log summaries and documentation`,hi:`Engineers ke liye generative AI: config drafts, log summaries aur documentation`},body:{en:`
<p>A good draughtsman in an architecture office can sketch a floor plan in minutes, but the architect still checks the load-bearing walls before anyone builds. Generative AI is your very fast draughtsman. It writes a first draft of a config, a summary of last night's logs or a runbook page in seconds. You remain the architect who checks it, tests it and signs it.</p>

<h3>Where generative AI genuinely helps</h3>
<table class="cmp"><tr><th>Task</th><th>What the AI produces</th><th>What you must check</th></tr>
<tr><td>Config drafts</td><td>ACLs, VLAN and trunk configs, OSPF stanzas, templates for many sites</td><td>Syntax for your platform and version, order of lines, implicit deny, wildcard masks, side effects</td></tr>
<tr><td>Log summarisation</td><td>A timeline and a short story of what happened</td><td>That the summary matches the raw lines; nothing important dropped</td></tr>
<tr><td>Explaining output</td><td>Plain-English meaning of a show command or error message</td><td>That it read the fields correctly (states, counters, flags)</td></tr>
<tr><td>Documentation</td><td>Runbooks, method-of-procedure (MOP) drafts, change descriptions, diagrams described in text</td><td>Accuracy of names, addresses and steps; rollback included</td></tr>
<tr><td>Scripts and templates</td><td>Python, Jinja2 templates, Ansible tasks (previous module)</td><td>Run it against a lab first; read every line that changes a device</td></tr>
<tr><td>Communication</td><td>Ticket updates, incident reports, customer-friendly explanations</td><td>No secrets, no blame, no invented facts</td></tr>
</table>

<h3>The draft-review-test workflow</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Workflow from AI draft to production change">
<rect x="10" y="35" width="105" height="55" rx="8" fill="#fde68a"/><text x="62" y="67" text-anchor="middle" class="svg-ink" font-size="13">AI draft</text>
<rect x="135" y="35" width="105" height="55" rx="8" fill="#bae6fd"/><text x="187" y="60" text-anchor="middle" class="svg-ink" font-size="13">You review</text><text x="187" y="78" text-anchor="middle" class="svg-muted" font-size="12">line by line</text>
<rect x="260" y="35" width="105" height="55" rx="8" fill="#ddd6fe"/><text x="312" y="60" text-anchor="middle" class="svg-ink" font-size="13">Lab test</text><text x="312" y="78" text-anchor="middle" class="svg-muted" font-size="12">verify output</text>
<rect x="385" y="35" width="115" height="55" rx="8" fill="#e2e8f0"/><text x="442" y="60" text-anchor="middle" class="svg-ink" font-size="13">Peer review</text><text x="442" y="78" text-anchor="middle" class="svg-muted" font-size="12">change ticket</text>
<rect x="520" y="35" width="110" height="55" rx="8" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="13">Change</text><text x="575" y="78" text-anchor="middle" class="svg-muted" font-size="12">window + checks</text>
<line x1="115" y1="62" x2="135" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="62" x2="260" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="365" y1="62" x2="385" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="62" x2="520" y2="62" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The AI saves time at the first box only. Every other box stays human.</p></div>

<div class="eg"><p><b>Worked example: an ACL draft with a hidden outage.</b> Request: "Pune users 192.168.50.0/24 may reach the ERP server 10.30.30.50 only on HTTPS (TCP 443). No other traffic from Pune may reach the ERP server. Everything else must keep working." The assistant returns:</p>
<pre class="code">ip access-list extended ERP-PROTECT
 permit tcp 192.168.50.0 0.0.0.255 host 10.30.30.50 eq 443
 deny   ip any host 10.30.30.50</pre>
<p>It looks right, and the first two requirements are met. But every extended ACL ends with an invisible <b>implicit deny</b>. Applied inbound on the users' interface, this ACL would block <i>all other traffic</i> from Pune, including DNS, email and internet: requirement three fails. The reviewed version adds the missing line and a remark:</p>
<pre class="code"><span class="c">! reviewed: implicit deny would have blocked all other traffic</span>
ip access-list extended ERP-PROTECT
 remark Pune users to ERP HTTPS only
 permit tcp 192.168.50.0 0.0.0.255 host 10.30.30.50 eq 443
 deny   ip any host 10.30.30.50
 permit ip any any
interface GigabitEthernet0/2
 ip access-group ERP-PROTECT in</pre>
<p>In the lab you then prove it: HTTPS to the ERP works, another port to the ERP is refused, and a ping to another server still works.</p>
<pre class="out">PUNE-EDGE# show access-lists ERP-PROTECT
Extended IP access list ERP-PROTECT
    10 permit tcp 192.168.50.0 0.0.0.255 host 10.30.30.50 eq 443 (112 matches)
    20 deny ip any host 10.30.30.50 (4 matches)
    <span class="hl">30 permit ip any any (2381 matches)</span></pre></div>

<h3>Log summarisation done well</h3>
<p>Filter first (chapter 3), then ask for a <b>timeline with the original timestamps and message codes</b>, not just prose. A summary such as "02:14 DIST1 Gi1/0/1 down (%LINK-3-UPDOWN), OSPF neighbour 10.0.0.2 FULL to DOWN, 02:31 link up, OSPF FULL at 02:31:40" lets you check each claim against the raw file in seconds. A summary without codes and times cannot be verified, so it cannot be trusted.</p>

<h3>Documentation: the underrated win</h3>
<p>Most networks are under-documented because writing is slow. Paste the (sanitised) output of <code>show cdp neighbors detail</code> and <code>show ip interface brief</code> and ask for an interface table with neighbours, or ask for a MOP that includes pre-checks, change steps, post-checks and rollback. You still verify names and numbers, but the blank-page problem disappears.</p>

<div class="warn"><p><b>Common mistakes.</b> Pasting an AI-generated config directly into production. Assuming the syntax matches your platform (IOS XE, NX-OS and Junos differ). Accepting a summary with no timestamps or message codes. Pasting running-configs with passwords and keys into an unapproved tool: mask them first (chapter 9).</p></div>
<div class="exam"><p><b>Exam trap.</b> Generative AI creates content; it does not verify it. The engineer stays responsible for anything applied to the network. Typical good uses: summarising logs, drafting configs and documentation, explaining output. A typical bad practice: applying generated config without review and testing.</p></div>

<div class="scn"><h4>The mask that was not a wildcard</h4><p>An engineer asked an assistant to translate a firewall filter from another vendor into an IOS ACL. The draft used <code>192.168.60.0 255.255.255.0</code> in an ACE, a subnet mask where IOS expects a wildcard mask. IOS accepted the line, but a wildcard of 255.255.255.0 means "ignore the first three octets, match only the last one", so it matched the wrong hosts. The lab test caught it when a test host from another subnet was permitted. The fix was <code>0.0.0.255</code>.</p><p><b>Lesson:</b> the router accepting a line does not mean the line does what you wanted. Test the behaviour, not just the syntax.</p></div>

<div class="iv"><p class="q">"How would you use generative AI safely to produce configuration?"</p><p>Strong answer: use it for the first draft with a precise prompt that names the platform, version, addressing and requirements; never paste secrets; review every line against the requirement (order, implicit deny, wildcard masks, interface direction); test in a lab and verify with show commands; then go through normal peer review and change control with a rollback plan. Mention that the value is speed on drafting and documentation, while accountability stays with the engineer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Generative AI drafts configs, summaries, explanations, documentation and scripts quickly.</li>
<li>Draft, review, lab test, peer review, change window: the AI speeds up only the first step.</li>
<li>Classic draft errors: implicit deny forgotten, wrong wildcard masks, wrong platform syntax.</li>
<li>Ask for summaries with timestamps and message codes so each claim can be checked.</li>
<li>Router acceptance is not correctness: test the behaviour.</li>
</ul></div>
`,hi:`
<p>Architecture office ka ek achha draughtsman minutes mein floor plan sketch kar sakta hai, lekin kisi ke banane se pehle architect load-bearing walls check karta hai. Generative AI aapka bahut tez draughtsman hai. Woh seconds mein config ka pehla draft, kal raat ke logs ka summary ya runbook page likh deta hai. Aap architect rehte ho jo use check karta hai, test karta hai aur sign karta hai.</p>

<h3>Generative AI sach mein kahan madad karta hai</h3>
<table class="cmp"><tr><th>Task</th><th>AI kya banata hai</th><th>Aapko kya check karna hai</th></tr>
<tr><td>Config drafts</td><td>ACLs, VLAN aur trunk configs, OSPF stanzas, bahut sites ke liye templates</td><td>Aapke platform aur version ka syntax, lines ka order, implicit deny, wildcard masks, side effects</td></tr>
<tr><td>Log summarisation</td><td>Timeline aur kya hua uski chhoti kahani</td><td>Summary raw lines se match karti hai; kuch important chhoota nahi</td></tr>
<tr><td>Output explain karna</td><td>Show command ya error message ka plain English matlab</td><td>Usne fields sahi padhe (states, counters, flags)</td></tr>
<tr><td>Documentation</td><td>Runbooks, method-of-procedure (MOP) drafts, change descriptions, text mein describe kiye diagrams</td><td>Names, addresses aur steps ki accuracy; rollback included</td></tr>
<tr><td>Scripts aur templates</td><td>Python, Jinja2 templates, Ansible tasks (pichhla module)</td><td>Pehle lab par chalao; device badalne wali har line padho</td></tr>
<tr><td>Communication</td><td>Ticket updates, incident reports, customer-friendly explanations</td><td>Koi secrets nahi, koi blame nahi, koi banaye hue facts nahi</td></tr>
</table>

<h3>Draft-review-test workflow</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="AI draft se production change tak workflow">
<rect x="10" y="35" width="105" height="55" rx="8" fill="#fde68a"/><text x="62" y="67" text-anchor="middle" class="svg-ink" font-size="13">AI draft</text>
<rect x="135" y="35" width="105" height="55" rx="8" fill="#bae6fd"/><text x="187" y="60" text-anchor="middle" class="svg-ink" font-size="13">Aap review</text><text x="187" y="78" text-anchor="middle" class="svg-muted" font-size="12">line by line</text>
<rect x="260" y="35" width="105" height="55" rx="8" fill="#ddd6fe"/><text x="312" y="60" text-anchor="middle" class="svg-ink" font-size="13">Lab test</text><text x="312" y="78" text-anchor="middle" class="svg-muted" font-size="12">output verify</text>
<rect x="385" y="35" width="115" height="55" rx="8" fill="#e2e8f0"/><text x="442" y="60" text-anchor="middle" class="svg-ink" font-size="13">Peer review</text><text x="442" y="78" text-anchor="middle" class="svg-muted" font-size="12">change ticket</text>
<rect x="520" y="35" width="110" height="55" rx="8" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="13">Change</text><text x="575" y="78" text-anchor="middle" class="svg-muted" font-size="12">window + checks</text>
<line x1="115" y1="62" x2="135" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="62" x2="260" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="365" y1="62" x2="385" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="62" x2="520" y2="62" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">AI sirf pehle box par time bachata hai. Baaki har box insaan ka rehta hai.</p></div>

<div class="eg"><p><b>Worked example: ACL draft jismein chhupa outage hai.</b> Request: "Pune users 192.168.50.0/24 ERP server 10.30.30.50 tak sirf HTTPS (TCP 443) par pahunch sakte hain. Pune ka koi aur traffic ERP server tak nahi pahunchna chahiye. Baaki sab kaam karta rehna chahiye." Assistant deta hai:</p>
<pre class="code">ip access-list extended ERP-PROTECT
 permit tcp 192.168.50.0 0.0.0.255 host 10.30.30.50 eq 443
 deny   ip any host 10.30.30.50</pre>
<p>Sahi dikhta hai, aur pehli do requirements poori hoti hain. Lekin har extended ACL ek invisible <b>implicit deny</b> par khatam hota hai. Users ke interface par inbound apply karne par yeh ACL Pune ka <i>baaki saara traffic</i> block kar deta, DNS, email aur internet samet: teesri requirement fail. Reviewed version missing line aur ek remark jodta hai:</p>
<pre class="code"><span class="c">! reviewed: implicit deny baaki saara traffic block kar deta</span>
ip access-list extended ERP-PROTECT
 remark Pune users to ERP HTTPS only
 permit tcp 192.168.50.0 0.0.0.255 host 10.30.30.50 eq 443
 deny   ip any host 10.30.30.50
 permit ip any any
interface GigabitEthernet0/2
 ip access-group ERP-PROTECT in</pre>
<p>Phir lab mein aap ise prove karte ho: ERP par HTTPS kaam karta hai, ERP par doosra port refuse hota hai, aur doosre server par ping abhi bhi kaam karta hai.</p>
<pre class="out">PUNE-EDGE# show access-lists ERP-PROTECT
Extended IP access list ERP-PROTECT
    10 permit tcp 192.168.50.0 0.0.0.255 host 10.30.30.50 eq 443 (112 matches)
    20 deny ip any host 10.30.30.50 (4 matches)
    <span class="hl">30 permit ip any any (2381 matches)</span></pre></div>

<h3>Log summarisation sahi tareeke se</h3>
<p>Pehle filter karo (chapter 3), phir sirf prose nahi, <b>original timestamps aur message codes ke saath timeline</b> maango. "02:14 DIST1 Gi1/0/1 down (%LINK-3-UPDOWN), OSPF neighbour 10.0.0.2 FULL se DOWN, 02:31 link up, 02:31:40 par OSPF FULL" jaisi summary aapko har claim ko seconds mein raw file se check karne deti hai. Bina codes aur times wali summary verify nahi ho sakti, isliye uspar trust nahi ho sakta.</p>

<h3>Documentation: underrated jeet</h3>
<p>Zyada tar networks ki documentation kam hoti hai kyunki likhna slow hai. <code>show cdp neighbors detail</code> aur <code>show ip interface brief</code> ka (sanitised) output paste karo aur neighbours ke saath interface table maango, ya aisa MOP maango jismein pre-checks, change steps, post-checks aur rollback ho. Names aur numbers aap phir bhi verify karte ho, lekin khaali page ki problem khatam ho jaati hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> AI-generated config seedhe production mein paste karna. Maan lena ki syntax aapke platform se match karta hai (IOS XE, NX-OS aur Junos alag hain). Bina timestamps ya message codes wali summary accept karna. Passwords aur keys wale running-configs unapproved tool mein paste karna: pehle unhe mask karo (chapter 9).</p></div>
<div class="exam"><p><b>Exam trap.</b> Generative AI content banata hai; use verify nahi karta. Network par jo bhi apply ho uski zimmedari engineer ki rehti hai. Typical achhe uses: logs summarise karna, configs aur documentation draft karna, output explain karna. Typical buri practice: generated config ko bina review aur testing ke apply karna.</p></div>

<div class="scn"><h4>Woh mask jo wildcard nahi tha</h4><p>Ek engineer ne assistant se doosre vendor ka firewall filter IOS ACL mein translate karwaya. Draft ne ek ACE mein <code>192.168.60.0 255.255.255.0</code> use kiya, yaani subnet mask jahan IOS wildcard mask expect karta hai. IOS ne line accept kar li, lekin 255.255.255.0 wildcard ka matlab hai "pehle teen octets ignore karo, sirf aakhri match karo", isliye usne galat hosts match kiye. Lab test ne ise pakda jab doosre subnet ka test host permit ho gaya. Fix tha <code>0.0.0.255</code>.</p><p><b>Seekh:</b> router ka line accept karna yeh nahi batata ki line wahi karti hai jo aap chahte the. Sirf syntax nahi, behaviour test karo.</p></div>

<div class="iv"><p class="q">"Configuration banane ke liye aap generative AI ko safely kaise use karoge?"</p><p>Strong answer: pehle draft ke liye use karo, precise prompt ke saath jo platform, version, addressing aur requirements batata hai; kabhi secrets paste mat karo; har line ko requirement ke against review karo (order, implicit deny, wildcard masks, interface direction); lab mein test karo aur show commands se verify karo; phir rollback plan ke saath normal peer review aur change control se jao. Bolo ki value drafting aur documentation ki speed mein hai, jabki accountability engineer ki rehti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Generative AI configs, summaries, explanations, documentation aur scripts jaldi draft karta hai.</li>
<li>Draft, review, lab test, peer review, change window: AI sirf pehla step tez karta hai.</li>
<li>Classic draft errors: implicit deny bhoolna, galat wildcard masks, galat platform syntax.</li>
<li>Timestamps aur message codes ke saath summaries maango taaki har claim check ho sake.</li>
<li>Router ka accept karna correctness nahi hai: behaviour test karo.</li>
</ul></div>
`}};export{e as default};