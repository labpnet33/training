var e={id:`vlan-database-design`,h:{en:`VLANs, the VLAN database and good VLAN design`,hi:`VLANs, VLAN database aur achha VLAN design`},body:{en:`
<h3>The analogy: a building directory</h3>
<p>Before anyone can be sent to "Floor 3, Accounts", the building must have a directory that says Floor 3 exists and what it is called. If someone deletes Floor 3 from the directory, the lift will not stop there any more, even though the desks and people are still physically present. The switch's <b>VLAN database</b> is that directory. A port can be told to belong to VLAN 20, but until VLAN 20 exists in the database, the port has nowhere to send its traffic.</p>

<h3>What a VLAN really is</h3>
<p>A <b>VLAN</b> is a logical layer 2 broadcast domain identified by a number, the <b>VLAN ID</b>. Frames arriving on a port assigned to VLAN 10 can be forwarded or flooded only to other ports (and trunks) that carry VLAN 10. In practice you give each VLAN one IP subnet and one default gateway, so a VLAN is also the unit you apply security policy to.</p>
<table class="cmp"><tr><th>VLAN IDs</th><th>Meaning</th></tr>
<tr><td>0 and 4095</td><td>Reserved by the 802.1Q standard; never usable</td></tr>
<tr><td>1</td><td>Default VLAN. Every port starts here. It cannot be deleted or renamed</td></tr>
<tr><td>2 to 1001</td><td>Normal range, free to use</td></tr>
<tr><td>1002 to 1005</td><td>Reserved on Cisco-style switches for legacy Token Ring and FDDI; cannot be deleted</td></tr>
<tr><td>1006 to 4094</td><td>Extended range, also usable on modern switches</td></tr>
</table>
<p>The VLAN ID field is 12 bits long, which is where the limit of 4094 usable VLANs comes from (4096 values minus the two reserved ones).</p>

<h3>The VLAN database</h3>
<p>On Cisco-style switches, normal-range VLANs are stored in a file called <code>vlan.dat</code> in flash, separate from the running configuration. That has two practical effects. First, erasing the startup configuration does not remove the VLANs; you must also delete <code>vlan.dat</code> for a truly clean switch. Second, creating a VLAN takes effect immediately, without <code>copy running-config startup-config</code> (although you still save to keep port settings). Other vendors keep VLANs in the main configuration; the idea of "the list of VLANs this switch knows" is the same everywhere.</p>
<pre class="code"><span class="c">! Create the lab VLANs on SW1 and give them names</span>
enable
configure terminal
vlan 10
 name STAFF
vlan 20
 name GUEST
end</pre>
<p>Names are optional but essential for humans: in a ticket at 2 a.m., "GUEST" tells you far more than "20". Verify with <code>show vlan brief</code>:</p>
<pre class="out">SW1#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/1, Gi0/2, Gi0/3
<span class="hl">10   STAFF                            active    
20   GUEST                            active    </span>
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>The new VLANs exist and are <b>active</b>, but have no ports yet: every port is still in VLAN 1. Assigning ports is the next chapter. Notice that trunk ports never appear in the Ports column of <code>show vlan brief</code>; you check trunks with <code>show interfaces trunk</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VLAN to subnet plan">
<rect x="20" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="90" y="46" text-anchor="middle" class="svg-ink" font-size="14">VLAN 10 STAFF</text><text x="90" y="68" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.0/24</text>
<rect x="175" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="245" y="46" text-anchor="middle" class="svg-ink" font-size="14">VLAN 20 GUEST</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.0/24</text>
<rect x="330" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="14">VLAN 30 PRINTERS</text><text x="400" y="68" text-anchor="middle" class="svg-muted" font-size="12">192.168.30.0/24</text>
<rect x="485" y="20" width="140" height="70" rx="8" fill="#fed7aa"/><text x="555" y="46" text-anchor="middle" class="svg-ink" font-size="14">VLAN 150 VOICE</text><text x="555" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.1.150.0/24</text>
<rect x="100" y="120" width="200" height="60" rx="8" fill="#e2e8f0"/><text x="200" y="146" text-anchor="middle" class="svg-ink" font-size="14">VLAN 99 MGMT</text><text x="200" y="166" text-anchor="middle" class="svg-muted" font-size="12">switch management only</text>
<rect x="340" y="120" width="200" height="60" rx="8" fill="#e2e8f0"/><text x="440" y="146" text-anchor="middle" class="svg-ink" font-size="14">VLAN 999 PARKING</text><text x="440" y="166" text-anchor="middle" class="svg-muted" font-size="12">unused ports, shut down</text>
</svg><p class="cap">A simple, readable plan: one purpose, one VLAN, one subnet; the VLAN ID echoes the third octet where possible.</p></div>

<h3>Designing VLANs well</h3>
<ul>
<li><b>Group by role, not by location.</b> Staff, guests, voice, printers, cameras, building systems and management each get their own VLAN, even if they share a switch.</li>
<li><b>One VLAN, one subnet.</b> Put two subnets in one VLAN and hosts will ARP for each other and fail in confusing ways. Put one subnet across two VLANs and neither half can reach the other without odd tricks.</li>
<li><b>Make numbers readable.</b> VLAN 10 = 192.168.10.0/24 and VLAN 20 = 192.168.20.0/24 means an engineer can guess the subnet from the VLAN ID.</li>
<li><b>Keep VLAN 1 empty.</b> Move users off the default VLAN, put unused ports in a "parking" VLAN and shut them down, and use a dedicated management VLAN for switch access.</li>
<li><b>Size the subnet to the VLAN.</b> A /24 gives 254 hosts; a VLAN with 500 phones needs a /23 or two VLANs. Very large VLANs mean more broadcast traffic and a bigger failure domain.</li>
<li><b>Document it.</b> A VLAN table (ID, name, subnet, gateway, DHCP scope, purpose) is part of the network documentation you will meet again in the monitoring module.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A clinic has 40 staff PCs, 40 IP phones, 6 printers, 12 cameras and public Wi-Fi. A clean plan: VLAN 10 STAFF 192.168.10.0/24, VLAN 150 VOICE 10.1.150.0/24, VLAN 30 PRINTERS 192.168.30.0/24, VLAN 40 CCTV 192.168.40.0/24, VLAN 20 GUEST 192.168.20.0/24, VLAN 99 MGMT 192.168.99.0/24 and VLAN 999 PARKING with no subnet. The router or firewall then allows staff to printers, cameras only to the recorder, and guests only to the internet.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Assigning a port to a VLAN that does not exist: on many switches the port becomes inactive and passes no traffic. (2) Deleting a VLAN that still has ports: those ports go inactive silently. (3) Assuming <code>write erase</code> gives a factory-clean switch; the old VLANs are still in <code>vlan.dat</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> VLAN 1 is the default VLAN on every port and cannot be deleted. The VLAN ID is 12 bits, so the maximum usable ID is 4094. A VLAN is a broadcast domain; a subnet is a layer 3 range; best practice maps one to one. The objective wording "VLAN database" means the switch's list of defined VLANs.</p></div>

<div class="scn"><h4>The printers that vanished on Monday</h4><p>Over the weekend a junior admin tidied the VLAN list and removed "old" VLAN 30, believing it unused. On Monday every printer was offline. <code>show vlan brief</code> no longer listed VLAN 30, and <code>show interfaces status</code> showed the printer ports as <code>inactive</code>. The ports were still configured with <code>switchport access vlan 30</code>, but the VLAN they pointed to no longer existed. Recreating <code>vlan 30</code> with <code>name PRINTERS</code> brought every printer back within seconds.</p><p><b>Lesson:</b> a port's VLAN assignment and the VLAN's existence are two separate things. Before deleting a VLAN, check which ports and trunks still use it.</p></div>

<div class="iv"><p class="q">"How would you design VLANs for a new office?"</p><p>Strong answer: start from roles and traffic policy, not floors. Give each role its own VLAN and subnet (staff, voice, guests, printers, cameras, management), keep VLAN 1 unused, park unused ports in a shut-down VLAN, use readable numbering that matches the subnet, size subnets for growth, and document ID, name, subnet, gateway and DHCP scope. Then say where inter-VLAN traffic is routed and filtered, because a VLAN plan without a policy point is only half a design.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VLAN is a layer 2 broadcast domain identified by a 12-bit ID (1 to 4094 usable).</li>
<li>VLAN 1 is the default and cannot be deleted; 1002 to 1005 are reserved on Cisco-style switches.</li>
<li>The VLAN database (vlan.dat on Cisco-style switches) lists which VLANs exist; a port in a missing VLAN goes inactive.</li>
<li>Design by role: one VLAN per purpose, one subnet per VLAN, readable numbering, VLAN 1 unused.</li>
<li>Verify with <code>show vlan brief</code>; trunks do not appear in its port list.</li>
</ul></div>
`,hi:`
<h3>Analogy: building ki directory</h3>
<p>Kisi ko "Floor 3, Accounts" bhejne se pehle building mein ek directory honi chahiye jo batati hai ki Floor 3 exist karta hai aur uska naam kya hai. Agar koi directory se Floor 3 delete kar de, to lift wahan rukegi hi nahi, bhale hi desks aur log physically wahin hon. Switch ka <b>VLAN database</b> wahi directory hai. Port ko bola ja sakta hai ki woh VLAN 20 ka hai, lekin jab tak VLAN 20 database mein exist nahi karta, port ke paas traffic bhejne ki koi jagah nahi hai.</p>

<h3>VLAN asal mein kya hai</h3>
<p><b>VLAN</b> ek logical layer 2 broadcast domain hai jise ek number se pehchana jaata hai, jise <b>VLAN ID</b> kehte hain. VLAN 10 wale port par aane wale frames sirf un doosre ports (aur trunks) par forward ya flood ho sakte hain jo VLAN 10 carry karte hain. Practice mein aap har VLAN ko ek IP subnet aur ek default gateway dete ho, isliye VLAN woh unit bhi hai jis par aap security policy lagate ho.</p>
<table class="cmp"><tr><th>VLAN IDs</th><th>Matlab</th></tr>
<tr><td>0 aur 4095</td><td>802.1Q standard ne reserve kiye hain; kabhi use nahi ho sakte</td></tr>
<tr><td>1</td><td>Default VLAN. Har port yahin se shuru hota hai. Ise delete ya rename nahi kar sakte</td></tr>
<tr><td>2 se 1001</td><td>Normal range, use karne ke liye free</td></tr>
<tr><td>1002 se 1005</td><td>Cisco-style switches par legacy Token Ring aur FDDI ke liye reserved; delete nahi ho sakte</td></tr>
<tr><td>1006 se 4094</td><td>Extended range, modern switches par yeh bhi usable</td></tr>
</table>
<p>VLAN ID field 12 bits lamba hai, isi se 4094 usable VLANs ki limit aati hai (4096 values mein se do reserved minus).</p>

<h3>VLAN database</h3>
<p>Cisco-style switches par normal-range VLANs flash mein <code>vlan.dat</code> naam ki file mein store hote hain, running configuration se alag. Iske do practical effects hain. Pehla, startup configuration erase karne se VLANs nahi hatte; poori tarah clean switch ke liye <code>vlan.dat</code> bhi delete karni padti hai. Doosra, VLAN banana turant effect leta hai, bina <code>copy running-config startup-config</code> ke (haalaanki port settings rakhne ke liye save phir bhi karte ho). Doosre vendors VLANs ko main configuration mein rakhte hain; "is switch ko kaunse VLANs pata hain" ki list ka idea har jagah same hai.</p>
<pre class="code"><span class="c">! SW1 par lab VLANs banao aur unhe naam do</span>
enable
configure terminal
vlan 10
 name STAFF
vlan 20
 name GUEST
end</pre>
<p>Naam optional hain lekin insaano ke liye zaroori hain: raat 2 baje ke ticket mein "GUEST" aapko "20" se kahin zyada batata hai. <code>show vlan brief</code> se verify karo:</p>
<pre class="out">SW1#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/1, Gi0/2, Gi0/3
<span class="hl">10   STAFF                            active    
20   GUEST                            active    </span>
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>Naye VLANs exist karte hain aur <b>active</b> hain, lekin abhi unmein koi port nahi hai: har port abhi bhi VLAN 1 mein hai. Ports assign karna agla chapter hai. Dhyan do ki trunk ports <code>show vlan brief</code> ke Ports column mein kabhi nahi dikhte; trunks ko aap <code>show interfaces trunk</code> se check karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VLAN se subnet plan">
<rect x="20" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="90" y="46" text-anchor="middle" class="svg-ink" font-size="14">VLAN 10 STAFF</text><text x="90" y="68" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.0/24</text>
<rect x="175" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="245" y="46" text-anchor="middle" class="svg-ink" font-size="14">VLAN 20 GUEST</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.0/24</text>
<rect x="330" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="14">VLAN 30 PRINTERS</text><text x="400" y="68" text-anchor="middle" class="svg-muted" font-size="12">192.168.30.0/24</text>
<rect x="485" y="20" width="140" height="70" rx="8" fill="#fed7aa"/><text x="555" y="46" text-anchor="middle" class="svg-ink" font-size="14">VLAN 150 VOICE</text><text x="555" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.1.150.0/24</text>
<rect x="100" y="120" width="200" height="60" rx="8" fill="#e2e8f0"/><text x="200" y="146" text-anchor="middle" class="svg-ink" font-size="14">VLAN 99 MGMT</text><text x="200" y="166" text-anchor="middle" class="svg-muted" font-size="12">sirf switch management</text>
<rect x="340" y="120" width="200" height="60" rx="8" fill="#e2e8f0"/><text x="440" y="146" text-anchor="middle" class="svg-ink" font-size="14">VLAN 999 PARKING</text><text x="440" y="166" text-anchor="middle" class="svg-muted" font-size="12">unused ports, shut down</text>
</svg><p class="cap">Simple, padhne layak plan: ek purpose, ek VLAN, ek subnet; jahan ho sake VLAN ID third octet ko repeat karta hai.</p></div>

<h3>VLANs ko achhe se design karna</h3>
<ul>
<li><b>Role ke hisaab se group karo, location se nahi.</b> Staff, guests, voice, printers, cameras, building systems aur management sabko apna VLAN milta hai, chahe woh ek hi switch share karein.</li>
<li><b>Ek VLAN, ek subnet.</b> Ek VLAN mein do subnets daaloge to hosts ek doosre ke liye ARP karenge aur confusing tareeke se fail honge. Ek subnet ko do VLANs mein failaoge to ajeeb tricks ke bina koi half doosre tak nahi pahunchega.</li>
<li><b>Numbers readable rakho.</b> VLAN 10 = 192.168.10.0/24 aur VLAN 20 = 192.168.20.0/24 ka matlab hai engineer VLAN ID se subnet guess kar sakta hai.</li>
<li><b>VLAN 1 khaali rakho.</b> Users ko default VLAN se hatao, unused ports ko "parking" VLAN mein daal kar shut down karo, aur switch access ke liye dedicated management VLAN use karo.</li>
<li><b>Subnet ko VLAN ke size ka rakho.</b> /24 se 254 hosts milte hain; 500 phones wale VLAN ko /23 ya do VLANs chahiye. Bahut bade VLANs ka matlab zyada broadcast traffic aur bada failure domain.</li>
<li><b>Document karo.</b> VLAN table (ID, name, subnet, gateway, DHCP scope, purpose) network documentation ka hissa hai jo aapko monitoring module mein phir milegi.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek clinic mein 40 staff PCs, 40 IP phones, 6 printers, 12 cameras aur public Wi-Fi hai. Saaf plan: VLAN 10 STAFF 192.168.10.0/24, VLAN 150 VOICE 10.1.150.0/24, VLAN 30 PRINTERS 192.168.30.0/24, VLAN 40 CCTV 192.168.40.0/24, VLAN 20 GUEST 192.168.20.0/24, VLAN 99 MGMT 192.168.99.0/24 aur VLAN 999 PARKING bina subnet ke. Phir router ya firewall staff ko printers tak, cameras ko sirf recorder tak, aur guests ko sirf internet tak jaane deta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Port ko aise VLAN mein assign karna jo exist hi nahi karta: kai switches par port inactive ho jaata hai aur koi traffic pass nahi karta. (2) Aisa VLAN delete karna jismein abhi bhi ports hain: woh ports chup-chaap inactive ho jaate hain. (3) Yeh maan lena ki <code>write erase</code> factory-clean switch deta hai; purane VLANs abhi bhi <code>vlan.dat</code> mein hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> VLAN 1 har port ka default VLAN hai aur delete nahi ho sakta. VLAN ID 12 bits ka hai, isliye maximum usable ID 4094 hai. VLAN broadcast domain hai; subnet layer 3 range hai; best practice dono ko one to one map karti hai. Objective ke words "VLAN database" ka matlab hai switch ke defined VLANs ki list.</p></div>

<div class="scn"><h4>Monday ko gayab hue printers</h4><p>Weekend par ek junior admin ne VLAN list saaf ki aur "purana" VLAN 30 hata diya, yeh sochkar ki woh unused hai. Monday ko har printer offline tha. <code>show vlan brief</code> mein VLAN 30 list nahi ho raha tha, aur <code>show interfaces status</code> mein printer ports <code>inactive</code> dikh rahe the. Ports abhi bhi <code>switchport access vlan 30</code> ke saath configured the, lekin jis VLAN ki taraf woh point kar rahe the woh ab exist nahi karta tha. <code>vlan 30</code> ko <code>name PRINTERS</code> ke saath dobara banate hi seconds mein har printer wapas aa gaya.</p><p><b>Seekh:</b> port ka VLAN assignment aur VLAN ka exist karna do alag cheezein hain. VLAN delete karne se pehle check karo ki kaunse ports aur trunks abhi bhi use use kar rahe hain.</p></div>

<div class="iv"><p class="q">"Naye office ke liye aap VLANs kaise design karoge?"</p><p>Strong answer: roles aur traffic policy se shuru karo, floors se nahi. Har role ko apna VLAN aur subnet do (staff, voice, guests, printers, cameras, management), VLAN 1 unused rakho, unused ports ko shut-down VLAN mein park karo, subnet se match karti readable numbering use karo, growth ke liye subnets size karo, aur ID, name, subnet, gateway aur DHCP scope document karo. Phir batao ki inter-VLAN traffic kahan route aur filter hota hai, kyunki bina policy point ka VLAN plan sirf aadha design hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN layer 2 broadcast domain hai jise 12-bit ID se pehchana jaata hai (1 se 4094 usable).</li>
<li>VLAN 1 default hai aur delete nahi ho sakta; Cisco-style switches par 1002 se 1005 reserved hain.</li>
<li>VLAN database (Cisco-style switches par vlan.dat) batata hai kaunse VLANs exist karte hain; missing VLAN wala port inactive ho jaata hai.</li>
<li>Role ke hisaab se design karo: har purpose ka ek VLAN, har VLAN ka ek subnet, readable numbering, VLAN 1 unused.</li>
<li><code>show vlan brief</code> se verify karo; trunks uski port list mein nahi dikhte.</li>
</ul></div>
`}};export{e as default};