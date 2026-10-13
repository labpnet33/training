var e={id:`troubleshooting`,h:{en:`Troubleshooting a remote network tunnel that is down`,hi:`Down remote network tunnel ka troubleshooting`},body:{en:`
<p>When a branch calls and says "internet is down", do not start by changing settings. Work like a mechanic: look at the dashboard lights, then open the bonnet, then fix one thing at a time. This chapter gives a repeatable workflow and walks through the lab ticket "Tunnel down", where one of three faults is injected: a wrong peer IP, a wrong PSK, or a crypto mismatch.</p>

<h3>The workflow</h3>
<ol>
<li><b>Define the symptom.</b> Is it no tunnel at all, tunnel up but no traffic, or BGP down?</li>
<li><b>Read the cloud page.</b> Config Status (Out of sync?), Tunnel Status, BGP Status.</li>
<li><b>Read the branch.</b> <code>show vpn ike-sa</code>, then <code>show vpn ipsec-sa</code>, then <code>show vpn flow</code>.</li>
<li><b>Force a test.</b> <code>test vpn ike-sa gateway PA-GW</code>, then read the log.</li>
<li><b>Match the symptom to a cause</b> using the table below. Fix one item. Clear SAs. Retest.</li>
</ol>

<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>Where to confirm</th></tr>
<tr><td>ike-sa empty, no reply at all</td><td>Wrong peer IP; branch not using the Service Endpoint Address; UDP blocked upstream</td><td>Network Details vs IKE gateway peer address</td></tr>
<tr><td>IKE starts, then "authentication failed"</td><td>Wrong pre-shared key or identity mismatch</td><td>ikemgr.log, both gateway pages</td></tr>
<tr><td>"no proposal chosen"</td><td>IKE or IPsec crypto mismatch</td><td>Compare IKE crypto and IPsec crypto both sides</td></tr>
<tr><td>ike-sa up, ipsec-sa missing</td><td>IPsec crypto or PFS mismatch, or Proxy ID mismatch with a policy-based peer</td><td>IPsec crypto profile, Proxy IDs tab</td></tr>
<tr><td>Both SAs up, encap only</td><td>Missing return route, policy, or the cloud has no route to the branch subnet</td><td>Routing tables, remote network subnets</td></tr>
<tr><td>Tunnel up, BGP Connect</td><td>No branch route to the Local IP, wrong Peer AS or Peer IP</td><td>BGP Status dialog, branch route to 10.254.1.1</td></tr>
<tr><td>Config Status Out of sync</td><td>Change not pushed</td><td>Push Config (SCM) or Commit and Push (Panorama)</td></tr>
<tr><td>Intermittent, odd reachability</td><td>Overlapping subnets with the infrastructure subnet or user pools</td><td>Address plan, Overlapped Subnets setting</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Decision tree">
<rect x="230" y="10" width="180" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">IKE SA established?</text>
<rect x="30" y="90" width="210" height="50" rx="8" fill="#fed7aa"/><text x="135" y="112" text-anchor="middle" class="svg-ink" font-size="12">No: peer IP, PSK, crypto</text><text x="135" y="130" text-anchor="middle" class="svg-muted" font-size="11">read ikemgr.log</text>
<rect x="400" y="90" width="210" height="50" rx="8" fill="#bbf7d0"/><text x="505" y="112" text-anchor="middle" class="svg-ink" font-size="12">Yes: IPsec SA up?</text><text x="505" y="130" text-anchor="middle" class="svg-muted" font-size="11">no: IPsec crypto or proxy ID</text>
<rect x="400" y="165" width="210" height="45" rx="8" fill="#bae6fd"/><text x="505" y="186" text-anchor="middle" class="svg-ink" font-size="12">Yes: routes, BGP, policy</text><text x="505" y="202" text-anchor="middle" class="svg-muted" font-size="11">overlap? pushed?</text>
<line x1="270" y1="46" x2="135" y2="90" stroke="#64748b" stroke-width="2"/><line x1="370" y1="46" x2="505" y2="90" stroke="#64748b" stroke-width="2"/><line x1="505" y1="140" x2="505" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Work top down. One fault at a time.</p></div>

<h3>Lab walk-through: three injected faults</h3>
<p><b>Fault A: wrong peer IP.</b> BR-FW has peer 203.0.113.110 instead of 203.0.113.101.</p>
<pre class="out">admin@BR-FW&gt; show vpn ike-sa gateway PA-GW
<span class="hl">No IKE SA found</span>
admin@BR-FW&gt; test vpn ike-sa gateway PA-GW
Start time: Oct.04 10:40:12
<span class="hl">Initiate 1 IKE SA.</span></pre>
<p>Check Network Details for the Service Endpoint Address, correct the gateway, commit, test again.</p>

<p><b>Fault B: wrong pre-shared key.</b> The ike-sa list stays empty, and the IKE log shows an authentication failure.</p>
<pre class="out">admin@BR-FW&gt; less mp-log ikemgr.log
2026-10-04 10:44:31 [PROTO_NOTIFY]: received notify type AUTHENTICATION_FAILED
<span class="hl">2026-10-04 10:44:31 [ERROR]: IKEv2 authentication failed, check pre-shared key and IDs</span></pre>
<p>Re-enter the key on the branch (watch for trailing spaces) and compare the identities.</p>

<p><b>Fault C: crypto mismatch.</b> For example the branch uses DH group 19 while the cloud profile uses group 14.</p>
<pre class="out">2026-10-04 10:49:02 [PROTO_NOTIFY]: received notify type NO_PROPOSAL_CHOSEN
<span class="hl">2026-10-04 10:49:02 [ERROR]: IKE phase-1 negotiation failed, proposal mismatch</span></pre>
<p>Make the branch profile match the cloud, commit, then <code>clear vpn ike-sa gateway PA-GW</code> and <code>clear vpn ipsec-sa tunnel PA-TUN</code>, and <code>test vpn</code> again. These log lines are illustrative; exact text varies by release.</p>

<div class="eg"><p><b>Worked example.</b> Success looks like this: ike-sa shows established with peer 203.0.113.101, ipsec-sa shows active, Monitor shows Tunnel Status Up, and PC-BR (10.20.0.100) reaches the internet. All three tests in the lab pass only when both phases and the route are in place.</p></div>

<h3>Other causes you must know</h3>
<ul>
<li><b>Proxy ID:</b> a policy-based CPE must have a matching Proxy ID, or phase 2 fails.</li>
<li><b>Missing route:</b> no route on the CPE to the Tunnel Monitor IP or the BGP Local IP.</li>
<li><b>Overlap:</b> branch subnets overlapping the infrastructure subnet (10.255.0.0/24) or the mobile pool (10.200.0.0/23).</li>
<li><b>Not pushed:</b> the object exists in the console but Config Status is Out of sync.</li>
<li><b>BGP wrong:</b> wrong Peer AS or Peer IP on the remote network.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once; forgetting to clear the SAs after a profile edit; debugging the branch when the change was never pushed; leaving debug on.</p></div>
<div class="exam"><p><b>Exam trap.</b> The SSE exam's troubleshooting domain tests reading status pages and CLI. Know that "Out of sync" means push, "no proposal chosen" means crypto, and "authentication failed" means key or identity.</p></div>

<div class="scn"><h4>The ticket that was a space</h4><p>A branch tunnel failed after a maintenance change. Everything matched on screen. The log said authentication failed. The key had been pasted with a trailing space. Re-typing it by hand brought the tunnel up in two minutes.</p><p><b>Lesson:</b> trust the log, not the screen. Fix one thing at a time.</p></div>

<div class="iv"><p class="q">"A branch tunnel to Prisma Access is down. Walk me through it."</p><p>I check Config Status and Tunnel Status, then show vpn ike-sa on the branch. If empty I verify the peer IP against the Service Endpoint Address, then read ikemgr.log: authentication failed means key or identity, no proposal chosen means crypto. If IKE is up but IPsec is not, I check IPsec crypto and Proxy IDs. Then routes, overlap and whether the change was pushed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the order: cloud status, branch SAs, test vpn, log, fix, clear, retest.</li>
<li>Empty ike-sa means peer, PSK or crypto; read the log to choose.</li>
<li>Both SAs up but no traffic means routes, policy, overlap or not pushed.</li>
<li>Proxy IDs matter for policy-based peers.</li>
<li>Change one thing at a time.</li>
</ul></div>
`,hi:`
<p>Branch call karke kahe "internet down hai", to settings badalne se shuru mat karo. Mechanic ki tarah kaam karo: pehle dashboard lights dekho, phir bonnet kholo, phir ek ek cheez fix karo. Yeh chapter repeatable workflow deta hai aur lab ticket "Tunnel down" ko walk-through karta hai, jisme teen faults mein se ek inject hota hai: galat peer IP, galat PSK, ya crypto mismatch.</p>

<h3>Workflow</h3>
<ol>
<li><b>Symptom define karo.</b> Tunnel bilkul nahi, tunnel up par traffic nahi, ya BGP down?</li>
<li><b>Cloud page padho.</b> Config Status (Out of sync?), Tunnel Status, BGP Status.</li>
<li><b>Branch padho.</b> <code>show vpn ike-sa</code>, phir <code>show vpn ipsec-sa</code>, phir <code>show vpn flow</code>.</li>
<li><b>Test force karo.</b> <code>test vpn ike-sa gateway PA-GW</code>, phir log padho.</li>
<li><b>Symptom ko cause se match karo</b> neeche ki table se. Ek item fix karo. SAs clear karo. Dobara test.</li>
</ol>

<table class="cmp"><tr><th>Kya dikhta hai</th><th>Likely cause</th><th>Kahan confirm karein</th></tr>
<tr><td>ike-sa khali, koi reply nahi</td><td>Galat peer IP; branch Service Endpoint Address use nahi kar raha; upstream UDP blocked</td><td>Network Details vs IKE gateway peer address</td></tr>
<tr><td>IKE start hota hai, phir "authentication failed"</td><td>Galat pre-shared key ya identity mismatch</td><td>ikemgr.log, dono gateway pages</td></tr>
<tr><td>"no proposal chosen"</td><td>IKE ya IPsec crypto mismatch</td><td>Dono sides IKE crypto aur IPsec crypto compare karo</td></tr>
<tr><td>ike-sa up, ipsec-sa missing</td><td>IPsec crypto ya PFS mismatch, ya policy-based peer ke saath Proxy ID mismatch</td><td>IPsec crypto profile, Proxy IDs tab</td></tr>
<tr><td>Dono SAs up, sirf encap</td><td>Return route missing, policy, ya cloud ke paas branch subnet ka route nahi</td><td>Routing tables, remote network subnets</td></tr>
<tr><td>Tunnel up, BGP Connect</td><td>Branch ke paas Local IP ka route nahi, galat Peer AS ya Peer IP</td><td>BGP Status dialog, branch route to 10.254.1.1</td></tr>
<tr><td>Config Status Out of sync</td><td>Change push nahi hua</td><td>Push Config (SCM) ya Commit and Push (Panorama)</td></tr>
<tr><td>Intermittent, ajeeb reachability</td><td>Infrastructure subnet ya user pools ke saath overlapping subnets</td><td>Address plan, Overlapped Subnets setting</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Decision tree">
<rect x="230" y="10" width="180" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">IKE SA established?</text>
<rect x="30" y="90" width="210" height="50" rx="8" fill="#fed7aa"/><text x="135" y="112" text-anchor="middle" class="svg-ink" font-size="12">No: peer IP, PSK, crypto</text><text x="135" y="130" text-anchor="middle" class="svg-muted" font-size="11">ikemgr.log padho</text>
<rect x="400" y="90" width="210" height="50" rx="8" fill="#bbf7d0"/><text x="505" y="112" text-anchor="middle" class="svg-ink" font-size="12">Yes: IPsec SA up?</text><text x="505" y="130" text-anchor="middle" class="svg-muted" font-size="11">no: IPsec crypto ya proxy ID</text>
<rect x="400" y="165" width="210" height="45" rx="8" fill="#bae6fd"/><text x="505" y="186" text-anchor="middle" class="svg-ink" font-size="12">Yes: routes, BGP, policy</text><text x="505" y="202" text-anchor="middle" class="svg-muted" font-size="11">overlap? pushed?</text>
<line x1="270" y1="46" x2="135" y2="90" stroke="#64748b" stroke-width="2"/><line x1="370" y1="46" x2="505" y2="90" stroke="#64748b" stroke-width="2"/><line x1="505" y1="140" x2="505" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Upar se neeche chalo. Ek time par ek fault.</p></div>

<h3>Lab walk-through: teen injected faults</h3>
<p><b>Fault A: galat peer IP.</b> BR-FW par peer 203.0.113.101 ki jagah 203.0.113.110 hai.</p>
<pre class="out">admin@BR-FW&gt; show vpn ike-sa gateway PA-GW
<span class="hl">No IKE SA found</span>
admin@BR-FW&gt; test vpn ike-sa gateway PA-GW
Start time: Oct.04 10:40:12
<span class="hl">Initiate 1 IKE SA.</span></pre>
<p>Network Details mein Service Endpoint Address check karo, gateway sahi karo, commit karo, dobara test.</p>

<p><b>Fault B: galat pre-shared key.</b> ike-sa list khali rehti hai, aur IKE log authentication failure dikhata hai.</p>
<pre class="out">admin@BR-FW&gt; less mp-log ikemgr.log
2026-10-04 10:44:31 [PROTO_NOTIFY]: received notify type AUTHENTICATION_FAILED
<span class="hl">2026-10-04 10:44:31 [ERROR]: IKEv2 authentication failed, check pre-shared key and IDs</span></pre>
<p>Branch par key dobara daalo (trailing spaces dhyaan se) aur identities compare karo.</p>

<p><b>Fault C: crypto mismatch.</b> Jaise branch DH group 19 use kare jabki cloud profile group 14.</p>
<pre class="out">2026-10-04 10:49:02 [PROTO_NOTIFY]: received notify type NO_PROPOSAL_CHOSEN
<span class="hl">2026-10-04 10:49:02 [ERROR]: IKE phase-1 negotiation failed, proposal mismatch</span></pre>
<p>Branch profile ko cloud se match karo, commit karo, phir <code>clear vpn ike-sa gateway PA-GW</code> aur <code>clear vpn ipsec-sa tunnel PA-TUN</code>, aur <code>test vpn</code> dobara. Yeh log lines illustrative hain; exact text release ke hisaab se alag hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Success aisa dikhta hai: ike-sa peer 203.0.113.101 ke saath established, ipsec-sa active, Monitor mein Tunnel Status Up, aur PC-BR (10.20.0.100) internet reach karta hai. Lab ke teeno tests tabhi pass hote hain jab dono phases aur route maujood hon.</p></div>

<h3>Aur causes jo aapko pata hone chahiye</h3>
<ul>
<li><b>Proxy ID:</b> policy-based CPE ko matching Proxy ID chahiye, warna phase 2 fail.</li>
<li><b>Missing route:</b> CPE par Tunnel Monitor IP ya BGP Local IP ka route nahi.</li>
<li><b>Overlap:</b> branch subnets infrastructure subnet (10.255.0.0/24) ya mobile pool (10.200.0.0/23) se overlap.</li>
<li><b>Not pushed:</b> object console mein hai par Config Status Out of sync hai.</li>
<li><b>BGP galat:</b> remote network par galat Peer AS ya Peer IP.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Ek saath teen cheezein badalna; profile edit ke baad SAs clear karna bhoolna; branch debug karna jabki change kabhi push hi nahi hua; debug on chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSE exam ka troubleshooting domain status pages aur CLI padhna test karta hai. "Out of sync" matlab push, "no proposal chosen" matlab crypto, "authentication failed" matlab key ya identity.</p></div>

<div class="scn"><h4>Woh ticket jo ek space tha</h4><p>Maintenance change ke baad branch tunnel fail ho gaya. Screen par sab match tha. Log ne kaha authentication failed. Key trailing space ke saath paste hui thi. Haath se dobara type karne par tunnel do minute mein up ho gaya.</p><p><b>Lesson:</b> log par bharosa karo, screen par nahi. Ek time par ek cheez fix karo.</p></div>

<div class="iv"><p class="q">"Prisma Access ka branch tunnel down hai. Mujhe walk-through do."</p><p>Pehle Config Status aur Tunnel Status dekhta hoon, phir branch par show vpn ike-sa. Khali ho to peer IP ko Service Endpoint Address se verify karta hoon, phir ikemgr.log padhta hoon: authentication failed matlab key ya identity, no proposal chosen matlab crypto. IKE up par IPsec nahi to IPsec crypto aur Proxy IDs. Phir routes, overlap aur change push hua ya nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order follow karo: cloud status, branch SAs, test vpn, log, fix, clear, retest.</li>
<li>Khali ike-sa matlab peer, PSK ya crypto; log padhkar chuno.</li>
<li>Dono SAs up par traffic nahi matlab routes, policy, overlap ya not pushed.</li>
<li>Policy-based peers ke liye Proxy IDs matter karte hain.</li>
<li>Ek time par ek cheez badlo.</li>
</ul></div>
`}};export{e as default};