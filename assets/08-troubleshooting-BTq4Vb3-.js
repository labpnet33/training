var e={id:`troubleshooting`,h:{en:`Troubleshooting advanced switching: one ticket, four symptoms`,hi:`Advanced switching troubleshooting: ek ticket, chaar symptoms`},body:{en:`
<p>Advanced Layer 2 faults feel confusing because the cable is up and the interface counters look normal. The method is always the same: decide what the feature should have done, ask the switch what it actually did, and compare. This chapter walks the real ticket from the mvrp-campus-troubleshoot lab, then gives checklists for private VLANs and Q-in-Q.</p>

<h3>A four-step method</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting method">
<rect x="10" y="30" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 Scope</text><text x="80" y="74" text-anchor="middle" class="svg-muted" font-size="11">who, where, since when</text>
<rect x="170" y="30" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 Which VLAN</text><text x="240" y="74" text-anchor="middle" class="svg-muted" font-size="11">port, filter, tags</text>
<rect x="330" y="30" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 Who may talk</text><text x="400" y="74" text-anchor="middle" class="svg-muted" font-size="11">trunks, PVLAN, tunnel</text>
<rect x="490" y="30" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">4 What changed</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="11">show system commit</text>
</svg><p class="cap">Scope, VLAN, permission, change history.</p></div>

<h3>The ticket: VLAN 20 and VLAN 30 are missing after the uplift</h3>
<p>Users behind ACC2 cannot reach the VLAN 20 gateway, and the printer behind ACC1 is not in its VLAN. Start at the core, which should know all VLANs from its neighbours:</p>
<pre class="out">lab@CORE&gt; show mvrp

MVRP configuration
  MVRP status                 : Enabled
  Dynamic VLAN creation       : Enabled
  Timers (ms)                 : join 200, leave 1000, leaveall 10000

  Interface       Status     Registration   Registered VLANs
  ge-0/0/1.0      Enabled    Normal         10</pre>
<p>Two things stand out. Only <b>ge-0/0/1.0</b> is listed, so the port toward ACC2 is not running MVRP on CORE at all, and VLAN 30 (the printer VLAN) is not registered from ACC1. Check the other side:</p>
<pre class="out">lab@ACC2&gt; show mvrp

MVRP configuration
  MVRP status                 : Enabled
  Dynamic VLAN creation       : Enabled
  Timers (ms)                 : join 200, leave 1000, leaveall 10000

  Interface       Status     Registration   Registered VLANs
  ge-0/0/0.0      Enabled    Forbidden      none</pre>
<p>ACC2's uplink says <b>Forbidden</b> and registers nothing. That is a deliberate setting. Who did it, and why?</p>
<pre class="out">lab@ACC2&gt; show system commit
0   2026-10-01 23:20:24 UTC by root via other
    stop VLAN sprawl
1   2026-10-01 23:20:24 UTC by root via other</pre>
<p>The commit comment says &quot;stop VLAN sprawl&quot;. A well-meant change that blocks all registrations. There are therefore two faults: ACC2's uplink is forbidden, and CORE is not listening on the port toward ACC2. The fix removes the forbidden mode on ACC2 and enables MVRP on CORE ge-0/0/2:</p>
<pre class="code"># on ACC2
delete protocols mvrp interface ge-0/0/0 registration
commit
# on CORE
set protocols mvrp interface ge-0/0/2
commit</pre>
<pre class="out">lab@CORE&gt; show mvrp
  Interface       Status     Registration   Registered VLANs
  ge-0/0/1.0      Enabled    Normal         10,30
  ge-0/0/2.0      Enabled    Normal         20

lab@PC2&gt; ping 10.44.20.1
84 bytes from 10.44.20.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.44.20.1 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.44.20.1 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.44.20.1 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.44.20.1 icmp_seq=5 ttl=64 time=0.900 ms</pre>
<p>Registration now shows 10,30 toward ACC1 and 20 toward ACC2, and the users reach their gateway. VLAN 30 became visible because the printer filter from chapter 2 (PRN-ASSIGN) put the printer into the PRINTERS VLAN on ACC1, and MVRP then registered it.</p>

<h3>Checklist: filter-based VLANs</h3>
<ul>
<li><code>show configuration firewall</code> and the interface: is the filter applied <b>input</b> on the right interface?</li>
<li>Does the term match what the frame really carries (MAC in the right case and mask /48)?</li>
<li>Does the final term accept the rest, or is the port discarding everything?</li>
<li><code>show ethernet-switching table</code>: is the device MAC learned in the target VLAN? Is the VLAN carried on the uplink?</li>
</ul>

<h3>Checklist: private VLANs</h3>
<ul>
<li><code>show vlans extensive</code> on every switch: roles (primary, isolated, community, promiscuous, inter-switch-link) and the same VLAN IDs on both sides.</li>
<li>Host in the wrong VLAN? A host port left in the primary VLAN behaves as promiscuous.</li>
<li>Remote hosts lose the gateway? Check <code>inter-switch-link</code> at both ends of the trunk.</li>
<li>Learned MACs: a local host should appear under its secondary VLAN, remote hosts and the gateway under the primary.</li>
</ul>

<h3>Checklist: Q-in-Q and L2PT</h3>
<ul>
<li><code>show vlans extensive</code>: does the S-VLAN list the customer side with its C-VLANs and the provider side with the S-tag?</li>
<li>Do the customer unit and the NNI unit both belong to the same S-VLAN name on both PEs?</li>
<li>Small packets work but large ones do not: look at the MTU for the extra 4-byte tag.</li>
<li>Customer LLDP or STP does not cross: look at <code>show configuration protocols layer2-control</code> on both PEs and at the L2PT statistics. A non-zero Dropped counter or one-sided Encapsulated and Decapsulated numbers show half-configured tunnelling.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A customer says LLDP works but STP does not cross. show configuration protocols layer2-control shows <code>protocol lldp</code> only. Adding <code>protocol stp</code> on both PEs makes the Encapsulated and Decapsulated counters for stp start to count.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing the symptom on one device and not checking the neighbour. In the MVRP ticket the first look at CORE would have led to enabling MVRP on ge-0/0/2 only, and ACC2 would still be forbidden. Always check both ends of the link and the commit history.</p></div>
<div class="exam"><p><b>Exam trap.</b> A port in registration forbidden mode is not an error and shows no alarm. It is legitimate configuration that silently prevents dynamic VLAN learning. Read the Registration column, not only the Status column.</p></div>

<div class="scn"><h4>The commit comment that explained everything</h4><p>An engineer spent an hour comparing VLAN configurations until a colleague typed show system commit. The comment &quot;stop VLAN sprawl&quot; led directly to the forbidden setting. The fix took one command.</p><p><b>Lesson:</b> ask what changed before asking what is broken.</p></div>

<div class="iv"><p class="q">"MVRP VLANs are not showing on a trunk. How do you troubleshoot?"</p><p>I run show mvrp on both ends: is MVRP enabled on the port, is the Registration column Normal and not Forbidden, and does the Registered VLANs column list the VLANs? Then show mvrp dynamic-vlan-memberships, and show system commit to find any recent lock-down change. I also remember MVRP never assigns access ports to VLANs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: scope, which VLAN, who may talk, what changed.</li>
<li>show mvrp both ends: enabled ports, Registration mode, registered VLANs.</li>
<li>show system commit often names the cause.</li>
<li>PVLAN: show vlans extensive roles and inter-switch-link on both ends.</li>
<li>Q-in-Q: S-VLAN membership, MTU, and layer2-control on both PEs.</li>
</ul></div>
`,hi:`
<p>Advanced Layer 2 faults confusing lagte hain kyunki cable up hota hai aur interface counters normal dikhte hain. Method hamesha wahi hai: tay karo ki feature ko kya karna chahiye tha, switch se poochho ki usne asal mein kya kiya, aur compare karo. Yeh chapter mvrp-campus-troubleshoot lab ka asli ticket chalata hai, phir private VLANs aur Q-in-Q ke checklists deta hai.</p>

<h3>Chaar-step method</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting method">
<rect x="10" y="30" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 Scope</text><text x="80" y="74" text-anchor="middle" class="svg-muted" font-size="11">kaun, kahan, kab se</text>
<rect x="170" y="30" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 Kaunsa VLAN</text><text x="240" y="74" text-anchor="middle" class="svg-muted" font-size="11">port, filter, tags</text>
<rect x="330" y="30" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 Kaun baat kare</text><text x="400" y="74" text-anchor="middle" class="svg-muted" font-size="11">trunks, PVLAN, tunnel</text>
<rect x="490" y="30" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">4 Kya badla</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="11">show system commit</text>
</svg><p class="cap">Scope, VLAN, permission, change history.</p></div>

<h3>Ticket: uplift ke baad VLAN 20 aur VLAN 30 gayab</h3>
<p>ACC2 ke peeche ke users VLAN 20 gateway tak nahi pahunch paate, aur ACC1 ke peeche ka printer apne VLAN mein nahi hai. Core se shuru karo, jise apne padosiyon se saare VLANs pata hone chahiye:</p>
<pre class="out">lab@CORE&gt; show mvrp

MVRP configuration
  MVRP status                 : Enabled
  Dynamic VLAN creation       : Enabled
  Timers (ms)                 : join 200, leave 1000, leaveall 10000

  Interface       Status     Registration   Registered VLANs
  ge-0/0/1.0      Enabled    Normal         10</pre>
<p>Do cheezein dikhti hain. Sirf <b>ge-0/0/1.0</b> list hai, isliye ACC2 ki taraf ka port CORE par MVRP chala hi nahi raha, aur VLAN 30 (printer VLAN) ACC1 se register nahi hua. Doosri side dekho:</p>
<pre class="out">lab@ACC2&gt; show mvrp

MVRP configuration
  MVRP status                 : Enabled
  Dynamic VLAN creation       : Enabled
  Timers (ms)                 : join 200, leave 1000, leaveall 10000

  Interface       Status     Registration   Registered VLANs
  ge-0/0/0.0      Enabled    Forbidden      none</pre>
<p>ACC2 ka uplink <b>Forbidden</b> bolta hai aur kuch register nahi karta. Yeh jaanbujhkar kiya gaya setting hai. Kisne kiya, aur kyun?</p>
<pre class="out">lab@ACC2&gt; show system commit
0   2026-10-01 23:20:24 UTC by root via other
    stop VLAN sprawl
1   2026-10-01 23:20:24 UTC by root via other</pre>
<p>Commit comment kehta hai &quot;stop VLAN sprawl&quot;. Achhi niyat ka badlav jo saare registrations rok deta hai. Isliye do faults hain: ACC2 ka uplink forbidden hai, aur CORE ACC2 ki taraf ke port par sun nahi raha. Fix ACC2 par forbidden mode hatata hai aur CORE ge-0/0/2 par MVRP enable karta hai:</p>
<pre class="code"># ACC2 par
delete protocols mvrp interface ge-0/0/0 registration
commit
# CORE par
set protocols mvrp interface ge-0/0/2
commit</pre>
<pre class="out">lab@CORE&gt; show mvrp
  Interface       Status     Registration   Registered VLANs
  ge-0/0/1.0      Enabled    Normal         10,30
  ge-0/0/2.0      Enabled    Normal         20

lab@PC2&gt; ping 10.44.20.1
84 bytes from 10.44.20.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.44.20.1 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.44.20.1 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.44.20.1 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.44.20.1 icmp_seq=5 ttl=64 time=0.900 ms</pre>
<p>Registration ab ACC1 ki taraf 10,30 aur ACC2 ki taraf 20 dikhata hai, aur users apne gateway tak pahunchte hain. VLAN 30 isliye dikha kyunki chapter 2 ke printer filter (PRN-ASSIGN) ne printer ko ACC1 par PRINTERS VLAN mein daala, aur MVRP ne use register kiya.</p>

<h3>Checklist: filter-based VLANs</h3>
<ul>
<li><code>show configuration firewall</code> aur interface: kya filter sahi interface par <b>input</b> lagaya hai?</li>
<li>Kya term wahi match karta hai jo frame asal mein carry karta hai (MAC sahi aur mask /48)?</li>
<li>Kya aakhri term baaki sab accept karta hai, ya port sab kuch discard kar raha hai?</li>
<li><code>show ethernet-switching table</code>: kya device MAC target VLAN mein seekha gaya? Kya VLAN uplink par carry ho raha hai?</li>
</ul>

<h3>Checklist: private VLANs</h3>
<ul>
<li>Har switch par <code>show vlans extensive</code>: roles (primary, isolated, community, promiscuous, inter-switch-link) aur dono sides par same VLAN IDs.</li>
<li>Host galat VLAN mein? Primary VLAN mein chhoda host port promiscuous ki tarah behave karta hai.</li>
<li>Remote hosts gateway kho dete hain? Trunk ke dono ends par <code>inter-switch-link</code> dekho.</li>
<li>Learned MACs: local host apne secondary VLAN ke under dikhna chahiye, remote hosts aur gateway primary ke under.</li>
</ul>

<h3>Checklist: Q-in-Q aur L2PT</h3>
<ul>
<li><code>show vlans extensive</code>: kya S-VLAN customer side ko uske C-VLANs ke saath aur provider side ko S-tag ke saath list karta hai?</li>
<li>Kya customer unit aur NNI unit dono PEs par same S-VLAN naam ke member hain?</li>
<li>Chhote packets chalte hain par bade nahi: extra 4-byte tag ke liye MTU dekho.</li>
<li>Customer LLDP ya STP paar nahi jaata: dono PEs par <code>show configuration protocols layer2-control</code> aur L2PT statistics dekho. Non-zero Dropped counter ya ek-tarfa Encapsulated aur Decapsulated numbers aadhe configured tunnelling dikhate hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Customer kehta hai LLDP chalta hai par STP paar nahi jaata. show configuration protocols layer2-control sirf <code>protocol lldp</code> dikhata hai. Dono PEs par <code>protocol stp</code> jodne se stp ke Encapsulated aur Decapsulated counters ginna shuru karte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Ek device par symptom theek karna aur padosi check na karna. MVRP ticket mein CORE ko pehli nazar mein dekhne se sirf ge-0/0/2 par MVRP enable hota, aur ACC2 phir bhi forbidden rehta. Hamesha link ke dono ends aur commit history check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Registration forbidden mode wala port error nahi hai aur koi alarm nahi dikhata. Yeh legitimate configuration hai jo chupchaap dynamic VLAN learning rokta hai. Sirf Status column nahi, Registration column padho.</p></div>

<div class="scn"><h4>Commit comment jisne sab samjha diya</h4><p>Ek engineer ne ek ghanta VLAN configurations compare karte hue bitaya jab tak ek colleague ne show system commit type nahi kiya. Comment &quot;stop VLAN sprawl&quot; seedha forbidden setting tak le gaya. Fix ek command ka tha.</p><p><b>Lesson:</b> kya toota yeh poochne se pehle poochho kya badla.</p></div>

<div class="iv"><p class="q">"Trunk par MVRP VLANs nahi dikh rahe. Troubleshoot kaise karoge?"</p><p>Main dono ends par show mvrp chalata hoon: kya port par MVRP enabled hai, kya Registration column Normal hai Forbidden nahi, aur kya Registered VLANs column VLANs list karta hai? Phir show mvrp dynamic-vlan-memberships, aur show system commit se recent lock-down badlav dhoondhta hoon. Yeh bhi yaad rakhta hoon ki MVRP kabhi access ports ko VLANs mein nahi daalta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: scope, kaunsa VLAN, kaun baat kare, kya badla.</li>
<li>Dono ends par show mvrp: enabled ports, Registration mode, registered VLANs.</li>
<li>show system commit aksar karan ka naam bata deta hai.</li>
<li>PVLAN: show vlans extensive ke roles aur dono ends par inter-switch-link.</li>
<li>Q-in-Q: S-VLAN membership, MTU, aur dono PEs par layer2-control.</li>
</ul></div>
`}};export{e as default};