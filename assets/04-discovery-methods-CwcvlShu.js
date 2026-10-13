var e={id:`discovery-methods`,h:{en:`Discovery methods: DHCP option 43, DNS, broadcast and primed APs`,hi:`Discovery methods: DHCP option 43, DNS, broadcast aur primed APs`},body:{en:`
<h3>The problem: an AP in another subnet</h3>
<p>An AP wakes up with an IP address and a gateway, nothing else. The controller is at 10.10.99.10, a different subnet. How does the AP learn that address? A broadcast stays inside its own VLAN, so a router will not forward it. The AP therefore uses several complementary methods, and any one of them is enough. Think of finding a friend's flat in a new city: you could shout in your own street (broadcast), have the address saved in your phone (primed), be told by the building reception when you arrive (DHCP), or look it up in a directory (DNS).</p>

<h3>The four discovery methods</h3>
<table class="cmp"><tr><th>Method</th><th>How it works</th><th>Works across subnets?</th></tr>
<tr><td>Layer 2 / Layer 3 broadcast</td><td>AP sends a CAPWAP discovery request to the local broadcast address on UDP 5246</td><td>No (only if the controller is in the same VLAN)</td></tr>
<tr><td>Primed (stored) controller</td><td>Controller names and IPs stored on the AP from an earlier join or set by an administrator</td><td>Yes</td></tr>
<tr><td>DHCP option 43</td><td>The DHCP server returns the controller IP in vendor-specific option 43</td><td>Yes</td></tr>
<tr><td>DNS</td><td>AP resolves the name CISCO-CAPWAP-CONTROLLER in its DNS domain</td><td>Yes</td></tr>
</table>
<p>The AP uses all of them in parallel or in sequence, collects every controller that answers, and then runs the selection algorithm from the previous chapter. In real life most production networks use <b>DHCP option 43</b> for new APs and then the AP remembers the controllers it learned.</p>

<h3>DHCP option 43 in detail</h3>
<p>DHCP option 43 is <b>vendor-specific information</b>. The DHCP server hands the AP a small blob of bytes. For Cisco APs the format is a <b>type-length-value (TLV)</b>:</p>
<ul>
<li><b>Type:</b> <code>f1</code> (hex) means "list of controller IPv4 addresses".</li>
<li><b>Length:</b> number of bytes of addresses, which is <b>4 times the number of controllers</b> (04 for one, 08 for two).</li>
<li><b>Value:</b> each controller IPv4 address written as four hex bytes.</li>
</ul>
<div class="eg"><p><b>Worked example: encoding 10.10.99.10.</b> Convert each octet to hex: 10 = 0a, 10 = 0a, 99 = 63, 10 = 0a. One controller, so length = 04. The option is <code>f1 04 0a 0a 63 0a</code>, written on a router as <code>f104.0a0a.630a</code>. Two controllers (10.10.99.10 and 10.10.99.11) give <code>f108.0a0a.630a.0a0a.630b</code>. The mistake to avoid is the wrong length byte; a length that does not match the number of addresses makes the AP ignore the option.</p></div>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Option 43 bytes">
<rect x="60" y="40" width="70" height="46" rx="6" fill="#fde68a"/><text x="95" y="68" text-anchor="middle" class="svg-ink" font-size="14">f1</text>
<rect x="140" y="40" width="70" height="46" rx="6" fill="#fed7aa"/><text x="175" y="68" text-anchor="middle" class="svg-ink" font-size="14">04</text>
<rect x="220" y="40" width="70" height="46" rx="6" fill="#bae6fd"/><text x="255" y="68" text-anchor="middle" class="svg-ink" font-size="14">0a</text>
<rect x="300" y="40" width="70" height="46" rx="6" fill="#bae6fd"/><text x="335" y="68" text-anchor="middle" class="svg-ink" font-size="14">0a</text>
<rect x="380" y="40" width="70" height="46" rx="6" fill="#bae6fd"/><text x="415" y="68" text-anchor="middle" class="svg-ink" font-size="14">63</text>
<rect x="460" y="40" width="70" height="46" rx="6" fill="#bae6fd"/><text x="495" y="68" text-anchor="middle" class="svg-ink" font-size="14">0a</text>
<text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="12">type</text>
<text x="175" y="110" text-anchor="middle" class="svg-muted" font-size="12">length</text>
<text x="375" y="110" text-anchor="middle" class="svg-muted" font-size="12">10 . 10 . 99 . 10</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">R1 syntax: option 43 hex f104.0a0a.630a</text>
</svg><p class="cap">Type f1, length 04 (one controller), then the four address bytes.</p></div>

<h3>DNS discovery</h3>
<p>If the AP has a DNS server and a domain name from DHCP (option 6 and option 15), it queries <code>CISCO-CAPWAP-CONTROLLER.example</code> (using your domain, for example nk.example). Create an A record with the controller management address. Older APs also try <code>CISCO-LWAPP-CONTROLLER</code>. DNS is helpful when the controller IP may change or when several controllers are listed behind one name. In the lab, DNS discovery is a concept: <b>not simulated</b>. The lab uses option 43.</p>

<h3>Primed and remembered controllers</h3>
<p>After a successful join the AP stores the controller's name and IP. If it reboots, it tries the remembered address first. An administrator can also <b>prime</b> the AP with primary, secondary and tertiary controller names before it is shipped to a branch: the AP then needs no DHCP hint at all. Priming is the usual method for HA pairs and for APs moved between sites.</p>

<h3>The R1 side in the lab</h3>
<p>R1 holds the DHCP pool AP-POOL for VLAN 10. In the broken lab the pool is missing option 43. The repaired pool looks like this:</p>
<pre class="code"><span class="c">! on R1: tell APs where the controller is</span>
R1# configure terminal
R1(config)# ip dhcp pool AP-POOL
R1(dhcp-config)# option 43 hex f104.0a0a.630a
R1(dhcp-config)# end</pre>
<pre class="out">R1# show running-config | section dhcp
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 <span class="hl">option 43 hex F104.0A0A.630A</span></pre>
<p>Note that the option lives on <b>R1</b>, the DHCP server. Editing the controller will never fix a discovery problem, because the controller was never the one who was missing information. The APs already hold a lease, so they will not ask again until it renews: on each AP issue <code>ip dhcp</code> (in the lab) to request a new lease immediately.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Putting option 43 in the wrong pool (for example the staff VLAN 20 pool). (2) Typing a wrong length byte or wrong hex for an address. (3) Forgetting that existing leases do not change until renewed. (4) Using a controller's client-facing address instead of its management address.</p></div>
<div class="exam"><p><b>Exam trap.</b> Option 43 type is f1 for Cisco, length is 4 times the number of controllers. Option 60 is the vendor class identifier (the AP sends its model string, such as Cisco AP c9120, so that a DHCP server can return a vendor-specific option 43 to the right device). Broadcast discovery never crosses a router.</p></div>

<div class="scn"><h4>The new branch with the old pool</h4><p>A branch router was cloned from another site. All AP-related settings were copied except option 43, because it lived in a hidden "ap-pool" template. The APs received addresses but showed "looking for controller" forever. The engineer converted 10.10.99.10 to hex, added <code>option 43 hex f104.0a0a.630a</code>, forced a lease renewal and both APs joined in two minutes.</p><p><b>Lesson:</b> DHCP carries more than addresses.</p></div>

<div class="iv"><p class="q">"How does an AP discover its controller if the two are in different subnets?"</p><p>Via DHCP option 43 (type f1 with controller IPs), via DNS name CISCO-CAPWAP-CONTROLLER, or via primed/stored controller addresses. Broadcast works only inside the same VLAN. Show you can encode an address in hex and say where the option is configured (the DHCP server).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery methods: broadcast, primed or stored, DHCP option 43, DNS.</li>
<li>Option 43 for Cisco APs is f1, then length (4 per controller), then the addresses in hex.</li>
<li>10.10.99.10 becomes 0a0a.630a, so the option is f104.0a0a.630a.</li>
<li>Fix discovery on the DHCP server, then renew the AP leases.</li>
<li>DNS and priming are real but not simulated; the lab teaches option 43.</li>
</ul></div>
`,hi:`
<h3>Problem: doosre subnet mein AP</h3>
<p>AP IP address aur gateway ke saath uthta hai, aur kuch nahi. Controller 10.10.99.10 par hai, alag subnet. AP yeh address kaise seekhe? Broadcast apne VLAN ke andar hi rehta hai, router use forward nahi karta. Isliye AP kai complementary methods use karta hai, aur inme se ek bhi kaafi hai. Naye shehar mein dost ka flat dhundne ki tarah socho: apni gali mein chilla sakte ho (broadcast), phone mein address saved ho (primed), building reception pahunchne par bata de (DHCP), ya directory mein dekh lo (DNS).</p>

<h3>Chaar discovery methods</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise kaam karta hai</th><th>Subnets ke paar chalta hai?</th></tr>
<tr><td>Layer 2 / Layer 3 broadcast</td><td>AP local broadcast address par UDP 5246 se CAPWAP discovery request bhejta hai</td><td>Nahi (sirf jab controller same VLAN mein ho)</td></tr>
<tr><td>Primed (stored) controller</td><td>Pichhle join se ya administrator ne AP par controller names aur IPs store kiye</td><td>Haan</td></tr>
<tr><td>DHCP option 43</td><td>DHCP server vendor-specific option 43 mein controller IP lauta deta hai</td><td>Haan</td></tr>
<tr><td>DNS</td><td>AP apne DNS domain mein CISCO-CAPWAP-CONTROLLER naam resolve karta hai</td><td>Haan</td></tr>
</table>
<p>AP sabko parallel ya sequence mein use karta hai, jo bhi controller jawab de usse collect karta hai, phir pichhle chapter ka selection algorithm chalata hai. Real life mein zyadatar production networks naye APs ke liye <b>DHCP option 43</b> use karte hain aur phir AP seekhe hue controllers yaad rakhta hai.</p>

<h3>DHCP option 43 detail mein</h3>
<p>DHCP option 43 <b>vendor-specific information</b> hai. DHCP server AP ko bytes ka chhota blob deta hai. Cisco APs ke liye format ek <b>type-length-value (TLV)</b> hai:</p>
<ul>
<li><b>Type:</b> <code>f1</code> (hex) ka matlab "controller IPv4 addresses ki list".</li>
<li><b>Length:</b> addresses ke bytes ki sankhya, yaani <b>controllers ki sankhya ka 4 guna</b> (ek ke liye 04, do ke liye 08).</li>
<li><b>Value:</b> har controller IPv4 address chaar hex bytes mein.</li>
</ul>
<div class="eg"><p><b>Worked example: 10.10.99.10 ko encode karna.</b> Har octet ko hex mein badlo: 10 = 0a, 10 = 0a, 99 = 63, 10 = 0a. Ek controller, isliye length = 04. Option hai <code>f1 04 0a 0a 63 0a</code>, router par <code>f104.0a0a.630a</code> likha jaata hai. Do controllers (10.10.99.10 aur 10.10.99.11) ke liye <code>f108.0a0a.630a.0a0a.630b</code>. Galat length byte se bachna; addresses ki sankhya se na milne wali length AP option ko ignore kar deta hai.</p></div>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Option 43 bytes">
<rect x="60" y="40" width="70" height="46" rx="6" fill="#fde68a"/><text x="95" y="68" text-anchor="middle" class="svg-ink" font-size="14">f1</text>
<rect x="140" y="40" width="70" height="46" rx="6" fill="#fed7aa"/><text x="175" y="68" text-anchor="middle" class="svg-ink" font-size="14">04</text>
<rect x="220" y="40" width="70" height="46" rx="6" fill="#bae6fd"/><text x="255" y="68" text-anchor="middle" class="svg-ink" font-size="14">0a</text>
<rect x="300" y="40" width="70" height="46" rx="6" fill="#bae6fd"/><text x="335" y="68" text-anchor="middle" class="svg-ink" font-size="14">0a</text>
<rect x="380" y="40" width="70" height="46" rx="6" fill="#bae6fd"/><text x="415" y="68" text-anchor="middle" class="svg-ink" font-size="14">63</text>
<rect x="460" y="40" width="70" height="46" rx="6" fill="#bae6fd"/><text x="495" y="68" text-anchor="middle" class="svg-ink" font-size="14">0a</text>
<text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="12">type</text>
<text x="175" y="110" text-anchor="middle" class="svg-muted" font-size="12">length</text>
<text x="375" y="110" text-anchor="middle" class="svg-muted" font-size="12">10 . 10 . 99 . 10</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">R1 syntax: option 43 hex f104.0a0a.630a</text>
</svg><p class="cap">Type f1, length 04 (ek controller), phir chaar address bytes.</p></div>

<h3>DNS discovery</h3>
<p>Agar AP ke paas DHCP se DNS server aur domain name hai (option 6 aur option 15), to woh <code>CISCO-CAPWAP-CONTROLLER.example</code> query karta hai (apna domain use karke, jaise nk.example). Controller management address ka A record banao. Purane APs <code>CISCO-LWAPP-CONTROLLER</code> bhi try karte hain. DNS tab madad karta hai jab controller IP badal sakta ho ya ek naam ke peeche kai controllers hon. Lab mein DNS discovery concept hai: <b>simulate nahi hota</b>. Lab option 43 use karta hai.</p>

<h3>Primed aur remembered controllers</h3>
<p>Successful join ke baad AP controller ka naam aur IP store kar leta hai. Reboot par woh pehle remembered address try karta hai. Administrator AP ko branch bhejne se pehle primary, secondary aur tertiary controller names se <b>prime</b> bhi kar sakta hai: tab AP ko DHCP hint ki zaroorat hi nahi. HA pairs aur sites ke beech move hone wale APs ke liye priming usual method hai.</p>

<h3>Lab mein R1 side</h3>
<p>R1 par VLAN 10 ke liye DHCP pool AP-POOL hai. Broken lab mein pool mein option 43 missing hai. Repaired pool aisa dikhta hai:</p>
<pre class="code"><span class="c">! on R1: tell APs where the controller is</span>
R1# configure terminal
R1(config)# ip dhcp pool AP-POOL
R1(dhcp-config)# option 43 hex f104.0a0a.630a
R1(dhcp-config)# end</pre>
<pre class="out">R1# show running-config | section dhcp
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 <span class="hl">option 43 hex F104.0A0A.630A</span></pre>
<p>Dhyan do ki option <b>R1</b> par rehta hai, jo DHCP server hai. Controller edit karne se discovery problem kabhi fix nahi hogi, kyunki controller ke paas information missing thi hi nahi. APs ke paas pehle se lease hai, isliye renew hone tak woh dobara nahi poochhenge: har AP par (lab mein) <code>ip dhcp</code> chalao taaki turant naya lease maange.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Option 43 ko galat pool mein daalna (jaise staff VLAN 20 pool). (2) Length byte ya address ka hex galat type karna. (3) Bhool jaana ki existing leases renew hone tak nahi badalte. (4) Controller ke management address ki jagah client-facing address use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Cisco ke liye option 43 type f1 hai, length controllers ki sankhya ka 4 guna. Option 60 vendor class identifier hai (AP apna model string bhejta hai, jaise Cisco AP c9120, taaki DHCP server sahi device ko vendor-specific option 43 lauta sake). Broadcast discovery router ke paar kabhi nahi jaati.</p></div>

<div class="scn"><h4>Naya branch purane pool ke saath</h4><p>Ek branch router doosri site se clone hua. AP-related saari settings copy huin sirf option 43 chhod kar, kyunki woh ek hidden "ap-pool" template mein tha. APs ko addresses mile lekin woh hamesha "looking for controller" dikhate rahe. Engineer ne 10.10.99.10 ko hex mein badla, <code>option 43 hex f104.0a0a.630a</code> add kiya, lease renewal force kiya aur dono APs do minute mein join ho gaye.</p><p><b>Seekh:</b> DHCP sirf addresses se zyada kuch carry karta hai.</p></div>

<div class="iv"><p class="q">"Agar AP aur controller alag subnets mein hon to AP controller kaise discover karta hai?"</p><p>DHCP option 43 (type f1 aur controller IPs) se, DNS naam CISCO-CAPWAP-CONTROLLER se, ya primed/stored controller addresses se. Broadcast sirf same VLAN ke andar chalta hai. Dikhao ki aap address ko hex mein encode kar sakte ho aur batao ki option kahan configure hota hai (DHCP server par).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery methods: broadcast, primed ya stored, DHCP option 43, DNS.</li>
<li>Cisco APs ke liye option 43 hai f1, phir length (har controller ke 4), phir addresses hex mein.</li>
<li>10.10.99.10 banta hai 0a0a.630a, isliye option hai f104.0a0a.630a.</li>
<li>Discovery DHCP server par fix karo, phir AP leases renew karo.</li>
<li>DNS aur priming real hain lekin simulate nahi hote; lab option 43 sikhata hai.</li>
</ul></div>
`}};export{e as default};