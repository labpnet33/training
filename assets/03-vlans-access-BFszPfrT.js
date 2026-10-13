var e={id:`vlans-access`,h:{en:`VLANs and access ports on ELS`,hi:`ELS par VLANs aur access ports`},body:{en:`
<p>Imagine a single large open-plan office where every conversation is heard by everyone. Now add glass partitions: Finance in one room, Design in another. People in the same room still talk freely, but a shout in one room is not heard in the next. A <b>VLAN</b> (virtual LAN) is that partition, built in software. One physical switch is divided into several separate <b>broadcast domains</b>. A broadcast sent in VLAN 110 is never delivered to ports in VLAN 120.</p>

<h3>Why VLANs matter</h3>
<ul>
<li><b>Smaller broadcast domains:</b> less ARP and broadcast noise on every host.</li>
<li><b>Security and policy:</b> traffic between VLANs has to pass through a router interface where a firewall filter can be applied.</li>
<li><b>Flexibility:</b> moving a desk means changing one line of configuration, not re-cabling a floor.</li>
</ul>
<p>A VLAN is identified by a <b>VLAN ID</b> (also called tag), a 12-bit number from 1 to 4094. Junos gives every switch a built-in VLAN called <code>default</code> with ID 1.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Two VLANs on one switch">
<rect x="230" y="70" width="180" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="14">AS1 (EX4300)</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">two broadcast domains</text>
<rect x="20" y="20" width="120" height="34" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">PC1 DESIGN</text>
<rect x="20" y="150" width="120" height="34" rx="8" fill="#bae6fd"/><text x="80" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC2 DESIGN</text>
<rect x="500" y="20" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">PC3 FINANCE</text>
<rect x="500" y="150" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="560" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC4 FINANCE</text>
<line x1="140" y1="37" x2="230" y2="90" stroke="#64748b" stroke-width="2"/><line x1="140" y1="167" x2="230" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="90" x2="500" y2="37" stroke="#64748b" stroke-width="2"/><line x1="410" y1="120" x2="500" y2="167" stroke="#64748b" stroke-width="2"/>
<text x="150" y="85" class="svg-accent" font-size="12">VLAN 110</text><text x="440" y="85" class="svg-accent" font-size="12">VLAN 120</text>
</svg><p class="cap">Same switch, same subnet 192.168.50.0/24, but two VLANs: PC1 can reach PC2, not PC3.</p></div>

<h3>Configuring VLANs on ELS</h3>
<p>Modern EX switches such as the EX4300 use <b>Enhanced Layer 2 Software (ELS)</b>. You define VLANs by name, then attach ports through <code>family ethernet-switching</code> on unit 0. The <b>access port</b> is for one end device: it belongs to one VLAN and sends and receives <b>untagged</b> frames.</p>
<pre class="code"><span class="c"># Lab 1: split the Chennai design studio</span>
set vlans DESIGN vlan-id 110
set vlans FINANCE vlan-id 120
set interfaces ge-0/0/1 unit 0 family ethernet-switching interface-mode access vlan members DESIGN
set interfaces ge-0/0/2 unit 0 family ethernet-switching interface-mode access vlan members DESIGN
set interfaces ge-0/0/3 unit 0 family ethernet-switching vlan members FINANCE
set interfaces ge-0/0/4 unit 0 family ethernet-switching vlan members FINANCE</pre>
<p><code>interface-mode access</code> is the default, so lines three and four are equivalent. <code>vlan members</code> accepts the VLAN name or its numeric ID. Before committing, review the change. This is real output from the simulator:</p>
<pre class="out">lab@AS1# show | compare
[edit]
+   vlans {
+       DESIGN {
+           vlan-id 110;
+       }
+       FINANCE {
+           vlan-id 120;
+       }
+   }
[edit interfaces ge-0/0/1 unit 0 family ethernet-switching]
+   interface-mode access;
+   vlan {
+       members DESIGN;
+   }</pre>

<h3>Verifying</h3>
<pre class="out">lab@AS1&gt; show vlans
Routing instance        VLAN name             Tag          Interfaces
default-switch          default               1
default-switch          DESIGN                110
                                                           ge-0/0/1.0*
                                                           ge-0/0/2.0*
default-switch          FINANCE               120
                                                           <span class="hl">ge-0/0/3.0*</span>
                                                           ge-0/0/4.0*</pre>
<p>The asterisk means the logical interface is up. After the move, PC3 reaches PC4 but PC1 can no longer reach PC3. The simulator shows five lines of <code>host (192.168.50.13) not reachable</code>, which is exactly what you want: same subnet, different VLANs, no Layer 2 path and no router between them.</p>
<pre class="out">lab@AS1&gt; show ethernet-switching interface ge-0/0/1 detail
Logical Interface          : ge-0/0/1.0
  State                    : up
  Interface mode           : access
  MAC addresses learned    : 1
  VLAN membership          :
    DESIGN                110   untagged  Forwarding</pre>

<div class="tip"><p>When you have many identical ports use an interface range: <code>set interfaces interface-range USERS member-range ge-0/0/1 to ge-0/0/20</code> and put the shared <code>unit 0 family ethernet-switching</code> lines under that range once.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming a VLAN is a subnet: it is a Layer 2 idea, and the switch will happily put the same IP subnet in two VLANs, which then cannot talk. Another: a port with <code>family ethernet-switching</code> but no <code>vlan members</code> silently joins <code>default</code>. And a port without <code>family ethernet-switching</code> does not switch at all.</p></div>
<div class="exam"><p><b>Exam trap.</b> VLAN IDs 0 and 4095 are reserved, so valid IDs are 1 to 4094. The ELS keyword for the port role is <code>interface-mode</code>; the legacy EX syntax used <code>port-mode</code> under <code>ethernet-switching-options</code>.</p></div>

<div class="scn"><h4>The new finance hires on the wrong floor</h4><p>Two accountants were seated at desks wired to design ports. They could open the designers' shared drives. The engineer did not move any cable: he put ge-0/0/3 and ge-0/0/4 into FINANCE, ran <code>show vlans</code> to confirm membership and asked a designer to try a ping. It failed, as intended.</p><p><b>Lesson:</b> VLAN membership is configuration. Always prove isolation with a ping that must fail.</p></div>

<div class="iv"><p class="q">"What is the difference between a VLAN and a subnet?"</p><p>A VLAN is a Layer 2 broadcast domain; a subnet is a Layer 3 address range. The usual design is one VLAN per subnet, but the switch does not enforce it. Hosts in different VLANs need a Layer 3 hop (an IRB or router) to communicate, even if they share an address range on paper.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VLAN is a separate broadcast domain with an ID from 1 to 4094.</li>
<li>ELS: define VLANs under <code>[edit vlans]</code>, attach ports with <code>family ethernet-switching</code> on unit 0.</li>
<li>An access port belongs to one VLAN and carries untagged frames.</li>
<li>Without <code>vlan members</code> a switching port lands in <code>default</code> (ID 1).</li>
<li>Verify with <code>show vlans</code> and <code>show ethernet-switching interface</code>.</li>
</ul></div>
`,hi:`
<p>Socho ek bada open-plan office jahan har baat sab sunte hain. Ab glass partitions lagao: Finance ek kamre mein, Design doosre mein. Ek hi kamre ke log aaram se baat karte hain, lekin ek kamre ki cheekh agle kamre tak nahi jaati. <b>VLAN</b> (virtual LAN) wahi partition hai, jo software mein banta hai. Ek physical switch kai alag <b>broadcast domains</b> mein bat jaata hai. VLAN 110 mein bheja gaya broadcast VLAN 120 ke ports tak kabhi nahi pahunchta.</p>

<h3>VLANs kyun zaroori hain</h3>
<ul>
<li><b>Chhote broadcast domains:</b> har host par ARP aur broadcast noise kam.</li>
<li><b>Security aur policy:</b> VLANs ke beech traffic ko router interface se guzarna padta hai jahan firewall filter lag sakta hai.</li>
<li><b>Flexibility:</b> desk shift karna matlab configuration ki ek line badalna, poore floor ki re-cabling nahi.</li>
</ul>
<p>VLAN ek <b>VLAN ID</b> (tag) se pehchana jaata hai, jo 1 se 4094 tak ka 12-bit number hai. Junos har switch ko <code>default</code> naam ka built-in VLAN deta hai jiska ID 1 hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ek switch par do VLANs">
<rect x="230" y="70" width="180" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="14">AS1 (EX4300)</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">do broadcast domains</text>
<rect x="20" y="20" width="120" height="34" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">PC1 DESIGN</text>
<rect x="20" y="150" width="120" height="34" rx="8" fill="#bae6fd"/><text x="80" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC2 DESIGN</text>
<rect x="500" y="20" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">PC3 FINANCE</text>
<rect x="500" y="150" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="560" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC4 FINANCE</text>
<line x1="140" y1="37" x2="230" y2="90" stroke="#64748b" stroke-width="2"/><line x1="140" y1="167" x2="230" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="90" x2="500" y2="37" stroke="#64748b" stroke-width="2"/><line x1="410" y1="120" x2="500" y2="167" stroke="#64748b" stroke-width="2"/>
<text x="150" y="85" class="svg-accent" font-size="12">VLAN 110</text><text x="440" y="85" class="svg-accent" font-size="12">VLAN 120</text>
</svg><p class="cap">Same switch, same subnet 192.168.50.0/24, lekin do VLANs: PC1, PC2 tak pahunchta hai, PC3 tak nahi.</p></div>

<h3>ELS par VLANs configure karna</h3>
<p>EX4300 jaise modern EX switches <b>Enhanced Layer 2 Software (ELS)</b> use karte hain. VLAN naam se define karte hain, phir ports ko unit 0 par <code>family ethernet-switching</code> se jodte hain. <b>Access port</b> ek end device ke liye hai: woh ek VLAN ka hota hai aur <b>untagged</b> frames bhejta aur leta hai.</p>
<pre class="code"><span class="c"># Lab 1: Chennai design studio ko baanto</span>
set vlans DESIGN vlan-id 110
set vlans FINANCE vlan-id 120
set interfaces ge-0/0/1 unit 0 family ethernet-switching interface-mode access vlan members DESIGN
set interfaces ge-0/0/2 unit 0 family ethernet-switching interface-mode access vlan members DESIGN
set interfaces ge-0/0/3 unit 0 family ethernet-switching vlan members FINANCE
set interfaces ge-0/0/4 unit 0 family ethernet-switching vlan members FINANCE</pre>
<p><code>interface-mode access</code> default hai, isliye teesri aur chauthi line barabar hain. <code>vlan members</code> mein VLAN ka naam ya numeric ID dono chalte hain. Commit se pehle change review karo. Yeh simulator ka real output hai:</p>
<pre class="out">lab@AS1# show | compare
[edit]
+   vlans {
+       DESIGN {
+           vlan-id 110;
+       }
+       FINANCE {
+           vlan-id 120;
+       }
+   }
[edit interfaces ge-0/0/1 unit 0 family ethernet-switching]
+   interface-mode access;
+   vlan {
+       members DESIGN;
+   }</pre>

<h3>Verify karna</h3>
<pre class="out">lab@AS1&gt; show vlans
Routing instance        VLAN name             Tag          Interfaces
default-switch          default               1
default-switch          DESIGN                110
                                                           ge-0/0/1.0*
                                                           ge-0/0/2.0*
default-switch          FINANCE               120
                                                           <span class="hl">ge-0/0/3.0*</span>
                                                           ge-0/0/4.0*</pre>
<p>Asterisk ka matlab logical interface up hai. Move ke baad PC3, PC4 tak pahunchta hai lekin PC1 ab PC3 tak nahi pahunch sakta. Simulator <code>host (192.168.50.13) not reachable</code> ki paanch lines dikhata hai, aur wahi chahiye: subnet same, VLAN alag, koi Layer 2 path nahi aur beech mein koi router nahi.</p>
<pre class="out">lab@AS1&gt; show ethernet-switching interface ge-0/0/1 detail
Logical Interface          : ge-0/0/1.0
  State                    : up
  Interface mode           : access
  MAC addresses learned    : 1
  VLAN membership          :
    DESIGN                110   untagged  Forwarding</pre>

<div class="tip"><p>Bahut saare same ports hon to interface range use karo: <code>set interfaces interface-range USERS member-range ge-0/0/1 to ge-0/0/20</code> aur shared <code>unit 0 family ethernet-switching</code> lines ek baar us range ke neeche daalo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> VLAN ko subnet samajhna: yeh Layer 2 ka concept hai, aur switch ek hi IP subnet ko do VLANs mein khushi se rakh dega, jo phir baat nahi kar paate. Doosri: <code>family ethernet-switching</code> wala port jisme <code>vlan members</code> nahi, chupchaap <code>default</code> mein chala jaata hai. Aur jis port par <code>family ethernet-switching</code> nahi, woh switch hi nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> VLAN ID 0 aur 4095 reserved hain, isliye valid IDs 1 se 4094 hain. ELS mein port role ka keyword <code>interface-mode</code> hai; purane EX syntax mein <code>ethernet-switching-options</code> ke neeche <code>port-mode</code> hota tha.</p></div>

<div class="scn"><h4>Naye finance hires galat floor par</h4><p>Do accountants ko design ke ports wale desks par bitha diya gaya. Woh designers ke shared drives khol sakte the. Engineer ne koi cable nahi hilayi: usne ge-0/0/3 aur ge-0/0/4 ko FINANCE mein daala, membership confirm karne ke liye <code>show vlans</code> chalaya aur ek designer se ping try karne ko kaha. Ping fail hua, jaisa chahiye tha.</p><p><b>Lesson:</b> VLAN membership configuration hai. Isolation hamesha aise ping se saabit karo jo fail hona chahiye.</p></div>

<div class="iv"><p class="q">"VLAN aur subnet mein kya difference hai?"</p><p>VLAN Layer 2 broadcast domain hai; subnet Layer 3 address range hai. Aam design mein ek VLAN ke liye ek subnet hota hai, lekin switch ise enforce nahi karta. Alag VLANs ke hosts ko aapas mein baat karne ke liye Layer 3 hop (IRB ya router) chahiye, chahe kagaz par unka address range same ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN ek alag broadcast domain hai jiska ID 1 se 4094 hota hai.</li>
<li>ELS: VLANs <code>[edit vlans]</code> mein define karo, ports ko unit 0 par <code>family ethernet-switching</code> se jodo.</li>
<li>Access port ek VLAN ka hota hai aur untagged frames le jaata hai.</li>
<li><code>vlan members</code> ke bina switching port <code>default</code> (ID 1) mein jaata hai.</li>
<li><code>show vlans</code> aur <code>show ethernet-switching interface</code> se verify karo.</li>
</ul></div>
`}};export{e as default};