var e={id:`vtp`,h:{en:`VTP: sharing VLANs, and why most networks turn it off`,hi:`VTP: VLANs share karna, aur zyada tar networks ise band kyun karte hain`},body:{en:`
<p>A company keeps one official staff directory. Head office edits it and every branch copies the latest version automatically. Convenient, until someone at a branch restores a two-year-old printout, stamps it "version 999" and the whole company copies it, deleting half the employees overnight. <b>VTP</b> (VLAN Trunking Protocol) works like that directory, and the version stamp is its famous weakness.</p>

<h3>What VTP does and does not do</h3>
<p>VTP is a <b>Cisco-proprietary</b> protocol that shares the <b>VLAN database</b> (VLAN IDs and names) between switches in the same <b>VTP domain</b>, over trunk links. You create VLAN 30 once on a server switch and it appears on every other switch in the domain. VTP does <b>not</b> assign ports to VLANs, does not configure trunks and does not carry user traffic. It only synchronises the list of VLANs.</p>

<h3>The modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Create/delete VLANs locally?</th><th>Learns from ads?</th><th>Forwards ads?</th><th>Notes</th></tr>
<tr><td><b>Server</b> (default)</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Originates advertisements; stores VLANs in vlan.dat</td></tr>
<tr><td><b>Client</b></td><td>No</td><td>Yes</td><td>Yes</td><td>Refuses VLAN changes: <code>VTP VLAN configuration not allowed when device is in CLIENT mode.</code></td></tr>
<tr><td><b>Transparent</b></td><td>Yes, local only</td><td>No</td><td>Yes (v2 and later)</td><td>Ignores the domain database; VLANs also saved in running-config</td></tr>
<tr><td><b>Off</b></td><td>Yes, local only</td><td>No</td><td>No</td><td>Available in VTPv3 and on newer IOS releases</td></tr>
</table>
<p>Other facts worth knowing: the <b>domain name</b> is case-sensitive; a switch with an empty (null) domain name adopts the first domain it hears on a trunk (VTP 1 and 2). An optional <b>password</b> is used to build an MD5 digest so only switches with the same password accept updates. Summary advertisements are sent every <b>5 minutes</b> and immediately after a change. Versions: <b>v1</b>, <b>v2</b> (adds consistency checks and transparent forwarding regardless of domain), and <b>v3</b> (extended VLANs, a protected <b>primary server</b>, hidden passwords, off mode).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VTP domain: a server advertises to clients through a transparent switch">
<rect x="250" y="16" width="140" height="50" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">DIST1: server</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">revision 14</text>
<rect x="40" y="150" width="140" height="50" rx="8" fill="#bae6fd"/><text x="110" y="172" text-anchor="middle" class="svg-ink" font-size="13">ACC1: client</text><text x="110" y="190" text-anchor="middle" class="svg-muted" font-size="12">revision 14</text>
<rect x="250" y="150" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">ACC2: transparent</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">own VLANs</text>
<rect x="460" y="150" width="140" height="50" rx="8" fill="#bae6fd"/><text x="530" y="172" text-anchor="middle" class="svg-ink" font-size="13">ACC3: client</text><text x="530" y="190" text-anchor="middle" class="svg-muted" font-size="12">revision 14</text>
<line x1="290" y1="66" x2="120" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="66" x2="320" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="175" x2="460" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="190" y="100" class="svg-accent" font-size="12">ads over trunks</text>
<text x="425" y="220" text-anchor="middle" class="svg-muted" font-size="12">relays ads, ignores them</text>
</svg><p class="cap">Domain NK-CAMPUS: the server advertises, clients copy, the transparent switch only passes advertisements along.</p></div>

<h3>Configuration and verification</h3>
<pre class="code"><span class="c">! Typical modern choice: take the switch out of VTP</span>
SW1(config)# vtp mode transparent
<span class="c">! or, where supported</span>
SW1(config)# vtp mode off

<span class="c">! If you really use VTP: set everything explicitly</span>
SW1(config)# vtp domain NK-CAMPUS
SW1(config)# vtp version 2
SW1(config)# vtp password Str0ngVtp
SW1(config)# vtp mode client</pre>
<pre class="out">SW1# show vtp status
VTP Version capable             : 1 to 3
VTP version running             : 2
<span class="hl">VTP Domain Name                 : NK-CAMPUS</span>
VTP Pruning Mode                : Disabled
VTP Traps Generation            : Disabled
Device ID                       : 5254.0012.3401
Configuration last modified by 10.99.0.2 at 9-28-26 22:14:05

Feature VLAN:
--------------
<span class="hl">VTP Operating Mode                : Server</span>
Maximum VLANs supported locally   : 1005
Number of existing VLANs          : 9
<span class="hl">Configuration Revision            : 14</span></pre>

<h3>The revision number danger</h3>
<p>Every change on a server increases the <b>configuration revision number</b> by one. When a switch receives an advertisement for its own domain (and password) with a <b>higher</b> revision, it replaces its whole VLAN database with the advertised one. This is true for <b>clients as well as servers</b>. Nobody checks whether the newer database makes sense.</p>
<div class="eg"><p><b>Worked example: the VTP bomb.</b> Production domain NK-CAMPUS is at revision 14 with VLANs 10, 20, 30, 99 and 110. A switch from the training lab, also configured with domain NK-CAMPUS, has been used for many exercises and is at revision 57 with only VLANs 1 and 200. It is plugged into a production trunk as a client. Its advertisement (57 is higher than 14) is accepted by the distribution server and every client: VLANs 10, 20, 30, 99 and 110 are deleted everywhere. Every access port in those VLANs becomes inactive. The whole campus is down, and nothing is "broken" in the hardware.</p></div>
<p>Protection: before connecting any switch to a VTP network, <b>reset its revision to 0</b> by setting <code>vtp mode transparent</code> and then back, or by changing the domain name to a dummy value and back (deleting vlan.dat also works). Better still, use VTPv3, where only the designated primary server can push changes, or do not use VTP at all.</p>

<h3>VTP pruning</h3>
<p>With pruning enabled on the server (<code>vtp pruning</code>), switches tell their neighbours which VLANs they actually have active ports in, and flooded traffic for other VLANs is not sent down those trunks. Pruned VLANs disappear from the last block of <code>show interfaces trunk</code> ("forwarding state and not pruned"). A manual allowed list achieves a similar result without VTP.</p>

<h3>Why most networks turn VTP off</h3>
<ul>
<li>One mistake (the revision bomb, or deleting a VLAN on the server) is instantly replicated to every switch.</li>
<li>Modern designs keep VLANs local to an access block and route everywhere else, so there is little to synchronise.</li>
<li>VLAN lists are now pushed by automation and templates, which are reviewed and version-controlled.</li>
<li>Transparent or off mode also puts VLANs into the running-config, so backups contain them.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Assuming a client cannot harm the domain (it can, with a higher revision); leaving new switches with the default server mode and null domain, so they silently join the first domain they hear; and forgetting that DTP negotiation also fails between dynamic ports whose VTP domain names differ.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default VTP mode is <b>server</b>. Transparent switches keep their own VLANs and relay advertisements; clients cannot create VLANs. A higher revision number wins, even from a client. VTP versions 1 and 2 do not carry extended-range VLANs.</p></div>

<div class="scn"><h4>Monday morning, no VLANs</h4><p>At a college campus, the IT team found every lab and office offline one Monday. <code>show vlan brief</code> on the core showed only VLAN 1 and a VLAN 250 nobody recognised. <code>show vtp status</code> reported revision 212 and "last modified by" the IP address of a switch a student assistant had brought back from the training room and connected over the weekend. It had the same domain name and a far higher revision. The team set every switch to <code>vtp mode transparent</code>, recreated the VLANs from the last configuration backup, and ports came back as each VLAN reappeared. VTP stayed off after that.</p><p><b>Lesson:</b> with VTP 1 and 2, the highest revision wins with no questions asked. Reset revisions before connecting any switch, or run transparent/off.</p></div>

<div class="iv"><p class="q">"What is the VTP revision number problem, and how do you avoid it?"</p><p>Strong answer: VTP servers and clients accept any advertisement for their domain with a higher configuration revision and overwrite their VLAN database. A switch from a lab with a higher revision can therefore wipe production VLANs, making access ports inactive. Avoid it by resetting the revision to 0 (mode transparent and back, or change the domain name) before connecting a switch, using passwords, using VTPv3 with a primary server, or running transparent/off mode as most modern networks do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VTP shares VLAN IDs and names over trunks within a domain; it never assigns ports.</li>
<li>Modes: server (default), client, transparent, off; clients cannot create VLANs, transparent keeps local VLANs and relays ads.</li>
<li>The higher configuration revision always wins, even from a client: the VTP bomb.</li>
<li>Reset the revision before adding a switch; VTPv3 adds a primary server and extended VLAN support.</li>
<li>Most networks run transparent or off and manage VLANs with templates or automation.</li>
</ul></div>
`,hi:`
<p>Ek company ek official staff directory rakhti hai. Head office use edit karta hai aur har branch latest version automatically copy kar leti hai. Convenient hai, jab tak kisi branch mein koi do saal purana printout restore karke us par "version 999" ka thappa na laga de aur poori company use copy karke raaton raat aadhe employees delete na kar de. <b>VTP</b> (VLAN Trunking Protocol) us directory ki tarah kaam karta hai, aur version stamp uski mashoor kamzori hai.</p>

<h3>VTP kya karta hai aur kya nahi</h3>
<p>VTP ek <b>Cisco-proprietary</b> protocol hai jo same <b>VTP domain</b> ke switches ke beech trunk links par <b>VLAN database</b> (VLAN IDs aur names) share karta hai. Aap VLAN 30 ek baar server switch par banate ho aur woh domain ke har doosre switch par dikh jaata hai. VTP ports ko VLANs assign <b>nahi</b> karta, trunks configure nahi karta aur user traffic carry nahi karta. Woh sirf VLANs ki list sync karta hai.</p>

<h3>Modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Locally VLANs bana/delete kar sakta hai?</th><th>Ads se seekhta hai?</th><th>Ads forward karta hai?</th><th>Notes</th></tr>
<tr><td><b>Server</b> (default)</td><td>Haan</td><td>Haan</td><td>Haan</td><td>Advertisements originate karta hai; VLANs vlan.dat mein store karta hai</td></tr>
<tr><td><b>Client</b></td><td>Nahi</td><td>Haan</td><td>Haan</td><td>VLAN changes mana karta hai: <code>VTP VLAN configuration not allowed when device is in CLIENT mode.</code></td></tr>
<tr><td><b>Transparent</b></td><td>Haan, sirf local</td><td>Nahi</td><td>Haan (v2 aur baad mein)</td><td>Domain database ko ignore karta hai; VLANs running-config mein bhi save hote hain</td></tr>
<tr><td><b>Off</b></td><td>Haan, sirf local</td><td>Nahi</td><td>Nahi</td><td>VTPv3 mein aur naye IOS releases par available</td></tr>
</table>
<p>Aur jaanne layak facts: <b>domain name</b> case-sensitive hai; khaali (null) domain name wala switch trunk par sune gaye pehle domain ko apna leta hai (VTP 1 aur 2). Optional <b>password</b> se MD5 digest banta hai taaki sirf same password wale switches updates accept karein. Summary advertisements har <b>5 minute</b> aur change ke turant baad bheje jaate hain. Versions: <b>v1</b>, <b>v2</b> (consistency checks aur domain se independent transparent forwarding jodta hai), aur <b>v3</b> (extended VLANs, protected <b>primary server</b>, hidden passwords, off mode).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VTP domain: server transparent switch ke through clients ko advertise karta hai">
<rect x="250" y="16" width="140" height="50" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">DIST1: server</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">revision 14</text>
<rect x="40" y="150" width="140" height="50" rx="8" fill="#bae6fd"/><text x="110" y="172" text-anchor="middle" class="svg-ink" font-size="13">ACC1: client</text><text x="110" y="190" text-anchor="middle" class="svg-muted" font-size="12">revision 14</text>
<rect x="250" y="150" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">ACC2: transparent</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">apne VLANs</text>
<rect x="460" y="150" width="140" height="50" rx="8" fill="#bae6fd"/><text x="530" y="172" text-anchor="middle" class="svg-ink" font-size="13">ACC3: client</text><text x="530" y="190" text-anchor="middle" class="svg-muted" font-size="12">revision 14</text>
<line x1="290" y1="66" x2="120" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="66" x2="320" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="175" x2="460" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="190" y="100" class="svg-accent" font-size="12">trunks par ads</text>
<text x="425" y="220" text-anchor="middle" class="svg-muted" font-size="12">ads aage bhejta, khud ignore karta</text>
</svg><p class="cap">Domain NK-CAMPUS: server advertise karta hai, clients copy karte hain, transparent switch sirf advertisements aage pass karta hai.</p></div>

<h3>Configuration aur verification</h3>
<pre class="code"><span class="c">! Typical modern choice: switch ko VTP se bahar nikalo</span>
SW1(config)# vtp mode transparent
<span class="c">! ya, jahan supported ho</span>
SW1(config)# vtp mode off

<span class="c">! Agar sach mein VTP use karte ho: sab kuch explicitly set karo</span>
SW1(config)# vtp domain NK-CAMPUS
SW1(config)# vtp version 2
SW1(config)# vtp password Str0ngVtp
SW1(config)# vtp mode client</pre>
<pre class="out">SW1# show vtp status
VTP Version capable             : 1 to 3
VTP version running             : 2
<span class="hl">VTP Domain Name                 : NK-CAMPUS</span>
VTP Pruning Mode                : Disabled
VTP Traps Generation            : Disabled
Device ID                       : 5254.0012.3401
Configuration last modified by 10.99.0.2 at 9-28-26 22:14:05

Feature VLAN:
--------------
<span class="hl">VTP Operating Mode                : Server</span>
Maximum VLANs supported locally   : 1005
Number of existing VLANs          : 9
<span class="hl">Configuration Revision            : 14</span></pre>

<h3>Revision number ka khatra</h3>
<p>Server par har change <b>configuration revision number</b> ko ek se badhata hai. Jab switch ko apne domain (aur password) ka aisa advertisement milta hai jiska revision <b>zyada</b> hai, to woh apna poora VLAN database advertised wale se replace kar deta hai. Yeh <b>servers ke saath clients</b> par bhi sach hai. Koi check nahi karta ki naya database sense banata hai ya nahi.</p>
<div class="eg"><p><b>Worked example: VTP bomb.</b> Production domain NK-CAMPUS revision 14 par hai, VLANs 10, 20, 30, 99 aur 110 ke saath. Training lab ka ek switch, jisme domain NK-CAMPUS hi configured hai, kai exercises mein use hua hai aur revision 57 par hai, sirf VLANs 1 aur 200 ke saath. Use production trunk mein client ki tarah laga diya jaata hai. Uska advertisement (57, 14 se zyada) distribution server aur har client accept kar leta hai: VLANs 10, 20, 30, 99 aur 110 har jagah delete ho jaate hain. Un VLANs ka har access port inactive ho jaata hai. Poora campus down hai, aur hardware mein kuch bhi "kharab" nahi hai.</p></div>
<p>Bachav: kisi bhi switch ko VTP network se jodne se pehle uska <b>revision 0 par reset karo</b>, <code>vtp mode transparent</code> set karke aur wapas, ya domain name ko dummy value mein badal kar aur wapas (vlan.dat delete karna bhi kaam karta hai). Aur behtar, VTPv3 use karo, jahan sirf designated primary server changes push kar sakta hai, ya VTP use hi mat karo.</p>

<h3>VTP pruning</h3>
<p>Server par pruning enable ho (<code>vtp pruning</code>), to switches apne neighbours ko batate hain ki unke kin VLANs mein active ports hain, aur doosre VLANs ka flooded traffic un trunks par nahi bheja jaata. Pruned VLANs <code>show interfaces trunk</code> ke last block ("forwarding state and not pruned") se gayab ho jaate hain. Manual allowed list bina VTP ke milta julta result deti hai.</p>

<h3>Zyada tar networks VTP band kyun karte hain</h3>
<ul>
<li>Ek galti (revision bomb, ya server par VLAN delete karna) turant har switch par replicate ho jaati hai.</li>
<li>Modern designs VLANs ko ek access block tak local rakhte hain aur baaki jagah route karte hain, isliye sync karne ko kam hi hota hai.</li>
<li>VLAN lists ab automation aur templates se push hoti hain, jo review aur version-control hote hain.</li>
<li>Transparent ya off mode VLANs ko running-config mein bhi daalta hai, isliye backups mein woh aa jaate hain.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Maan lena ki client domain ko nuksaan nahi pahuncha sakta (zyada revision ke saath pahuncha sakta hai); naye switches ko default server mode aur null domain ke saath chhodna, jisse woh chupchaap pehle sune domain mein jud jaate hain; aur bhoolna ki alag VTP domain names wale dynamic ports ke beech DTP negotiation bhi fail hoti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default VTP mode <b>server</b> hai. Transparent switches apne VLANs rakhte hain aur advertisements relay karte hain; clients VLANs nahi bana sakte. Zyada revision number jeetta hai, client se bhi. VTP versions 1 aur 2 extended-range VLANs carry nahi karte.</p></div>

<div class="scn"><h4>Monday subah, koi VLAN nahi</h4><p>Ek college campus mein IT team ne ek Monday har lab aur office ko offline paaya. Core par <code>show vlan brief</code> sirf VLAN 1 aur ek VLAN 250 dikha raha tha jise koi nahi pehchanta tha. <code>show vtp status</code> ne revision 212 aur "last modified by" mein us switch ka IP address dikhaya jise ek student assistant weekend par training room se laakar jod gaya tha. Uska domain name same tha aur revision kahin zyada. Team ne har switch ko <code>vtp mode transparent</code> par set kiya, last configuration backup se VLANs dobara banaye, aur har VLAN wapas aate hi ports wapas aa gaye. Uske baad VTP band hi raha.</p><p><b>Seekh:</b> VTP 1 aur 2 mein sabse zyada revision bina sawaal jeetta hai. Koi bhi switch jodne se pehle revisions reset karo, ya transparent/off chalao.</p></div>

<div class="iv"><p class="q">"VTP revision number problem kya hai, aur aap isse kaise bachte ho?"</p><p>Strong answer: VTP servers aur clients apne domain ka koi bhi advertisement jiska configuration revision zyada ho accept karke apna VLAN database overwrite kar dete hain. Isliye zyada revision wala lab switch production VLANs mita sakta hai, jisse access ports inactive ho jaate hain. Isse bachne ke liye switch jodne se pehle revision 0 par reset karo (mode transparent aur wapas, ya domain name badlo), passwords use karo, primary server ke saath VTPv3 use karo, ya transparent/off mode chalao jaisa zyada tar modern networks karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VTP ek domain ke andar trunks par VLAN IDs aur names share karta hai; yeh kabhi ports assign nahi karta.</li>
<li>Modes: server (default), client, transparent, off; clients VLANs nahi bana sakte, transparent local VLANs rakhta hai aur ads relay karta hai.</li>
<li>Zyada configuration revision hamesha jeetta hai, client se bhi: VTP bomb.</li>
<li>Switch jodne se pehle revision reset karo; VTPv3 primary server aur extended VLAN support jodta hai.</li>
<li>Zyada tar networks transparent ya off chalate hain aur VLANs templates ya automation se manage karte hain.</li>
</ul></div>
`}};export{e as default};