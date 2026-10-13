var e={id:`overview`,h:{en:`Advanced switching at a glance: four tools for four problems`,hi:`Advanced switching ek nazar mein: chaar problems ke liye chaar tools`},body:{en:`
<p>At JNCIA level a VLAN is a simple idea: a port belongs to one VLAN and a trunk carries several. At JNCIP-ENT (JN0-650) the questions get harder. How do you put a device in the right VLAN without touching its port? How do you stop two servers in the same subnet from talking to each other? How do 200 access switches learn VLANs without a human typing them? How does a service provider carry a customer's own VLANs across its network? This module answers those four questions, one tool each.</p>

<h3>The four tools</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four switching tools">
<rect x="10" y="20" width="145" height="150" rx="10" fill="#bae6fd"/><text x="82" y="50" text-anchor="middle" class="svg-ink" font-size="14">Filter-based VLAN</text><text x="82" y="78" text-anchor="middle" class="svg-muted" font-size="12">who you are</text><text x="82" y="96" text-anchor="middle" class="svg-muted" font-size="12">decides the VLAN</text><text x="82" y="140" text-anchor="middle" class="svg-accent" font-size="12">MAC, IP, port</text>
<rect x="170" y="20" width="145" height="150" rx="10" fill="#ddd6fe"/><text x="242" y="50" text-anchor="middle" class="svg-ink" font-size="14">Private VLAN</text><text x="242" y="78" text-anchor="middle" class="svg-muted" font-size="12">one subnet,</text><text x="242" y="96" text-anchor="middle" class="svg-muted" font-size="12">limited talking</text><text x="242" y="140" text-anchor="middle" class="svg-accent" font-size="12">isolated, community</text>
<rect x="325" y="20" width="145" height="150" rx="10" fill="#bbf7d0"/><text x="397" y="50" text-anchor="middle" class="svg-ink" font-size="14">MVRP</text><text x="397" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLANs register</text><text x="397" y="96" text-anchor="middle" class="svg-muted" font-size="12">themselves</text><text x="397" y="140" text-anchor="middle" class="svg-accent" font-size="12">join, leave</text>
<rect x="485" y="20" width="145" height="150" rx="10" fill="#fde68a"/><text x="557" y="50" text-anchor="middle" class="svg-ink" font-size="14">Q-in-Q and L2PT</text><text x="557" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLANs inside</text><text x="557" y="96" text-anchor="middle" class="svg-muted" font-size="12">a VLAN</text><text x="557" y="140" text-anchor="middle" class="svg-accent" font-size="12">S-tag, C-tag</text>
</svg><p class="cap">Each tool solves one problem; the exam mixes them in one scenario.</p></div>
<ul>
<li><b>Filter-based VLAN (FBV).</b> A firewall filter in the ethernet-switching family matches a frame (for example its source MAC) and the action <code>then vlan NAME</code> puts it in that VLAN, whatever port it arrived on.</li>
<li><b>Private VLAN (PVLAN).</b> A primary VLAN is split into secondary VLANs. Isolated ports talk only to the promiscuous port, community ports talk to their own community and the promiscuous port.</li>
<li><b>MVRP.</b> The Multiple VLAN Registration Protocol (802.1ak) lets a switch announce VLANs to its neighbours, so trunks carry only the VLANs that are really in use and downstream VLANs can be created dynamically.</li>
<li><b>Q-in-Q and L2PT.</b> The provider pushes an outer service tag (S-tag) over the customer's tag (C-tag), and Layer 2 protocol tunnelling carries the customer's STP and LLDP across the provider cloud unchanged.</li>
</ul>

<h3>The labs behind this module</h3>
<p>Every chapter is tied to a real lab in the simulator, and every output block you see was captured from it.</p>
<pre class="code">Lab pvlan-dmz            DMZ1, DMZ2   VLAN DMZ 100, GUEST 101 isolated, WEB 102 community
Lab qinq-l2pt            PE1, PE2     SVLAN-ACME tag 100, SVLAN-BETA tag 200, CE1/CE2, RB1/RB2
Lab mvrp-campus-trouble  CORE, ACC1, ACC2   MVRP plus filter PRN-ASSIGN to VLAN PRINTERS 30</pre>

<h3>How to think about the order</h3>
<p>Think in layers of decision. A frame arrives; first the port and any filter decide <b>which VLAN</b> it is in (chapter 2). Inside that VLAN, private VLAN rules decide <b>who may receive it</b> (chapters 3 and 4). MVRP decides <b>which trunks carry that VLAN at all</b> (chapter 5). At the provider edge, Q-in-Q and mapping decide <b>which outer tag the frame wears</b> on the way (chapters 6 and 7). Chapter 8 puts all of this into troubleshooting routines.</p>

<div class="eg"><p><b>Worked example.</b> A school wants a printer to be in the PRINTERS VLAN wherever it is plugged in, student PCs on the guest network not to see each other, and new classroom switches to learn VLAN 20 automatically. That is three tools: FBV on the MAC of the printer, a PVLAN with an isolated guest secondary VLAN, and MVRP on the uplinks.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating these as alternatives. They stack. A PVLAN can run across MVRP trunks, and a Q-in-Q service VLAN can sit above customer VLANs that use FBV. Always ask which question each feature answers.</p></div>
<div class="exam"><p><b>Exam trap.</b> The syntax differs by platform generation. This module uses the Enhanced Layer 2 Software style (<code>family ethernet-switching</code>, <code>vlan members</code>) that the simulator uses. If a question shows older <code>interface-mode</code> or <code>port-mode</code> statements, read what the feature does and not the keyword alone.</p></div>

<div class="scn"><h4>The sprawl that nobody planned</h4><p>A campus added a new VLAN every semester. Within a year some trunks carried 80 VLANs of which a given access switch used 3. Broadcast and unknown unicast of unused VLANs flowed to every switch. Registering only the VLANs in use with MVRP (and pruning the rest) cut that traffic to what each switch needed.</p><p><b>Lesson:</b> VLAN design is not only about creating VLANs, it is about where they are carried.</p></div>

<div class="iv"><p class="q">"Name four ways Junos controls where a frame goes inside a Layer 2 network beyond a plain VLAN."</p><p>Filter-based VLANs choose the VLAN by frame attributes, private VLANs restrict who can talk inside a VLAN, MVRP controls which trunks carry which VLANs dynamically, and Q-in-Q with L2PT stacks tags and tunnels control protocols for a service provider customer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FBV picks the VLAN by frame content, PVLAN limits talk inside a VLAN, MVRP prunes trunks, Q-in-Q stacks tags.</li>
<li>The labs are pvlan-dmz, qinq-l2pt and mvrp-campus-troubleshoot.</li>
<li>The features stack and are asked together in scenarios.</li>
<li>Always find out which question a feature answers before choosing it.</li>
</ul></div>
`,hi:`
<p>JNCIA level par VLAN ek simple idea hai: port ek VLAN ka hota hai aur trunk kai VLANs le jaata hai. JNCIP-ENT (JN0-650) mein sawaal mushkil ho jaate hain. Kisi device ko uska port chhue bina sahi VLAN mein kaise daalen? Ek hi subnet ke do servers ko ek doosre se baat karne se kaise rokein? 200 access switches VLANs kaise seekhein bina insaan ke type kiye? Service provider customer ke apne VLANs apne network se kaise le jaaye? Yeh module in chaar sawaalon ka jawab deta hai, har ek ke liye ek tool.</p>

<h3>Chaar tools</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four switching tools">
<rect x="10" y="20" width="145" height="150" rx="10" fill="#bae6fd"/><text x="82" y="50" text-anchor="middle" class="svg-ink" font-size="14">Filter-based VLAN</text><text x="82" y="78" text-anchor="middle" class="svg-muted" font-size="12">aap kaun ho</text><text x="82" y="96" text-anchor="middle" class="svg-muted" font-size="12">VLAN tay karta hai</text><text x="82" y="140" text-anchor="middle" class="svg-accent" font-size="12">MAC, IP, port</text>
<rect x="170" y="20" width="145" height="150" rx="10" fill="#ddd6fe"/><text x="242" y="50" text-anchor="middle" class="svg-ink" font-size="14">Private VLAN</text><text x="242" y="78" text-anchor="middle" class="svg-muted" font-size="12">ek subnet,</text><text x="242" y="96" text-anchor="middle" class="svg-muted" font-size="12">seemit baat-cheet</text><text x="242" y="140" text-anchor="middle" class="svg-accent" font-size="12">isolated, community</text>
<rect x="325" y="20" width="145" height="150" rx="10" fill="#bbf7d0"/><text x="397" y="50" text-anchor="middle" class="svg-ink" font-size="14">MVRP</text><text x="397" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLANs khud</text><text x="397" y="96" text-anchor="middle" class="svg-muted" font-size="12">register hote hain</text><text x="397" y="140" text-anchor="middle" class="svg-accent" font-size="12">join, leave</text>
<rect x="485" y="20" width="145" height="150" rx="10" fill="#fde68a"/><text x="557" y="50" text-anchor="middle" class="svg-ink" font-size="14">Q-in-Q aur L2PT</text><text x="557" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLAN ke andar</text><text x="557" y="96" text-anchor="middle" class="svg-muted" font-size="12">VLAN</text><text x="557" y="140" text-anchor="middle" class="svg-accent" font-size="12">S-tag, C-tag</text>
</svg><p class="cap">Har tool ek problem solve karta hai; exam ek scenario mein sab mila deta hai.</p></div>
<ul>
<li><b>Filter-based VLAN (FBV).</b> Ethernet-switching family ka firewall filter frame ko match karta hai (jaise source MAC) aur action <code>then vlan NAME</code> use us VLAN mein daal deta hai, chahe woh kisi bhi port se aaya ho.</li>
<li><b>Private VLAN (PVLAN).</b> Primary VLAN ko secondary VLANs mein baanta jaata hai. Isolated ports sirf promiscuous port se baat karte hain, community ports apni community aur promiscuous port se.</li>
<li><b>MVRP.</b> Multiple VLAN Registration Protocol (802.1ak) switch ko VLANs padosiyon ko announce karne deta hai, taaki trunks sirf asal mein use hone wale VLANs le jaayein aur downstream VLANs dynamically ban sakein.</li>
<li><b>Q-in-Q aur L2PT.</b> Provider customer ke tag (C-tag) ke upar bahari service tag (S-tag) push karta hai, aur Layer 2 protocol tunnelling customer ke STP aur LLDP ko provider cloud se bina badle le jaata hai.</li>
</ul>

<h3>Is module ke peeche ke labs</h3>
<p>Har chapter simulator ke ek asli lab se juda hai, aur jo bhi output block aap dekhte ho woh usi se capture kiya gaya hai.</p>
<pre class="code">Lab pvlan-dmz            DMZ1, DMZ2   VLAN DMZ 100, GUEST 101 isolated, WEB 102 community
Lab qinq-l2pt            PE1, PE2     SVLAN-ACME tag 100, SVLAN-BETA tag 200, CE1/CE2, RB1/RB2
Lab mvrp-campus-trouble  CORE, ACC1, ACC2   MVRP plus filter PRN-ASSIGN to VLAN PRINTERS 30</pre>

<h3>Order ke baare mein kaise sochein</h3>
<p>Faisle ki layers mein socho. Frame aata hai; pehle port aur filter tay karte hain ki woh <b>kaunse VLAN</b> mein hai (chapter 2). Us VLAN ke andar private VLAN rules tay karte hain <b>kaun receive kar sakta hai</b> (chapters 3 aur 4). MVRP tay karta hai ki <b>kaunse trunks woh VLAN le jaayein</b> (chapter 5). Provider edge par Q-in-Q aur mapping tay karte hain ki frame raaste mein <b>kaunsa bahari tag pahne</b> (chapters 6 aur 7). Chapter 8 yeh sab troubleshooting routines mein daalta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek school chahta hai ki printer jahan bhi lage PRINTERS VLAN mein rahe, guest network par student PCs ek doosre ko na dekhein, aur naye classroom switches VLAN 20 apne aap seekhein. Yeh teen tools hain: printer ke MAC par FBV, isolated guest secondary VLAN wala PVLAN, aur uplinks par MVRP.</p></div>

<div class="warn"><p><b>Common mistake.</b> Inhe alternatives samajhna. Yeh ek ke upar ek lagte hain. PVLAN MVRP trunks par chal sakta hai, aur Q-in-Q service VLAN customer VLANs ke upar ho sakta hai jo FBV use karte hain. Hamesha poochho ki har feature kaunsa sawaal solve karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Syntax platform generation ke hisaab se badalta hai. Yeh module Enhanced Layer 2 Software style (<code>family ethernet-switching</code>, <code>vlan members</code>) use karta hai jo simulator bhi use karta hai. Agar sawaal mein purane <code>interface-mode</code> ya <code>port-mode</code> statements dikhein, to sirf keyword nahi, feature kya karta hai woh padho.</p></div>

<div class="scn"><h4>Sprawl jo kisi ne plan nahi kiya tha</h4><p>Ek campus har semester ek naya VLAN jodta tha. Ek saal mein kuch trunks 80 VLANs le jaate the jinmein se ek access switch 3 use karta tha. Unused VLANs ka broadcast aur unknown unicast har switch tak jaata tha. MVRP se sirf use hone wale VLANs register karne (aur baaki prune karne) se woh traffic utna reh gaya jitna har switch ko chahiye tha.</p><p><b>Lesson:</b> VLAN design sirf VLAN banana nahi, yeh bhi hai ki woh kahan le jaaye jaayein.</p></div>

<div class="iv"><p class="q">"Plain VLAN ke alawa Junos Layer 2 network ke andar frame kahan jaaye yeh control karne ke chaar tareeke batao."</p><p>Filter-based VLANs frame attributes se VLAN chunte hain, private VLANs VLAN ke andar kaun baat kare yeh seemit karte hain, MVRP dynamically tay karta hai ki kaunse trunks kaunse VLANs le jaayein, aur Q-in-Q ke saath L2PT service provider customer ke liye tags stack karta hai aur control protocols tunnel karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FBV frame content se VLAN chunta hai, PVLAN VLAN ke andar baat seemit karta hai, MVRP trunks prune karta hai, Q-in-Q tags stack karta hai.</li>
<li>Labs hain pvlan-dmz, qinq-l2pt aur mvrp-campus-troubleshoot.</li>
<li>Features ek ke upar ek lagte hain aur scenarios mein saath poochhe jaate hain.</li>
<li>Feature chunne se pehle jaano woh kaunsa sawaal solve karta hai.</li>
</ul></div>
`}};export{e as default};