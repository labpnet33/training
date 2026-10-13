var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the PAgP bundle that never came up`,hi:`Troubleshooting workflow: PAgP bundle jo kabhi up nahi hua`},body:{en:`
<p>A good car mechanic does not start by replacing the engine. He checks the fuel, the battery and the tyres first, in a fixed order, because most problems are simple and the order stops him from missing one. EtherChannel problems are the same: almost every broken bundle is one of four things, and one command tells you which.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="EtherChannel troubleshooting flowchart">
<rect x="190" y="10" width="260" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">show etherchannel summary (both)</text>
<line x1="320" y1="50" x2="320" y2="74" stroke="#64748b" stroke-width="2"/>
<rect x="210" y="74" width="220" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">Look at each member flag</text>
<line x1="320" y1="110" x2="80" y2="150" stroke="#64748b"/><line x1="320" y1="110" x2="240" y2="150" stroke="#64748b"/><line x1="320" y1="110" x2="400" y2="150" stroke="#64748b"/><line x1="320" y1="110" x2="560" y2="150" stroke="#64748b"/>
<rect x="20" y="150" width="120" height="36" rx="8" fill="#fed7aa"/><text x="80" y="173" text-anchor="middle" class="svg-ink" font-size="13">(D) down</text>
<rect x="180" y="150" width="120" height="36" rx="8" fill="#fde68a"/><text x="240" y="173" text-anchor="middle" class="svg-ink" font-size="13">(I) stand-alone</text>
<rect x="340" y="150" width="120" height="36" rx="8" fill="#bae6fd"/><text x="400" y="173" text-anchor="middle" class="svg-ink" font-size="13">(s) suspended</text>
<rect x="500" y="150" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="560" y="173" text-anchor="middle" class="svg-ink" font-size="13">all (P)</text>
<text x="80" y="210" text-anchor="middle" class="svg-muted" font-size="12">cable, optic,</text><text x="80" y="226" text-anchor="middle" class="svg-muted" font-size="12">shutdown,</text><text x="80" y="242" text-anchor="middle" class="svg-muted" font-size="12">err-disabled?</text>
<text x="240" y="210" text-anchor="middle" class="svg-muted" font-size="12">modes, protocol,</text><text x="240" y="226" text-anchor="middle" class="svg-muted" font-size="12">wrong neighbour?</text><text x="240" y="242" text-anchor="middle" class="svg-muted" font-size="12">lacp/pagp neighbor</text>
<text x="400" y="210" text-anchor="middle" class="svg-muted" font-size="12">speed, duplex,</text><text x="400" y="226" text-anchor="middle" class="svg-muted" font-size="12">VLANs, mode?</text><text x="400" y="242" text-anchor="middle" class="svg-muted" font-size="12">read the log</text>
<text x="560" y="210" text-anchor="middle" class="svg-muted" font-size="12">slow? check</text><text x="560" y="226" text-anchor="middle" class="svg-muted" font-size="12">load-balance</text><text x="560" y="242" text-anchor="middle" class="svg-muted" font-size="12">and trunk/STP</text>
<rect x="110" y="275" width="420" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="300" text-anchor="middle" class="svg-ink" font-size="13">Fix one thing, re-run summary on both switches, repeat</text>
</svg><p class="cap">One command sorts almost every EtherChannel fault into four buckets.</p></div>

<ol>
<li><b>Run <code>show etherchannel summary</code> on both switches.</b> Note the Po flags and every member flag.</li>
<li><b>(D) down</b>: the physical layer. <code>show interfaces status</code>: is it notconnect, disabled or err-disabled? Check cables, optics and <code>shutdown</code>.</li>
<li><b>(I) stand-alone</b>: no compatible partner. Compare the modes on both sides (<code>show running-config | include channel-group</code>): passive/passive, auto/auto, LACP versus PAgP, on versus a negotiating mode. Use <code>show lacp neighbor</code> or <code>show pagp neighbor</code> to see who answers, and <code>show cdp neighbors</code> to confirm each member goes to the right switch.</li>
<li><b>(s) suspended</b>: configuration mismatch. Read the log (<code>%EC-5-CANNOT_BUNDLE2</code> names the setting), then compare <code>show running-config interface</code> of the member with the Po: speed, duplex, switchport mode, VLAN lists.</li>
<li><b>All (P) but a complaint remains</b>: look at load balancing (chapter 8), trunk allowed lists on the Po (<code>show interfaces trunk</code>) and STP.</li>
<li><b>Fix one thing at a time</b> and re-run the summary on both switches.</li>
</ol>

<h3>Err-disabled bundles: the misconfig guard</h3>
<p>If one side uses mode on and the other does not bundle, the STP EtherChannel guard err-disables the on side:</p>
<pre class="out">%SPANTREE-2-CHNL_MISCFG: Detected loop due to etherchannel misconfiguration of Gi1/0/1
%PM-4-ERR_DISABLE: channel-misconfig (STP) error detected on Po5, putting Gi1/0/1 in err-disable state

CORE-SW# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi1/0/1                      err-disabled channel-misconfig (STP)</span>
Gi1/0/2                      err-disabled channel-misconfig (STP)</pre>
<p>Recovery is always <b>fix first, then re-enable</b>: correct the modes (ideally LACP active on both sides), then <code>shutdown</code> and <code>no shutdown</code> on the port-channel and its members. Optionally <code>errdisable recovery cause channel-misconfig</code> makes the switch retry automatically after the recovery interval (300 seconds by default), but if the cause is still there it will simply err-disable again.</p>
<p>A related message on LACP ports is <code>%EC-5-L3DONTBNDL2: Gi0/1 suspended: LACP currently not enabled on the remote port.</code> It means the far end is not sending LACPDUs: it is set to on, PAgP, or not configured at all.</p>

<h3>Lab walkthrough: the PAgP bundle that never came up</h3>
<p>Ticket: Port-channel 5 between two floor switches was configured last week with PAgP, but the switches still use single links and Po5 is down. PC1 (10.55.0.11) and PC2 (10.55.0.12) are in VLAN 10. Two faults are hidden.</p>
<p><b>Step 1, diagnose on SW2.</b></p>
<pre class="out">SW2# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">5      Po5(SD)         PAgP      Gi0/1(I)    Gi0/2(I)</span>

SW2# show running-config interface g0/2
interface GigabitEthernet0/2
 switchport mode trunk
 <span class="hl">speed 100</span>
 channel-group 5 mode auto</pre>
<p>Po5 is down and both members are stand-alone: no PAgP partner. <code>show pagp neighbor</code> on either switch shows no partners. Both switches are in <code>auto</code>: two listeners. Notice also the hard-coded <code>speed 100</code> on Gi0/2, which we will meet in a moment.</p>
<p><b>Step 2, make SW1 start the negotiation.</b></p>
<pre class="code">SW1(config)# interface range g0/1 - 2
SW1(config-if-range)# channel-group 5 mode desirable</pre>
<pre class="out">SW2# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">5      Po5(SU)         PAgP      Gi0/1(P)    Gi0/2(s)</span></pre>
<p>Progress: Po5 is up on Gi0/1. Gi0/2 is now <b>suspended</b>, and the log explains it: <code>%EC-5-CANNOT_BUNDLE2: Gi0/2 is not compatible with Gi0/1 and will be suspended (speed of Gi0/2 is 100M, Gi0/1 is 1000M)</code>. Fixing the first fault revealed the second.</p>
<p><b>Step 3, remove the hard-coded speed.</b></p>
<pre class="code">SW2(config)# interface g0/2
SW2(config-if)# speed auto</pre>
<p><b>Step 4 and 5, verify both switches and test.</b></p>
<pre class="out">SW1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">5      Po5(SU)         PAgP      Gi0/1(P)    Gi0/2(P)</span>

SW1# show pagp neighbor
Channel group 5 neighbors
          Partner              Partner          Partner         Partner Group
Port      Name                 Device ID        Port       Age  Flags   Cap.
Gi0/1     SW2                  5254.0002.0000   Gi0/1        6s SAC     50001
Gi0/2     SW2                  5254.0002.0000   Gi0/2        4s SAC     50001</pre>
<p>Flags SAC: the partner sends slow hellos, is in auto mode, and is consistent. PC1 now pings PC2 at 10.55.0.12 across Po5.</p>

<div class="eg"><p><b>Worked example: reading a mixed output.</b> <code>Po3(SU) LACP Gi1/0/1(P) Gi1/0/2(s) Gi1/0/3(I) Gi1/0/4(D)</code>. Four members, four different stories: Gi1/0/1 is fine; Gi1/0/2 has a config mismatch (read the log); Gi1/0/3 gets no LACP answer (check the far-end port and cabling); Gi1/0/4 is physically down. The bundle is up but running at a quarter of its capacity.</p></div>

<div class="warn"><p><b>Common mistake.</b> Bouncing an err-disabled port-channel before fixing the mode mismatch. It comes up, the guard fires again, and you have caused a second outage.</p></div>

<div class="exam"><p><b>Exam trap.</b> Fixing a negotiation problem often <b>reveals</b> a second, hidden problem, as in this lab. And the root cause of <code>channel-misconfig</code> err-disable is a mode mismatch involving <code>on</code>, not a speed mismatch.</p></div>

<div class="scn"><h4>The Monday morning uplink</h4><p>After a weekend switch replacement at a bank branch, users could reach local printers but the core only intermittently. On the new access switch the uplink Po1 showed <code>(SU)</code> but only Gi1/0/49(P); Gi1/0/50 showed (I). The technician had copied the old config, but the core side of that second link was patched into port Gi1/0/12, which was in a different channel-group. <code>show cdp neighbors</code> revealed the wrong far-end port. Re-patching fixed it; the intermittent loss came from STP flapping on the stand-alone link.</p><p><b>Lesson:</b> (I) is often cabling. CDP or LLDP tells you where each member really lands.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting an EtherChannel that will not come up."</p><p>Strong answer: run <code>show etherchannel summary</code> on both switches and use the member flag to split the problem. D means Layer 1 or err-disabled. I means a partner problem: check mode combinations, protocol, and cabling with lacp/pagp/cdp neighbor. s means a config mismatch: read CANNOT_BUNDLE2 and compare speed, duplex, VLANs and mode with the Po. For channel-misconfig err-disable, fix the modes first, then shut/no shut. Re-verify both sides after each change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start every investigation with <code>show etherchannel summary</code> on both switches.</li>
<li>D = physical, I = partner/mode/cabling, s = config mismatch, all P = look at load or trunk.</li>
<li>channel-misconfig err-disable comes from on versus a non-bundling side: fix modes, then bounce.</li>
<li>Logs such as CANNOT_BUNDLE2 and L3DONTBNDL2 usually name the cause.</li>
<li>The lab needed two fixes: auto/auto to desirable/auto, and speed 100 back to auto.</li>
</ul></div>
`,hi:`
<p>Achha car mechanic engine badalne se shuru nahi karta. Woh pehle fuel, battery aur tyres check karta hai, ek fixed order mein, kyunki zyada tar problems simple hoti hain aur order use kuch miss karne se rokta hai. EtherChannel problems bhi aisi hi hain: lagbhag har toota bundle chaar cheezon mein se ek hai, aur ek command batata hai kaunsi.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="EtherChannel troubleshooting flowchart">
<rect x="190" y="10" width="260" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">show etherchannel summary (dono)</text>
<line x1="320" y1="50" x2="320" y2="74" stroke="#64748b" stroke-width="2"/>
<rect x="210" y="74" width="220" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">Har member flag dekho</text>
<line x1="320" y1="110" x2="80" y2="150" stroke="#64748b"/><line x1="320" y1="110" x2="240" y2="150" stroke="#64748b"/><line x1="320" y1="110" x2="400" y2="150" stroke="#64748b"/><line x1="320" y1="110" x2="560" y2="150" stroke="#64748b"/>
<rect x="20" y="150" width="120" height="36" rx="8" fill="#fed7aa"/><text x="80" y="173" text-anchor="middle" class="svg-ink" font-size="13">(D) down</text>
<rect x="180" y="150" width="120" height="36" rx="8" fill="#fde68a"/><text x="240" y="173" text-anchor="middle" class="svg-ink" font-size="13">(I) stand-alone</text>
<rect x="340" y="150" width="120" height="36" rx="8" fill="#bae6fd"/><text x="400" y="173" text-anchor="middle" class="svg-ink" font-size="13">(s) suspended</text>
<rect x="500" y="150" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="560" y="173" text-anchor="middle" class="svg-ink" font-size="13">sab (P)</text>
<text x="80" y="210" text-anchor="middle" class="svg-muted" font-size="12">cable, optic,</text><text x="80" y="226" text-anchor="middle" class="svg-muted" font-size="12">shutdown,</text><text x="80" y="242" text-anchor="middle" class="svg-muted" font-size="12">err-disabled?</text>
<text x="240" y="210" text-anchor="middle" class="svg-muted" font-size="12">modes, protocol,</text><text x="240" y="226" text-anchor="middle" class="svg-muted" font-size="12">galat neighbour?</text><text x="240" y="242" text-anchor="middle" class="svg-muted" font-size="12">lacp/pagp neighbor</text>
<text x="400" y="210" text-anchor="middle" class="svg-muted" font-size="12">speed, duplex,</text><text x="400" y="226" text-anchor="middle" class="svg-muted" font-size="12">VLANs, mode?</text><text x="400" y="242" text-anchor="middle" class="svg-muted" font-size="12">log padho</text>
<text x="560" y="210" text-anchor="middle" class="svg-muted" font-size="12">slow? check karo</text><text x="560" y="226" text-anchor="middle" class="svg-muted" font-size="12">load-balance</text><text x="560" y="242" text-anchor="middle" class="svg-muted" font-size="12">aur trunk/STP</text>
<rect x="110" y="275" width="420" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="300" text-anchor="middle" class="svg-ink" font-size="13">Ek cheez theek karo, dono par summary dobara, repeat</text>
</svg><p class="cap">Ek command lagbhag har EtherChannel fault ko chaar buckets mein baant deta hai.</p></div>

<ol>
<li><b>Dono switches par <code>show etherchannel summary</code> chalao.</b> Po flags aur har member flag note karo.</li>
<li><b>(D) down</b>: physical layer. <code>show interfaces status</code>: kya woh notconnect, disabled ya err-disabled hai? Cables, optics aur <code>shutdown</code> check karo.</li>
<li><b>(I) stand-alone</b>: koi compatible partner nahi. Dono sides ke modes compare karo (<code>show running-config | include channel-group</code>): passive/passive, auto/auto, LACP vs PAgP, on vs negotiating mode. <code>show lacp neighbor</code> ya <code>show pagp neighbor</code> se dekho kaun jawab deta hai, aur <code>show cdp neighbors</code> se confirm karo ki har member sahi switch par jaata hai.</li>
<li><b>(s) suspended</b>: configuration mismatch. Log padho (<code>%EC-5-CANNOT_BUNDLE2</code> setting ka naam batata hai), phir member ka <code>show running-config interface</code> Po se compare karo: speed, duplex, switchport mode, VLAN lists.</li>
<li><b>Sab (P) lekin shikayat baaki hai</b>: load balancing (chapter 8), Po par trunk allowed lists (<code>show interfaces trunk</code>) aur STP dekho.</li>
<li><b>Ek samay mein ek cheez theek karo</b> aur dono switches par summary dobara chalao.</li>
</ol>

<h3>Err-disabled bundles: misconfig guard</h3>
<p>Agar ek side mode on use kare aur doosri bundle na kare, to STP EtherChannel guard on side ko err-disable kar deta hai:</p>
<pre class="out">%SPANTREE-2-CHNL_MISCFG: Detected loop due to etherchannel misconfiguration of Gi1/0/1
%PM-4-ERR_DISABLE: channel-misconfig (STP) error detected on Po5, putting Gi1/0/1 in err-disable state

CORE-SW# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi1/0/1                      err-disabled channel-misconfig (STP)</span>
Gi1/0/2                      err-disabled channel-misconfig (STP)</pre>
<p>Recovery hamesha <b>pehle fix, phir re-enable</b> hai: modes theek karo (ideally dono sides par LACP active), phir port-channel aur uske members par <code>shutdown</code> aur <code>no shutdown</code>. Optionally <code>errdisable recovery cause channel-misconfig</code> switch ko recovery interval (default 300 seconds) ke baad khud retry karwata hai, lekin agar kaaran abhi bhi hai to woh phir se err-disable ho jaayega.</p>
<p>LACP ports par ek related message hai <code>%EC-5-L3DONTBNDL2: Gi0/1 suspended: LACP currently not enabled on the remote port.</code> Iska matlab hai doosra end LACPDUs nahi bhej raha: woh on par hai, PAgP par hai, ya configure hi nahi hua.</p>

<h3>Lab walkthrough: PAgP bundle jo kabhi up nahi hua</h3>
<p>Ticket: do floor switches ke beech Port-channel 5 pichhle hafte PAgP ke saath configure hua tha, lekin switches abhi bhi single links use kar rahe hain aur Po5 down hai. PC1 (10.55.0.11) aur PC2 (10.55.0.12) VLAN 10 mein hain. Do faults chhupe hain.</p>
<p><b>Step 1, SW2 par diagnose karo.</b></p>
<pre class="out">SW2# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">5      Po5(SD)         PAgP      Gi0/1(I)    Gi0/2(I)</span>

SW2# show running-config interface g0/2
interface GigabitEthernet0/2
 switchport mode trunk
 <span class="hl">speed 100</span>
 channel-group 5 mode auto</pre>
<p>Po5 down hai aur dono members stand-alone hain: koi PAgP partner nahi. Kisi bhi switch par <code>show pagp neighbor</code> koi partner nahi dikhata. Dono switches <code>auto</code> mein hain: do sunne wale. Gi0/2 par hard-coded <code>speed 100</code> bhi note karo, jisse hum abhi milenge.</p>
<p><b>Step 2, SW1 se negotiation shuru karwao.</b></p>
<pre class="code">SW1(config)# interface range g0/1 - 2
SW1(config-if-range)# channel-group 5 mode desirable</pre>
<pre class="out">SW2# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">5      Po5(SU)         PAgP      Gi0/1(P)    Gi0/2(s)</span></pre>
<p>Progress: Po5 Gi0/1 par up hai. Gi0/2 ab <b>suspended</b> hai, aur log wajah batata hai: <code>%EC-5-CANNOT_BUNDLE2: Gi0/2 is not compatible with Gi0/1 and will be suspended (speed of Gi0/2 is 100M, Gi0/1 is 1000M)</code>. Pehla fault theek karne se doosra saamne aa gaya.</p>
<p><b>Step 3, hard-coded speed hatao.</b></p>
<pre class="code">SW2(config)# interface g0/2
SW2(config-if)# speed auto</pre>
<p><b>Step 4 aur 5, dono switches verify karo aur test karo.</b></p>
<pre class="out">SW1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">5      Po5(SU)         PAgP      Gi0/1(P)    Gi0/2(P)</span>

SW1# show pagp neighbor
Channel group 5 neighbors
          Partner              Partner          Partner         Partner Group
Port      Name                 Device ID        Port       Age  Flags   Cap.
Gi0/1     SW2                  5254.0002.0000   Gi0/1        6s SAC     50001
Gi0/2     SW2                  5254.0002.0000   Gi0/2        4s SAC     50001</pre>
<p>Flags SAC: partner slow hellos bhej raha hai, auto mode mein hai, aur consistent hai. Ab PC1 Po5 ke across PC2 ko 10.55.0.12 par ping karta hai.</p>

<div class="eg"><p><b>Worked example: mixed output padhna.</b> <code>Po3(SU) LACP Gi1/0/1(P) Gi1/0/2(s) Gi1/0/3(I) Gi1/0/4(D)</code>. Chaar members, chaar alag kahaniyan: Gi1/0/1 theek hai; Gi1/0/2 par config mismatch hai (log padho); Gi1/0/3 ko LACP jawab nahi mil raha (doosre end ka port aur cabling check karo); Gi1/0/4 physically down hai. Bundle up hai lekin apni capacity ke ek chauthai par chal raha hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Mode mismatch theek karne se pehle err-disabled port-channel ko bounce karna. Woh up hota hai, guard phir fire hota hai, aur aapne doosra outage bana diya.</p></div>

<div class="exam"><p><b>Exam trap.</b> Negotiation problem theek karne se aksar ek doosri, chhupi problem <b>saamne aati hai</b>, jaise is lab mein. Aur <code>channel-misconfig</code> err-disable ka root cause <code>on</code> wala mode mismatch hai, speed mismatch nahi.</p></div>

<div class="scn"><h4>Monday subah ka uplink</h4><p>Ek bank branch mein weekend par switch replace hone ke baad users local printers tak pahunch rahe the lekin core tak beech beech mein hi. Naye access switch par uplink Po1 <code>(SU)</code> dikha raha tha lekin sirf Gi1/0/49(P); Gi1/0/50 (I) dikha raha tha. Technician ne purana config copy kiya tha, lekin us doosre link ki core side port Gi1/0/12 mein patch hui thi, jo alag channel-group mein tha. <code>show cdp neighbors</code> ne galat far-end port dikhaya. Re-patching se theek hua; beech beech ka loss stand-alone link par STP flapping se aa raha tha.</p><p><b>Seekh:</b> (I) aksar cabling hota hai. CDP ya LLDP batata hai ki har member asal mein kahan land hota hai.</p></div>

<div class="iv"><p class="q">"Up na hone wale EtherChannel ko troubleshoot karna samjhao."</p><p>Strong answer: dono switches par <code>show etherchannel summary</code> chalao aur member flag se problem baanto. D matlab Layer 1 ya err-disabled. I matlab partner problem: mode combinations, protocol, aur lacp/pagp/cdp neighbor se cabling check karo. s matlab config mismatch: CANNOT_BUNDLE2 padho aur speed, duplex, VLANs aur mode Po se compare karo. channel-misconfig err-disable ke liye pehle modes theek karo, phir shut/no shut. Har change ke baad dono sides dobara verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har investigation dono switches par <code>show etherchannel summary</code> se shuru karo.</li>
<li>D = physical, I = partner/mode/cabling, s = config mismatch, sab P = load ya trunk dekho.</li>
<li>channel-misconfig err-disable on vs bundle na karne wali side se aata hai: modes theek karo, phir bounce.</li>
<li>CANNOT_BUNDLE2 aur L3DONTBNDL2 jaise logs aam taur par kaaran batate hain.</li>
<li>Lab ko do fixes chahiye the: auto/auto se desirable/auto, aur speed 100 wapas auto.</li>
</ul></div>
`}};export{e as default};