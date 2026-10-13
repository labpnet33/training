var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a flight, pilots do not rely on memory; they run a checklist, even after thousands of hours. This chapter is your EtherChannel checklist. Read it the day before the exam, and come back to it the first time you build a bundle in production.</p>

<h3>The whole module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="EtherChannel module summary">
<rect x="20" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Why</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">STP sees one link</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">bandwidth, failover</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">How</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">on / LACP / PAgP</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">one side must start</text>
<rect x="430" y="20" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Rules</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">members match</text><text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="12">configure the Po</text>
<rect x="20" y="120" width="190" height="80" rx="8" fill="#fde68a"/><text x="115" y="144" text-anchor="middle" class="svg-ink" font-size="13">Types</text><text x="115" y="164" text-anchor="middle" class="svg-muted" font-size="12">L2 (SU), L3 (RU)</text><text x="115" y="182" text-anchor="middle" class="svg-muted" font-size="12">MEC: stack, vPC</text>
<rect x="225" y="120" width="190" height="80" rx="8" fill="#fed7aa"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="13">Traffic</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">per-flow hash</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="12">global method</text>
<rect x="430" y="120" width="190" height="80" rx="8" fill="#e2e8f0"/><text x="525" y="144" text-anchor="middle" class="svg-ink" font-size="13">Verify / fix</text><text x="525" y="164" text-anchor="middle" class="svg-muted" font-size="12">P, I, s, H, D flags</text><text x="525" y="182" text-anchor="middle" class="svg-muted" font-size="12">both switches</text>
</svg><p class="cap">Six ideas: why, how, rules, types, traffic sharing, and verify-and-fix.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why STP blocks parallel links and how a port-channel avoids it.</li>
<li>I can configure a static bundle (mode on) and explain its risk.</li>
<li>I can configure LACP active/passive and a trunk on the port-channel, as in the Po10 lab.</li>
<li>I can configure PAgP desirable/auto and recognise auto/auto as a failure.</li>
<li>I can predict, for any pair of modes, whether a channel forms.</li>
<li>I can list what must match on members and follow a safe configuration order.</li>
<li>I can build a Layer 3 port-channel with an IP address on the Po.</li>
<li>I can explain per-flow hashing, set <code>port-channel load-balance</code>, and explain uneven load.</li>
<li>I can read every flag in <code>show etherchannel summary</code> and use <code>show lacp neighbor</code>.</li>
<li>I can troubleshoot (I), (s), (D) and channel-misconfig err-disable, and I solved the PAgP lab.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EtherChannel / port-channel / LAG</dt><dd>A bundle of physical links acting as one logical interface (PoN).</dd>
<dt>Member</dt><dd>A physical port inside a port-channel.</dd>
<dt>LACP</dt><dd>IEEE 802.3ad / 802.1AX negotiation protocol; modes active and passive; 16 ports, 8 active.</dd>
<dt>PAgP</dt><dd>Cisco proprietary negotiation protocol; modes desirable and auto; 8 ports.</dd>
<dt>System priority / port priority</dt><dd>LACP values (default 32768, lower wins) that decide who chooses active ports and which ports are active.</dd>
<dt>Hot-standby (H)</dt><dd>LACP member beyond the active limit, waiting to take over.</dd>
<dt>Suspended (s) / stand-alone (I)</dt><dd>Incompatible config / no compatible partner.</dd>
<dt>Misconfig guard</dt><dd>STP feature that err-disables a one-sided on bundle (channel-misconfig).</dd>
<dt>MEC</dt><dd>Multi-chassis EtherChannel: a bundle to two switches that act as one LACP partner (StackWise, StackWise Virtual, VSS, vPC).</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Max 8 active members; LACP allows 16 configured (8 active + 8 hot-standby); PAgP and static max 8.</li>
<li>Forms: active/active, active/passive, desirable/desirable, desirable/auto, on/on. Everything else fails.</li>
<li>LACP LACPDUs: slow every 30 s (default), fast every 1 s with <code>lacp rate fast</code>.</li>
<li>Must match: speed, duplex, switchport mode, access/native VLAN, allowed VLANs, L2 versus L3.</li>
<li>Layer 3: <code>no switchport</code> on members before <code>channel-group</code>; IP only on the Po; flag RU.</li>
<li><code>port-channel load-balance</code> is global; load sharing is per flow, never per packet.</li>
<li>Uppercase S = Layer 2, R = Layer 3, U = in use, D = down; member P = bundled, I = stand-alone, s = suspended, H = hot-standby.</li>
<li>STP, trunks and interface bandwidth show the Po, not the members.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr>
<tr><td>Add members (LACP)</td><td><code>interface range g0/1 - 3</code> then <code>channel-group 10 mode active</code></td></tr>
<tr><td>Static / PAgP</td><td><code>channel-group 1 mode on</code> / <code>channel-group 5 mode desirable</code></td></tr>
<tr><td>Configure the bundle</td><td><code>interface port-channel 10</code>, <code>switchport mode trunk</code>, <code>switchport trunk allowed vlan 30,40</code></td></tr>
<tr><td>Layer 3 bundle</td><td><code>no switchport</code> on members, then <code>ip address</code> on the Po</td></tr>
<tr><td>LACP tuning</td><td><code>lacp system-priority</code>, <code>lacp port-priority</code>, <code>lacp max-bundle</code>, <code>port-channel min-links</code>, <code>lacp rate fast</code></td></tr>
<tr><td>Hashing</td><td><code>port-channel load-balance src-dst-ip</code>, <code>show etherchannel load-balance</code></td></tr>
<tr><td>Verify</td><td><code>show etherchannel summary</code>, <code>show etherchannel port-channel</code>, <code>show lacp neighbor</code>, <code>show pagp neighbor</code>, <code>show interfaces port-channel 10</code></td></tr>
<tr><td>Err-disable</td><td><code>show interfaces status err-disabled</code>, fix, then <code>shutdown</code> / <code>no shutdown</code></td></tr></table>

<div class="eg"><p><b>Worked example: a 60-second exam drill.</b> "SW1: channel-group 2 mode passive. SW2: channel-group 2 mode auto. Result?" Different protocols: no channel, members (I). "SW1 desirable, SW2 auto, SW2 Gi0/2 at 100 Mbps?" Channel forms on Gi0/1; Gi0/2 (s). "Which command changes hashing on Po3 only?" None: the command is global. Practise until each answer takes five seconds.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising the mode table without being able to read output. The exam and real tickets show you <code>show etherchannel summary</code>, not the configuration. Practise from output to cause.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch the wording "at least one side must be active" for LACP and "desirable" for PAgP, and remember that <code>on</code> is never compatible with a negotiating mode.</p></div>

<div class="scn"><h4>The change that passed review</h4><p>A network team introduced a pre-change checklist for every new port-channel: modes chosen (LACP active on both ends), member settings identical, Po configuration written, and a post-change check of <code>show etherchannel summary</code> and <code>show lacp neighbor</code> on both switches with screenshots in the ticket. In the following quarter, EtherChannel-related incidents dropped to zero, and two mis-patched cables were caught during the change window instead of after it.</p><p><b>Lesson:</b> a short, repeatable checklist beats heroics.</p></div>

<div class="iv"><p class="q">"Give me the one-minute summary of EtherChannel."</p><p>Strong answer: bundle up to 8 active links into one port-channel so STP sees one link, you get aggregate bandwidth and sub-second member failover. Negotiate with LACP active/passive (open standard) or PAgP desirable/auto (Cisco), or force with on. Members must match speed, duplex, mode and VLANs; configure the Po. Traffic is hashed per flow. Verify with show etherchannel summary and show lacp neighbor. Next in the track: Layer 2 security, where err-disable appears again.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EtherChannel = one logical link: no STP blocking, more bandwidth, fast failover.</li>
<li>LACP active on both ends is the default choice; on and PAgP are special cases.</li>
<li>Consistent members, configure the Po, and follow a safe order.</li>
<li>Per-flow hashing: choose fields that vary; expect imperfect balance.</li>
<li>Always verify both switches: Po (SU)/(RU), members (P), one partner.</li>
</ul></div>
`,hi:`
<p>Flight se pehle pilots memory par bharosa nahi karte; woh checklist chalate hain, hazaaron ghante ke baad bhi. Yeh chapter aapki EtherChannel checklist hai. Exam se ek din pehle ise padho, aur production mein pehli baar bundle banate waqt wapas aao.</p>

<h3>Poora module ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="EtherChannel module summary">
<rect x="20" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Kyun</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">STP ko ek link dikhta hai</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">bandwidth, failover</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Kaise</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">on / LACP / PAgP</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">ek side shuru kare</text>
<rect x="430" y="20" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Rules</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">members match</text><text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="12">Po configure karo</text>
<rect x="20" y="120" width="190" height="80" rx="8" fill="#fde68a"/><text x="115" y="144" text-anchor="middle" class="svg-ink" font-size="13">Types</text><text x="115" y="164" text-anchor="middle" class="svg-muted" font-size="12">L2 (SU), L3 (RU)</text><text x="115" y="182" text-anchor="middle" class="svg-muted" font-size="12">MEC: stack, vPC</text>
<rect x="225" y="120" width="190" height="80" rx="8" fill="#fed7aa"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="13">Traffic</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">per-flow hash</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="12">global method</text>
<rect x="430" y="120" width="190" height="80" rx="8" fill="#e2e8f0"/><text x="525" y="144" text-anchor="middle" class="svg-ink" font-size="13">Verify / fix</text><text x="525" y="164" text-anchor="middle" class="svg-muted" font-size="12">P, I, s, H, D flags</text><text x="525" y="182" text-anchor="middle" class="svg-muted" font-size="12">dono switches</text>
</svg><p class="cap">Chhe ideas: kyun, kaise, rules, types, traffic sharing, aur verify-aur-fix.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki STP parallel links kyun block karta hai aur port-channel isse kaise bachta hai.</li>
<li>Main static bundle (mode on) configure kar sakta hoon aur uska risk samjha sakta hoon.</li>
<li>Main LACP active/passive aur port-channel par trunk configure kar sakta hoon, jaise Po10 lab mein.</li>
<li>Main PAgP desirable/auto configure kar sakta hoon aur auto/auto ko failure pehchan sakta hoon.</li>
<li>Main modes ke kisi bhi pair ke liye predict kar sakta hoon ki channel banega ya nahi.</li>
<li>Main list kar sakta hoon ki members par kya match hona chahiye aur safe configuration order follow kar sakta hoon.</li>
<li>Main Po par IP address ke saath Layer 3 port-channel bana sakta hoon.</li>
<li>Main per-flow hashing samjha sakta hoon, <code>port-channel load-balance</code> set kar sakta hoon, aur uneven load samjha sakta hoon.</li>
<li>Main <code>show etherchannel summary</code> ka har flag padh sakta hoon aur <code>show lacp neighbor</code> use kar sakta hoon.</li>
<li>Main (I), (s), (D) aur channel-misconfig err-disable troubleshoot kar sakta hoon, aur maine PAgP lab solve kiya.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>EtherChannel / port-channel / LAG</dt><dd>Physical links ka bundle jo ek logical interface (PoN) ki tarah kaam karta hai.</dd>
<dt>Member</dt><dd>Port-channel ke andar ka physical port.</dd>
<dt>LACP</dt><dd>IEEE 802.3ad / 802.1AX negotiation protocol; modes active aur passive; 16 ports, 8 active.</dd>
<dt>PAgP</dt><dd>Cisco proprietary negotiation protocol; modes desirable aur auto; 8 ports.</dd>
<dt>System priority / port priority</dt><dd>LACP values (default 32768, kam jeetta hai) jo tay karti hain ki active ports kaun chunega aur kaunse ports active honge.</dd>
<dt>Hot-standby (H)</dt><dd>Active limit ke baad wala LACP member, jagah lene ka intezaar karta hua.</dd>
<dt>Suspended (s) / stand-alone (I)</dt><dd>Incompatible config / koi compatible partner nahi.</dd>
<dt>Misconfig guard</dt><dd>STP feature jo ek-tarfa on bundle ko err-disable karta hai (channel-misconfig).</dd>
<dt>MEC</dt><dd>Multi-chassis EtherChannel: do switches ki taraf bundle jo ek LACP partner ki tarah kaam karte hain (StackWise, StackWise Virtual, VSS, vPC).</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Max 8 active members; LACP 16 configured allow karta hai (8 active + 8 hot-standby); PAgP aur static max 8.</li>
<li>Banta hai: active/active, active/passive, desirable/desirable, desirable/auto, on/on. Baaki sab fail.</li>
<li>LACP LACPDUs: slow har 30 s (default), <code>lacp rate fast</code> ke saath fast har 1 s.</li>
<li>Match hona chahiye: speed, duplex, switchport mode, access/native VLAN, allowed VLANs, L2 vs L3.</li>
<li>Layer 3: <code>channel-group</code> se pehle members par <code>no switchport</code>; IP sirf Po par; flag RU.</li>
<li><code>port-channel load-balance</code> global hai; load sharing per flow hai, per packet kabhi nahi.</li>
<li>Capital S = Layer 2, R = Layer 3, U = in use, D = down; member P = bundled, I = stand-alone, s = suspended, H = hot-standby.</li>
<li>STP, trunks aur interface bandwidth Po dikhate hain, members nahi.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Kaam</th><th>Command</th></tr>
<tr><td>Members add karna (LACP)</td><td><code>interface range g0/1 - 3</code> phir <code>channel-group 10 mode active</code></td></tr>
<tr><td>Static / PAgP</td><td><code>channel-group 1 mode on</code> / <code>channel-group 5 mode desirable</code></td></tr>
<tr><td>Bundle configure karna</td><td><code>interface port-channel 10</code>, <code>switchport mode trunk</code>, <code>switchport trunk allowed vlan 30,40</code></td></tr>
<tr><td>Layer 3 bundle</td><td>Members par <code>no switchport</code>, phir Po par <code>ip address</code></td></tr>
<tr><td>LACP tuning</td><td><code>lacp system-priority</code>, <code>lacp port-priority</code>, <code>lacp max-bundle</code>, <code>port-channel min-links</code>, <code>lacp rate fast</code></td></tr>
<tr><td>Hashing</td><td><code>port-channel load-balance src-dst-ip</code>, <code>show etherchannel load-balance</code></td></tr>
<tr><td>Verify</td><td><code>show etherchannel summary</code>, <code>show etherchannel port-channel</code>, <code>show lacp neighbor</code>, <code>show pagp neighbor</code>, <code>show interfaces port-channel 10</code></td></tr>
<tr><td>Err-disable</td><td><code>show interfaces status err-disabled</code>, fix, phir <code>shutdown</code> / <code>no shutdown</code></td></tr></table>

<div class="eg"><p><b>Worked example: 60 second ka exam drill.</b> "SW1: channel-group 2 mode passive. SW2: channel-group 2 mode auto. Result?" Alag protocols: channel nahi, members (I). "SW1 desirable, SW2 auto, SW2 Gi0/2 100 Mbps par?" Gi0/1 par channel banta hai; Gi0/2 (s). "Kaunsa command sirf Po3 par hashing badalta hai?" Koi nahi: command global hai. Tab tak practice karo jab tak har jawab paanch second mein na aa jaaye.</p></div>

<div class="warn"><p><b>Common galti.</b> Mode table ratt lena lekin output na padh paana. Exam aur real tickets aapko <code>show etherchannel summary</code> dikhate hain, configuration nahi. Output se cause tak practice karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Wording par dhyan do: LACP ke liye "kam se kam ek side active honi chahiye" aur PAgP ke liye "desirable", aur yaad rakho ki <code>on</code> kabhi kisi negotiating mode ke saath compatible nahi hai.</p></div>

<div class="scn"><h4>Change jo review pass kar gaya</h4><p>Ek network team ne har naye port-channel ke liye pre-change checklist shuru ki: modes chune gaye (dono ends par LACP active), member settings identical, Po configuration likha gaya, aur dono switches par <code>show etherchannel summary</code> aur <code>show lacp neighbor</code> ka post-change check, ticket mein screenshots ke saath. Agle quarter mein EtherChannel se jude incidents zero ho gaye, aur do galat patch kiye cables change window ke dauraan hi pakde gaye, baad mein nahi.</p><p><b>Seekh:</b> chhoti, repeatable checklist heroics se behtar hai.</p></div>

<div class="iv"><p class="q">"EtherChannel ki ek minute ki summary do."</p><p>Strong answer: 8 tak active links ko ek port-channel mein bundle karo taaki STP ko ek link dikhe, aggregate bandwidth mile aur sub-second member failover ho. LACP active/passive (open standard) ya PAgP desirable/auto (Cisco) se negotiate karo, ya on se force karo. Members ki speed, duplex, mode aur VLANs match hone chahiye; Po configure karo. Traffic per flow hash hota hai. show etherchannel summary aur show lacp neighbor se verify karo. Track mein aage: Layer 2 security, jahan err-disable phir se aata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EtherChannel = ek logical link: STP blocking nahi, zyada bandwidth, fast failover.</li>
<li>Dono ends par LACP active default choice hai; on aur PAgP special cases hain.</li>
<li>Consistent members, Po configure karo, aur safe order follow karo.</li>
<li>Per-flow hashing: badalne wale fields chuno; perfect balance ki ummeed mat karo.</li>
<li>Hamesha dono switches verify karo: Po (SU)/(RU), members (P), ek partner.</li>
</ul></div>
`}};export{e as default};