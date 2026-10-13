var e={id:`access-voice`,h:{en:`Access ports and the voice VLAN`,hi:`Access ports aur voice VLAN`},body:{en:`
<h3>The analogy: a door with one floor number on it</h3>
<p>Every office door on the staff floor opens onto the staff corridor and nowhere else. The person using the door does not need to know which floor they are on; the building takes care of it. An <b>access port</b> is that door. The PC plugged into it sends ordinary, untagged Ethernet frames and has no idea VLANs exist. The switch quietly places every frame from that port into the port's VLAN, and strips any VLAN information before sending frames back out to the PC.</p>

<h3>Access ports step by step</h3>
<p>An <b>access port</b> belongs to exactly one data VLAN, called the <b>access VLAN</b>. Frames enter and leave untagged. You use access ports for end devices: PCs, printers, cameras, servers with one network, and access points in simple setups. Two commands make a port a clean access port:</p>
<pre class="code"><span class="c">! Lab task: PC1 on Gi0/1 into STAFF, PC2 on Gi0/2 into GUEST</span>
configure terminal
interface GigabitEthernet0/1
 switchport mode access
 switchport access vlan 10
interface GigabitEthernet0/2
 switchport mode access
 switchport access vlan 20
end</pre>
<p><code>switchport mode access</code> fixes the port as an access port so it will never try to become a trunk, even if the device on the other end asks. On Cisco-style switches that request comes from <b>DTP</b> (Dynamic Trunking Protocol), a proprietary negotiation that is best switched off on user ports. <code>switchport access vlan 10</code> chooses the VLAN. If VLAN 10 did not exist yet, many switches create it automatically with a default name such as VLAN0010, but good practice is to create and name it first, as you did in chapter 3.</p>
<p>When many ports need the same settings, use a range: <code>interface range GigabitEthernet0/1 - 24</code> followed by the same two commands. That is how real rollouts are done, and it avoids typos on port 17 of 48.</p>

<h3>Verify the access ports</h3>
<pre class="out">SW1#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3
<span class="hl">10   STAFF                            active    Gi0/1
20   GUEST                            active    Gi0/2</span>
1002 fddi-default                     act/unsup 
...</pre>
<p>For the full detail of one port, use <code>show interfaces GigabitEthernet0/1 switchport</code>:</p>
<pre class="out">SW1#show interfaces GigabitEthernet0/1 switchport
Name: Gi0/1
Switchport: Enabled
Administrative Mode: static access
<span class="hl">Operational Mode: static access</span>
Negotiation of Trunking: Off
<span class="hl">Access Mode VLAN: 10 (STAFF)</span>
Trunking Native Mode VLAN: 1 (default)
Voice VLAN: none</pre>
<p>Gi0/0 is not shown in <code>show vlan brief</code> yet only because it is still an access port in VLAN 1 until you make it a trunk in the next chapter.</p>

<h3>The voice VLAN: two VLANs on one wall port</h3>
<p>Most desks have one network socket but two devices: an IP phone and a PC. The phone has a tiny built-in switch with a second port for the PC, so one cable serves both. We still want voice and data in different VLANs, because voice needs priority and a separate security policy. The solution is the <b>voice VLAN</b>:</p>
<ul>
<li>The <b>PC's</b> frames pass through the phone <b>untagged</b> and land in the access (data) VLAN.</li>
<li>The <b>phone's</b> own frames are sent <b>tagged</b> with the voice VLAN ID, and carry an 802.1p priority value (CoS 5) in the same tag so the network can prioritise them.</li>
<li>The switch tells the phone which voice VLAN to use with a discovery protocol: <b>LLDP-MED</b> (vendor-neutral) or <b>CDP</b> (Cisco).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Voice VLAN on one port">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="14">PC</text>
<rect x="220" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="285" y="92" text-anchor="middle" class="svg-ink" font-size="14">IP phone</text><text x="285" y="110" text-anchor="middle" class="svg-muted" font-size="12">built-in switch</text>
<rect x="470" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="545" y="88" text-anchor="middle" class="svg-ink" font-size="14">SW1 Gi0/5</text><text x="545" y="108" text-anchor="middle" class="svg-muted" font-size="12">access 10 · voice 150</text>
<line x1="130" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/><line x1="350" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="140" y="85" class="svg-muted" font-size="12">untagged</text>
<text x="360" y="75" class="svg-ink" font-size="12">PC data: untagged (10)</text>
<text x="360" y="128" class="svg-accent" font-size="12">voice: tagged 150, CoS 5</text>
</svg><p class="cap">One cable, two VLANs: data travels untagged, voice travels tagged with priority.</p></div>

<pre class="code"><span class="c">! Desk port with a phone and a PC behind it</span>
vlan 150
 name VOICE
interface GigabitEthernet0/5
 switchport mode access
 switchport access vlan 10
 switchport voice vlan 150
 spanning-tree portfast</pre>
<pre class="out">SW1#show interfaces GigabitEthernet0/5 switchport | include VLAN
Access Mode VLAN: 10 (STAFF)
Trunking Native Mode VLAN: 1 (default)
<span class="hl">Voice VLAN: 150 (VOICE)</span></pre>
<p>Even though the port now carries two VLANs, it is still configured and treated as an access port, not a trunk. Phones are usually powered by the same cable using <b>PoE</b> (Power over Ethernet), which you will meet again in the physical installation chapter because it adds to the switch's power load.</p>

<div class="eg"><p><b>Worked example.</b> A 48-port access switch serves 40 desks, each with a phone and a PC, and 8 printers. Configure <code>interface range Gi1/0/1 - 40</code> with access VLAN 10 and voice VLAN 150; <code>interface range Gi1/0/41 - 48</code> with access VLAN 30 and no voice VLAN. The 40 phones each draw about 6 W over PoE, so the switch must budget roughly 240 W for phones alone.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Leaving user ports in dynamic mode, so a device can negotiate a trunk and see every VLAN. (2) Forgetting to create the voice VLAN, so phones boot, learn VLAN 150 by LLDP, and then get no DHCP address. (3) Putting the PC in the voice VLAN, or the phone in the data VLAN, by swapping the two numbers.</p></div>

<div class="exam"><p><b>Exam traps.</b> Access ports carry one data VLAN, untagged. A voice VLAN port carries data untagged and voice tagged, and is still an access port. The phone learns the voice VLAN through LLDP-MED or CDP. "Untagged" and "access" go together; "tagged" means a trunk or the voice VLAN.</p></div>

<div class="scn"><h4>The phones that rebooted forever</h4><p>After a switch replacement at a call centre, every phone showed "Configuring IP" and rebooted in a loop, while PCs behind them worked. The engineer ran <code>show interfaces Gi1/0/12 switchport</code> and saw <code>Voice VLAN: 150 (Inactive)</code>. The new switch had the port configuration copied from the old one, but VLAN 150 had never been created in its VLAN database. The phones were told "use VLAN 150" by LLDP, tagged their frames, and the switch had nowhere to put them. Creating <code>vlan 150</code> fixed every desk at once.</p><p><b>Lesson:</b> the voice VLAN is a real VLAN; it must exist in the database and be routed and served by DHCP like any other.</p></div>

<div class="iv"><p class="q">"How does one switch port support both an IP phone and a PC in different VLANs?"</p><p>Strong answer: the port is an access port with an access (data) VLAN and a voice VLAN. The phone's internal switch passes PC traffic untagged into the data VLAN, while the phone tags its own traffic with the voice VLAN ID and CoS 5 for QoS. The switch advertises the voice VLAN to the phone with LLDP-MED or CDP. Mention PoE, and that the voice VLAN needs its own subnet, DHCP scope and gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An access port carries one VLAN, untagged; end devices do not know VLANs exist.</li>
<li><code>switchport mode access</code> plus <code>switchport access vlan N</code> is the standard pair; it also stops trunk negotiation.</li>
<li>Verify with <code>show vlan brief</code> and <code>show interfaces X switchport</code>.</li>
<li>A voice VLAN lets one port carry untagged data and tagged, prioritised voice; phones learn it by LLDP-MED or CDP.</li>
<li>Both the access VLAN and the voice VLAN must exist in the VLAN database.</li>
</ul></div>
`,hi:`
<h3>Analogy: ek darwaza jis par ek floor number likha hai</h3>
<p>Staff floor ka har office darwaza staff corridor mein khulta hai aur kahin nahi. Darwaza use karne wale ko yeh jaanne ki zaroorat nahi ki woh kis floor par hai; building khud sambhal leti hai. <b>Access port</b> wahi darwaza hai. Usmein laga PC normal, untagged Ethernet frames bhejta hai aur use pata bhi nahi ki VLANs exist karte hain. Switch chup-chaap us port ke har frame ko port ke VLAN mein daal deta hai, aur PC ko frames wapas bhejne se pehle VLAN ki koi bhi information hata deta hai.</p>

<h3>Access ports step by step</h3>
<p><b>Access port</b> exactly ek data VLAN ka hota hai, jise <b>access VLAN</b> kehte hain. Frames untagged aate aur jaate hain. Access ports end devices ke liye use hote hain: PCs, printers, cameras, ek network wale servers, aur simple setups mein access points. Do commands port ko saaf access port banate hain:</p>
<pre class="code"><span class="c">! Lab task: Gi0/1 par PC1 STAFF mein, Gi0/2 par PC2 GUEST mein</span>
configure terminal
interface GigabitEthernet0/1
 switchport mode access
 switchport access vlan 10
interface GigabitEthernet0/2
 switchport mode access
 switchport access vlan 20
end</pre>
<p><code>switchport mode access</code> port ko access port ki tarah fix kar deta hai taaki woh kabhi trunk banne ki koshish na kare, chahe doosre end ka device maange. Cisco-style switches par yeh request <b>DTP</b> (Dynamic Trunking Protocol) se aati hai, ek proprietary negotiation jise user ports par band rakhna best hai. <code>switchport access vlan 10</code> VLAN chunta hai. Agar VLAN 10 abhi exist nahi karta, to kai switches use VLAN0010 jaise default naam ke saath automatically bana dete hain, lekin achhi practice hai pehle use banao aur naam do, jaise aapne chapter 3 mein kiya.</p>
<p>Jab bahut saare ports ko same settings chahiye, range use karo: <code>interface range GigabitEthernet0/1 - 24</code> aur phir wahi do commands. Real rollouts aise hi hote hain, aur isse 48 mein se port 17 par typo nahi hota.</p>

<h3>Access ports verify karo</h3>
<pre class="out">SW1#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3
<span class="hl">10   STAFF                            active    Gi0/1
20   GUEST                            active    Gi0/2</span>
1002 fddi-default                     act/unsup 
...</pre>
<p>Ek port ki poori detail ke liye <code>show interfaces GigabitEthernet0/1 switchport</code> use karo:</p>
<pre class="out">SW1#show interfaces GigabitEthernet0/1 switchport
Name: Gi0/1
Switchport: Enabled
Administrative Mode: static access
<span class="hl">Operational Mode: static access</span>
Negotiation of Trunking: Off
<span class="hl">Access Mode VLAN: 10 (STAFF)</span>
Trunking Native Mode VLAN: 1 (default)
Voice VLAN: none</pre>
<p>Gi0/0 abhi <code>show vlan brief</code> mein nahi dikh raha sirf isliye kyunki woh abhi bhi VLAN 1 ka access port hai, jab tak aap agle chapter mein use trunk nahi banate.</p>

<h3>Voice VLAN: ek wall port par do VLANs</h3>
<p>Zyada tar desks par ek network socket hota hai lekin do devices: ek IP phone aur ek PC. Phone mein ek chhota built-in switch hota hai jiska doosra port PC ke liye hota hai, isliye ek cable dono ko serve karti hai. Hum phir bhi voice aur data ko alag VLANs mein chahte hain, kyunki voice ko priority aur alag security policy chahiye. Solution hai <b>voice VLAN</b>:</p>
<ul>
<li><b>PC</b> ke frames phone se <b>untagged</b> guzarte hain aur access (data) VLAN mein pahunchte hain.</li>
<li><b>Phone</b> ke apne frames voice VLAN ID ke saath <b>tagged</b> jaate hain, aur usi tag mein 802.1p priority value (CoS 5) hoti hai taaki network unhe priority de sake.</li>
<li>Switch phone ko discovery protocol se batata hai ki kaunsa voice VLAN use karna hai: <b>LLDP-MED</b> (vendor-neutral) ya <b>CDP</b> (Cisco).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Ek port par voice VLAN">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="14">PC</text>
<rect x="220" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="285" y="92" text-anchor="middle" class="svg-ink" font-size="14">IP phone</text><text x="285" y="110" text-anchor="middle" class="svg-muted" font-size="12">built-in switch</text>
<rect x="470" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="545" y="88" text-anchor="middle" class="svg-ink" font-size="14">SW1 Gi0/5</text><text x="545" y="108" text-anchor="middle" class="svg-muted" font-size="12">access 10 · voice 150</text>
<line x1="130" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/><line x1="350" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="140" y="85" class="svg-muted" font-size="12">untagged</text>
<text x="360" y="75" class="svg-ink" font-size="12">PC data: untagged (10)</text>
<text x="360" y="128" class="svg-accent" font-size="12">voice: tagged 150, CoS 5</text>
</svg><p class="cap">Ek cable, do VLANs: data untagged chalta hai, voice priority ke saath tagged chalta hai.</p></div>

<pre class="code"><span class="c">! Desk port jismein phone aur uske peeche PC hai</span>
vlan 150
 name VOICE
interface GigabitEthernet0/5
 switchport mode access
 switchport access vlan 10
 switchport voice vlan 150
 spanning-tree portfast</pre>
<pre class="out">SW1#show interfaces GigabitEthernet0/5 switchport | include VLAN
Access Mode VLAN: 10 (STAFF)
Trunking Native Mode VLAN: 1 (default)
<span class="hl">Voice VLAN: 150 (VOICE)</span></pre>
<p>Haalaanki port ab do VLANs carry karta hai, phir bhi woh access port ki tarah configure aur treat hota hai, trunk ki tarah nahi. Phones aam taur par usi cable se <b>PoE</b> (Power over Ethernet) ke through power lete hain, jo aapko physical installation chapter mein phir milega kyunki woh switch ka power load badhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek 48-port access switch 40 desks serve karta hai, har ek par phone aur PC, aur 8 printers. <code>interface range Gi1/0/1 - 40</code> ko access VLAN 10 aur voice VLAN 150 ke saath configure karo; <code>interface range Gi1/0/41 - 48</code> ko access VLAN 30 ke saath aur bina voice VLAN. 40 phones mein se har ek PoE par lagbhag 6 W leta hai, isliye switch ko sirf phones ke liye lagbhag 240 W budget karna padega.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) User ports ko dynamic mode mein chhod dena, jisse koi device trunk negotiate karke har VLAN dekh sakta hai. (2) Voice VLAN banana bhool jaana, jisse phones boot hote hain, LLDP se VLAN 150 seekhte hain, aur phir unhe DHCP address nahi milta. (3) Dono numbers ulat kar PC ko voice VLAN mein, ya phone ko data VLAN mein daal dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> Access ports ek data VLAN untagged carry karte hain. Voice VLAN port data untagged aur voice tagged carry karta hai, aur phir bhi access port hi hai. Phone voice VLAN LLDP-MED ya CDP se seekhta hai. "Untagged" aur "access" saath chalte hain; "tagged" ka matlab trunk ya voice VLAN.</p></div>

<div class="scn"><h4>Phones jo hamesha reboot hote rahe</h4><p>Ek call centre mein switch replace hone ke baad har phone "Configuring IP" dikha kar loop mein reboot ho raha tha, jabki unke peeche ke PCs chal rahe the. Engineer ne <code>show interfaces Gi1/0/12 switchport</code> chalaya aur <code>Voice VLAN: 150 (Inactive)</code> dekha. Naye switch mein port configuration purane se copy hua tha, lekin uske VLAN database mein VLAN 150 kabhi bana hi nahi tha. LLDP ne phones ko "VLAN 150 use karo" bola, unhone frames tag kiye, aur switch ke paas unhe rakhne ki koi jagah nahi thi. <code>vlan 150</code> banate hi har desk ek saath theek ho gaya.</p><p><b>Seekh:</b> voice VLAN ek real VLAN hai; use database mein exist karna chahiye aur doosre VLANs ki tarah route aur DHCP se serve hona chahiye.</p></div>

<div class="iv"><p class="q">"Ek switch port alag VLANs mein IP phone aur PC dono ko kaise support karta hai?"</p><p>Strong answer: port ek access port hai jismein access (data) VLAN aur voice VLAN dono hain. Phone ka internal switch PC traffic ko untagged data VLAN mein pass karta hai, jabki phone apna traffic voice VLAN ID aur QoS ke liye CoS 5 ke saath tag karta hai. Switch phone ko LLDP-MED ya CDP se voice VLAN advertise karta hai. PoE mention karo, aur yeh bhi ki voice VLAN ko apna subnet, DHCP scope aur gateway chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access port ek VLAN untagged carry karta hai; end devices ko pata bhi nahi ki VLANs exist karte hain.</li>
<li><code>switchport mode access</code> aur <code>switchport access vlan N</code> standard pair hai; yeh trunk negotiation bhi rokta hai.</li>
<li><code>show vlan brief</code> aur <code>show interfaces X switchport</code> se verify karo.</li>
<li>Voice VLAN ek port ko untagged data aur tagged, prioritised voice carry karne deta hai; phones use LLDP-MED ya CDP se seekhte hain.</li>
<li>Access VLAN aur voice VLAN dono VLAN database mein exist karne chahiye.</li>
</ul></div>
`}};export{e as default};