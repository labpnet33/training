var e={id:`access-ports`,h:{en:`Creating VLANs and configuring access ports`,hi:`VLANs banana aur access ports configure karna`},body:{en:`
<p>A new employee joins, gets a desk and a network port. Somebody has to decide which department's network that port belongs to. On a switch, that decision is two lines of configuration: create the VLAN, then assign the port to it as an <b>access port</b>. This chapter walks through exactly what you type in lab 1 (Kaveri Textiles) and how to prove it worked.</p>

<h3>What an access port is</h3>
<p>An <b>access port</b> belongs to exactly one data VLAN. Frames between the switch and the PC are <b>untagged</b>: normal Ethernet frames with no VLAN information. The PC has no idea VLANs exist. When a frame enters, the switch associates it with the port's VLAN internally; when a frame leaves an access port, it leaves untagged. That is why any ordinary PC, printer or camera works on an access port without special settings.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Untagged frame enters Gi0/1, is handled inside VLAN 10, leaves Gi0/2 untagged">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">no VLAN idea</text>
<rect x="220" y="40" width="200" height="110" rx="10" fill="#bae6fd"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="245" y="80" width="150" height="46" rx="6" fill="#bbf7d0"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">inside: VLAN 10</text>
<rect x="510" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="565" y="110" text-anchor="middle" class="svg-muted" font-size="12">no VLAN idea</text>
<line x1="130" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="3"/><line x1="420" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="3"/>
<text x="175" y="85" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text><text x="465" y="85" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2</text>
<text x="175" y="125" text-anchor="middle" class="svg-accent" font-size="12">untagged</text><text x="465" y="125" text-anchor="middle" class="svg-accent" font-size="12">untagged</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">The VLAN exists only inside the switch for access-port traffic</text>
</svg><p class="cap">On access ports the VLAN is a switch-internal label. Frames on the wire carry no tag.</p></div>

<h3>Step 1: create and name the VLANs</h3>
<pre class="code"><span class="c">! Lab 1: Kaveri Textiles, SW1</span>
SW1# configure terminal
SW1(config)# vlan 10
SW1(config-vlan)# name SALES
SW1(config-vlan)# vlan 20
SW1(config-vlan)# name ACCOUNTS
SW1(config-vlan)# exit</pre>
<p><code>vlan 10</code> creates the VLAN (or enters it if it exists) and moves you into VLAN configuration mode. <code>name</code> is optional but always use it: without it the name defaults to <code>VLAN0010</code>, which tells the next engineer nothing. Names can be up to 32 characters. You can create several at once with <code>vlan 10,20,30</code> or <code>vlan 40-45</code>.</p>

<h3>Step 2: make the ports static access ports</h3>
<pre class="code"><span class="c">! PC1 and PC2 go to SALES</span>
SW1(config)# interface range GigabitEthernet0/1 - 2
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
<span class="c">! PC3 and PC4 go to ACCOUNTS</span>
SW1(config-if-range)# interface range GigabitEthernet0/3 - 4
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 20
SW1(config-if-range)# end
SW1# copy running-config startup-config</pre>
<ul>
<li><code>switchport mode access</code> hard-codes the port as access. Without it the port stays in its default dynamic mode and could become a trunk if the neighbour asks (chapter 9). Always set it on user ports.</li>
<li><code>switchport access vlan 10</code> chooses the data VLAN. If you name a VLAN that does not exist, IOS creates it and prints <code>% Access VLAN does not exist. Creating vlan 30</code>. Convenient, but the new VLAN has no name.</li>
<li>On some multilayer switches and router switch modules, ports are routed by default. Enter <code>switchport</code> first to make them Layer 2.</li>
<li>VLAN creation is written to vlan.dat immediately, but the port assignments live in the running-config, so save the configuration.</li>
</ul>

<h3>Step 3: verify</h3>
<pre class="out">SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/5, Gi0/6, Gi0/7
<span class="hl">10   SALES                            active    Gi0/1, Gi0/2</span>
<span class="hl">20   ACCOUNTS                         active    Gi0/3, Gi0/4</span>
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup</pre>
<p><code>show vlan brief</code> lists every VLAN with its name, status and <b>access ports</b>. Trunk ports never appear here, which confuses beginners. For one port in detail:</p>
<pre class="out">SW1# show interfaces GigabitEthernet0/1 switchport
Name: Gi0/1
Switchport: Enabled
<span class="hl">Administrative Mode: static access</span>
<span class="hl">Operational Mode: static access</span>
Administrative Trunking Encapsulation: dot1q
Negotiation of Trunking: Off
<span class="hl">Access Mode VLAN: 10 (SALES)</span>
Trunking Native Mode VLAN: 1 (default)
Voice VLAN: none</pre>
<p>Then test from the hosts, exactly as the lab asks: PC1 pings PC2 (192.168.50.12, works) and PC3 pings PC4 (192.168.50.22, works), but PC1 pinging PC3 (192.168.50.21) fails because the ARP never leaves VLAN 10.</p>

<div class="eg"><p><b>Worked example: parking unused ports.</b> Ports Gi0/5 to Gi0/7 are spare. Best practice is to create an unused VLAN, for example <code>vlan 999</code> with <code>name PARKING</code>, then <code>interface range g0/5 - 7</code>, <code>switchport mode access</code>, <code>switchport access vlan 999</code>, <code>shutdown</code>. Someone plugging a laptop into a spare port now gets nothing, and even if a port is later enabled by mistake it lands in a VLAN with no gateway and no users.</p></div>

<h3>Deleting a VLAN</h3>
<p><code>no vlan 20</code> removes the VLAN, but the ports that were in it <b>keep</b> <code>switchport access vlan 20</code>. They become <b>inactive</b>: they stop forwarding and vanish from <code>show vlan brief</code>. <code>show interfaces g0/3 switchport</code> shows <code>Access Mode VLAN: 20 (Inactive)</code>. They do not fall back to VLAN 1. Recreate the VLAN or reassign the ports.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>switchport mode access</code> (port stays dynamic); relying on auto-creation and ending up with unnamed VLANs; deleting a VLAN "to clean up" while ports still use it; and not saving, so the port assignments disappear after a reload even though the VLANs remain in vlan.dat.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which command shows which access ports are in VLAN 20?" Answer: <code>show vlan brief</code> (or <code>show vlan id 20</code>). And remember: a port whose VLAN was deleted is inactive, not moved to VLAN 1.</p></div>

<div class="scn"><h4>The clean-up that cut off HR</h4><p>During a tidy-up at an insurance office, an engineer saw VLAN 40 named OLD-HR and deleted it with <code>no vlan 40</code>. Within a minute, twelve HR users lost their network. Their ports were still configured with <code>switchport access vlan 40</code>; the name was old, but the VLAN was very much in use. <code>show vlan brief</code> no longer listed those ports at all, which at first made the engineer think the cables were unplugged. <code>show interfaces g1/0/14 switchport</code> revealed <code>Access Mode VLAN: 40 (Inactive)</code>. Recreating <code>vlan 40</code> restored service instantly, and the VLAN was renamed HR.</p><p><b>Lesson:</b> check <code>show vlan id N</code> for member ports before you ever delete a VLAN.</p></div>

<div class="iv"><p class="q">"How do you put a user port into VLAN 10, and why do you also set the mode?"</p><p>Strong answer: create the VLAN with <code>vlan 10</code> and a <code>name</code>, then on the interface <code>switchport mode access</code> and <code>switchport access vlan 10</code>. Setting the mode explicitly stops the port from ever negotiating a trunk, which prevents switch-spoofing VLAN hopping. Verify with <code>show vlan brief</code> and <code>show interfaces switchport</code>, and save the config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access port = one data VLAN, untagged frames; the end device knows nothing about VLANs.</li>
<li>Configure: <code>vlan N</code>, <code>name X</code>, then <code>switchport mode access</code> and <code>switchport access vlan N</code>.</li>
<li><code>show vlan brief</code> lists access ports per VLAN; trunk ports are not shown there.</li>
<li>Deleting a VLAN makes its ports inactive; they do not return to VLAN 1.</li>
<li>Park unused ports in an unused VLAN and shut them down.</li>
</ul></div>
`,hi:`
<p>Ek naya employee join karta hai, use desk aur ek network port milta hai. Kisi ko decide karna hai ki woh port kis department ke network ka hai. Switch par yeh decision do lines ki configuration hai: VLAN banao, phir port ko usme <b>access port</b> ki tarah assign karo. Yeh chapter exactly wahi dikhata hai jo aap lab 1 (Kaveri Textiles) mein type karte ho aur kaise prove karte ho ki woh chal gaya.</p>

<h3>Access port kya hai</h3>
<p><b>Access port</b> exactly ek data VLAN ka hota hai. Switch aur PC ke beech frames <b>untagged</b> hote hain: bina VLAN information ke normal Ethernet frames. PC ko pata hi nahi ki VLANs exist karte hain. Jab frame andar aata hai, switch use andar hi port ke VLAN se jodta hai; jab frame access port se bahar jaata hai, untagged jaata hai. Isiliye koi bhi normal PC, printer ya camera bina special settings ke access port par chal jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Untagged frame Gi0/1 mein aata hai, VLAN 10 ke andar handle hota hai, Gi0/2 se untagged nikalta hai">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">VLAN ka pata nahi</text>
<rect x="220" y="40" width="200" height="110" rx="10" fill="#bae6fd"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="245" y="80" width="150" height="46" rx="6" fill="#bbf7d0"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">andar: VLAN 10</text>
<rect x="510" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="565" y="110" text-anchor="middle" class="svg-muted" font-size="12">VLAN ka pata nahi</text>
<line x1="130" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="3"/><line x1="420" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="3"/>
<text x="175" y="85" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text><text x="465" y="85" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2</text>
<text x="175" y="125" text-anchor="middle" class="svg-accent" font-size="12">untagged</text><text x="465" y="125" text-anchor="middle" class="svg-accent" font-size="12">untagged</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Access-port traffic ke liye VLAN sirf switch ke andar exist karta hai</text>
</svg><p class="cap">Access ports par VLAN switch ka internal label hai. Wire par frames koi tag nahi le jaate.</p></div>

<h3>Step 1: VLANs banao aur naam do</h3>
<pre class="code"><span class="c">! Lab 1: Kaveri Textiles, SW1</span>
SW1# configure terminal
SW1(config)# vlan 10
SW1(config-vlan)# name SALES
SW1(config-vlan)# vlan 20
SW1(config-vlan)# name ACCOUNTS
SW1(config-vlan)# exit</pre>
<p><code>vlan 10</code> VLAN banata hai (ya agar exist karta hai to usme enter karta hai) aur aapko VLAN configuration mode mein le jaata hai. <code>name</code> optional hai par hamesha use karo: iske bina naam default <code>VLAN0010</code> hota hai, jo agle engineer ko kuch nahi batata. Naam 32 characters tak ho sakta hai. Aap ek saath kai bana sakte ho: <code>vlan 10,20,30</code> ya <code>vlan 40-45</code>.</p>

<h3>Step 2: ports ko static access ports banao</h3>
<pre class="code"><span class="c">! PC1 aur PC2 SALES mein jaate hain</span>
SW1(config)# interface range GigabitEthernet0/1 - 2
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
<span class="c">! PC3 aur PC4 ACCOUNTS mein jaate hain</span>
SW1(config-if-range)# interface range GigabitEthernet0/3 - 4
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 20
SW1(config-if-range)# end
SW1# copy running-config startup-config</pre>
<ul>
<li><code>switchport mode access</code> port ko pakka access bana deta hai. Iske bina port apne default dynamic mode mein rehta hai aur neighbour maange to trunk ban sakta hai (chapter 9). User ports par hamesha lagao.</li>
<li><code>switchport access vlan 10</code> data VLAN choose karta hai. Agar aap aisa VLAN do jo exist nahi karta, IOS use bana deta hai aur print karta hai <code>% Access VLAN does not exist. Creating vlan 30</code>. Convenient hai, par naye VLAN ka koi naam nahi hota.</li>
<li>Kuch multilayer switches aur router switch modules par ports default mein routed hote hain. Unhe Layer 2 banane ke liye pehle <code>switchport</code> do.</li>
<li>VLAN creation turant vlan.dat mein likh diya jaata hai, par port assignments running-config mein rehte hain, isliye configuration save karo.</li>
</ul>

<h3>Step 3: verify karo</h3>
<pre class="out">SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/5, Gi0/6, Gi0/7
<span class="hl">10   SALES                            active    Gi0/1, Gi0/2</span>
<span class="hl">20   ACCOUNTS                         active    Gi0/3, Gi0/4</span>
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup</pre>
<p><code>show vlan brief</code> har VLAN ko uske naam, status aur <b>access ports</b> ke saath dikhata hai. Trunk ports yahan kabhi nahi dikhte, jo beginners ko confuse karta hai. Ek port ki detail ke liye:</p>
<pre class="out">SW1# show interfaces GigabitEthernet0/1 switchport
Name: Gi0/1
Switchport: Enabled
<span class="hl">Administrative Mode: static access</span>
<span class="hl">Operational Mode: static access</span>
Administrative Trunking Encapsulation: dot1q
Negotiation of Trunking: Off
<span class="hl">Access Mode VLAN: 10 (SALES)</span>
Trunking Native Mode VLAN: 1 (default)
Voice VLAN: none</pre>
<p>Phir hosts se test karo, bilkul jaisa lab kehta hai: PC1 PC2 ko ping karta hai (192.168.50.12, chalta hai) aur PC3 PC4 ko (192.168.50.22, chalta hai), par PC1 se PC3 (192.168.50.21) ka ping fail hota hai kyunki ARP kabhi VLAN 10 se bahar nahi jaata.</p>

<div class="eg"><p><b>Worked example: unused ports ko park karna.</b> Ports Gi0/5 se Gi0/7 spare hain. Best practice hai ek unused VLAN banao, jaise <code>vlan 999</code> ke saath <code>name PARKING</code>, phir <code>interface range g0/5 - 7</code>, <code>switchport mode access</code>, <code>switchport access vlan 999</code>, <code>shutdown</code>. Ab spare port mein laptop lagane wale ko kuch nahi milta, aur agar baad mein galti se port enable bhi ho jaaye to woh aise VLAN mein aata hai jisme na gateway hai na users.</p></div>

<h3>VLAN delete karna</h3>
<p><code>no vlan 20</code> VLAN hata deta hai, par jo ports usme the woh <code>switchport access vlan 20</code> <b>rakhte</b> hain. Woh <b>inactive</b> ho jaate hain: forward karna band kar dete hain aur <code>show vlan brief</code> se gayab ho jaate hain. <code>show interfaces g0/3 switchport</code> dikhata hai <code>Access Mode VLAN: 20 (Inactive)</code>. Woh VLAN 1 mein wapas nahi jaate. VLAN dobara banao ya ports reassign karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> <code>switchport mode access</code> bhool jaana (port dynamic rehta hai); auto-creation par bharosa karke bina naam ke VLANs bana lena; "safai" ke liye aisa VLAN delete karna jise ports abhi use kar rahe hain; aur save na karna, jisse reload ke baad port assignments gayab ho jaate hain jabki VLANs vlan.dat mein bache rehte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsi command dikhati hai ki VLAN 20 mein kaunse access ports hain?" Jawab: <code>show vlan brief</code> (ya <code>show vlan id 20</code>). Aur yaad rakho: jis port ka VLAN delete hua woh inactive hota hai, VLAN 1 mein move nahi hota.</p></div>

<div class="scn"><h4>Woh safai jisne HR ko kaat diya</h4><p>Ek insurance office mein tidy-up ke dauran engineer ne OLD-HR naam ka VLAN 40 dekha aur <code>no vlan 40</code> se delete kar diya. Ek minute ke andar baarah HR users ka network chala gaya. Unke ports abhi bhi <code>switchport access vlan 40</code> ke saath configured the; naam purana tha, par VLAN poori tarah use mein tha. <code>show vlan brief</code> ab un ports ko dikhata hi nahi tha, jisse pehle engineer ko laga ki cables nikal gayi hain. <code>show interfaces g1/0/14 switchport</code> ne dikhaya <code>Access Mode VLAN: 40 (Inactive)</code>. <code>vlan 40</code> dobara banane se service turant wapas aayi, aur VLAN ka naam HR kar diya gaya.</p><p><b>Seekh:</b> VLAN delete karne se pehle hamesha <code>show vlan id N</code> se member ports check karo.</p></div>

<div class="iv"><p class="q">"User port ko VLAN 10 mein kaise daaloge, aur mode bhi kyun set karte ho?"</p><p>Strong answer: <code>vlan 10</code> aur ek <code>name</code> se VLAN banao, phir interface par <code>switchport mode access</code> aur <code>switchport access vlan 10</code>. Mode explicitly set karne se port kabhi trunk negotiate nahi karta, jo switch-spoofing VLAN hopping ko rokta hai. <code>show vlan brief</code> aur <code>show interfaces switchport</code> se verify karo, aur config save karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access port = ek data VLAN, untagged frames; end device VLANs ke baare mein kuch nahi jaanta.</li>
<li>Configure: <code>vlan N</code>, <code>name X</code>, phir <code>switchport mode access</code> aur <code>switchport access vlan N</code>.</li>
<li><code>show vlan brief</code> har VLAN ke access ports dikhata hai; trunk ports wahan nahi dikhte.</li>
<li>VLAN delete karne se uske ports inactive ho jaate hain; woh VLAN 1 mein wapas nahi jaate.</li>
<li>Unused ports ko ek unused VLAN mein park karo aur shutdown karo.</li>
</ul></div>
`}};export{e as default};