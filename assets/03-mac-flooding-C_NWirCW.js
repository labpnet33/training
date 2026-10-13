var e={id:`mac-flooding`,h:{en:`MAC flooding and MAC spoofing: what the defender sees`,hi:`MAC flooding aur MAC spoofing: defender ko kya dikhta hai`},body:{en:`
<p>Imagine a post-office clerk who sorts letters into pigeonholes, one per house. He learns each house's pigeonhole from the return address on letters that house sends. His rack has a fixed number of pigeonholes. One day someone posts thousands of letters, each with a different fake return address, and the rack fills up. Now, for any house he no longer has a pigeonhole for, the clerk photocopies the letter and delivers a copy to <b>every</b> house on the street, including the prankster's. That is <b>MAC flooding</b>, and the photocopies are the prize.</p>

<h3>How the CAM table works</h3>
<p>A switch keeps a <b>MAC address table</b>, also called the <b>CAM table</b> (Content Addressable Memory, the fast hardware that stores it). For every frame it receives, the switch records the <b>source MAC, VLAN and ingress port</b>. When a frame arrives for a destination MAC, the switch looks it up: a hit means the frame goes out of one port; a miss means <b>unknown unicast</b>, and the switch floods the frame out of every port in that VLAN except the one it came in on. Dynamic entries age out after <b>300 seconds</b> of silence by default. The table is finite: a few thousand entries on small access switches, more on bigger platforms.</p>

<h3>The attack at recognition level</h3>
<p>An attacker on one access port sends a very high rate of frames, each with a different random source MAC. The switch dutifully learns every one of them. Within seconds the table is full. From then on:</p>
<ul>
<li>New legitimate MACs cannot be learned, and existing ones that age out cannot be re-learned.</li>
<li>Traffic toward those hosts becomes unknown unicast and is <b>flooded</b> to every port in the VLAN, so the attacker's port receives copies of other users' traffic. The switch "fails open" and behaves like an old hub.</li>
<li>If the VLAN spans several switches, the flooding travels over trunks and fills their tables too.</li>
</ul>
<p>The goal is eavesdropping, not destruction, although the flood of junk frames also wastes bandwidth and CPU. The effect stays inside the attacker's VLAN.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="MAC flooding fills the CAM table">
<rect x="230" y="20" width="180" height="70" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">ACC1 CAM table</text><text x="320" y="64" text-anchor="middle" class="svg-accent" font-size="13">7998 / 8000 used</text><text x="320" y="81" text-anchor="middle" class="svg-muted" font-size="12">7996 learned on Gi0/2</text>
<rect x="40" y="170" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="115" y="192" text-anchor="middle" class="svg-ink" font-size="13">PC1 Gi0/1</text><text x="115" y="209" text-anchor="middle" class="svg-muted" font-size="12">entry aged out</text>
<rect x="450" y="170" width="150" height="50" rx="8" fill="#fed7aa"/><text x="525" y="192" text-anchor="middle" class="svg-ink" font-size="13">ATK Gi0/2</text><text x="525" y="209" text-anchor="middle" class="svg-muted" font-size="12">random source MACs</text>
<line x1="500" y1="170" x2="380" y2="90" stroke="#64748b" stroke-width="3"/><text x="470" y="125" class="svg-muted" font-size="12">thousands/s</text>
<line x1="260" y1="90" x2="140" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="90" x2="480" y2="170" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="330" y="150" text-anchor="middle" class="svg-accent" font-size="12">frames to PC1 flooded: ATK gets a copy</text>
</svg><p class="cap">Once the table is full, traffic for hosts without an entry is flooded, and the attacker's port receives it.</p></div>

<h3>MAC spoofing: the quieter cousin</h3>
<p>Instead of thousands of MACs, the attacker uses <b>one</b>: the MAC of a victim (for example the gateway or a printer). The switch moves the entry to the attacker's port, and frames for the victim now go to the attacker until the victim sends again and the entry moves back. This flip-flop is called a <b>MAC flap</b>, and Catalyst switches log it:</p>
<pre class="out">%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7900.0a11 in vlan 10 is flapping between port Gi0/1 and port Gi0/2</pre>
<p>MAC spoofing is also used to impersonate devices that are authorised by MAC address only, which is one reason MAC-based trust is weak.</p>

<h3>What the defender sees</h3>
<pre class="out">ACC1# show mac address-table count

Mac Entries for Vlan 10:
---------------------------
<span class="hl">Dynamic Address Count  : 7998</span>
Static  Address Count  : 0
Total Mac Addresses    : 7998

<span class="hl">Total Mac Address Space Available: 2</span>

ACC1# show mac address-table interface Gi0/2 | count
<span class="hl">Number of lines which match regexp = 7996</span></pre>
<p>Three indicators together tell the story: the table is almost full, one single access port owns thousands of entries, and users report slowness or see traffic that is not theirs in a packet capture. A normal PC port owns one MAC; a PC with a phone owns two or three.</p>

<div class="eg"><p><b>Worked example.</b> ACC1 holds 8000 entries. A flood tool sends 50,000 frames per second with random MACs, so the free space is gone in well under a second. PC1's entry ages out 300 seconds after PC1 last spoke; from that moment every frame the gateway sends to PC1 is flooded to all ports in VLAN 10. With port security set to a maximum of 2 on Gi0/2, the third new MAC triggers a violation and the attack stops at 2 entries, not 7996.</p></div>

<h3>The defences (preview)</h3>
<p><b>Port security</b> limits how many MACs a port may learn and reacts when the limit is exceeded: chapter 4 covers it in depth and it is the control in Lab 1. <b>802.1X</b> identity-based access, covered in the ISE module later in this course, makes sure only authenticated devices use the port at all. Some platforms also let you cap MACs per VLAN, but per-port limits are the standard answer.</p>

<div class="warn"><p><b>Common mistake.</b> Running <code>clear mac address-table dynamic</code> and declaring victory. The attacker's tool refills the table within a second. Find the port that owns thousands of entries and apply a port control there.</p></div>

<div class="exam"><p><b>Exam trap.</b> MAC flooding makes the switch flood unknown unicast <b>within the VLAN</b>; it does not give access to other VLANs. The mitigation the exam expects is <b>port security</b> (maximum MAC addresses), not DAI or DHCP snooping.</p></div>

<div class="scn"><h4>The printer that moved every ten seconds</h4><p>A hospital NOC saw hundreds of MACFLAP messages per hour for one MAC address, flapping between the port of a label printer and a port in a waiting-room kiosk area. Printing kept failing. Someone had connected a small device to the kiosk port and cloned the printer's MAC to get onto a network that allowed devices by MAC address only. The engineer shut the kiosk port, pinned the printer's MAC with port security (maximum 1, static MAC) and opened a project to move to 802.1X with MAB profiling.</p><p><b>Lesson:</b> MAC flap logs for one address across two access ports are a strong spoofing indicator, and MAC addresses alone are not an identity.</p></div>

<div class="iv"><p class="q">"What happens when a switch's CAM table is full, and how do you prevent it?"</p><p>Strong answer: the switch cannot learn new MACs, so frames to hosts without an entry become unknown unicast and are flooded to every port in the VLAN. An attacker uses this to sniff traffic. I detect it with <code>show mac address-table count</code> and by finding the port with thousands of entries, and I prevent it with port security limiting the MACs per port, ideally backed by 802.1X. Mention that the impact is limited to the VLAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The CAM table learns source MAC, VLAN and port; unknown destinations are flooded in the VLAN; default aging is 300 seconds.</li>
<li>MAC flooding fills the table so traffic is flooded and the attacker can eavesdrop; the switch fails open like a hub.</li>
<li>MAC spoofing steals one address and shows up as MACFLAP syslog messages.</li>
<li>Indicators: near-full table, one access port owning thousands of MACs, users seeing others' traffic.</li>
<li>Mitigation: port security (chapter 4), with 802.1X for identity.</li>
</ul></div>
`,hi:`
<p>Ek post-office clerk socho jo letters ko pigeonholes mein sort karta hai, har ghar ka ek. Woh har ghar ka pigeonhole us ghar ke bheje letters par likhe return address se seekhta hai. Uske rack mein pigeonholes ki fixed ginti hai. Ek din koi hazaaron letters post karta hai, har ek par alag nakli return address, aur rack bhar jaata hai. Ab jis ghar ka pigeonhole uske paas nahi hai, uske letter ki clerk photocopy karta hai aur street ke <b>har</b> ghar ko ek copy deta hai, prankster ke ghar ko bhi. Yahi <b>MAC flooding</b> hai, aur photocopies hi inaam hain.</p>

<h3>CAM table kaise kaam karti hai</h3>
<p>Switch ek <b>MAC address table</b> rakhta hai, jise <b>CAM table</b> bhi kehte hain (Content Addressable Memory, woh tez hardware jisme yeh store hoti hai). Har aane wale frame ke liye switch <b>source MAC, VLAN aur ingress port</b> record karta hai. Jab kisi destination MAC ke liye frame aata hai, switch use dhoondhta hai: hit ka matlab frame ek port se bahar jaata hai; miss ka matlab <b>unknown unicast</b>, aur switch frame ko us VLAN ke har port par flood karta hai, jis port se aaya us chhodkar. Dynamic entries default mein <b>300 seconds</b> ki khamoshi ke baad age out hoti hain. Table limited hai: chhote access switches par kuch hazaar entries, bade platforms par zyada.</p>

<h3>Attack recognition level par</h3>
<p>Ek access port par baitha attacker bahut tez rate se frames bhejta hai, har ek alag random source MAC ke saath. Switch imaandari se har ek seekh leta hai. Kuch hi seconds mein table bhar jaati hai. Uske baad:</p>
<ul>
<li>Naye legitimate MACs seekhe nahi ja sakte, aur jo purane age out ho jaate hain woh dobara seekhe nahi ja sakte.</li>
<li>Un hosts ki taraf jaane wala traffic unknown unicast ban jaata hai aur VLAN ke har port par <b>flood</b> hota hai, isliye attacker ke port ko doosre users ke traffic ki copies milti hain. Switch "fail open" hota hai aur purane hub jaisa behave karta hai.</li>
<li>Agar VLAN kai switches par faila hai, to flooding trunks se aage jaati hai aur unki tables bhi bhar deti hai.</li>
</ul>
<p>Maksad eavesdropping hai, tabaahi nahi, halaanki junk frames ki baadh bandwidth aur CPU bhi barbaad karti hai. Asar attacker ke VLAN ke andar hi rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="MAC flooding CAM table bhar deta hai">
<rect x="230" y="20" width="180" height="70" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">ACC1 CAM table</text><text x="320" y="64" text-anchor="middle" class="svg-accent" font-size="13">7998 / 8000 used</text><text x="320" y="81" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 par 7996 seekhe</text>
<rect x="40" y="170" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="115" y="192" text-anchor="middle" class="svg-ink" font-size="13">PC1 Gi0/1</text><text x="115" y="209" text-anchor="middle" class="svg-muted" font-size="12">entry age out</text>
<rect x="450" y="170" width="150" height="50" rx="8" fill="#fed7aa"/><text x="525" y="192" text-anchor="middle" class="svg-ink" font-size="13">ATK Gi0/2</text><text x="525" y="209" text-anchor="middle" class="svg-muted" font-size="12">random source MACs</text>
<line x1="500" y1="170" x2="380" y2="90" stroke="#64748b" stroke-width="3"/><text x="470" y="125" class="svg-muted" font-size="12">hazaaron/s</text>
<line x1="260" y1="90" x2="140" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="90" x2="480" y2="170" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="330" y="150" text-anchor="middle" class="svg-accent" font-size="12">PC1 ke frames flood: ATK ko copy</text>
</svg><p class="cap">Table bharne ke baad, jin hosts ki entry nahi hai unka traffic flood hota hai, aur attacker ke port ko milta hai.</p></div>

<h3>MAC spoofing: shaant cousin</h3>
<p>Hazaaron MACs ki jagah attacker <b>ek</b> use karta hai: kisi victim ka MAC (jaise gateway ya printer). Switch entry ko attacker ke port par move kar deta hai, aur victim ke frames ab attacker ke paas jaate hain jab tak victim dobara kuch bheje aur entry wapas na aa jaaye. Is ulat-palat ko <b>MAC flap</b> kehte hain, aur Catalyst switches ise log karte hain:</p>
<pre class="out">%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7900.0a11 in vlan 10 is flapping between port Gi0/1 and port Gi0/2</pre>
<p>MAC spoofing un devices ki nakal karne ke liye bhi use hota hai jo sirf MAC address se authorised hain, jo ek wajah hai ki MAC-based trust kamzor hai.</p>

<h3>Defender ko kya dikhta hai</h3>
<pre class="out">ACC1# show mac address-table count

Mac Entries for Vlan 10:
---------------------------
<span class="hl">Dynamic Address Count  : 7998</span>
Static  Address Count  : 0
Total Mac Addresses    : 7998

<span class="hl">Total Mac Address Space Available: 2</span>

ACC1# show mac address-table interface Gi0/2 | count
<span class="hl">Number of lines which match regexp = 7996</span></pre>
<p>Teen indicators milkar kahani batate hain: table lagbhag bhari hai, ek akele access port ke paas hazaaron entries hain, aur users slowness report karte hain ya packet capture mein aisa traffic dekhte hain jo unka nahi hai. Normal PC port ka ek MAC hota hai; phone wale PC ke do ya teen.</p>

<div class="eg"><p><b>Worked example.</b> ACC1 mein 8000 entries aati hain. Flood tool random MACs ke saath 50,000 frames per second bhejta hai, isliye free space ek second se bhi kam mein khatam. PC1 ke aakhri baar bolne ke 300 seconds baad uski entry age out hoti hai; us pal se gateway jo bhi frame PC1 ko bhejta hai woh VLAN 10 ke saare ports par flood hota hai. Gi0/2 par port security maximum 2 ke saath, teesra naya MAC violation trigger karta hai aur attack 7996 par nahi, 2 entries par ruk jaata hai.</p></div>

<h3>Defences (preview)</h3>
<p><b>Port security</b> limit karta hai ki port kitne MACs seekh sakta hai aur limit paar hone par react karta hai: chapter 4 ise gehraai se cover karta hai aur Lab 1 ka control yahi hai. <b>802.1X</b> identity-based access, jo is course mein aage ISE module mein aata hai, pakka karta hai ki sirf authenticated devices hi port use karein. Kuch platforms per VLAN MACs cap karne dete hain, par standard jawab per-port limits hai.</p>

<div class="warn"><p><b>Common galti.</b> <code>clear mac address-table dynamic</code> chalakar jeet declare kar dena. Attacker ka tool ek second mein table phir bhar deta hai. Woh port dhoondho jiske paas hazaaron entries hain aur wahan port control lagao.</p></div>

<div class="exam"><p><b>Exam trap.</b> MAC flooding switch se <b>VLAN ke andar</b> unknown unicast flood karwata hai; yeh doosre VLANs ka access nahi deta. Exam jo mitigation expect karta hai woh <b>port security</b> (maximum MAC addresses) hai, DAI ya DHCP snooping nahi.</p></div>

<div class="scn"><h4>Woh printer jo har das second mein jagah badalta tha</h4><p>Ek hospital NOC ne ek MAC address ke liye har ghante saikdon MACFLAP messages dekhe, jo ek label printer ke port aur waiting-room kiosk area ke ek port ke beech flap ho raha tha. Printing baar baar fail ho rahi thi. Kisi ne kiosk port par ek chhota device lagaya tha aur printer ka MAC clone kiya tha taaki aise network par aa sake jo devices ko sirf MAC address se allow karta tha. Engineer ne kiosk port shut kiya, printer ka MAC port security (maximum 1, static MAC) se pin kiya aur MAB profiling ke saath 802.1X par jaane ka project khola.</p><p><b>Seekh:</b> do access ports ke beech ek address ke MAC flap logs spoofing ka strong indicator hain, aur akela MAC address identity nahi hai.</p></div>

<div class="iv"><p class="q">"Jab switch ki CAM table full ho jaaye to kya hota hai, aur aap ise kaise rokte ho?"</p><p>Strong answer: switch naye MACs nahi seekh sakta, isliye jin hosts ki entry nahi unke frames unknown unicast ban jaate hain aur VLAN ke har port par flood hote hain. Attacker iska use traffic sniff karne ke liye karta hai. Main ise <code>show mac address-table count</code> se aur hazaaron entries wala port dhoondhkar detect karta hoon, aur per port MACs limit karne wale port security se rokta hoon, behtar ho to 802.1X ke saath. Batao ki asar VLAN tak seemit hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CAM table source MAC, VLAN aur port seekhti hai; unknown destinations VLAN mein flood hote hain; default aging 300 seconds hai.</li>
<li>MAC flooding table bhar deta hai taaki traffic flood ho aur attacker eavesdrop kar sake; switch hub ki tarah fail open hota hai.</li>
<li>MAC spoofing ek address churaata hai aur MACFLAP syslog messages ke roop mein dikhta hai.</li>
<li>Indicators: lagbhag bhari table, ek access port ke paas hazaaron MACs, users ko doosron ka traffic dikhna.</li>
<li>Mitigation: port security (chapter 4), identity ke liye 802.1X ke saath.</li>
</ul></div>
`}};export{e as default};