var e={id:`pagp`,h:{en:`PAgP: desirable and auto`,hi:`PAgP: desirable aur auto`},body:{en:`
<p>Some families speak a language at home that nobody outside understands. It works perfectly at the dinner table, but the moment a guest from another family joins, nobody can talk to them. <b>PAgP</b> is Cisco's family language for building bundles. Between two Cisco switches it works well; with a server, a firewall or another vendor's switch it simply does not exist.</p>

<h3>What PAgP is</h3>
<p>The <b>Port Aggregation Protocol</b> is Cisco proprietary and older than LACP. It does the same job: before bundling, each switch checks that the ports on the far end belong together, have compatible settings and connect to the same neighbour. PAgP packets are sent to the Cisco multicast MAC <code>01:00:0C:CC:CC:CC</code>, the same destination used by CDP and DTP, and they stay on the link. In steady state PAgP sends a hello every 30 seconds.</p>
<p>Key facts to remember:</p>
<ul>
<li>A PAgP bundle holds up to <b>8</b> ports. There is no hot-standby concept like LACP's 16.</li>
<li>It runs only on Cisco devices, and not on all of them: Nexus switches (NX-OS) do not support PAgP at all.</li>
<li>The CCNA blueprint names LACP for configuration, but you must still recognise PAgP modes, because they appear in legacy networks and exam questions.</li>
</ul>

<h3>The two modes</h3>
<dl class="terms">
<dt>desirable</dt><dd>The port <b>initiates</b> PAgP negotiation by sending PAgP packets. The PAgP equivalent of LACP active.</dd>
<dt>auto</dt><dd>The port <b>responds</b> to PAgP packets but never starts. The PAgP equivalent of LACP passive. This is the dangerous one, because <b>auto with auto never forms a channel</b>.</dd>
</dl>
<p>So desirable with desirable works, desirable with auto works, and auto with auto fails. PAgP never negotiates with LACP, and neither protocol works with mode on.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PAgP negotiation: desirable starts, auto answers">
<rect x="40" y="30" width="150" height="46" rx="8" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="115" y="68" text-anchor="middle" class="svg-muted" font-size="12">desirable</text>
<rect x="450" y="30" width="150" height="46" rx="8" fill="#bae6fd"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="525" y="68" text-anchor="middle" class="svg-muted" font-size="12">auto</text>
<line x1="190" y1="44" x2="450" y2="44" stroke="#64748b" stroke-width="2"/><text x="320" y="38" text-anchor="middle" class="svg-accent" font-size="12">1. PAgP hello: I want to bundle</text>
<line x1="450" y1="64" x2="190" y2="64" stroke="#64748b" stroke-width="2"/><text x="320" y="84" text-anchor="middle" class="svg-accent" font-size="12">2. PAgP reply: me too, same group</text>
<text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">3. Both bundle: Po5(SU) PAgP</text>
<rect x="40" y="150" width="150" height="46" rx="8" fill="#fed7aa"/><text x="115" y="172" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="115" y="188" text-anchor="middle" class="svg-muted" font-size="12">auto</text>
<rect x="450" y="150" width="150" height="46" rx="8" fill="#fed7aa"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="525" y="188" text-anchor="middle" class="svg-muted" font-size="12">auto</text>
<line x1="190" y1="173" x2="450" y2="173" stroke="#64748b" stroke-width="2" stroke-dasharray="5 5"/><text x="320" y="166" text-anchor="middle" class="svg-accent" font-size="12">silence: both wait</text>
<text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">No channel: members (I), Po5(SD)</text>
</svg><p class="cap">Top: desirable starts, auto answers, the bundle forms. Bottom: two listeners never talk, so nothing forms.</p></div>

<h3>Silent and non-silent</h3>
<p>PAgP modes have an optional keyword: <code>channel-group 5 mode desirable non-silent</code>. By default ports run in <b>silent</b> mode, which lets a port come up and pass traffic as an individual link even if the device on the other end never sends PAgP packets (for example a file server or a traffic analyser). <b>Non-silent</b> expects the partner to send PAgP and is used between PAgP-capable switches, often on fibre ports. For the CCNA you only need to know the keywords exist; the default silent mode is fine.</p>

<h3>Configuration</h3>
<pre class="code">SW1(config)# interface range g0/1 - 2
SW1(config-if-range)# channel-group 5 mode desirable
SW1(config-if-range)# exit
SW1(config)# interface port-channel 5
SW1(config-if)# switchport mode trunk
<span class="c">! SW2 can be desirable or auto. auto on BOTH sides never forms Po5.</span></pre>
<p>Optionally, <code>channel-protocol pagp</code> on the members locks the channel to PAgP, so a later typo like <code>mode active</code> is rejected. The mode already implies the protocol, so this command is not required.</p>

<h3>Verification</h3>
<pre class="out">SW1# show pagp neighbor
Flags:  S - Device is sending Slow hello.  C - Device is in Consistent state.
        A - Device is in Auto mode.        P - Device learns on physical port.

Channel group 5 neighbors
          Partner              Partner          Partner         Partner Group
Port      Name                 Device ID        Port       Age  Flags   Cap.
<span class="hl">Gi0/1     SW2                  5254.0002.0000   Gi0/1        9s SAC     50001</span>
Gi0/2     SW2                  5254.0002.0000   Gi0/2       11s SAC     50001</pre>
<p>Read the flags: <b>S</b> the partner sends slow hellos, <b>A</b> the partner is in auto mode, <b>C</b> the partner is in a consistent state, which is what you want. The partner name is SW2 on both rows, so both cables go to the same switch. In <code>show etherchannel summary</code> the Protocol column shows <code>PAgP</code>.</p>

<div class="eg"><p><b>Worked example: the module's third lab.</b> On the two floor switches, Gi0/1 and Gi0/2 were configured last week with <code>channel-group 5 mode auto</code> on <b>both</b> SW1 and SW2. PC1 (10.55.0.11) and PC2 (10.55.0.12) are in VLAN 10 (FLOOR). Po5 is down and <code>show pagp neighbor</code> shows no partners, because both sides are listeners. Changing SW1 to <code>desirable</code> starts the conversation. That is only half of the story: the lab hides a second fault on SW2 Gi0/2, which we solve in the troubleshooting chapter.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using auto on both switches because "auto sounds automatic". Auto means "I will join if someone asks". If nobody asks, nothing happens, and STP quietly blocks the extra link.</p></div>

<div class="exam"><p><b>Exam trap.</b> desirable/auto are PAgP; active/passive are LACP. A question offering "active and desirable" as a working pair is wrong, because the protocols differ. Also remember PAgP is limited to 8 ports and is Cisco only.</p></div>

<div class="scn"><h4>The firewall that ignored the switch</h4><p>A network team migrated a core switch that had used PAgP desirable towards another Cisco switch. They copied the same template to the ports facing a new non-Cisco firewall pair. The firewall's LACP bundle stayed down and the switch ports showed <code>(I)</code>. The firewall simply did not understand PAgP. Changing the switch ports to <code>channel-group 8 mode active</code> brought the bundle up immediately.</p><p><b>Lesson:</b> PAgP is Cisco to Cisco only. For anything else, use LACP. Many teams now use LACP everywhere to keep one standard.</p></div>

<div class="iv"><p class="q">"What is the difference between PAgP and LACP?"</p><p>Strong answer: both negotiate EtherChannel and check the far end, but LACP is the IEEE 802.3ad / 802.1AX standard and works with any vendor, while PAgP is Cisco proprietary. LACP modes are active/passive, PAgP modes are desirable/auto. LACP supports 16 ports with 8 active and 8 standby; PAgP supports 8. Finish with: I would choose LACP for new designs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAgP is Cisco proprietary; packets go to 01:00:0C:CC:CC:CC; max 8 ports.</li>
<li>desirable initiates, auto only responds; auto + auto never forms a channel.</li>
<li>PAgP never interoperates with LACP or with mode on.</li>
<li>Silent (default) and non-silent are optional PAgP keywords.</li>
<li>Verify with <code>show pagp neighbor</code>: partner name and flags SAC or SC on every member.</li>
</ul></div>
`,hi:`
<p>Kuch families ghar mein aisi bhasha bolti hain jo bahar koi nahi samajhta. Dinner table par sab perfect chalta hai, lekin jaise hi kisi doosri family ka mehmaan aata hai, usse koi baat nahi kar pata. <b>PAgP</b> bundles banane ke liye Cisco ki family language hai. Do Cisco switches ke beech yeh achha chalta hai; server, firewall ya doosre vendor ke switch ke saath yeh exist hi nahi karta.</p>

<h3>PAgP kya hai</h3>
<p><b>Port Aggregation Protocol</b> Cisco proprietary hai aur LACP se purana hai. Yeh wahi kaam karta hai: bundle karne se pehle har switch check karta hai ki doosre end ke ports ek saath belong karte hain, unki settings compatible hain aur woh same neighbour se jude hain. PAgP packets Cisco multicast MAC <code>01:00:0C:CC:CC:CC</code> par bheje jaate hain, wahi destination jo CDP aur DTP use karte hain, aur link par hi rehte hain. Steady state mein PAgP har 30 seconds mein hello bhejta hai.</p>
<p>Yaad rakhne wale key facts:</p>
<ul>
<li>PAgP bundle <b>8</b> ports tak rakhta hai. LACP ke 16 jaisa hot-standby concept nahi hai.</li>
<li>Yeh sirf Cisco devices par chalta hai, aur sab par bhi nahi: Nexus switches (NX-OS) PAgP bilkul support nahi karte.</li>
<li>CCNA blueprint configuration ke liye LACP ka naam leta hai, lekin aapko PAgP modes phir bhi pehchanne aane chahiye, kyunki woh legacy networks aur exam questions mein aate hain.</li>
</ul>

<h3>Do modes</h3>
<dl class="terms">
<dt>desirable</dt><dd>Port PAgP packets bhej kar PAgP negotiation <b>shuru karta hai</b>. LACP active ka PAgP version.</dd>
<dt>auto</dt><dd>Port PAgP packets ka <b>jawab deta hai</b> lekin kabhi shuru nahi karta. LACP passive ka PAgP version. Yahi khatarnak wala hai, kyunki <b>auto ke saath auto kabhi channel nahi banata</b>.</dd>
</dl>
<p>To desirable ke saath desirable chalta hai, desirable ke saath auto chalta hai, aur auto ke saath auto fail hota hai. PAgP kabhi LACP ke saath negotiate nahi karta, aur dono protocols mode on ke saath nahi chalte.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PAgP negotiation: desirable shuru karta hai, auto jawab deta hai">
<rect x="40" y="30" width="150" height="46" rx="8" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="115" y="68" text-anchor="middle" class="svg-muted" font-size="12">desirable</text>
<rect x="450" y="30" width="150" height="46" rx="8" fill="#bae6fd"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="525" y="68" text-anchor="middle" class="svg-muted" font-size="12">auto</text>
<line x1="190" y1="44" x2="450" y2="44" stroke="#64748b" stroke-width="2"/><text x="320" y="38" text-anchor="middle" class="svg-accent" font-size="12">1. PAgP hello: mujhe bundle karna hai</text>
<line x1="450" y1="64" x2="190" y2="64" stroke="#64748b" stroke-width="2"/><text x="320" y="84" text-anchor="middle" class="svg-accent" font-size="12">2. PAgP reply: mujhe bhi, same group</text>
<text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">3. Dono bundle: Po5(SU) PAgP</text>
<rect x="40" y="150" width="150" height="46" rx="8" fill="#fed7aa"/><text x="115" y="172" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="115" y="188" text-anchor="middle" class="svg-muted" font-size="12">auto</text>
<rect x="450" y="150" width="150" height="46" rx="8" fill="#fed7aa"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="525" y="188" text-anchor="middle" class="svg-muted" font-size="12">auto</text>
<line x1="190" y1="173" x2="450" y2="173" stroke="#64748b" stroke-width="2" stroke-dasharray="5 5"/><text x="320" y="166" text-anchor="middle" class="svg-accent" font-size="12">khamoshi: dono wait karte hain</text>
<text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">Channel nahi: members (I), Po5(SD)</text>
</svg><p class="cap">Upar: desirable shuru karta hai, auto jawab deta hai, bundle banta hai. Neeche: do sunne wale kabhi baat nahi karte, isliye kuch nahi banta.</p></div>

<h3>Silent aur non-silent</h3>
<p>PAgP modes ka ek optional keyword hai: <code>channel-group 5 mode desirable non-silent</code>. Default mein ports <b>silent</b> mode mein chalte hain, jo port ko individual link ke roop mein up hone aur traffic pass karne deta hai chahe doosre end ka device kabhi PAgP packets na bheje (jaise file server ya traffic analyser). <b>Non-silent</b> partner se PAgP bhejne ki ummeed karta hai aur PAgP-capable switches ke beech use hota hai, aksar fibre ports par. CCNA ke liye bas itna jaanna kaafi hai ki yeh keywords exist karte hain; default silent mode theek hai.</p>

<h3>Configuration</h3>
<pre class="code">SW1(config)# interface range g0/1 - 2
SW1(config-if-range)# channel-group 5 mode desirable
SW1(config-if-range)# exit
SW1(config)# interface port-channel 5
SW1(config-if)# switchport mode trunk
<span class="c">! SW2 desirable ya auto ho sakta hai. DONO sides par auto se Po5 kabhi nahi banta.</span></pre>
<p>Optionally, members par <code>channel-protocol pagp</code> channel ko PAgP par lock kar deta hai, taaki baad mein <code>mode active</code> jaisa typo reject ho jaaye. Mode se protocol pehle hi pata chal jaata hai, isliye yeh command zaroori nahi.</p>

<h3>Verification</h3>
<pre class="out">SW1# show pagp neighbor
Flags:  S - Device is sending Slow hello.  C - Device is in Consistent state.
        A - Device is in Auto mode.        P - Device learns on physical port.

Channel group 5 neighbors
          Partner              Partner          Partner         Partner Group
Port      Name                 Device ID        Port       Age  Flags   Cap.
<span class="hl">Gi0/1     SW2                  5254.0002.0000   Gi0/1        9s SAC     50001</span>
Gi0/2     SW2                  5254.0002.0000   Gi0/2       11s SAC     50001</pre>
<p>Flags padho: <b>S</b> partner slow hellos bhej raha hai, <b>A</b> partner auto mode mein hai, <b>C</b> partner consistent state mein hai, jo aapko chahiye. Dono rows par partner name SW2 hai, isliye dono cables same switch par jaate hain. <code>show etherchannel summary</code> mein Protocol column <code>PAgP</code> dikhata hai.</p>

<div class="eg"><p><b>Worked example: module ka teesra lab.</b> Do floor switches par Gi0/1 aur Gi0/2 pichhle hafte SW1 aur SW2 <b>dono</b> par <code>channel-group 5 mode auto</code> ke saath configure hue the. PC1 (10.55.0.11) aur PC2 (10.55.0.12) VLAN 10 (FLOOR) mein hain. Po5 down hai aur <code>show pagp neighbor</code> koi partner nahi dikhata, kyunki dono sides sunne wali hain. SW1 ko <code>desirable</code> karne se baat-cheet shuru hoti hai. Lekin yeh aadhi kahani hai: lab SW2 Gi0/2 par ek doosra fault chhupata hai, jise hum troubleshooting chapter mein solve karenge.</p></div>

<div class="warn"><p><b>Common galti.</b> Dono switches par auto use karna kyunki "auto automatic lagta hai". Auto ka matlab hai "koi poochega to join kar lunga". Koi nahi poochta to kuch nahi hota, aur STP chupchap extra link block kar deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> desirable/auto PAgP hain; active/passive LACP hain. Jo question "active aur desirable" ko working pair bataye woh galat hai, kyunki protocols alag hain. Yeh bhi yaad rakho ki PAgP 8 ports tak limited hai aur sirf Cisco hai.</p></div>

<div class="scn"><h4>Firewall jisne switch ko ignore kiya</h4><p>Ek network team ne ek core switch migrate kiya jo doosre Cisco switch ki taraf PAgP desirable use karta tha. Unhone wahi template naye non-Cisco firewall pair ki taraf ke ports par copy kar diya. Firewall ka LACP bundle down raha aur switch ports <code>(I)</code> dikhate rahe. Firewall PAgP samajhta hi nahi tha. Switch ports ko <code>channel-group 8 mode active</code> karte hi bundle turant up ho gaya.</p><p><b>Seekh:</b> PAgP sirf Cisco se Cisco hai. Baaki sab ke liye LACP use karo. Kai teams ab ek standard rakhne ke liye har jagah LACP use karti hain.</p></div>

<div class="iv"><p class="q">"PAgP aur LACP mein kya fark hai?"</p><p>Strong answer: dono EtherChannel negotiate karte hain aur doosra end check karte hain, lekin LACP IEEE 802.3ad / 802.1AX standard hai aur kisi bhi vendor ke saath chalta hai, jabki PAgP Cisco proprietary hai. LACP modes active/passive hain, PAgP modes desirable/auto. LACP 16 ports support karta hai jisme 8 active aur 8 standby; PAgP 8. End mein bolo: naye designs ke liye main LACP chunuunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAgP Cisco proprietary hai; packets 01:00:0C:CC:CC:CC par jaate hain; max 8 ports.</li>
<li>desirable shuru karta hai, auto sirf jawab deta hai; auto + auto kabhi channel nahi banata.</li>
<li>PAgP kabhi LACP ya mode on ke saath interoperate nahi karta.</li>
<li>Silent (default) aur non-silent optional PAgP keywords hain.</li>
<li><code>show pagp neighbor</code> se verify karo: har member par partner name aur flags SAC ya SC.</li>
</ul></div>
`}};export{e as default};