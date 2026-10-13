var e={id:`troubleshooting`,h:{en:`Multicast troubleshooting workflow, scoping and join policy`,hi:`Multicast troubleshooting workflow, scoping aur join policy`},body:{en:`
<p>"The stream does not arrive" is the standard multicast ticket. The trick is to walk the path in the same order every time, starting at the <b>receiver</b> and moving toward the source, because each step proves one more piece of the chain. This chapter gives you that order, applies it to the three labs, and adds the two controls (scope and join policy) that limit where a group may go.</p>

<h3>The six-step walk</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Troubleshooting order">
<rect x="10" y="20" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="57" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Receiver</text><text x="57" y="62" text-anchor="middle" class="svg-muted" font-size="11">IGMP</text>
<rect x="115" y="20" width="95" height="60" rx="8" fill="#bae6fd"/><text x="162" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 Switch</text><text x="162" y="62" text-anchor="middle" class="svg-muted" font-size="11">snooping</text>
<rect x="220" y="20" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="267" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Join</text><text x="267" y="62" text-anchor="middle" class="svg-muted" font-size="11">PIM state</text>
<rect x="325" y="20" width="95" height="60" rx="8" fill="#fde68a"/><text x="372" y="45" text-anchor="middle" class="svg-ink" font-size="12">4 RPF</text><text x="372" y="62" text-anchor="middle" class="svg-muted" font-size="11">path to S/RP</text>
<rect x="430" y="20" width="95" height="60" rx="8" fill="#fed7aa"/><text x="477" y="45" text-anchor="middle" class="svg-ink" font-size="12">5 RP</text><text x="477" y="62" text-anchor="middle" class="svg-muted" font-size="11">same on all</text>
<rect x="535" y="20" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="582" y="45" text-anchor="middle" class="svg-ink" font-size="12">6 Data</text><text x="582" y="62" text-anchor="middle" class="svg-muted" font-size="11">counters</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">show igmp group | show igmp snooping membership | show pim join extensive</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">show multicast rpf | show pim neighbors | show pim rps | show multicast route extensive</text>
</svg><p class="cap">Receiver first; each step proves one more link in the chain.</p></div>
<ol>
<li><b>Does the last-hop router see a member?</b> <code>show igmp group</code> (and the version and the Include/Exclude mode for SSM).</li>
<li><b>On the switch, is the port a member?</b> <code>show igmp snooping membership</code>; check the mrouter port.</li>
<li><b>Is there join state with an upstream?</b> <code>show pim join extensive</code>. An upstream of <i>unknown</i> means no RPF route or no RP.</li>
<li><b>RPF.</b> <code>show multicast rpf SOURCE-OR-RP</code> and <code>show pim neighbors</code>: is PIM running on the RPF interface and is there a neighbour?</li>
<li><b>RP.</b> <code>show pim rps</code> on every hop: the same RP for the group? For anycast: <code>show msdp</code> and <code>show msdp source-active</code>.</li>
<li><b>Data.</b> <code>show multicast route extensive</code>: packets counted on each hop? Does the first-hop router see the source at all?</li>
</ol>

<h3>Ticket 1: the class video (PIM-SM and snooping)</h3>
<p>Symptom: PC1 and PC2 should watch 239.61.1.1, PC3 must not, but nobody receives. Start at step 1 and 2. If SW1 lists ge-0/0/1.0 and ge-0/0/2.0 under the group and an mrouter interface toward R3, snooping is right. On R3 <code>show pim join</code> must list the (*,G) toward RP 10.61.255.2. If the join is missing, check the RP type with <code>show pim rps</code> (<code>static</code> on R1 and R3, <code>local</code> on R2). If it exists, check the data plane: on R1 the (S,G) with upstream ge-0/0/0.0, on R3 the entry with downstream ge-0/0/1.0 and a growing packet count. All of these were shown in chapters 3 to 5; a break at any of them points to exactly one fix.</p>

<h3>Ticket 2: anycast with a missing MSDP session</h3>
<p>Symptom: PC1 is a member of 239.62.5.5, the source sends, nothing arrives. Steps 3 and 5 show the problem: RP-A has the Register for the source but no joins, RP-B has the (*,G) but never saw the source. Check <code>show msdp</code> on both: no peer, or state Active, means no SA exchange. The lab output after the mesh group is applied shows <code>Established</code> and an SA count of 1/1. If a peer stays Active after configuration, verify <code>local-address</code>, that the peer address is the <b>unique</b> loopback of the other RP, and that TCP port 639 is reachable.</p>
<p>Before MSDP the entry that proves where the join lived was:</p>
<pre class="out">lab@RP-B&gt; show pim join
Group: 239.62.5.5
    Source: *
    RP: 10.62.255.100
    Flags: sparse,rptree,wildcard
    <span class="hl">Upstream interface: Local</span></pre>
<p>"Upstream interface: Local" means RP-B is itself the RP for this (*,G) and has nowhere to send a join: it does not know the source yet.</p>

<h3>Ticket 3: the SSM ticker (RPF)</h3>
<p>Symptom: no packets at the dealers. The order matters: IGMP first (<code>show igmp group</code> showed Exclude with source 0.0.0.0, so set version 3), then PIM (<code>show pim join extensive</code> showed <code>None (RPF check failed)</code>), then RPF (<code>show multicast rpf 10.63.10.50</code> showed ge-0/0/2.0 with a note that PIM is not running there). The fix was an inet.2 route and a rib-group. In the final state R2-CORE holds the (S,G) join and R3 forwards to irb.60.</p>

<h3>Scoping and join policy</h3>
<p>Three tools limit where a group may travel:</p>
<ul>
<li><b>Scope</b> - a boundary: <code>set routing-options multicast scope SITE prefix 239.61.0.0/16 interface ge-0/0/1.0</code>. Packets for the range do not cross that interface. <code>show multicast scope</code> lists them.</li>
<li><b>PIM join filter</b> - <code>set protocols pim import NO-LAB</code>, a policy applied to joins received from neighbours.</li>
<li><b>IGMP group policy</b> - <code>set protocols igmp interface ge-0/0/1.0 group-policy NO-LAB</code>, so reports for rejected groups are ignored on that LAN.</li>
</ul>
<pre class="code">set policy-options policy-statement NO-LAB term t from route-filter 239.61.99.0/24 orlonger
set policy-options policy-statement NO-LAB term t then reject</pre>
<pre class="out">lab@R2&gt; show multicast scope
Scope name                      Group Prefix       Interface         Resolve Rejects</pre>
<p>On the lab router no scope is configured, so the table is empty. If a group stops at a boundary after you configure a scope, the Rejects counter for that scope grows. Use the policy tools to keep a private range (for example 239.61.99.0/24) inside one site, or to stop a lab's multicast from reaching production.</p>

<h3>Signature symptoms</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Command</th></tr>
<tr><td>No member in IGMP</td><td>Host not joining; wrong VLAN; version mismatch</td><td>show igmp group</td></tr>
<tr><td>Upstream unknown</td><td>RPF failure or no RP</td><td>show multicast rpf, show pim rps</td></tr>
<tr><td>(*,G) at RP, no source</td><td>Anycast without MSDP</td><td>show msdp, show msdp source-active</td></tr>
<tr><td>(S,G) present, no downstream</td><td>No receivers or snooping/IGMP problem</td><td>show igmp snooping membership</td></tr>
<tr><td>Works for a minute then stops</td><td>No IGMP querier in the VLAN</td><td>show igmp snooping membership</td></tr>
<tr><td>Stops at a boundary</td><td>Scope or join policy</td><td>show multicast scope</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A ticket: "PC2 gets nothing". IGMP on R3 shows no group on that LAN. That alone stops the investigation at step 1: the PC never joined or sits in a different VLAN. Everything upstream (PIM, RP, RPF) can be correct and irrelevant. Spend the first minute at the receiver.</p></div>

<div class="warn"><p><b>Common mistake.</b> Debugging at the source first. A silent source is rare; the usual fault is at the receiver edge (IGMP version, snooping, querier) or in RPF.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show pim join</code> showing a group does not mean traffic flows; only <code>show multicast route</code> with forwarding state and growing counters proves forwarding. Conversely, forwarding entries can exist while IGMP is gone and will expire.</p></div>

<div class="scn"><h4>The lab video that reached production</h4><p>A trainer's multicast video, sent to 239.61.99.1 for a lab VLAN, started to appear in an office VLAN. Both sites ran PIM through the same core. A scope on the lab uplink for 239.61.99.0/24 stopped it, and <code>show multicast scope</code> afterwards showed the Rejects counter increasing at the boundary.</p><p><b>Lesson:</b> private group ranges need explicit boundaries; PIM will happily connect two receivers anywhere.</p></div>

<div class="iv"><p class="q">"A multicast stream does not reach a receiver. How do you troubleshoot?"</p><p>I start at the receiver: IGMP membership on the router and snooping on the switch. Then PIM join state with an upstream, then the RPF check and PIM neighbours, then RP consistency or MSDP for anycast, and finally forwarding counters on each hop. I name the command for each step and I stop as soon as one step fails.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk receiver to source: IGMP, snooping, join, RPF, RP, data.</li>
<li>Upstream unknown means RPF or RP trouble; RP only (*,G) with no source means missing MSDP.</li>
<li>Only show multicast route proves forwarding.</li>
<li>Use scope, PIM import and IGMP group-policy to limit group reach.</li>
<li>Check IGMP version for SSM and the querier for snooping.</li>
</ul></div>
`,hi:`
<p>"Stream nahi aa rahi" standard multicast ticket hai. Trick yeh hai ki path ko har baar usi order mein chalo, <b>receiver</b> se shuru karke source ki taraf, kyunki har step chain ka ek aur hissa saabit karta hai. Yeh chapter aapko woh order deta hai, use teeno labs par lagata hai, aur do controls (scope aur join policy) jodta hai jo group ke jaane ki jagah limit karte hain.</p>

<h3>Chhe-step walk</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Troubleshooting order">
<rect x="10" y="20" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="57" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Receiver</text><text x="57" y="62" text-anchor="middle" class="svg-muted" font-size="11">IGMP</text>
<rect x="115" y="20" width="95" height="60" rx="8" fill="#bae6fd"/><text x="162" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 Switch</text><text x="162" y="62" text-anchor="middle" class="svg-muted" font-size="11">snooping</text>
<rect x="220" y="20" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="267" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Join</text><text x="267" y="62" text-anchor="middle" class="svg-muted" font-size="11">PIM state</text>
<rect x="325" y="20" width="95" height="60" rx="8" fill="#fde68a"/><text x="372" y="45" text-anchor="middle" class="svg-ink" font-size="12">4 RPF</text><text x="372" y="62" text-anchor="middle" class="svg-muted" font-size="11">S/RP tak path</text>
<rect x="430" y="20" width="95" height="60" rx="8" fill="#fed7aa"/><text x="477" y="45" text-anchor="middle" class="svg-ink" font-size="12">5 RP</text><text x="477" y="62" text-anchor="middle" class="svg-muted" font-size="11">sab par same</text>
<rect x="535" y="20" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="582" y="45" text-anchor="middle" class="svg-ink" font-size="12">6 Data</text><text x="582" y="62" text-anchor="middle" class="svg-muted" font-size="11">counters</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">show igmp group | show igmp snooping membership | show pim join extensive</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">show multicast rpf | show pim neighbors | show pim rps | show multicast route extensive</text>
</svg><p class="cap">Pehle receiver; har step chain ka ek aur link saabit karta hai.</p></div>
<ol>
<li><b>Kya last-hop router ko member dikhta hai?</b> <code>show igmp group</code> (aur SSM ke liye version aur Include/Exclude mode).</li>
<li><b>Switch par kya port member hai?</b> <code>show igmp snooping membership</code>; mrouter port check karo.</li>
<li><b>Kya upstream ke saath join state hai?</b> <code>show pim join extensive</code>. Upstream <i>unknown</i> ka matlab RPF route nahi ya RP nahi.</li>
<li><b>RPF.</b> <code>show multicast rpf SOURCE-OR-RP</code> aur <code>show pim neighbors</code>: kya RPF interface par PIM chal raha hai aur neighbour hai?</li>
<li><b>RP.</b> Har hop par <code>show pim rps</code>: group ke liye same RP? Anycast ke liye: <code>show msdp</code> aur <code>show msdp source-active</code>.</li>
<li><b>Data.</b> <code>show multicast route extensive</code>: har hop par packets gine ja rahe hain? Kya first-hop router ko source dikhta hai?</li>
</ol>

<h3>Ticket 1: class video (PIM-SM aur snooping)</h3>
<p>Symptom: PC1 aur PC2 ko 239.61.1.1 dekhna chahiye, PC3 ko nahi, lekin kisi ko nahi mil raha. Step 1 aur 2 se shuru karo. Agar SW1 group ke neeche ge-0/0/1.0 aur ge-0/0/2.0 aur R3 ki taraf mrouter interface list karta hai to snooping sahi hai. R3 par <code>show pim join</code> mein RP 10.61.255.2 ki taraf (*,G) hona chahiye. Join missing ho to <code>show pim rps</code> se RP type check karo (R1 aur R3 par <code>static</code>, R2 par <code>local</code>). Maujood ho to data plane check karo: R1 par upstream ge-0/0/0.0 wala (S,G), R3 par ge-0/0/1.0 downstream aur badhta packet count wala entry. Yeh sab chapters 3 se 5 mein dikhaya gaya; kisi bhi par toot ek hi fix ki taraf point karti hai.</p>

<h3>Ticket 2: MSDP session ke bina anycast</h3>
<p>Symptom: PC1 239.62.5.5 ka member hai, source bhejta hai, kuch nahi aata. Steps 3 aur 5 problem dikhate hain: RP-A ke paas source ka Register hai lekin joins nahi, RP-B ke paas (*,G) hai lekin usne source kabhi nahi dekha. Dono par <code>show msdp</code> check karo: peer nahi, ya state Active, ka matlab SA exchange nahi. Mesh group lagne ke baad lab output <code>Established</code> aur SA count 1/1 dikhata hai. Configuration ke baad peer Active hi rahe to <code>local-address</code> verify karo, ki peer address doosre RP ka <b>unique</b> loopback hai, aur TCP port 639 reachable hai.</p>
<p>MSDP se pehle jis entry ne saabit kiya ki join kahan tha:</p>
<pre class="out">lab@RP-B&gt; show pim join
Group: 239.62.5.5
    Source: *
    RP: 10.62.255.100
    Flags: sparse,rptree,wildcard
    <span class="hl">Upstream interface: Local</span></pre>
<p>"Upstream interface: Local" ka matlab RP-B khud is (*,G) ka RP hai aur join bhejne ki koi jagah nahi: use source abhi pata nahi.</p>

<h3>Ticket 3: SSM ticker (RPF)</h3>
<p>Symptom: dealers ke paas koi packet nahi. Order matter karta hai: pehle IGMP (<code>show igmp group</code> ne source 0.0.0.0 ke saath Exclude dikhaya, to version 3 set karo), phir PIM (<code>show pim join extensive</code> ne <code>None (RPF check failed)</code> dikhaya), phir RPF (<code>show multicast rpf 10.63.10.50</code> ne ge-0/0/2.0 dikhaya aur note ki wahan PIM nahi chal raha). Fix inet.2 route aur rib-group tha. Final state mein R2-CORE ke paas (S,G) join hai aur R3 irb.60 ko forward karta hai.</p>

<h3>Scoping aur join policy</h3>
<p>Teen tools group ke jaane ki jagah limit karte hain:</p>
<ul>
<li><b>Scope</b> - boundary: <code>set routing-options multicast scope SITE prefix 239.61.0.0/16 interface ge-0/0/1.0</code>. Range ke packets us interface ko cross nahi karte. <code>show multicast scope</code> unhe list karta hai.</li>
<li><b>PIM join filter</b> - <code>set protocols pim import NO-LAB</code>, neighbours se mile joins par lagi policy.</li>
<li><b>IGMP group policy</b> - <code>set protocols igmp interface ge-0/0/1.0 group-policy NO-LAB</code>, taaki us LAN par reject kiye groups ke reports ignore ho jaayein.</li>
</ul>
<pre class="code">set policy-options policy-statement NO-LAB term t from route-filter 239.61.99.0/24 orlonger
set policy-options policy-statement NO-LAB term t then reject</pre>
<pre class="out">lab@R2&gt; show multicast scope
Scope name                      Group Prefix       Interface         Resolve Rejects</pre>
<p>Lab router par koi scope configured nahi, isliye table khaali hai. Scope configure karne ke baad group boundary par ruke to us scope ka Rejects counter badhta hai. Policy tools ka use private range (jaise 239.61.99.0/24) ek site ke andar rakhne ke liye karo, ya lab ke multicast ko production tak pahunchne se rokne ke liye.</p>

<h3>Signature symptoms</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Command</th></tr>
<tr><td>IGMP mein member nahi</td><td>Host join nahi kar raha; galat VLAN; version mismatch</td><td>show igmp group</td></tr>
<tr><td>Upstream unknown</td><td>RPF failure ya RP nahi</td><td>show multicast rpf, show pim rps</td></tr>
<tr><td>RP par (*,G), source nahi</td><td>MSDP ke bina anycast</td><td>show msdp, show msdp source-active</td></tr>
<tr><td>(S,G) hai, downstream nahi</td><td>Receivers nahi ya snooping/IGMP problem</td><td>show igmp snooping membership</td></tr>
<tr><td>Ek minute chalta hai phir ruk jaata hai</td><td>VLAN mein IGMP querier nahi</td><td>show igmp snooping membership</td></tr>
<tr><td>Boundary par ruk jaata hai</td><td>Scope ya join policy</td><td>show multicast scope</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "PC2 ko kuch nahi mil raha". R3 par IGMP us LAN par koi group nahi dikhata. Yahin step 1 par investigation ruk jaati hai: PC ne join hi nahi kiya ya alag VLAN mein hai. Upar ka sab kuch (PIM, RP, RPF) sahi aur irrelevant ho sakta hai. Pehla minute receiver par lagao.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehle source par debug karna. Chup source kam hota hai; aam fault receiver edge (IGMP version, snooping, querier) ya RPF mein hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show pim join</code> mein group dikhne ka matlab traffic bah raha hai nahi; sirf forwarding state aur badhte counters wala <code>show multicast route</code> forwarding saabit karta hai. Ulta, IGMP chala jaye tab bhi forwarding entries rah sakti hain aur expire ho jaayengi.</p></div>

<div class="scn"><h4>Lab video jo production tak pahunch gayi</h4><p>Ek trainer ka lab VLAN ke liye 239.61.99.1 par bheja multicast video office VLAN mein dikhne laga. Dono sites ek hi core se PIM chalate the. Lab uplink par 239.61.99.0/24 ke scope ne ise roka, aur baad mein <code>show multicast scope</code> ne boundary par Rejects counter badhta dikhaya.</p><p><b>Lesson:</b> private group ranges ko explicit boundaries chahiye; PIM kahin bhi do receivers ko khushi se jod dega.</p></div>

<div class="iv"><p class="q">"Multicast stream receiver tak nahi pahunchti. Troubleshoot kaise karoge?"</p><p>Main receiver se shuru karta hoon: router par IGMP membership aur switch par snooping. Phir upstream ke saath PIM join state, phir RPF check aur PIM neighbours, phir RP consistency ya anycast ke liye MSDP, aur aakhir mein har hop par forwarding counters. Har step ka command batata hoon aur jaise hi koi step fail ho ruk jaata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Receiver se source tak chalo: IGMP, snooping, join, RPF, RP, data.</li>
<li>Upstream unknown ka matlab RPF ya RP trouble; sirf RP par (*,G) bina source ke ka matlab MSDP missing.</li>
<li>Sirf show multicast route forwarding saabit karta hai.</li>
<li>Group ki pahunch limit karne ke liye scope, PIM import aur IGMP group-policy use karo.</li>
<li>SSM ke liye IGMP version aur snooping ke liye querier check karo.</li>
</ul></div>
`}};export{e as default};