var e={id:`layer2-loops`,h:{en:`Why redundancy creates Layer 2 loops`,hi:`Redundancy Layer 2 loops kyun banati hai`},body:{en:`
<p>Think of a rumour in a group of three friends who each tell every other friend everything they hear. Asha tells Bala and Chitra. Bala tells Chitra, Chitra tells Bala, and both tell Asha again. Nobody remembers that they already heard it, so the same rumour keeps travelling round the group, faster and faster, until nobody can talk about anything else. A switched loop is that rumour, running at a million frames per second.</p>

<h3>Three rules of switching that make loops fatal</h3>
<p>Recall how a switch forwards frames (you met these rules in the VLAN module):</p>
<ol>
<li><b>Flood broadcasts</b> (destination ffff.ffff.ffff), multicasts it does not track, and <b>unknown unicasts</b> out of every port in the VLAN except the one the frame arrived on.</li>
<li><b>Learn</b> the source MAC of every frame against the port it arrived on, overwriting any older entry.</li>
<li><b>Never change</b> the frame. There is no hop count, no TTL, no "seen before" mark in an Ethernet header.</li>
</ol>
<p>Each rule is sensible on a tree. Put the three together on a loop and you get three distinct failures: broadcast storms, MAC table instability and duplicate frames.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="A broadcast circulating a triangle in both directions">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="60" y="180" width="140" height="44" rx="8" fill="#bae6fd"/><text x="130" y="207" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<rect x="440" y="180" width="140" height="44" rx="8" fill="#bae6fd"/><text x="510" y="207" text-anchor="middle" class="svg-ink" font-size="14">SW3</text>
<line x1="280" y1="64" x2="150" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="360" y1="64" x2="490" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="200" y1="202" x2="440" y2="202" stroke="#64748b" stroke-width="3"/>
<text x="175" y="115" class="svg-accent" font-size="13">copy A</text>
<text x="420" y="115" class="svg-accent" font-size="13">copy B</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="13">A and B cross here</text>
<rect x="470" y="232" width="80" height="24" rx="6" fill="#fde68a"/><text x="510" y="249" text-anchor="middle" class="svg-ink" font-size="12">PC1 ARP</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">no TTL: both copies loop forever</text>
</svg><p class="cap">PC1 sends one ARP broadcast. SW3 floods it to SW1 and SW2; each forwards it to the other; the two copies keep circling in opposite directions.</p></div>

<h3>1. Broadcast storm</h3>
<p>PC1 on SW3 sends a single ARP request. SW3 floods it to SW1 (copy A) and SW2 (copy B). SW1 floods copy A out of every port except the one it came in on, so it goes to SW2 and to SW1's own access ports. SW2 does the same with copy B toward SW1. Now SW2 has received copy A from SW1 and floods it to SW3; SW1 has received copy B and floods it to SW3. SW3 floods both back up. Two copies circle the triangle for ever, and every lap delivers another copy to every host in the VLAN.</p>
<p>In a triangle the number of looping copies stays at two per original broadcast. But real networks have <b>several</b> overlapping loops (a square with a diagonal, two access switches each dual-homed), and there each switch with three or more loop ports turns one copy into two or more on every pass. The copies multiply. Meanwhile hosts keep sending new ARPs, DHCP Discovers and other broadcasts, each of which starts its own endless journey. Within seconds every link in the VLAN is full.</p>

<div class="eg"><p><b>Worked example: how fast is "full"?</b> A 1 Gbps link carries at most about 1,488,000 minimum-size (64-byte) frames per second. An ARP frame is 64 bytes on the wire plus preamble and gap. If each lap of the triangle takes roughly 10 microseconds through three switches, one looping copy completes about 100,000 laps per second. Two copies from one ARP already consume more than 13% of each link. Add fifty hosts sending ARPs and DHCP traffic, plus multiplication in a second loop, and the links hit 100% in well under a second. Switch CPUs, which must inspect every broadcast in case it is for the switch itself (ARP for its management IP), climb to 99%.</p></div>

<h3>2. MAC address table instability (MAC flapping)</h3>
<p>Copy A reaches SW1 from SW3 on one port; a moment later copy B, carrying the <b>same source MAC</b> (PC1), reaches SW1 from SW2 on another port. SW1 obediently rewrites its table each time: PC1 is on Gi0/2, no, on Gi0/1, no, on Gi0/2. Unicast frames for PC1 are now sent whichever way the table pointed a microsecond ago, often into the loop instead of toward PC1. Catalyst switches log this:</p>
<pre class="out"><span class="hl">%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.6801 in vlan 10 is flapping between port Gi0/1 and port Gi0/2</span>
%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.6802 in vlan 20 is flapping between port Gi0/2 and port Gi0/1</pre>
<p>A MAC flap message between two <b>uplinks</b> almost always means a loop somewhere below or beside this switch.</p>

<h3>3. Duplicate frames</h3>
<p>Even a normal unicast can be duplicated. If SW3 does not yet know where the server's MAC is, it floods PC1's frame up both uplinks. Both copies reach the server by different paths, so the server receives the same frame twice. TCP copes, although it wastes effort; some older or UDP-based applications do not, and users see strange errors long before anyone notices a loop.</p>

<h3>How to recognise a loop on a live network</h3>
<ul>
<li>All port LEDs blinking in unison, very fast.</li>
<li>Switch CPU near 100% and slow or unresponsive console or SSH (<code>show processes cpu sorted</code>).</li>
<li>MACFLAP log messages naming uplink ports.</li>
<li>Huge broadcast and multicast input rates on inter-switch links (<code>show interfaces | include rate|broadcast</code>).</li>
<li>Users in one VLAN losing everything while other VLANs on the same switches may still work, because each VLAN floods only inside itself.</li>
</ul>
<p>The fast fix during an outage is to <b>shut one link</b> in the loop. The real fix is to find why STP did not block it: STP disabled on a VLAN, a BPDU filter, an unmanaged switch, or a one-way link. Chapter 11 turns that into a workflow.</p>

<div class="warn"><p><b>Common mistake.</b> Looking only for cables between switches. Loops are also created by a hypervisor or server bridging two NICs, an IP phone's PC port patched back into the wall, a wireless bridge, or a cheap desktop switch with two cables to the floor switch.</p></div>

<div class="exam"><p><b>Exam trap.</b> The three named consequences of a Layer 2 loop are <b>broadcast storms</b>, <b>MAC address table instability</b> and <b>multiple (duplicate) frame transmission</b>. "Routing loop" and "TTL expiry" are Layer 3 answers and are wrong for a switched loop.</p></div>

<div class="scn"><h4>The phone that closed a loop</h4><p>At a call centre, VLAN 20 went down every afternoon at the same time. The access switch logged MACFLAP messages between Gi1/0/12 and Gi1/0/13. A floor walk found an agent who had plugged the PC port of her IP phone into the second wall socket so her laptop dock "would also work". The phone's built-in three-port switch bridged the two wall ports. Spanning tree was running on the floor switch, but both ports had BPDU Filter enabled from an old template, so the loop was never blocked. The fix: remove the filter, enable BPDU Guard, and re-patch the phone.</p><p><b>Lesson:</b> the loop is often inside a device you do not think of as a switch, and filtering BPDUs turns STP's eyes off.</p></div>

<div class="iv"><p class="q">"What happens when there is a Layer 2 loop and STP is not running?"</p><p>Strong answer: name all three effects. Broadcast and unknown-unicast frames are flooded around the loop forever because Ethernet has no TTL, so they multiply into a broadcast storm that saturates links and switch CPUs. The same source MAC arrives on different ports, so the MAC table flaps and unicast is sent the wrong way. Hosts receive duplicate frames. Add how you would spot it in production: MACFLAP logs, 100% CPU, LEDs in unison, and the emergency fix of shutting one link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flooding, source-MAC learning and no TTL together make a Layer 2 loop self-sustaining.</li>
<li>Broadcast storm: copies circle forever and multiply where loops overlap, saturating links and CPUs.</li>
<li>MAC flapping: the same source MAC is learned on different ports; logged as %SW_MATM-4-MACFLAP_NOTIF.</li>
<li>Duplicate frames: flooded unicasts reach the destination over several paths.</li>
<li>Emergency action is to shut one link; the lasting fix is to find why STP did not block it.</li>
</ul></div>
`,hi:`
<p>Teen doston ke group mein ek afwaah socho, jahan har dost jo bhi sunta hai woh baaki sabko batata hai. Asha, Bala aur Chitra ko batati hai. Bala Chitra ko batata hai, Chitra Bala ko batati hai, aur dono phir se Asha ko batate hain. Kisi ko yaad nahi ki unhone yeh pehle sun liya hai, isliye wahi afwaah group mein ghoomti rehti hai, aur tez, aur tez, jab tak koi aur baat karna hi possible na rahe. Switched loop wahi afwaah hai, jo ek million frames per second par chal rahi hai.</p>

<h3>Switching ke teen rules jo loops ko jaanleva banate hain</h3>
<p>Yaad karo switch frames kaise forward karta hai (yeh rules aap VLAN module mein dekh chuke ho):</p>
<ol>
<li><b>Broadcasts</b> (destination ffff.ffff.ffff), jo multicasts track nahi hote, aur <b>unknown unicasts</b> ko VLAN ke har port par <b>flood</b> karo, us port ko chhod kar jahan se frame aaya.</li>
<li>Har frame ka source MAC us port ke against <b>learn</b> karo jahan se woh aaya, purani entry ko overwrite karke.</li>
<li>Frame ko <b>kabhi mat badlo</b>. Ethernet header mein na hop count hai, na TTL, na "pehle dekha hai" wala mark.</li>
</ol>
<p>Tree par har rule sahi hai. Teeno ko ek loop par saath rakho to teen alag failures milte hain: broadcast storms, MAC table instability aur duplicate frames.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Triangle mein dono directions mein ghoomta broadcast">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="60" y="180" width="140" height="44" rx="8" fill="#bae6fd"/><text x="130" y="207" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<rect x="440" y="180" width="140" height="44" rx="8" fill="#bae6fd"/><text x="510" y="207" text-anchor="middle" class="svg-ink" font-size="14">SW3</text>
<line x1="280" y1="64" x2="150" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="360" y1="64" x2="490" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="200" y1="202" x2="440" y2="202" stroke="#64748b" stroke-width="3"/>
<text x="175" y="115" class="svg-accent" font-size="13">copy A</text>
<text x="420" y="115" class="svg-accent" font-size="13">copy B</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="13">A aur B yahan cross</text>
<rect x="470" y="232" width="80" height="24" rx="6" fill="#fde68a"/><text x="510" y="249" text-anchor="middle" class="svg-ink" font-size="12">PC1 ARP</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">TTL nahi: dono copies hamesha loop</text>
</svg><p class="cap">PC1 ek ARP broadcast bhejta hai. SW3 use SW1 aur SW2 ko flood karta hai; har ek use doosre ko forward karta hai; dono copies ulti directions mein ghoomti rehti hain.</p></div>

<h3>1. Broadcast storm</h3>
<p>SW3 par PC1 ek ARP request bhejta hai. SW3 use SW1 (copy A) aur SW2 (copy B) ko flood karta hai. SW1 copy A ko us port ko chhod kar har port par flood karta hai jahan se aayi, to woh SW2 aur SW1 ke apne access ports tak jaati hai. SW2 copy B ke saath SW1 ki taraf yahi karta hai. Ab SW2 ko SW1 se copy A mili aur woh use SW3 ko flood karta hai; SW1 ko copy B mili aur woh use SW3 ko flood karta hai. SW3 dono ko wapas upar flood karta hai. Do copies triangle ke hamesha chakkar lagati hain, aur har chakkar VLAN ke har host tak ek aur copy pahunchata hai.</p>
<p>Triangle mein looping copies ki ginti har original broadcast ke liye do par rukti hai. Lekin real networks mein <b>kai</b> overlapping loops hote hain (diagonal wala square, do access switches jo dono dual-homed hain), aur wahan teen ya zyada loop ports wala har switch har pass par ek copy ko do ya zyada bana deta hai. Copies multiply hoti hain. Is beech hosts naye ARPs, DHCP Discovers aur doosre broadcasts bhejte rehte hain, aur har ek apni endless journey shuru karta hai. Kuch second mein VLAN ka har link full ho jaata hai.</p>

<div class="eg"><p><b>Worked example: "full" kitna tez?</b> 1 Gbps link zyada se zyada lagbhag 1,488,000 minimum-size (64-byte) frames per second le jaata hai. ARP frame wire par 64 bytes plus preamble aur gap hai. Agar triangle ka ek chakkar teen switches se hote hue lagbhag 10 microseconds leta hai, to ek looping copy har second lagbhag 100,000 chakkar poore karti hai. Ek ARP ki do copies pehle hi har link ka 13% se zyada kha jaati hain. Pachaas hosts ke ARPs aur DHCP traffic jodo, plus doosre loop mein multiplication, aur links ek second se bhi kam mein 100% par pahunch jaate hain. Switch CPUs, jinhe har broadcast inspect karna padta hai ki kahin woh switch ke liye to nahi (uske management IP ke liye ARP), 99% tak chadh jaate hain.</p></div>

<h3>2. MAC address table instability (MAC flapping)</h3>
<p>Copy A SW3 se SW1 tak ek port par pahunchti hai; ek pal baad copy B, jismein <b>same source MAC</b> (PC1) hai, SW2 se SW1 tak doosre port par pahunchti hai. SW1 har baar chupchaap apni table rewrite karta hai: PC1 Gi0/2 par hai, nahi, Gi0/1 par, nahi, Gi0/2 par. PC1 ke liye unicast frames ab us taraf bheje jaate hain jidhar table ek microsecond pehle point kar rahi thi, aksar PC1 ki taraf nahi balki loop mein. Catalyst switches ise log karte hain:</p>
<pre class="out"><span class="hl">%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.6801 in vlan 10 is flapping between port Gi0/1 and port Gi0/2</span>
%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.6802 in vlan 20 is flapping between port Gi0/2 and port Gi0/1</pre>
<p>Do <b>uplinks</b> ke beech MAC flap message ka matlab lagbhag hamesha yeh hai ki is switch ke neeche ya bagal mein kahin loop hai.</p>

<h3>3. Duplicate frames</h3>
<p>Normal unicast bhi duplicate ho sakta hai. Agar SW3 ko abhi server ka MAC pata nahi, to woh PC1 ka frame dono uplinks par flood karta hai. Dono copies alag paths se server tak pahunchti hain, isliye server ko same frame do baar milta hai. TCP sambhal leta hai, bhale mehnat waste ho; kuch purani ya UDP-based applications nahi sambhaal paati, aur users ko ajeeb errors dikhne lagte hain, loop pakde jaane se bahut pehle.</p>

<h3>Live network par loop kaise pehchane</h3>
<ul>
<li>Saari port LEDs ek saath, bahut tez blink kar rahi hain.</li>
<li>Switch CPU 100% ke paas aur console ya SSH slow ya unresponsive (<code>show processes cpu sorted</code>).</li>
<li>MACFLAP log messages jo uplink ports ka naam lete hain.</li>
<li>Inter-switch links par bahut bade broadcast aur multicast input rates (<code>show interfaces | include rate|broadcast</code>).</li>
<li>Ek VLAN ke users ka sab kuch chala jaata hai jabki same switches par doosre VLANs shayad chal rahe hon, kyunki har VLAN sirf apne andar flood karta hai.</li>
</ul>
<p>Outage ke dauraan fast fix hai loop ka <b>ek link shut karna</b>. Asli fix yeh dhoondhna hai ki STP ne use block kyun nahi kiya: kisi VLAN par STP disabled, BPDU filter, unmanaged switch, ya one-way link. Chapter 11 ise ek workflow bana deta hai.</p>

<div class="warn"><p><b>Common galti.</b> Sirf switches ke beech cables dhoondhna. Loops tab bhi bante hain jab hypervisor ya server do NICs ko bridge kare, IP phone ka PC port wapas wall mein patch ho, wireless bridge ho, ya saste desktop switch se floor switch tak do cables hon.</p></div>

<div class="exam"><p><b>Exam trap.</b> Layer 2 loop ke teen named consequences hain <b>broadcast storms</b>, <b>MAC address table instability</b> aur <b>multiple (duplicate) frame transmission</b>. "Routing loop" aur "TTL expiry" Layer 3 answers hain aur switched loop ke liye galat hain.</p></div>

<div class="scn"><h4>Phone jisne loop band kiya</h4><p>Ek call centre mein VLAN 20 har dopahar same time par down ho jaata tha. Access switch Gi1/0/12 aur Gi1/0/13 ke beech MACFLAP messages log karta tha. Floor walk mein ek agent mili jisne apne IP phone ka PC port doosre wall socket mein laga diya tha taaki uska laptop dock "bhi chal jaaye". Phone ke andar ke three-port switch ne dono wall ports ko bridge kar diya. Floor switch par spanning tree chal raha tha, lekin purane template ki wajah se dono ports par BPDU Filter enabled tha, isliye loop kabhi block nahi hua. Fix: filter hatao, BPDU Guard enable karo, aur phone ko sahi patch karo.</p><p><b>Seekh:</b> loop aksar aise device ke andar hota hai jise aap switch nahi maante, aur BPDUs filter karna STP ki aankhein band kar deta hai.</p></div>

<div class="iv"><p class="q">"Jab Layer 2 loop ho aur STP na chal raha ho to kya hota hai?"</p><p>Strong answer: teeno effects ka naam lo. Broadcast aur unknown-unicast frames loop mein hamesha flood hote rehte hain kyunki Ethernet mein TTL nahi, isliye woh multiply hokar broadcast storm banate hain jo links aur switch CPUs ko saturate kar deta hai. Same source MAC alag ports par aata hai, isliye MAC table flap karti hai aur unicast galat taraf jaata hai. Hosts ko duplicate frames milte hain. Jodo ki production mein ise kaise pakdoge: MACFLAP logs, 100% CPU, ek saath blink karti LEDs, aur emergency fix ek link shut karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flooding, source-MAC learning aur TTL ka na hona milkar Layer 2 loop ko self-sustaining banate hain.</li>
<li>Broadcast storm: copies hamesha ghoomti hain aur jahan loops overlap karte hain wahan multiply hoti hain, links aur CPUs saturate karti hain.</li>
<li>MAC flapping: same source MAC alag ports par learn hota hai; %SW_MATM-4-MACFLAP_NOTIF ke roop mein log hota hai.</li>
<li>Duplicate frames: flooded unicasts kai paths se destination tak pahunchte hain.</li>
<li>Emergency action ek link shut karna hai; lasting fix yeh dhoondhna hai ki STP ne use block kyun nahi kiya.</li>
</ul></div>
`}};export{e as default};