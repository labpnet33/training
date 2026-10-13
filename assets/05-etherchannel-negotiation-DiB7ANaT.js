var e={id:`etherchannel-negotiation`,h:{en:`EtherChannel: LACP, PAgP, misconfig guard and troubleshooting`,hi:`EtherChannel: LACP, PAgP, misconfig guard aur troubleshooting`},body:{en:`
<p>Two towns are joined by four narrow bridges. The councils decide to treat them as one four-lane bridge with one name and one set of rules. That only works if <b>both</b> councils agree which bridges belong to it. If one town declares "these four are one bridge" and the other still treats them as four separate roads, cars start going round in circles. An <b>EtherChannel</b> is that four-lane bridge, and <b>LACP</b> or <b>PAgP</b> is the phone call where the two councils confirm the deal.</p>

<h3>Three ways to build a bundle</h3>
<table class="cmp"><tr><th>Method</th><th>Modes</th><th>Standard</th><th>Forms a channel with</th></tr>
<tr><td>Static</td><td><code>on</code></td><td>none (no protocol)</td><td>only <code>on</code></td></tr>
<tr><td>LACP</td><td><code>active</code>, <code>passive</code></td><td>IEEE 802.3ad, now 802.1AX</td><td>active+active, active+passive</td></tr>
<tr><td>PAgP</td><td><code>desirable</code>, <code>auto</code></td><td>Cisco proprietary</td><td>desirable+desirable, desirable+auto</td></tr></table>
<p>The pattern matches DTP: <b>passive</b> and <b>auto</b> never start negotiation, so passive+passive and auto+auto never bundle. LACP and PAgP never talk to each other, and <code>on</code> never talks to either.</p>

<h3>LACP in detail</h3>
<dl class="terms">
<dt>LACPDU</dt><dd>Sent to the slow-protocols multicast 0180.c200.0002. Default <b>slow</b> rate every 30 seconds (timeout 90 s); <code>lacp rate fast</code> on an interface asks the partner to send every 1 second (timeout 3 s).</dd>
<dt>System ID</dt><dd>System priority (default 32768, <code>lacp system-priority</code>) + switch MAC. All members must see the <b>same partner system ID</b>; that is how LACP proves the links end on one device.</dd>
<dt>Port ID</dt><dd>Port priority (default 32768, <code>lacp port-priority</code>) + port number.</dd>
<dt>Hot-standby</dt><dd>Up to 16 ports can be configured in one LACP group but at most 8 are active. The switch with the <b>better (lower) system ID</b> decides which 8 are active, using the lowest port IDs; the others show flag <b>H</b>. <code>lacp max-bundle</code> lowers the limit.</dd>
<dt>Min-links</dt><dd><code>port-channel min-links 2</code> on the Port-channel interface keeps the whole bundle down if fewer members are available (flag <b>M</b>), useful when a half-bandwidth link is worse than a clean failover.</dd>
</dl>
<p>PAgP works the same way in spirit: hellos every 30 seconds, desirable initiates, auto answers. The <code>non-silent</code> keyword requires PAgP packets from the partner before a port becomes operational; the default <b>silent</b> mode tolerates a partner that rarely transmits.</p>

<pre class="code"><span class="c">! Lab 2 startup, identical on SW1 and SW2</span>
interface range GigabitEthernet0/1 - 2
 switchport mode trunk
 channel-group 1 mode active
interface Port-channel1
 switchport mode trunk</pre>

<h3>What must match</h3>
<p>Every member must have the same speed and duplex, the same switchport mode, the same access VLAN or the same native VLAN and allowed list, and compatible STP settings. A member that differs is <b>suspended</b> (flag <b>s</b>). Configure trunk settings on the <b>Port-channel interface</b>; IOS copies them to the members, which keeps them consistent.</p>

<h3>Reading show etherchannel summary</h3>
<pre class="out">SW2# show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        M - not in use, minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated

Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">1      Po1(SU)         LACP      Gi0/1(P)    Gi0/2(P)</span></pre>
<p><b>SU</b> on the port-channel means Layer 2 and in use. <b>P</b> on each member means bundled. The failure flags tell you where to look: <b>I</b> (stand-alone) means the neighbour is not answering LACP; <b>s</b> means a local or partner mismatch; <b>D</b> means the physical link is down; <b>H</b> is normal on the 9th to 16th LACP member.</p>
<pre class="out">SW2# show lacp neighbor
Channel group 1 neighbors

Partner's information:

                  LACP port                        Admin  Oper   Port    Port
Port      Flags   Priority  Dev ID          Age    key    Key    Number  State
Gi0/1     SA      32768     5254.0001.0000  12s    0x0    0x1    0x2     0x3D
Gi0/2     SA      32768     5254.0001.0000  15s    0x0    0x1    0x3     0x3D</pre>
<p>Flag S = slow rate, A = active mode. Both members show the <b>same Dev ID</b>: the partner is one system.</p>

<h3>The EtherChannel misconfig guard</h3>
<p>Static <code>on</code> has no handshake. If SW1 bundles Gi0/1-2 with mode on but SW2's ports are plain trunks, SW1 treats two links as one logical port while SW2 sees two separate ports, and a broadcast can loop back through the second link. The <b>EtherChannel misconfiguration guard</b>, enabled by default with <code>spanning-tree etherchannel guard misconfig</code>, notices that BPDUs arriving on the bundle come from more than one partner port and error-disables the channel:</p>
<pre class="out">%SPANTREE-2-CHNL_MISCFG: Detected loop due to etherchannel misconfiguration of Gi0/1
%PM-4-ERR_DISABLE: channel-misconfig (STP) error detected on Po1, putting Gi0/1 in err-disable state</pre>
<p>Fix the configuration on both sides, then <code>shutdown</code> / <code>no shutdown</code> the Port-channel (or use <code>errdisable recovery cause channel-misconfig</code>).</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="LACP negotiation outcomes">
<rect x="30" y="30" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="57" text-anchor="middle" class="svg-ink" font-size="13">active + passive</text>
<rect x="30" y="90" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="117" text-anchor="middle" class="svg-ink" font-size="13">active + active</text>
<rect x="30" y="150" width="130" height="44" rx="8" fill="#fed7aa"/><text x="95" y="177" text-anchor="middle" class="svg-ink" font-size="13">on + active</text>
<text x="330" y="57" text-anchor="middle" class="svg-accent" font-size="13">Po1(SU), members (P)</text>
<text x="330" y="117" text-anchor="middle" class="svg-accent" font-size="13">Po1(SU), members (P)</text>
<text x="330" y="177" text-anchor="middle" class="svg-accent" font-size="13">active side (I) or (s); risk of loop</text>
<line x1="160" y1="52" x2="220" y2="52" stroke="#64748b" stroke-width="2"/><line x1="160" y1="112" x2="220" y2="112" stroke="#64748b" stroke-width="2"/><line x1="160" y1="172" x2="200" y2="172" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">LACP modes and the flags you see; mixing on with a protocol mode never forms a clean bundle.</p></div>

<div class="eg"><p><b>Worked example: which members go hot-standby?</b> SW1 (system priority 32768, MAC 5254.0001.0000) and SW2 (system priority 100) share a 10-link LACP group. SW2 has the lower system ID, so SW2 decides. All port priorities are default, so SW2's 8 lowest port numbers become active, and the matching ports on SW1 follow. To choose which links stay active from SW1 instead, lower SW1's system priority below 100, then lower <code>lacp port-priority</code> on the preferred ports.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the allowed VLAN list on one member interface instead of on the Port-channel. That member becomes inconsistent and is suspended, halving the bundle bandwidth without any link going down.</p></div>

<div class="exam"><p><b>Exam trap.</b> passive+passive and auto+auto never form a bundle; <code>on</code> works only with <code>on</code>. LACP allows 16 configured and 8 active ports; the switch with the lower system priority (then lower MAC) chooses the active ones.</p></div>

<div class="scn"><h4>The bundle that ran at half speed</h4><p>After a change, a 2x10G uplink carried only 10G. <code>show etherchannel summary</code> showed <code>Po1(SU) LACP Te1/1/1(P) Te1/1/2(s)</code>. <code>show run interface Te1/1/2</code> revealed <code>switchport trunk allowed vlan 10,20,30</code> while the Port-channel allowed 10,20,30,40: someone had edited the member directly. Re-applying the list on the Port-channel interface synchronised both members and Te1/1/2 rejoined with flag P.</p><p><b>Lesson:</b> flag (s) means an inconsistency; compare each member with the Port-channel configuration.</p></div>

<div class="iv"><p class="q">"What is the EtherChannel misconfiguration guard and when does it trigger?"</p><p>Strong answer: an STP feature enabled by default that detects when the local switch has bundled ports but the neighbour has not, typically with static mode on. BPDUs arriving on the bundle from different partner ports reveal it, and the switch err-disables the members with reason channel-misconfig to prevent a loop. Recommend LACP active on both sides so negotiation prevents the problem in the first place.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LACP active/passive (IEEE), PAgP desirable/auto (Cisco), static on (no protocol); passive+passive and auto+auto fail.</li>
<li>LACP: system ID = priority + MAC; 16 configured, 8 active, the lower system ID picks the active ports.</li>
<li>Flags: P bundled, I stand-alone, s suspended, H hot-standby, D down, M min-links not met.</li>
<li>Configure trunk settings on the Port-channel interface to keep members consistent.</li>
<li>The misconfig guard err-disables a one-sided bundle (channel-misconfig).</li>
</ul></div>
`,hi:`
<p>Do towns chaar patle pulon se jude hain. Councils decide karti hain ki unhe ek naam aur ek set of rules ke saath ek chaar-lane pul maana jaaye. Yeh tabhi chalta hai jab <b>dono</b> councils agree karein ki kaunse pul isme shaamil hain. Agar ek town kehta hai "yeh chaar ek pul hain" aur doosra unhe abhi bhi chaar alag sadkein maanta hai, to cars gol gol ghoomne lagti hain. <b>EtherChannel</b> woh chaar-lane pul hai, aur <b>LACP</b> ya <b>PAgP</b> woh phone call hai jisme dono councils deal confirm karti hain.</p>

<h3>Bundle banane ke teen tareeke</h3>
<table class="cmp"><tr><th>Method</th><th>Modes</th><th>Standard</th><th>Kiske saath channel banata hai</th></tr>
<tr><td>Static</td><td><code>on</code></td><td>koi nahi (no protocol)</td><td>sirf <code>on</code></td></tr>
<tr><td>LACP</td><td><code>active</code>, <code>passive</code></td><td>IEEE 802.3ad, ab 802.1AX</td><td>active+active, active+passive</td></tr>
<tr><td>PAgP</td><td><code>desirable</code>, <code>auto</code></td><td>Cisco proprietary</td><td>desirable+desirable, desirable+auto</td></tr></table>
<p>Pattern DTP jaisa hi hai: <b>passive</b> aur <b>auto</b> kabhi negotiation shuru nahi karte, isliye passive+passive aur auto+auto kabhi bundle nahi banate. LACP aur PAgP kabhi ek doosre se baat nahi karte, aur <code>on</code> dono mein se kisi se baat nahi karta.</p>

<h3>LACP detail mein</h3>
<dl class="terms">
<dt>LACPDU</dt><dd>Slow-protocols multicast 0180.c200.0002 par bheja jaata hai. Default <b>slow</b> rate har 30 second (timeout 90 s); interface par <code>lacp rate fast</code> partner se har 1 second bhejne ko kehta hai (timeout 3 s).</dd>
<dt>System ID</dt><dd>System priority (default 32768, <code>lacp system-priority</code>) + switch MAC. Saare members ko <b>same partner system ID</b> dikhna chahiye; isi se LACP prove karta hai ki links ek hi device par khatam hote hain.</dd>
<dt>Port ID</dt><dd>Port priority (default 32768, <code>lacp port-priority</code>) + port number.</dd>
<dt>Hot-standby</dt><dd>Ek LACP group mein 16 ports tak configure ho sakte hain lekin zyada se zyada 8 active hote hain. <b>Behtar (kam) system ID</b> wala switch sabse kam port IDs use karke decide karta hai ki kaunse 8 active honge; baaki flag <b>H</b> dikhate hain. <code>lacp max-bundle</code> limit kam karta hai.</dd>
<dt>Min-links</dt><dd>Port-channel interface par <code>port-channel min-links 2</code> kam members available hone par poora bundle down rakhta hai (flag <b>M</b>), jab aadhi bandwidth wala link saaf failover se bura ho tab kaam ka.</dd>
</dl>
<p>PAgP bhi usi soch se kaam karta hai: har 30 second hellos, desirable shuru karta hai, auto jawab deta hai. <code>non-silent</code> keyword port operational hone se pehle partner se PAgP packets maangta hai; default <b>silent</b> mode aise partner ko bhi bardasht karta hai jo kam hi transmit karta hai.</p>

<pre class="code"><span class="c">! Lab 2 startup, SW1 aur SW2 par same</span>
interface range GigabitEthernet0/1 - 2
 switchport mode trunk
 channel-group 1 mode active
interface Port-channel1
 switchport mode trunk</pre>

<h3>Kya match hona chahiye</h3>
<p>Har member ki same speed aur duplex, same switchport mode, same access VLAN ya same native VLAN aur allowed list, aur compatible STP settings honi chahiye. Jo member alag ho woh <b>suspended</b> hota hai (flag <b>s</b>). Trunk settings <b>Port-channel interface</b> par configure karo; IOS unhe members par copy karta hai, jisse woh consistent rehte hain.</p>

<h3>show etherchannel summary padhna</h3>
<pre class="out">SW2# show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator
        M - not in use, minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated

Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">1      Po1(SU)         LACP      Gi0/1(P)    Gi0/2(P)</span></pre>
<p>Port-channel par <b>SU</b> ka matlab Layer 2 aur in use. Har member par <b>P</b> ka matlab bundled. Failure flags batate hain kahan dekhna hai: <b>I</b> (stand-alone) matlab neighbour LACP ka jawab nahi de raha; <b>s</b> matlab local ya partner mismatch; <b>D</b> matlab physical link down; <b>H</b> 9th se 16th LACP member par normal hai.</p>
<pre class="out">SW2# show lacp neighbor
Channel group 1 neighbors

Partner's information:

                  LACP port                        Admin  Oper   Port    Port
Port      Flags   Priority  Dev ID          Age    key    Key    Number  State
Gi0/1     SA      32768     5254.0001.0000  12s    0x0    0x1    0x2     0x3D
Gi0/2     SA      32768     5254.0001.0000  15s    0x0    0x1    0x3     0x3D</pre>
<p>Flag S = slow rate, A = active mode. Dono members <b>same Dev ID</b> dikhate hain: partner ek hi system hai.</p>

<h3>EtherChannel misconfig guard</h3>
<p>Static <code>on</code> mein koi handshake nahi hota. Agar SW1 Gi0/1-2 ko mode on se bundle karta hai lekin SW2 ke ports plain trunks hain, to SW1 do links ko ek logical port maanta hai jabki SW2 do alag ports dekhta hai, aur broadcast doosre link se wapas loop kar sakta hai. <b>EtherChannel misconfiguration guard</b>, jo default mein <code>spanning-tree etherchannel guard misconfig</code> se enabled hai, notice karta hai ki bundle par aane wale BPDUs ek se zyada partner ports se aa rahe hain aur channel ko error-disable kar deta hai:</p>
<pre class="out">%SPANTREE-2-CHNL_MISCFG: Detected loop due to etherchannel misconfiguration of Gi0/1
%PM-4-ERR_DISABLE: channel-misconfig (STP) error detected on Po1, putting Gi0/1 in err-disable state</pre>
<p>Dono sides par configuration theek karo, phir Port-channel ko <code>shutdown</code> / <code>no shutdown</code> karo (ya <code>errdisable recovery cause channel-misconfig</code> use karo).</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="LACP negotiation outcomes">
<rect x="30" y="30" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="57" text-anchor="middle" class="svg-ink" font-size="13">active + passive</text>
<rect x="30" y="90" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="117" text-anchor="middle" class="svg-ink" font-size="13">active + active</text>
<rect x="30" y="150" width="130" height="44" rx="8" fill="#fed7aa"/><text x="95" y="177" text-anchor="middle" class="svg-ink" font-size="13">on + active</text>
<text x="330" y="57" text-anchor="middle" class="svg-accent" font-size="13">Po1(SU), members (P)</text>
<text x="330" y="117" text-anchor="middle" class="svg-accent" font-size="13">Po1(SU), members (P)</text>
<text x="330" y="177" text-anchor="middle" class="svg-accent" font-size="13">active side (I) ya (s); loop ka risk</text>
<line x1="160" y1="52" x2="220" y2="52" stroke="#64748b" stroke-width="2"/><line x1="160" y1="112" x2="220" y2="112" stroke="#64748b" stroke-width="2"/><line x1="160" y1="172" x2="200" y2="172" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">LACP modes aur unke flags; on ko protocol mode ke saath milane se kabhi saaf bundle nahi banta.</p></div>

<div class="eg"><p><b>Worked example: kaunse members hot-standby jaate hain?</b> SW1 (system priority 32768, MAC 5254.0001.0000) aur SW2 (system priority 100) ek 10-link LACP group share karte hain. SW2 ka system ID kam hai, isliye SW2 decide karta hai. Saari port priorities default hain, isliye SW2 ke 8 sabse kam port numbers active bante hain, aur SW1 ke matching ports follow karte hain. Agar SW1 se choose karna ho ki kaunse links active rahein, to SW1 ki system priority 100 se neeche karo, phir preferred ports par <code>lacp port-priority</code> kam karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Allowed VLAN list Port-channel ki jagah ek member interface par badalna. Woh member inconsistent ho jaata hai aur suspend hota hai, bina koi link down hue bundle ki bandwidth aadhi ho jaati hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> passive+passive aur auto+auto kabhi bundle nahi banate; <code>on</code> sirf <code>on</code> ke saath chalta hai. LACP 16 configured aur 8 active ports allow karta hai; kam system priority (phir kam MAC) wala switch active ports chunta hai.</p></div>

<div class="scn"><h4>Aadhi speed par chalta bundle</h4><p>Ek change ke baad 2x10G uplink sirf 10G le jaa raha tha. <code>show etherchannel summary</code> ne <code>Po1(SU) LACP Te1/1/1(P) Te1/1/2(s)</code> dikhaya. <code>show run interface Te1/1/2</code> mein <code>switchport trunk allowed vlan 10,20,30</code> tha jabki Port-channel 10,20,30,40 allow karta tha: kisi ne member ko seedha edit kiya tha. Port-channel interface par list dobara apply karne se dono members sync hue aur Te1/1/2 flag P ke saath wapas jud gaya.</p><p><b>Seekh:</b> flag (s) matlab inconsistency; har member ko Port-channel configuration se compare karo.</p></div>

<div class="iv"><p class="q">"EtherChannel misconfiguration guard kya hai aur kab trigger hota hai?"</p><p>Strong answer: yeh default mein enabled STP feature hai jo pakadta hai ki local switch ne ports bundle kar diye hain lekin neighbour ne nahi, aam taur par static mode on ke saath. Bundle par alag partner ports se aane wale BPDUs ise expose karte hain, aur switch loop rokne ke liye members ko channel-misconfig reason ke saath err-disable kar deta hai. Dono sides par LACP active recommend karo taaki negotiation problem ko shuru mein hi rok de.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LACP active/passive (IEEE), PAgP desirable/auto (Cisco), static on (koi protocol nahi); passive+passive aur auto+auto fail.</li>
<li>LACP: system ID = priority + MAC; 16 configured, 8 active, kam system ID active ports chunta hai.</li>
<li>Flags: P bundled, I stand-alone, s suspended, H hot-standby, D down, M min-links poore nahi.</li>
<li>Members consistent rakhne ke liye trunk settings Port-channel interface par configure karo.</li>
<li>Misconfig guard ek-tarfa bundle ko err-disable karta hai (channel-misconfig).</li>
</ul></div>
`}};export{e as default};