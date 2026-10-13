var e={id:`summary`,h:{en:`Summary and exam checklist: multicast`,hi:`Summary aur exam checklist: multicast`},body:{en:`
<p>You have followed a stream from the receiver's IGMP report, through the switch and the PIM tree, to the RP and back to the source, and you have repaired three broken designs. Use this chapter as your last-day revision sheet for the multicast objectives of JNCIP-ENT (JN0-650).</p>

<h3>Can-do checklist</h3>
<ul>
<li>Choose group addresses: 239.0.0.0/8 for private, 232.0.0.0/8 for SSM; explain why 32 groups share one multicast MAC.</li>
<li>Compare IGMPv1, v2 and v3, and say who the querier is and the default query interval.</li>
<li>Enable IGMP snooping on a VLAN and read <code>show igmp snooping membership</code>, including the mrouter interface.</li>
<li>Enable PIM sparse mode and explain the RPT, Register, Register-Stop and the SPT switchover.</li>
<li>Configure a local RP, a static RP and describe BSR election and the RP-set.</li>
<li>Build anycast RP with MSDP (mesh group, unique addresses) and prove failover.</li>
<li>Configure SSM, IGMPv3 and fix an RPF failure with inet.2 and a rib-group.</li>
<li>Limit group reach with scope, PIM import and IGMP group-policy.</li>
<li>Troubleshoot receiver-first with the six-step walk.</li>
</ul>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ranges</td><td>224.0.0.0/24 link-local; 232.0.0.0/8 SSM; 239.0.0.0/8 administratively scoped</td></tr>
<tr><td>MAC mapping</td><td>01:00:5e + low 23 bits; 32 groups per MAC</td></tr>
<tr><td>IGMP</td><td>Query interval 125 s; membership timeout 260 s; querier = lowest IP; v3 reports to 224.0.0.22</td></tr>
<tr><td>PIM</td><td>Hellos to 224.0.0.13; DR = highest priority then highest IP; sparse mode default on Junos</td></tr>
<tr><td>Trees</td><td>(*,G) shared tree rooted at RP; (S,G) source tree</td></tr>
<tr><td>Register</td><td>Unicast from first-hop DR to RP; RP answers with (S,G) join and Register-Stop</td></tr>
<tr><td>RPF</td><td>Data must arrive on the interface leading to S; joins go out of it; table inet.0, optionally inet.2 by rib-group</td></tr>
<tr><td>RP methods</td><td>Local, static, BSR (election by highest priority), Auto-RP</td></tr>
<tr><td>Anycast RP</td><td>Same address on loopbacks; MSDP (TCP 639) or PIM anycast RP shares sources</td></tr>
<tr><td>SSM</td><td>232/8 default; IGMPv3 Include; no RP; (S,G) join straight to source</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="out"><span class="hl">IGMP</span>      show igmp interface | show igmp group
<span class="hl">Snooping</span>  show igmp snooping membership
<span class="hl">PIM</span>       show pim neighbors | show pim interfaces | show pim join extensive
<span class="hl">RP</span>        show pim rps [extensive] | show pim bootstrap
<span class="hl">MSDP</span>      show msdp | show msdp source-active
<span class="hl">RPF</span>       show multicast rpf SOURCE
<span class="hl">Forward</span>   show multicast route [extensive] | show multicast scope
<span class="hl">Config</span>    set protocols pim interface all | pim rp local|static address X
          set protocols igmp interface X version 3
          set protocols igmp-snooping vlan NAME
          set protocols msdp group G mode mesh-group peer X
          set routing-options rib-groups G import-rib inet.2 | set protocols pim rib-group inet G</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASM</dt><dd>Any-source multicast: receivers ask for (*,G) and an RP helps find sources.</dd>
<dt>SSM</dt><dd>Source-specific multicast: receivers ask for (S,G); no RP.</dd>
<dt>IGMP</dt><dd>Protocol hosts use to join and leave groups on a LAN.</dd>
<dt>IGMP snooping</dt><dd>Layer 2 switch feature that forwards groups only where members exist.</dd>
<dt>PIM-SM</dt><dd>Protocol that builds sparse-mode trees between routers.</dd>
<dt>RP</dt><dd>Rendezvous point: meeting place for sources and receivers in sparse mode.</dd>
<dt>BSR</dt><dd>Bootstrap router: distributes the RP-set.</dd>
<dt>MSDP</dt><dd>Protocol that lets RPs share active-source information.</dd>
<dt>RPF</dt><dd>Reverse path forwarding: the check tying multicast to unicast routing.</dd>
<dt>DR</dt><dd>Designated router on a LAN: joins for receivers, registers for sources.</dd>
</dl>

<div class="eg"><p><b>Worked example for revision.</b> Receivers on LAN L join 239.5.5.5; the RP is 10.0.0.9; the source is S behind R1. Trace: host IGMP report, last-hop DR, (*,G) join toward 10.0.0.9 (RPF toward the RP), source registers with RP, RP sends (S,G) join and Register-Stop, data flows S to RP down the shared tree, last hop switches to the SPT. If any hop's RPF interface lacks PIM, the chain breaks there.</p></div>

<div class="warn"><p><b>Last-minute mistakes.</b> Forgetting IGMPv3 for SSM; putting the RP on a physical interface; not including lo0 in PIM; anycast RP without MSDP; blaming IGMP for an RPF problem; enabling snooping without a querier.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pay attention to the word "RP" in the question. If it is SSM, there is no RP. If it is anycast, the answer includes MSDP or PIM anycast. If a stream stops after a few minutes, think querier or timeout.</p></div>

<div class="scn"><h4>One network, three problems</h4><p>A candidate was shown a network where the training video, the anycast RPs and the SSM ticker all failed. She fixed the video with an IGMP snooping line, the anycast RPs with an MSDP mesh group, and the ticker with IGMPv3 plus an inet.2 route. Each time she named the command that revealed the fault: show igmp snooping membership, show msdp, show multicast rpf.</p><p><b>Lesson:</b> a short list of show commands, in the right order, solves nearly every multicast ticket.</p></div>

<div class="iv"><p class="q">"Design multicast for a campus with live training video and a market-data feed."</p><p>Private groups in 239/8 for the video with PIM sparse mode, a loopback RP (anycast with MSDP for redundancy) and IGMP snooping with a querier on every access VLAN; SSM in 232/8 for the feed with IGMPv3 and no RP; RPF checked with show multicast rpf, an inet.2 route if the unicast path is not PIM-enabled; scope boundaries to keep private ranges inside the site.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP and snooping serve receivers; PIM, RP, MSDP serve the core; RPF ties it to unicast.</li>
<li>SSM removes the RP; anycast RP needs MSDP or PIM anycast.</li>
<li>Always troubleshoot from the receiver toward the source.</li>
<li>Only forwarding counters prove traffic flows.</li>
<li>Know the cheat-sheet commands by heart.</li>
</ul></div>
`,hi:`
<p>Aapne stream ko receiver ke IGMP report se, switch aur PIM tree ke raaste, RP tak aur wapas source tak follow kiya, aur teen toote hue designs repair kiye. Is chapter ko JNCIP-ENT (JN0-650) ke multicast objectives ki aakhri din ki revision sheet ki tarah use karo.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Group addresses chuno: private ke liye 239.0.0.0/8, SSM ke liye 232.0.0.0/8; samjhao ki 32 groups ek multicast MAC kyun share karte hain.</li>
<li>IGMPv1, v2 aur v3 compare karo, aur batao querier kaun hai aur default query interval kya hai.</li>
<li>VLAN par IGMP snooping enable karo aur mrouter interface samet <code>show igmp snooping membership</code> padho.</li>
<li>PIM sparse mode enable karo aur RPT, Register, Register-Stop aur SPT switchover samjhao.</li>
<li>Local RP, static RP configure karo aur BSR election aur RP-set batao.</li>
<li>MSDP (mesh group, unique addresses) ke saath anycast RP banao aur failover saabit karo.</li>
<li>SSM, IGMPv3 configure karo aur inet.2 aur rib-group se RPF failure fix karo.</li>
<li>Scope, PIM import aur IGMP group-policy se group ki pahunch limit karo.</li>
<li>Chhe-step walk se receiver-first troubleshoot karo.</li>
</ul>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ranges</td><td>224.0.0.0/24 link-local; 232.0.0.0/8 SSM; 239.0.0.0/8 administratively scoped</td></tr>
<tr><td>MAC mapping</td><td>01:00:5e + low 23 bits; ek MAC par 32 groups</td></tr>
<tr><td>IGMP</td><td>Query interval 125 s; membership timeout 260 s; querier = lowest IP; v3 reports 224.0.0.22 par</td></tr>
<tr><td>PIM</td><td>Hellos 224.0.0.13 par; DR = highest priority phir highest IP; Junos par sparse mode default</td></tr>
<tr><td>Trees</td><td>(*,G) shared tree RP par rooted; (S,G) source tree</td></tr>
<tr><td>Register</td><td>First-hop DR se RP ko unicast; RP (S,G) join aur Register-Stop se jawab deta hai</td></tr>
<tr><td>RPF</td><td>Data S ki taraf jaane wale interface par aana chahiye; joins usi se jaate hain; table inet.0, rib-group se optionally inet.2</td></tr>
<tr><td>RP methods</td><td>Local, static, BSR (highest priority se election), Auto-RP</td></tr>
<tr><td>Anycast RP</td><td>Loopbacks par same address; MSDP (TCP 639) ya PIM anycast RP sources share karta hai</td></tr>
<tr><td>SSM</td><td>232/8 default; IGMPv3 Include; RP nahi; (S,G) join seedha source ko</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="out"><span class="hl">IGMP</span>      show igmp interface | show igmp group
<span class="hl">Snooping</span>  show igmp snooping membership
<span class="hl">PIM</span>       show pim neighbors | show pim interfaces | show pim join extensive
<span class="hl">RP</span>        show pim rps [extensive] | show pim bootstrap
<span class="hl">MSDP</span>      show msdp | show msdp source-active
<span class="hl">RPF</span>       show multicast rpf SOURCE
<span class="hl">Forward</span>   show multicast route [extensive] | show multicast scope
<span class="hl">Config</span>    set protocols pim interface all | pim rp local|static address X
          set protocols igmp interface X version 3
          set protocols igmp-snooping vlan NAME
          set protocols msdp group G mode mesh-group peer X
          set routing-options rib-groups G import-rib inet.2 | set protocols pim rib-group inet G</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASM</dt><dd>Any-source multicast: receivers (*,G) maangte hain aur RP sources dhoondhne mein madad karta hai.</dd>
<dt>SSM</dt><dd>Source-specific multicast: receivers (S,G) maangte hain; RP nahi.</dd>
<dt>IGMP</dt><dd>Protocol jo hosts LAN par group join aur leave karne ke liye use karte hain.</dd>
<dt>IGMP snooping</dt><dd>Layer 2 switch feature jo groups ko sirf wahan forward karta hai jahan members hain.</dd>
<dt>PIM-SM</dt><dd>Protocol jo routers ke beech sparse-mode trees banata hai.</dd>
<dt>RP</dt><dd>Rendezvous point: sparse mode mein sources aur receivers ke milne ki jagah.</dd>
<dt>BSR</dt><dd>Bootstrap router: RP-set distribute karta hai.</dd>
<dt>MSDP</dt><dd>Protocol jo RPs ko active-source information share karne deta hai.</dd>
<dt>RPF</dt><dd>Reverse path forwarding: multicast ko unicast routing se jodne wala check.</dd>
<dt>DR</dt><dd>LAN par designated router: receivers ke liye joins, sources ke liye registers.</dd>
</dl>

<div class="eg"><p><b>Revision ke liye worked example.</b> LAN L ke receivers 239.5.5.5 join karte hain; RP 10.0.0.9 hai; source S R1 ke peeche hai. Trace: host IGMP report, last-hop DR, 10.0.0.9 ki taraf (*,G) join (RP ki taraf RPF), source RP ko register karta hai, RP (S,G) join aur Register-Stop bhejta hai, data S se RP se shared tree par neeche bahta hai, last hop SPT par switch karta hai. Kisi bhi hop ke RPF interface par PIM na ho to chain wahin tootti hai.</p></div>

<div class="warn"><p><b>Aakhri waqt ki galtiyan.</b> SSM ke liye IGMPv3 bhoolna; RP ko physical interface par rakhna; PIM mein lo0 shamil na karna; MSDP ke bina anycast RP; RPF problem ke liye IGMP ko doshi thehrana; querier ke bina snooping enable karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal mein "RP" shabd par dhyan do. SSM ho to RP nahi. Anycast ho to jawab mein MSDP ya PIM anycast hota hai. Stream kuch minutes baad ruk jaye to querier ya timeout socho.</p></div>

<div class="scn"><h4>Ek network, teen problems</h4><p>Ek candidate ko aisa network dikhaya gaya jahan training video, anycast RPs aur SSM ticker teeno fail the. Usne video ko IGMP snooping ki ek line se, anycast RPs ko MSDP mesh group se, aur ticker ko IGMPv3 aur inet.2 route se fix kiya. Har baar usne woh command bataya jisne fault dikhaya: show igmp snooping membership, show msdp, show multicast rpf.</p><p><b>Lesson:</b> show commands ki chhoti list, sahi order mein, lagbhag har multicast ticket solve kar deti hai.</p></div>

<div class="iv"><p class="q">"Live training video aur market-data feed wale campus ke liye multicast design karo."</p><p>Video ke liye 239/8 private groups PIM sparse mode ke saath, loopback RP (redundancy ke liye MSDP ke saath anycast) aur har access VLAN par querier ke saath IGMP snooping; feed ke liye 232/8 mein SSM IGMPv3 ke saath aur RP ke bina; RPF show multicast rpf se check, unicast path PIM-enabled na ho to inet.2 route; private ranges ko site ke andar rakhne ke liye scope boundaries.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP aur snooping receivers ko serve karte hain; PIM, RP, MSDP core ko; RPF use unicast se jodta hai.</li>
<li>SSM RP hata deta hai; anycast RP ko MSDP ya PIM anycast chahiye.</li>
<li>Hamesha receiver se source ki taraf troubleshoot karo.</li>
<li>Sirf forwarding counters saabit karte hain ki traffic bah raha hai.</li>
<li>Cheat-sheet commands ratt lo.</li>
</ul></div>
`}};export{e as default};