var e={id:`trust-classification`,h:{en:`Trust boundary and classification`,hi:`Trust boundary aur classification`},body:{en:`
<p>A nightclub bouncer checks each guest at the door. A guest who is a known regular with a staff wristband is waved through. A stranger must show ID, and if the wristband looks fake, the bouncer cuts it off and gives a new one. Once inside, staff trust the wristband and never check ID again. That door is the <b>trust boundary</b>, the wristband is the <b>marking</b>, and the check on the way in is <b>classification</b>. Done well at one place, every device behind it can classify cheaply.</p>

<h3>The trust boundary</h3>
<p>The trust boundary is the point in the network where you decide whether to believe the CoS or DSCP value a device sends you, or to ignore it and mark the traffic yourself. Anything beyond the boundary is trusted; anything outside is not.</p>
<div class="dia"><svg viewBox="0 0 660 210" role="img" aria-label="Trust boundary positions">
<rect x="10" y="40" width="110" height="46" rx="6" fill="#fecaca"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">PC</text><text x="65" y="76" text-anchor="middle" class="svg-muted" font-size="11">untrusted</text>
<rect x="10" y="120" width="110" height="46" rx="6" fill="#bbf7d0"/><text x="65" y="140" text-anchor="middle" class="svg-ink" font-size="12">IP phone</text><text x="65" y="156" text-anchor="middle" class="svg-muted" font-size="11">trusted device</text>
<rect x="220" y="70" width="120" height="70" rx="6" fill="#ddd6fe"/><text x="280" y="98" text-anchor="middle" class="svg-ink" font-size="12">Access switch</text><text x="280" y="116" text-anchor="middle" class="svg-accent" font-size="11">trust boundary</text>
<rect x="440" y="70" width="90" height="70" rx="6" fill="#bae6fd"/><text x="485" y="100" text-anchor="middle" class="svg-ink" font-size="12">Router R1</text><text x="485" y="118" text-anchor="middle" class="svg-muted" font-size="11">trusts marks</text>
<rect x="580" y="70" width="70" height="70" rx="6" fill="#e2e8f0"/><text x="615" y="100" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<path d="M120 63 L220 90 M120 143 L220 120 M340 105 H440 M530 105 H580" stroke="#64748b" stroke-width="2" fill="none"/>
<path d="M200 30 V190" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
<text x="200" y="22" text-anchor="middle" class="svg-accent" font-size="11">boundary</text>
<text x="330" y="190" text-anchor="middle" class="svg-muted" font-size="11">Mark here, in the switch or at the first router, and trust it afterwards.</text>
</svg><p class="cap">The boundary is a policy choice. Closer to the user is safer; further in is simpler.</p></div>
<ul>
<li><b>Untrusted</b>: a PC or a guest laptop. Users can set any DSCP they like, and a malicious or careless application could mark everything EF to jump the queue. The switch or router must overwrite the value.</li>
<li><b>Trusted device</b>: a Cisco IP phone detected with CDP. The switch trusts the phone's voice marking but not the PC plugged into the phone's back port.</li>
<li><b>Trusted port</b>: an uplink to another switch or router in your own network, where the neighbour already did its job.</li>
</ul>
<p>On older Catalyst switches the idea is written <code>mls qos</code> globally and <code>mls qos trust dscp</code> (or <code>cos</code>) per port. Once <code>mls qos</code> is on, a port that is <i>not trusted</i> resets DSCP to 0. The simulator models this on SW1.</p>
<pre class="code">SW1# show mls qos
SW1# configure terminal
SW1(config)# mls qos
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# mls qos trust dscp
SW1(config-if)# end
SW1# show mls qos
SW1# show mls qos interface GigabitEthernet0/1</pre>
<pre class="out">QoS is disabled
QoS ip packet dscp rewrite is disabled (an untrusted port resets DSCP to 0 while mls qos is on)

QoS is enabled
QoS ip packet dscp rewrite is enabled (an untrusted port resets DSCP to 0 while mls qos is on)

GigabitEthernet0/1
trust state: trust dscp
trust mode: trust dscp
trust enabled flag: ena
COS override: dis
default COS: 0
DSCP Mutation Map: Default DSCP Mutation Map
Trust device: none
qos mode: port-based</pre>
<p>The first block is the state before configuration, the second is <code>show mls qos</code> after turning it on, and the third is the port. <code>trust dscp</code> tells the port to keep whatever DSCP the sender wrote. Without it, an untrusted port would reset the value to 0. Newer switch families use MQC policies instead of <code>mls qos</code>, but the trust decision is identical.</p>

<h3>Classification: how a device decides what a packet is</h3>
<p>Classification looks at fields that are already in the packet and sorts it into a class. In MQC the class is a <code>class-map</code> and the test is one or more <code>match</code> lines.</p>
<div class="tbl"><table>
<tr><th>Method</th><th>Looks at</th><th>Strength</th><th>Cost</th></tr>
<tr><td><code>match dscp</code> / <code>match precedence</code></td><td>The marking already in the IP header</td><td>Fast, simple, works across hops</td><td>Only as honest as the sender</td></tr>
<tr><td><code>match cos</code></td><td>802.1Q priority bits</td><td>Works on trunks</td><td>Gone after a routed hop</td></tr>
<tr><td><code>match access-group</code></td><td>An ACL: source, destination, protocol, port</td><td>Precise, you control it</td><td>You must maintain the ACL</td></tr>
<tr><td><code>match input-interface</code></td><td>Where the packet entered</td><td>Easy for "all traffic from this LAN"</td><td>Coarse</td></tr>
<tr><td><code>match protocol</code> (NBAR)</td><td>Deep inspection: application signatures</td><td>Finds apps on any port, such as video calls</td><td>CPU load, needs signature updates</td></tr>
</table></div>
<dl class="terms">
<dt>ACL as a classifier</dt><dd>In a class-map an ACL only <b>selects</b>. A <code>permit</code> line means "this packet belongs to the class"; a <code>deny</code> line means "this packet is not in the class". Nothing is blocked. This is the most common beginner confusion.</dd>
<dt>NBAR (concept)</dt><dd>Network-Based Application Recognition inspects packet contents beyond Layer 4 and recognises applications such as web, SIP or a collaboration tool by their signature. It saves you from writing ports into ACLs when applications use dynamic ports. For CCNA you only need the idea: it is classification by application name, it costs CPU, and it is configured with <code>match protocol</code>.</dd>
<dt>match-any / match-all</dt><dd><code>match-any</code> means a packet needs to satisfy <b>one</b> line (logical OR). <code>match-all</code>, the default if you omit the keyword, needs to satisfy <b>every</b> line (logical AND). Matching two different DSCP values in a match-all class can never succeed, because one packet has only one DSCP.</dd>
<dt>class-default</dt><dd>The built-in class that catches everything no other class matched. It is always last.</dd>
</dl>
<pre class="code">R1(config)# class-map match-all WEB
R1(config-cmap)# match protocol http
R1(config-cmap)# match dscp af21
R1(config)# class-map match-any SIG
R1(config-cmap)# match dscp cs3
R1(config)# class-map match-any COS5
R1(config-cmap)# match cos 5
R1(config)# class-map match-any INSIDE
R1(config-cmap)# match input-interface GigabitEthernet0/1
R1# show class-map</pre>
<pre class="out"> Class Map match-all WEB (id 1)
   Match protocol http
   Match dscp af21 (18)

 Class Map match-any SIG (id 2)
   Match dscp cs3 (24)

 Class Map match-any COS5 (id 3)
   Match cos 5

 Class Map match-any INSIDE (id 4)
   Match input-interface GigabitEthernet0/1

 Class Map match-any class-default (id 0)
   Match any </pre>
<p>Notice the simulator expands names to numbers: <code>af21</code> becomes 18 and <code>cs3</code> becomes 24. WEB is a match-all, so a packet must be HTTP <i>and</i> AF21 to join it. The last block, class-default, is not one you typed; it is always there.</p>

<div class="eg"><p><b>Worked example.</b> At the Pune branch the phone is on 10.10.10.0/24 and sends RTP on UDP ports 16384 to 32767. A class-map for voice would use an ACL <code>permit udp 10.10.10.0 0.0.0.255 any range 16384 32767</code>. A PC in the same subnet sending to UDP 5001 is not in that range, so it falls through to class-default. If someone later puts a video client on UDP 20000, it will also match the voice ACL and be marked as voice. This is why ACL-based classification should be tied to the phone's own subnet or voice VLAN, and why many sites combine an ACL with <code>match-all</code> and a DSCP check.</p></div>

<h3>Where to classify</h3>
<p>Classify and mark on <b>input</b> at the edge, once, with the expensive ACL or NBAR check. Then every later device uses a cheap <code>match dscp</code>. This is also why the QoS policy that does queuing on the WAN uses DSCP classes (EF-Q, AF11-Q) rather than repeating the ACLs.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading a <code>deny</code> in a class-map ACL as "drop this traffic". Using match-all with two values of the same field. Trusting DSCP from untrusted ports, which lets any user claim priority. Classifying on <code>cos</code> and expecting it to survive a routed hop: CoS lives only in the 802.1Q tag and is lost when the router builds a new frame.</p></div>

<div class="exam"><p><b>Exam traps.</b> The trust boundary is where markings are accepted or rewritten, and it should be as close to the source as practical. Classification is by ACL, NBAR, DSCP/CoS/precedence or interface. match-all is AND and match-any is OR; the default is match-all. NBAR is application recognition by deep inspection. A permit in the class-map ACL means "in the class".</p></div>

<div class="scn"><h4>The gamer who got voice priority</h4><p>At a coworking space the voice priority queue was always full in the evening. The switches trusted DSCP on every access port. One tenant's streaming application marked its UDP video as EF, so it entered the priority queue beside the phones and used 6 Mbps of a 10 Mbps WAN. The fix was to move the trust boundary: untrusted user ports now reset DSCP to 0, and the router classifies phones by their voice VLAN subnet and marks EF itself.</p><p><b>Lesson:</b> trust only devices you control. Everything else is re-marked at the boundary.</p></div>

<div class="iv"><p class="q">"What is a trust boundary and where would you put it?"</p><p>Define it as the point where you accept or overwrite QoS markings. Place it at the access layer: trust the IP phone (detected by CDP), do not trust the PC behind it, and trust the uplink ports inside your network. Explain the risk of trusting everything: users or malware can mark all traffic EF and starve real voice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The trust boundary is where you accept or rewrite CoS/DSCP. Put it at the edge, close to the user.</li>
<li>Untrusted ports reset the marking; trusted devices and uplinks keep it.</li>
<li>Classify with ACL, NBAR, DSCP, CoS, precedence or input interface using <code>class-map</code> and <code>match</code>.</li>
<li>An ACL in a class-map only selects traffic; permit means "in the class", nothing is blocked.</li>
<li>match-all is AND (the default), match-any is OR; class-default catches the rest.</li>
</ul></div>
`,hi:`
<p>Nightclub ka bouncer darwaze par har guest ko check karta hai. Jo guest known regular hai aur staff wristband pehne hai use jaane diya jaata hai. Ajnabi ko ID dikhani padti hai, aur agar wristband nakli lage to bouncer use kaat deta hai aur naya laga deta hai. Andar jaane ke baad staff wristband par bharosa karta hai aur dobara ID nahi dekhta. Woh darwaza <b>trust boundary</b> hai, wristband <b>marking</b> hai, aur andar aate waqt ki jaanch <b>classification</b> hai. Ek jagah achhe se ho jaye to uske peeche ka har device sasta classify kar sakta hai.</p>

<h3>Trust boundary</h3>
<p>Trust boundary network ka woh point hai jahan aap tay karte ho ki device ki bheji CoS ya DSCP value par bharosa karna hai, ya use ignore karke traffic khud mark karna hai. Boundary ke andar sab trusted, bahar sab untrusted.</p>
<div class="dia"><svg viewBox="0 0 660 210" role="img" aria-label="Trust boundary ki positions">
<rect x="10" y="40" width="110" height="46" rx="6" fill="#fecaca"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">PC</text><text x="65" y="76" text-anchor="middle" class="svg-muted" font-size="11">untrusted</text>
<rect x="10" y="120" width="110" height="46" rx="6" fill="#bbf7d0"/><text x="65" y="140" text-anchor="middle" class="svg-ink" font-size="12">IP phone</text><text x="65" y="156" text-anchor="middle" class="svg-muted" font-size="11">trusted device</text>
<rect x="220" y="70" width="120" height="70" rx="6" fill="#ddd6fe"/><text x="280" y="98" text-anchor="middle" class="svg-ink" font-size="12">Access switch</text><text x="280" y="116" text-anchor="middle" class="svg-accent" font-size="11">trust boundary</text>
<rect x="440" y="70" width="90" height="70" rx="6" fill="#bae6fd"/><text x="485" y="100" text-anchor="middle" class="svg-ink" font-size="12">Router R1</text><text x="485" y="118" text-anchor="middle" class="svg-muted" font-size="11">marks par trust</text>
<rect x="580" y="70" width="70" height="70" rx="6" fill="#e2e8f0"/><text x="615" y="100" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<path d="M120 63 L220 90 M120 143 L220 120 M340 105 H440 M530 105 H580" stroke="#64748b" stroke-width="2" fill="none"/>
<path d="M200 30 V190" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
<text x="200" y="22" text-anchor="middle" class="svg-accent" font-size="11">boundary</text>
<text x="330" y="190" text-anchor="middle" class="svg-muted" font-size="11">Yahin, switch mein ya pehle router par mark karo, phir us par bharosa karo.</text>
</svg><p class="cap">Boundary ek policy choice hai. User ke paas safer; andar simple.</p></div>
<ul>
<li><b>Untrusted</b>: PC ya guest laptop. Users koi bhi DSCP set kar sakte hain, aur ek lapravah ya malicious application sab kuch EF mark karke queue mein aage kud sakti hai. Switch ya router ko value overwrite karni chahiye.</li>
<li><b>Trusted device</b>: CDP se detect hua Cisco IP phone. Switch phone ki voice marking par bharosa karta hai, lekin phone ke peeche ke port mein lage PC par nahi.</li>
<li><b>Trusted port</b>: apne hi network ke dusre switch ya router ka uplink, jahan padosi apna kaam pehle kar chuka hai.</li>
</ul>
<p>Purane Catalyst switches par yeh idea globally <code>mls qos</code> aur har port par <code>mls qos trust dscp</code> (ya <code>cos</code>) se likha jaata hai. <code>mls qos</code> on hone ke baad <i>untrusted</i> port DSCP ko 0 kar deta hai. Simulator SW1 par yeh model karta hai.</p>
<pre class="code">SW1# show mls qos
SW1# configure terminal
SW1(config)# mls qos
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# mls qos trust dscp
SW1(config-if)# end
SW1# show mls qos
SW1# show mls qos interface GigabitEthernet0/1</pre>
<pre class="out">QoS is disabled
QoS ip packet dscp rewrite is disabled (an untrusted port resets DSCP to 0 while mls qos is on)

QoS is enabled
QoS ip packet dscp rewrite is enabled (an untrusted port resets DSCP to 0 while mls qos is on)

GigabitEthernet0/1
trust state: trust dscp
trust mode: trust dscp
trust enabled flag: ena
COS override: dis
default COS: 0
DSCP Mutation Map: Default DSCP Mutation Map
Trust device: none
qos mode: port-based</pre>
<p>Pehla block configuration se pehle ki state hai, doosra <code>show mls qos</code> on karne ke baad, aur teesra port hai. <code>trust dscp</code> port ko kehta hai ki sender ne jo DSCP likha hai use rakho. Iske bina untrusted port value ko 0 kar deta. Naye switch families <code>mls qos</code> ki jagah MQC policies use karte hain, lekin trust ka decision wahi hai.</p>

<h3>Classification: device kaise tay karta hai ki packet kya hai</h3>
<p>Classification packet mein pehle se maujood fields dekhkar use class mein daalti hai. MQC mein class ek <code>class-map</code> hai aur test ek ya zyada <code>match</code> lines hain.</p>
<div class="tbl"><table>
<tr><th>Method</th><th>Kya dekhta hai</th><th>Taakat</th><th>Keemat</th></tr>
<tr><td><code>match dscp</code> / <code>match precedence</code></td><td>IP header mein pehle se likhi marking</td><td>Tez, simple, hops ke paar chalta hai</td><td>Sender jitna imaandaar hai utna hi</td></tr>
<tr><td><code>match cos</code></td><td>802.1Q priority bits</td><td>Trunks par chalta hai</td><td>Routed hop ke baad gayab</td></tr>
<tr><td><code>match access-group</code></td><td>ACL: source, destination, protocol, port</td><td>Precise, aapke control mein</td><td>ACL maintain karni padti hai</td></tr>
<tr><td><code>match input-interface</code></td><td>Packet kahan se aaya</td><td>"Is LAN ka sara traffic" ke liye aasaan</td><td>Mota</td></tr>
<tr><td><code>match protocol</code> (NBAR)</td><td>Deep inspection: application signatures</td><td>Kisi bhi port par apps pehchanta hai, jaise video calls</td><td>CPU load, signature updates chahiye</td></tr>
</table></div>
<dl class="terms">
<dt>ACL as a classifier</dt><dd>Class-map mein ACL sirf <b>chunti</b> hai. <code>permit</code> line ka matlab "yeh packet class ka hissa hai"; <code>deny</code> ka matlab "yeh class mein nahi". Kuch block nahi hota. Yeh sabse aam beginner confusion hai.</dd>
<dt>NBAR (concept)</dt><dd>Network-Based Application Recognition Layer 4 se aage packet contents inspect karke web, SIP ya collaboration tool jaisi applications ko unke signature se pehchanta hai. Jab applications dynamic ports use karti hain to ACLs mein ports likhne se bachata hai. CCNA ke liye bas idea chahiye: application naam se classification, CPU lagta hai, aur <code>match protocol</code> se configure hota hai.</dd>
<dt>match-any / match-all</dt><dd><code>match-any</code> ka matlab packet ko <b>ek</b> line satisfy karni hai (logical OR). <code>match-all</code>, jo keyword chhodne par default hai, ko <b>har</b> line satisfy karni hai (logical AND). Match-all class mein do alag DSCP values match karna kabhi succeed nahi hoga, kyunki ek packet ka ek hi DSCP hota hai.</dd>
<dt>class-default</dt><dd>Built-in class jo woh sab pakadti hai jo kisi aur class se match nahi hua. Yeh hamesha aakhri hoti hai.</dd>
</dl>
<pre class="code">R1(config)# class-map match-all WEB
R1(config-cmap)# match protocol http
R1(config-cmap)# match dscp af21
R1(config)# class-map match-any SIG
R1(config-cmap)# match dscp cs3
R1(config)# class-map match-any COS5
R1(config-cmap)# match cos 5
R1(config)# class-map match-any INSIDE
R1(config-cmap)# match input-interface GigabitEthernet0/1
R1# show class-map</pre>
<pre class="out"> Class Map match-all WEB (id 1)
   Match protocol http
   Match dscp af21 (18)

 Class Map match-any SIG (id 2)
   Match dscp cs3 (24)

 Class Map match-any COS5 (id 3)
   Match cos 5

 Class Map match-any INSIDE (id 4)
   Match input-interface GigabitEthernet0/1

 Class Map match-any class-default (id 0)
   Match any </pre>
<p>Dhyan do ki simulator names ko numbers mein badalta hai: <code>af21</code> 18 ban jaata hai aur <code>cs3</code> 24. WEB match-all hai, isliye packet ko HTTP <i>aur</i> AF21 dono hona padega. Aakhri block class-default aapne type nahi kiya; woh hamesha rehta hai.</p>

<div class="eg"><p><b>Worked example.</b> Pune branch mein phone 10.10.10.0/24 par hai aur UDP ports 16384 se 32767 par RTP bhejta hai. Voice ka class-map ACL <code>permit udp 10.10.10.0 0.0.0.255 any range 16384 32767</code> use karega. Usi subnet ka PC jo UDP 5001 par bhejta hai us range mein nahi hai, isliye class-default mein jaata hai. Agar baad mein koi video client UDP 20000 use kare, to woh bhi voice ACL se match hoga aur voice ki tarah mark ho jayega. Isliye ACL-based classification ko phone ke apne subnet ya voice VLAN se bandhna chahiye, aur kai sites ACL ko <code>match-all</code> aur DSCP check ke saath milate hain.</p></div>

<h3>Kahan classify karein</h3>
<p>Edge par <b>input</b> mein ek baar classify aur mark karo, mehnge ACL ya NBAR check ke saath. Phir har agla device sasta <code>match dscp</code> use karta hai. Isi wajah se WAN par queuing wali QoS policy ACLs dohrane ki jagah DSCP classes (EF-Q, AF11-Q) use karti hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Class-map ACL ke <code>deny</code> ko "yeh traffic drop karo" padhna. Match-all mein ek hi field ki do values lagana. Untrusted ports se DSCP par bharosa karna, jisse koi bhi user priority claim kar sakta hai. <code>cos</code> par classify karke umeed rakhna ki woh routed hop ke paar jaayega: CoS sirf 802.1Q tag mein rehta hai aur router naya frame banata hai to chala jaata hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Trust boundary woh jagah hai jahan markings accept ya rewrite hoti hain, aur jitna practical ho source ke paas honi chahiye. Classification ACL, NBAR, DSCP/CoS/precedence ya interface se hoti hai. match-all AND hai aur match-any OR; default match-all hai. NBAR deep inspection se application recognition hai. Class-map ACL mein permit ka matlab "class mein".</p></div>

<div class="scn"><h4>Gamer jisko voice priority mil gayi</h4><p>Ek coworking space mein shaam ko voice priority queue hamesha full rehti thi. Switches har access port par DSCP trust karte the. Ek tenant ki streaming application apni UDP video ko EF mark kar rahi thi, isliye woh phones ke saath priority queue mein ghusi aur 10 Mbps WAN ke 6 Mbps use karne lagi. Fix yeh tha ki trust boundary ko hilaya: untrusted user ports ab DSCP ko 0 kar dete hain, aur router phones ko unke voice VLAN subnet se classify karke khud EF mark karta hai.</p><p><b>Seekh:</b> sirf un devices par bharosa karo jo aapke control mein hain. Baaki sab boundary par re-mark hote hain.</p></div>

<div class="iv"><p class="q">"Trust boundary kya hai aur aap use kahan rakhoge?"</p><p>Ise us point ki tarah define karo jahan QoS markings accept ya overwrite hoti hain. Access layer par rakho: IP phone (CDP se detect) par trust karo, uske peeche ke PC par nahi, aur apne network ke andar ke uplink ports par trust karo. Sab kuch trust karne ka risk samjhao: users ya malware sab traffic ko EF mark karke asli voice ko bhookha rakh sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trust boundary woh jagah hai jahan CoS/DSCP accept ya rewrite hota hai. Edge par, user ke paas rakho.</li>
<li>Untrusted ports marking reset karte hain; trusted devices aur uplinks use rakhte hain.</li>
<li>ACL, NBAR, DSCP, CoS, precedence ya input interface se <code>class-map</code> aur <code>match</code> ke zariye classify karo.</li>
<li>Class-map mein ACL sirf traffic chunti hai; permit ka matlab "class mein", kuch block nahi hota.</li>
<li>match-all AND hai (default), match-any OR; class-default baaki sab pakadti hai.</li>
</ul></div>
`}};export{e as default};