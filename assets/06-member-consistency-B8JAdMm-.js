var e={id:`member-consistency`,h:{en:`What must match, and a safe configuration order`,hi:`Kya match hona chahiye, aur configuration ka safe order`},body:{en:`
<p>A rowing crew only moves fast if every rower pulls at the same rhythm with the same kind of oar. If one rower shows up with a shorter oar, the coach does not let the whole boat wobble; he benches that one rower and the rest keep rowing. A switch treats port-channel members the same way. A member whose settings differ from the bundle is <b>suspended</b>, and the rest of the bundle carries on.</p>

<h3>Why consistency matters</h3>
<p>The port-channel is one logical interface. Every frame is hashed onto one member, and the receiving switch must treat it exactly as if it had arrived on any other member. If Gi0/1 carries VLANs 10 and 20 but Gi0/2 only VLAN 10, a VLAN 20 frame hashed onto Gi0/2 would be dropped. If one member runs at 100 Mbps and another at 1 Gbps, the hash would push the same share of flows into a link ten times slower. So the switch checks every member against the bundle before letting it in.</p>

<h3>What must match on every member (on both switches)</h3>
<table class="cmp"><tr><th>Setting</th><th>Rule</th></tr>
<tr><td>Speed and duplex</td><td>Identical on all members, for example all 1000/full. A 100 Mbps member is suspended.</td></tr>
<tr><td>Switchport mode</td><td>All access or all trunk.</td></tr>
<tr><td>Access VLAN</td><td>Same VLAN on every member if the bundle is an access link.</td></tr>
<tr><td>Trunk settings</td><td>Same native VLAN and same allowed VLAN list on every member.</td></tr>
<tr><td>Layer 2 or Layer 3</td><td>All <code>switchport</code> or all <code>no switchport</code>; you cannot mix.</td></tr>
<tr><td>Special port roles</td><td>A SPAN destination port cannot be a member; features such as port security or private VLANs have platform-specific restrictions.</td></tr>
<tr><td>Channel mode and protocol</td><td>One protocol per channel; the far end must use a compatible mode.</td></tr>
<tr><td>Cabling</td><td>All members must land on the same neighbour (or the same multi-chassis pair) and in one channel there.</td></tr></table>
<p>What does <b>not</b> need to match: interface descriptions, the channel-group number on the two switches (Po1 on one side may connect to Po7 on the other), active versus passive, and LACP port priority. STP port cost differences do not by themselves stop bundling either, but STP settings belong on the port-channel anyway, because STP only sees the Po.</p>

<h3>Suspended versus stand-alone</h3>
<p>Two member flags look similar but have different causes, and telling them apart is half of every troubleshooting session:</p>
<dl class="terms">
<dt>(s) suspended</dt><dd>The port's own configuration or state is <b>incompatible with the bundle</b>: speed, duplex, VLANs, mode. The switch logs why, for example <code>%EC-5-CANNOT_BUNDLE2</code>.</dd>
<dt>(I) stand-alone</dt><dd>The port found <b>no compatible partner</b>: no LACP or PAgP replies, a different protocol on the far end, or a different neighbour. It works as an ordinary switch port, so STP may block it.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Bundled, suspended and stand-alone members">
<rect x="250" y="15" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Po10</text>
<rect x="30" y="120" width="170" height="56" rx="8" fill="#bbf7d0"/><text x="115" y="143" text-anchor="middle" class="svg-ink" font-size="13">Gi0/1 (P)</text><text x="115" y="162" text-anchor="middle" class="svg-muted" font-size="12">matches, partner OK</text>
<rect x="235" y="120" width="170" height="56" rx="8" fill="#bae6fd"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">Gi0/2 (s)</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">speed 100: own config</text>
<rect x="440" y="120" width="170" height="56" rx="8" fill="#fde68a"/><text x="525" y="143" text-anchor="middle" class="svg-ink" font-size="13">Gi0/3 (I)</text><text x="525" y="162" text-anchor="middle" class="svg-muted" font-size="12">no partner answers</text>
<line x1="300" y1="59" x2="115" y2="120" stroke="#64748b" stroke-width="3"/>
<line x1="320" y1="59" x2="320" y2="120" stroke="#64748b" stroke-dasharray="5 5"/>
<line x1="340" y1="59" x2="525" y2="120" stroke="#64748b" stroke-dasharray="5 5"/>
<text x="180" y="88" text-anchor="middle" class="svg-accent" font-size="12">in the bundle</text>
<text x="470" y="88" text-anchor="middle" class="svg-accent" font-size="12">kept out</text>
</svg><p class="cap">Only (P) members carry bundle traffic. (s) points at the port's own configuration; (I) points at the far end.</p></div>

<pre class="out">*Mar  3 09:14:22.101: <span class="hl">%EC-5-CANNOT_BUNDLE2: Gi0/2 is not compatible with Gi0/1 and will be suspended (speed of Gi0/2 is 100M, Gi0/1 is 1000M)</span>
*Mar  3 09:21:40.558: %EC-5-CANNOT_BUNDLE2: Gi0/4 is not compatible with Po10 and will be suspended (vlan mask is different)</pre>
<p>"vlan mask is different" means the allowed VLAN list differs. Read these messages carefully: they usually name the exact setting to fix.</p>

<h3>A safe configuration order</h3>
<p>You can build a bundle in many orders and it will usually work, but this sequence avoids the classic traps:</p>
<ol>
<li><b>Clean the ports.</b> If the ports have old configuration, reset them with <code>default interface range g0/1 - 2</code>.</li>
<li><b>Shut the members</b> if you are using mode on, or if the link is in production: <code>shutdown</code>.</li>
<li><b>Make the members identical</b> with <code>interface range</code>: same speed and duplex (auto on both ends is fine), and for a Layer 3 bundle <code>no switchport</code> now, before joining the channel.</li>
<li><b>Join the channel:</b> <code>channel-group N mode active</code>. Port-channel N is created.</li>
<li><b>Configure the port-channel:</b> trunk mode, allowed VLANs, native VLAN, or the IP address for Layer 3.</li>
<li><b>Repeat on the other switch</b>, then <code>no shutdown</code> the members on both sides.</li>
<li><b>Verify both switches:</b> Po <code>(SU)</code> or <code>(RU)</code>, all members <code>(P)</code>, partner visible in <code>show lacp neighbor</code>.</li>
<li><b>From now on, change only the port-channel.</b> A change on the Po is pushed to all members; a change on one member alone creates a mismatch and suspends it.</li>
</ol>

<pre class="code"><span class="c">! Adding a fourth uplink to an existing LACP Po10 safely</span>
ASW1(config)# default interface g0/4
ASW1(config)# interface g0/4
ASW1(config-if)# shutdown
ASW1(config-if)# channel-group 10 mode passive
<span class="c">! The switch copies Po10's switchport settings to the new member</span>
ASW1(config-if)# no shutdown</pre>

<div class="eg"><p><b>Worked example.</b> Po2 on DSW2 is a trunk allowing VLANs 10,20,40,99. An engineer testing something sets <code>switchport trunk allowed vlan 40</code> directly on member Gi1/0/4. Within a second the log shows <code>vlan mask is different</code> and Gi1/0/4 turns <code>(s)</code>. Po2 stays up on the other member, but its bandwidth is halved. Two correct fixes: remove the line from Gi1/0/4 (so it inherits the Po again), or configure the Po and let it push the list to all members. The wrong fix is to shrink Po2 to VLAN 40, which would cut VLANs 10, 20 and 99 for everyone.</p></div>

<div class="warn"><p><b>Common mistake.</b> Hard-coding <code>speed 100</code> on one member "just for a cable test" and forgetting it. The member stays suspended for months and nobody notices, because the bundle is still up on the other links.</p></div>

<div class="exam"><p><b>Exam trap.</b> Things that must match: speed, duplex, switchport mode, access or native VLAN, allowed VLANs, Layer 2 versus Layer 3. Things that need not: description, channel-group number across the link, active versus passive. Expect a "which does NOT need to match" question.</p></div>

<div class="scn"><h4>The member that was benched for a year</h4><p>During an audit at a hospital, an engineer noticed a distribution uplink Po3 with members Gi1/0/49(P) and Gi1/0/50(s). The log history had rolled over, but <code>show running-config interface g1/0/50</code> revealed <code>speed 100</code> and <code>duplex full</code>, left over from troubleshooting a flaky optic a year earlier. Removing both lines brought the member back to <code>(P)</code> and doubled the uplink capacity during the busiest clinic hours.</p><p><b>Lesson:</b> a bundle that is up is not necessarily healthy. Check that every member is (P).</p></div>

<div class="iv"><p class="q">"What has to match for ports to join the same EtherChannel?"</p><p>Strong answer: speed and duplex; switchport mode; access VLAN, or native VLAN and allowed VLAN list for trunks; all Layer 2 or all Layer 3; a compatible channel mode and the same neighbour. Add the operational rule: after the bundle is built, configure the port-channel, not the members, and know that a mismatched port shows (s) with a CANNOT_BUNDLE2 message telling you why.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Members must share speed, duplex, switchport mode, VLAN settings and L2/L3 type, on both switches.</li>
<li>Descriptions, channel-group numbers across the link and active/passive choice do not need to match.</li>
<li>(s) suspended = incompatible config; (I) stand-alone = no compatible partner.</li>
<li>Order: clean, shut, make identical, channel-group, configure Po, other side, no shut, verify.</li>
<li>After it is built, configure the Po only; per-member changes suspend that member.</li>
</ul></div>
`,hi:`
<p>Rowing crew tabhi tez chalti hai jab har rower same rhythm mein, same tarah ke oar se kheenche. Agar ek rower chhota oar lekar aa jaaye, to coach poori boat ko hilne nahi deta; woh us ek rower ko bench par bitha deta hai aur baaki row karte rehte hain. Switch port-channel members ke saath bhi aisa hi karta hai. Jis member ki settings bundle se alag hon, woh <b>suspended</b> ho jaata hai, aur baaki bundle chalta rehta hai.</p>

<h3>Consistency kyun zaroori hai</h3>
<p>Port-channel ek logical interface hai. Har frame ek member par hash hota hai, aur receiving switch ko use bilkul aise treat karna hota hai jaise woh kisi bhi doosre member par aaya ho. Agar Gi0/1 VLAN 10 aur 20 le jaata hai lekin Gi0/2 sirf VLAN 10, to Gi0/2 par hash hua VLAN 20 frame drop ho jaayega. Agar ek member 100 Mbps par chale aur doosra 1 Gbps par, to hash flows ka same hissa das guna slow link mein dhakel dega. Isliye switch har member ko andar aane dene se pehle bundle ke against check karta hai.</p>

<h3>Har member par kya match hona chahiye (dono switches par)</h3>
<table class="cmp"><tr><th>Setting</th><th>Rule</th></tr>
<tr><td>Speed aur duplex</td><td>Saare members par identical, jaise saare 1000/full. 100 Mbps wala member suspend hota hai.</td></tr>
<tr><td>Switchport mode</td><td>Saare access ya saare trunk.</td></tr>
<tr><td>Access VLAN</td><td>Agar bundle access link hai to har member par same VLAN.</td></tr>
<tr><td>Trunk settings</td><td>Har member par same native VLAN aur same allowed VLAN list.</td></tr>
<tr><td>Layer 2 ya Layer 3</td><td>Saare <code>switchport</code> ya saare <code>no switchport</code>; mix nahi kar sakte.</td></tr>
<tr><td>Special port roles</td><td>SPAN destination port member nahi ban sakta; port security ya private VLANs jaise features par platform-specific restrictions hain.</td></tr>
<tr><td>Channel mode aur protocol</td><td>Har channel ka ek protocol; doosre end ko compatible mode use karna chahiye.</td></tr>
<tr><td>Cabling</td><td>Saare members same neighbour (ya same multi-chassis pair) par aur wahan ek hi channel mein land hone chahiye.</td></tr></table>
<p>Jo match karna <b>zaroori nahi</b>: interface descriptions, do switches par channel-group number (ek side ka Po1 doosri side ke Po7 se jud sakta hai), active vs passive, aur LACP port priority. STP port cost ka fark bhi akele bundling nahi rokta, lekin STP settings waise bhi port-channel par honi chahiye, kyunki STP sirf Po dekhta hai.</p>

<h3>Suspended vs stand-alone</h3>
<p>Do member flags ek jaise dikhte hain lekin unke kaaran alag hain, aur unhe alag pehchanna har troubleshooting session ka aadha kaam hai:</p>
<dl class="terms">
<dt>(s) suspended</dt><dd>Port ka apna configuration ya state <b>bundle se incompatible</b> hai: speed, duplex, VLANs, mode. Switch kaaran log karta hai, jaise <code>%EC-5-CANNOT_BUNDLE2</code>.</dd>
<dt>(I) stand-alone</dt><dd>Port ko <b>koi compatible partner nahi mila</b>: koi LACP ya PAgP reply nahi, doosre end par alag protocol, ya alag neighbour. Woh normal switch port ki tarah kaam karta hai, isliye STP use block kar sakta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Bundled, suspended aur stand-alone members">
<rect x="250" y="15" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Po10</text>
<rect x="30" y="120" width="170" height="56" rx="8" fill="#bbf7d0"/><text x="115" y="143" text-anchor="middle" class="svg-ink" font-size="13">Gi0/1 (P)</text><text x="115" y="162" text-anchor="middle" class="svg-muted" font-size="12">match, partner OK</text>
<rect x="235" y="120" width="170" height="56" rx="8" fill="#bae6fd"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="13">Gi0/2 (s)</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">speed 100: apna config</text>
<rect x="440" y="120" width="170" height="56" rx="8" fill="#fde68a"/><text x="525" y="143" text-anchor="middle" class="svg-ink" font-size="13">Gi0/3 (I)</text><text x="525" y="162" text-anchor="middle" class="svg-muted" font-size="12">koi partner jawab nahi</text>
<line x1="300" y1="59" x2="115" y2="120" stroke="#64748b" stroke-width="3"/>
<line x1="320" y1="59" x2="320" y2="120" stroke="#64748b" stroke-dasharray="5 5"/>
<line x1="340" y1="59" x2="525" y2="120" stroke="#64748b" stroke-dasharray="5 5"/>
<text x="180" y="88" text-anchor="middle" class="svg-accent" font-size="12">bundle ke andar</text>
<text x="470" y="88" text-anchor="middle" class="svg-accent" font-size="12">bahar rakhe gaye</text>
</svg><p class="cap">Sirf (P) members bundle traffic le jaate hain. (s) port ke apne configuration ki taraf ishara karta hai; (I) doosre end ki taraf.</p></div>

<pre class="out">*Mar  3 09:14:22.101: <span class="hl">%EC-5-CANNOT_BUNDLE2: Gi0/2 is not compatible with Gi0/1 and will be suspended (speed of Gi0/2 is 100M, Gi0/1 is 1000M)</span>
*Mar  3 09:21:40.558: %EC-5-CANNOT_BUNDLE2: Gi0/4 is not compatible with Po10 and will be suspended (vlan mask is different)</pre>
<p>"vlan mask is different" ka matlab hai allowed VLAN list alag hai. Yeh messages dhyan se padho: aam taur par yeh wahi setting batate hain jo theek karni hai.</p>

<h3>Configuration ka safe order</h3>
<p>Bundle kai orders mein banaya ja sakta hai aur aam taur par chal jaata hai, lekin yeh sequence classic traps se bachata hai:</p>
<ol>
<li><b>Ports saaf karo.</b> Agar ports par purana configuration hai to <code>default interface range g0/1 - 2</code> se reset karo.</li>
<li><b>Members shut karo</b> agar mode on use kar rahe ho, ya link production mein hai: <code>shutdown</code>.</li>
<li><b>Members ko identical banao</b> <code>interface range</code> se: same speed aur duplex (dono ends par auto theek hai), aur Layer 3 bundle ke liye <code>no switchport</code> abhi, channel join karne se pehle.</li>
<li><b>Channel join karo:</b> <code>channel-group N mode active</code>. Port-channel N ban jaata hai.</li>
<li><b>Port-channel configure karo:</b> trunk mode, allowed VLANs, native VLAN, ya Layer 3 ke liye IP address.</li>
<li><b>Doosre switch par repeat karo</b>, phir dono sides par members ko <code>no shutdown</code>.</li>
<li><b>Dono switches verify karo:</b> Po <code>(SU)</code> ya <code>(RU)</code>, saare members <code>(P)</code>, <code>show lacp neighbor</code> mein partner dikhe.</li>
<li><b>Ab se sirf port-channel badlo.</b> Po par change saare members par push hota hai; sirf ek member par change mismatch banata hai aur use suspend karta hai.</li>
</ol>

<pre class="code"><span class="c">! Maujooda LACP Po10 mein chautha uplink safely add karna</span>
ASW1(config)# default interface g0/4
ASW1(config)# interface g0/4
ASW1(config-if)# shutdown
ASW1(config-if)# channel-group 10 mode passive
<span class="c">! Switch Po10 ki switchport settings naye member par copy kar deta hai</span>
ASW1(config-if)# no shutdown</pre>

<div class="eg"><p><b>Worked example.</b> DSW2 par Po2 ek trunk hai jo VLANs 10,20,40,99 allow karta hai. Kuch test kar raha engineer member Gi1/0/4 par seedha <code>switchport trunk allowed vlan 40</code> set kar deta hai. Ek second mein log <code>vlan mask is different</code> dikhata hai aur Gi1/0/4 <code>(s)</code> ho jaata hai. Po2 doosre member par up rehta hai, lekin uski bandwidth aadhi ho jaati hai. Do sahi fixes: Gi1/0/4 se line hatao (taaki woh phir se Po ko inherit kare), ya Po configure karo aur use list saare members par push karne do. Galat fix hai Po2 ko VLAN 40 tak chhota karna, jisse sabke liye VLANs 10, 20 aur 99 kat jaayenge.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek member par "bas cable test ke liye" <code>speed 100</code> hard-code karna aur bhool jaana. Member mahino tak suspended rehta hai aur kisi ko pata nahi chalta, kyunki bundle baaki links par up hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jo match hona chahiye: speed, duplex, switchport mode, access ya native VLAN, allowed VLANs, Layer 2 vs Layer 3. Jo zaroori nahi: description, link ke across channel-group number, active vs passive. "Kaunsa match karna zaroori NAHI hai" wala question expect karo.</p></div>

<div class="scn"><h4>Member jo ek saal bench par raha</h4><p>Ek hospital mein audit ke dauraan engineer ne distribution uplink Po3 dekha jiske members Gi1/0/49(P) aur Gi1/0/50(s) the. Log history roll over ho chuki thi, lekin <code>show running-config interface g1/0/50</code> ne <code>speed 100</code> aur <code>duplex full</code> dikhaya, jo ek saal pehle ek kharab optic troubleshoot karte waqt reh gaye the. Dono lines hatane se member wapas <code>(P)</code> ho gaya aur sabse busy clinic hours mein uplink capacity double ho gayi.</p><p><b>Seekh:</b> jo bundle up hai woh zaroori nahi healthy ho. Check karo ki har member (P) hai.</p></div>

<div class="iv"><p class="q">"Ports ko same EtherChannel mein judne ke liye kya match hona chahiye?"</p><p>Strong answer: speed aur duplex; switchport mode; access VLAN, ya trunks ke liye native VLAN aur allowed VLAN list; saare Layer 2 ya saare Layer 3; compatible channel mode aur same neighbour. Operational rule jodo: bundle banne ke baad port-channel configure karo, members nahi, aur jaano ki mismatched port (s) dikhata hai aur CANNOT_BUNDLE2 message kaaran batata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Members ki speed, duplex, switchport mode, VLAN settings aur L2/L3 type dono switches par same honi chahiye.</li>
<li>Descriptions, link ke across channel-group numbers aur active/passive choice match karna zaroori nahi.</li>
<li>(s) suspended = incompatible config; (I) stand-alone = koi compatible partner nahi.</li>
<li>Order: saaf karo, shut, identical banao, channel-group, Po configure, doosri side, no shut, verify.</li>
<li>Banne ke baad sirf Po configure karo; per-member changes us member ko suspend karte hain.</li>
</ul></div>
`}};export{e as default};