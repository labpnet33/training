var e={id:`eui64`,h:{en:`Interface IDs and modified EUI-64, step by step`,hi:`Interface IDs aur modified EUI-64, step by step`},body:{en:`
<p>When a new student joins a hostel, the warden could invent a room number, or simply use the student's roll number, which is already unique in the college. <b>EUI-64</b> is the "use the roll number" approach: the device builds the 64-bit interface ID of its IPv6 address from its own 48-bit MAC address, which is already unique on the link.</p>

<h3>Three ways to get an interface ID</h3>
<ul>
<li><b>Manual</b>: you type it, for example <code>2001:db8:acad:12::1</code>. Best for routers, servers and anything people must remember.</li>
<li><b>Modified EUI-64</b>: derived from the MAC address. Cisco IOS uses it for automatic link-local addresses and for the <code>eui-64</code> keyword; hosts may use it for SLAAC.</li>
<li><b>Random</b>: modern operating systems prefer random or hashed interface IDs for privacy (covered at the end of this chapter).</li>
</ul>

<h3>Background: the U/L bit</h3>
<p>A MAC address is 48 bits: a 24-bit <b>OUI</b> (vendor) and a 24-bit device part. The <b>7th bit</b> of the first byte (counting from the left, starting at 1) is the <b>Universal/Local (U/L) bit</b>. In a burned-in MAC it is 0, meaning "universally administered". Modified EUI-64 <b>inverts</b> this bit. The designers did this so that simple hand-typed IDs such as <code>::1</code>, which have the bit at 0, read as "locally assigned", while IDs built from real MACs get a 1.</p>

<h3>The procedure</h3>
<ol>
<li>Write the MAC as six bytes: <code>5254.0012.3401</code> becomes <code>52:54:00:12:34:01</code>.</li>
<li>Split it in the middle: <code>52:54:00</code> | <code>12:34:01</code>.</li>
<li>Insert <code>ff:fe</code> between the halves: <code>52:54:00:ff:fe:12:34:01</code> (now 64 bits).</li>
<li>Flip the 7th bit of the first byte: <code>52</code> = <code>0101 0010</code>; flipping the 7th bit gives <code>0101 0000</code> = <code>50</code>.</li>
<li>Group into hextets: <code>5054:00ff:fe12:3401</code>, shortened to <code>5054:ff:fe12:3401</code>, and append it to the /64 prefix.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="EUI-64 steps">
<rect x="130" y="14" width="190" height="32" rx="6" fill="#fde68a"/><text x="225" y="35" text-anchor="middle" class="svg-ink" font-size="13">52:54:00</text>
<rect x="320" y="14" width="190" height="32" rx="6" fill="#fde68a"/><text x="415" y="35" text-anchor="middle" class="svg-ink" font-size="13">12:34:01</text>
<text x="20" y="35" class="svg-muted" font-size="12">1. MAC</text>
<rect x="100" y="66" width="160" height="32" rx="6" fill="#fde68a"/><text x="180" y="87" text-anchor="middle" class="svg-ink" font-size="13">52:54:00</text>
<rect x="260" y="66" width="120" height="32" rx="6" fill="#ddd6fe"/><text x="320" y="87" text-anchor="middle" class="svg-accent" font-size="13">ff:fe</text>
<rect x="380" y="66" width="160" height="32" rx="6" fill="#fde68a"/><text x="460" y="87" text-anchor="middle" class="svg-ink" font-size="13">12:34:01</text>
<text x="20" y="87" class="svg-muted" font-size="12">2. insert</text>
<text x="100" y="128" class="svg-ink" font-size="13">52 = 0101 00<tspan class="svg-accent">1</tspan>0  flip 7th bit  0101 00<tspan class="svg-accent">0</tspan>0 = 50</text>
<text x="20" y="128" class="svg-muted" font-size="12">3. flip</text>
<rect x="100" y="148" width="440" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="13">interface ID 5054:00ff:fe12:3401</text>
<text x="20" y="169" class="svg-muted" font-size="12">4. result</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">link-local fe80::5054:ff:fe12:3401</text>
</svg><p class="cap">Modified EUI-64 in four moves: split, insert ff:fe, flip the U/L bit, regroup.</p></div>

<h3>A fast way to flip the bit</h3>
<p>The 7th bit is worth 2 inside the <b>second hex digit</b> of the first byte. So you only ever change that one digit: <b>0 and 2</b> swap, 1 and 3, 4 and 6, 5 and 7, 8 and a, 9 and b, c and e, d and f. <code>00</code> becomes <code>02</code>, <code>52</code> becomes <code>50</code>, <code>0c</code> would become <code>0e</code>.</p>

<div class="eg"><p><b>Worked examples.</b></p>
<ul>
<li>Lab 2, R1 G0/0 MAC <code>5254.0c04.4b01</code>: <code>52:54:0c:ff:fe:04:4b:01</code>, flip <code>52</code> to <code>50</code>, ID <code>5054:0cff:fe04:4b01</code>. With prefix <code>2001:db8:cafe:1::/64</code> the address is <code>2001:db8:cafe:1:5054:cff:fe04:4b01</code>.</li>
<li>Lab 2, PC1 MAC <code>0050.7f06.6d01</code>: <code>00:50:7f:ff:fe:06:6d:01</code>, flip <code>00</code> to <code>02</code>, ID <code>0250:7fff:fe06:6d01</code>, address <code>2001:db8:cafe:1:250:7fff:fe06:6d01</code>.</li>
<li>A locally administered MAC <code>0200.1111.2222</code>: the bit is already 1, so flipping makes it 0: ID <code>0000:11ff:fe11:2222</code>, written <code>::11ff:fe11:2222</code> after the prefix.</li>
</ul>
<p>How to recognise an EUI-64 ID in any output: look for <b>ff:fe</b> in the middle of the interface ID, as in <code>...:cff:fe04:...</code>.</p></div>

<h3>EUI-64 on Cisco IOS</h3>
<pre class="code"><span class="c">! global address built from the prefix plus the EUI-64 ID</span>
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:cafe:1::/64 eui-64
R1(config-if)# end
R1# show interfaces g0/0 | include address is</pre>
<pre class="out">  Hardware is iGbE, <span class="hl">address is 5254.0c04.4b01</span> (bia 5254.0c04.4b01)

R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is <span class="hl">FE80::5054:CFF:FE04:4B01</span>
  No Virtual link-local address(es):
  Global unicast address(es):
    <span class="hl">2001:DB8:CAFE:1:5054:CFF:FE04:4B01, subnet is 2001:DB8:CAFE:1::/64 [EUI]</span></pre>
<p>Note two things. The <code>[EUI]</code> flag tells you the address was generated. And the automatic <b>link-local</b> address uses the same EUI-64 ID with the <code>fe80::</code> prefix. Interfaces without their own MAC, such as serial links and loopbacks, borrow the MAC of one of the router's Ethernet interfaces for this.</p>

<h3>Privacy: why your laptop does not use EUI-64</h3>
<p>An EUI-64 ID contains the MAC, so the same ID follows a laptop from home to office to café, and anyone can track it. Operating systems therefore use <b>temporary (privacy) addresses</b> with random IDs that change regularly for outgoing connections, and <b>stable privacy</b> IDs, a hash that stays the same inside one network but differs between networks. Windows, macOS, Linux and Android all do some form of this. On a real LAN you will mostly see random-looking IDs on clients and EUI-64 or manual IDs on network devices.</p>

<div class="warn"><p><b>Common mistakes.</b> Flipping the wrong bit (changing the first hex digit instead of the second), forgetting to flip at all, inserting <code>ff:fe</code> at the end instead of the middle, and typing <code>eui-64</code> with a prefix length other than /64.</p></div>

<div class="exam"><p><b>Exam trap.</b> Typical question: "MAC 0019.e8a1.2b3c, prefix 2001:db8:5::/64 with eui-64; what is the address?" Answer: <code>2001:db8:5:0:219:e8ff:fea1:2b3c</code>. The wrong options will be missing the flip (<code>19:e8ff</code>), have <code>fffe</code> in the wrong place, or flip to <code>1b</code>.</p></div>

<div class="scn"><h4>The replaced router with a new address</h4><p>A branch router failed and was swapped for an identical model. The config was restored from backup, but monitoring could not reach the router's management address. The engineer compared the old config and the new <code>show ipv6 interface brief</code>: the management interface used <code>ipv6 address 2001:db8:50:1::/64 eui-64</code>. The new chassis had different MAC addresses, so the EUI-64 address changed, and the monitoring system and ACLs still pointed at the old one. The fix was to give the management interface a manual address, <code>2001:db8:50:1::1/64</code>, and update DNS.</p><p><b>Lesson:</b> EUI-64 addresses change with the hardware. Use manual addresses on anything other systems must find.</p></div>

<div class="iv"><p class="q">"Walk me through how a router builds an EUI-64 interface ID."</p><p>Strong answer: take the 48-bit MAC, split it into two 24-bit halves, insert FFFE in the middle to make 64 bits, and invert the 7th bit of the first byte, the universal/local bit. Then append it to the /64 prefix. Give a quick example, mention that Cisco uses it for automatic link-locals and the eui-64 keyword, and add that hosts often use random or stable-privacy IDs instead for privacy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modified EUI-64 = MAC split in half + ff:fe in the middle + the 7th bit (U/L) of the first byte inverted.</li>
<li>Only the second hex digit of the first byte changes: 0 and 2, 4 and 6, 8 and a, c and e swap (and so on).</li>
<li>An ID with ff:fe in the middle is almost always EUI-64.</li>
<li>IOS uses EUI-64 for automatic link-local addresses and with <code>ipv6 address prefix/64 eui-64</code>; the address shows [EUI].</li>
<li>EUI-64 changes with hardware and exposes the MAC; clients usually prefer random or stable-privacy IDs.</li>
</ul></div>
`,hi:`
<p>Jab hostel mein naya student aata hai, warden ya to koi room number bana sakta hai, ya seedha student ka roll number use kar sakta hai, jo college mein pehle se unique hai. <b>EUI-64</b> "roll number use karo" wala tarika hai: device apne IPv6 address ka 64-bit interface ID apne 48-bit MAC address se banata hai, jo link par pehle se unique hai.</p>

<h3>Interface ID paane ke teen tarike</h3>
<ul>
<li><b>Manual</b>: aap khud type karte ho, jaise <code>2001:db8:acad:12::1</code>. Routers, servers aur har us cheez ke liye best jise log yaad rakhein.</li>
<li><b>Modified EUI-64</b>: MAC address se banaya jaata hai. Cisco IOS ise automatic link-local addresses aur <code>eui-64</code> keyword ke liye use karta hai; hosts ise SLAAC ke liye use kar sakte hain.</li>
<li><b>Random</b>: modern operating systems privacy ke liye random ya hashed interface IDs pasand karte hain (is chapter ke end mein).</li>
</ul>

<h3>Background: U/L bit</h3>
<p>MAC address 48 bits ka hota hai: 24-bit <b>OUI</b> (vendor) aur 24-bit device part. Pehle byte ka <b>7th bit</b> (left se ginti, 1 se shuru) <b>Universal/Local (U/L) bit</b> hai. Burned-in MAC mein yeh 0 hota hai, matlab "universally administered". Modified EUI-64 is bit ko <b>ulta</b> kar deta hai. Designers ne aisa isliye kiya taaki <code>::1</code> jaise simple haath se type kiye IDs, jinka bit 0 hai, "locally assigned" padhe jaayein, jabki asli MACs se bane IDs ko 1 mile.</p>

<h3>Procedure</h3>
<ol>
<li>MAC ko chhe bytes mein likho: <code>5254.0012.3401</code> ban jaata hai <code>52:54:00:12:34:01</code>.</li>
<li>Beech se todo: <code>52:54:00</code> | <code>12:34:01</code>.</li>
<li>Dono hisson ke beech <code>ff:fe</code> daalo: <code>52:54:00:ff:fe:12:34:01</code> (ab 64 bits).</li>
<li>Pehle byte ka 7th bit flip karo: <code>52</code> = <code>0101 0010</code>; 7th bit flip karne se <code>0101 0000</code> = <code>50</code>.</li>
<li>Hextets mein group karo: <code>5054:00ff:fe12:3401</code>, chhota karke <code>5054:ff:fe12:3401</code>, aur ise /64 prefix ke peeche jodo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="EUI-64 steps">
<rect x="130" y="14" width="190" height="32" rx="6" fill="#fde68a"/><text x="225" y="35" text-anchor="middle" class="svg-ink" font-size="13">52:54:00</text>
<rect x="320" y="14" width="190" height="32" rx="6" fill="#fde68a"/><text x="415" y="35" text-anchor="middle" class="svg-ink" font-size="13">12:34:01</text>
<text x="20" y="35" class="svg-muted" font-size="12">1. MAC</text>
<rect x="100" y="66" width="160" height="32" rx="6" fill="#fde68a"/><text x="180" y="87" text-anchor="middle" class="svg-ink" font-size="13">52:54:00</text>
<rect x="260" y="66" width="120" height="32" rx="6" fill="#ddd6fe"/><text x="320" y="87" text-anchor="middle" class="svg-accent" font-size="13">ff:fe</text>
<rect x="380" y="66" width="160" height="32" rx="6" fill="#fde68a"/><text x="460" y="87" text-anchor="middle" class="svg-ink" font-size="13">12:34:01</text>
<text x="20" y="87" class="svg-muted" font-size="12">2. daalo</text>
<text x="100" y="128" class="svg-ink" font-size="13">52 = 0101 00<tspan class="svg-accent">1</tspan>0  7th bit flip  0101 00<tspan class="svg-accent">0</tspan>0 = 50</text>
<text x="20" y="128" class="svg-muted" font-size="12">3. flip</text>
<rect x="100" y="148" width="440" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="13">interface ID 5054:00ff:fe12:3401</text>
<text x="20" y="169" class="svg-muted" font-size="12">4. result</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">link-local fe80::5054:ff:fe12:3401</text>
</svg><p class="cap">Chaar chaalon mein modified EUI-64: todo, ff:fe daalo, U/L bit flip karo, dobara group karo.</p></div>

<h3>Bit flip karne ka tez tarika</h3>
<p>7th bit pehle byte ke <b>doosre hex digit</b> ke andar 2 ki value rakhta hai. Isliye aap hamesha sirf woh ek digit badalte ho: <b>0 aur 2</b> aapas mein badalte hain, 1 aur 3, 4 aur 6, 5 aur 7, 8 aur a, 9 aur b, c aur e, d aur f. <code>00</code> ban jaata hai <code>02</code>, <code>52</code> ban jaata hai <code>50</code>, <code>0c</code> ban jaayega <code>0e</code>.</p>

<div class="eg"><p><b>Worked examples.</b></p>
<ul>
<li>Lab 2, R1 G0/0 MAC <code>5254.0c04.4b01</code>: <code>52:54:0c:ff:fe:04:4b:01</code>, <code>52</code> ko <code>50</code> mein flip karo, ID <code>5054:0cff:fe04:4b01</code>. Prefix <code>2001:db8:cafe:1::/64</code> ke saath address hai <code>2001:db8:cafe:1:5054:cff:fe04:4b01</code>.</li>
<li>Lab 2, PC1 MAC <code>0050.7f06.6d01</code>: <code>00:50:7f:ff:fe:06:6d:01</code>, <code>00</code> ko <code>02</code> mein flip karo, ID <code>0250:7fff:fe06:6d01</code>, address <code>2001:db8:cafe:1:250:7fff:fe06:6d01</code>.</li>
<li>Locally administered MAC <code>0200.1111.2222</code>: bit pehle se 1 hai, to flip karne par 0 ho jaata hai: ID <code>0000:11ff:fe11:2222</code>, prefix ke baad <code>::11ff:fe11:2222</code> likha jaata hai.</li>
</ul>
<p>Kisi bhi output mein EUI-64 ID kaise pehchano: interface ID ke beech mein <b>ff:fe</b> dhoondho, jaise <code>...:cff:fe04:...</code>.</p></div>

<h3>Cisco IOS par EUI-64</h3>
<pre class="code"><span class="c">! prefix plus EUI-64 ID se bana global address</span>
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:cafe:1::/64 eui-64
R1(config-if)# end
R1# show interfaces g0/0 | include address is</pre>
<pre class="out">  Hardware is iGbE, <span class="hl">address is 5254.0c04.4b01</span> (bia 5254.0c04.4b01)

R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is <span class="hl">FE80::5054:CFF:FE04:4B01</span>
  No Virtual link-local address(es):
  Global unicast address(es):
    <span class="hl">2001:DB8:CAFE:1:5054:CFF:FE04:4B01, subnet is 2001:DB8:CAFE:1::/64 [EUI]</span></pre>
<p>Do cheezein dekho. <code>[EUI]</code> flag batata hai ki address generate hua hai. Aur automatic <b>link-local</b> address wahi EUI-64 ID <code>fe80::</code> prefix ke saath use karta hai. Jin interfaces ka apna MAC nahi hota, jaise serial links aur loopbacks, woh iske liye router ke kisi Ethernet interface ka MAC udhaar lete hain.</p>

<h3>Privacy: aapka laptop EUI-64 kyun use nahi karta</h3>
<p>EUI-64 ID mein MAC hota hai, isliye same ID laptop ke saath ghar se office se café tak jaata hai, aur koi bhi use track kar sakta hai. Isliye operating systems outgoing connections ke liye random IDs wale <b>temporary (privacy) addresses</b> use karte hain jo regularly badalte hain, aur <b>stable privacy</b> IDs, ek hash jo ek network ke andar same rehta hai par networks ke beech alag hota hai. Windows, macOS, Linux aur Android sab iska koi na koi form karte hain. Real LAN par aapko clients par zyada tar random dikhne wale IDs aur network devices par EUI-64 ya manual IDs dikhenge.</p>

<div class="warn"><p><b>Common galtiyan.</b> Galat bit flip karna (doosre ki jagah pehla hex digit badalna), flip karna bhool jaana, <code>ff:fe</code> beech ki jagah end mein daalna, aur /64 ke alawa kisi prefix length ke saath <code>eui-64</code> type karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Typical question: "MAC 0019.e8a1.2b3c, prefix 2001:db8:5::/64 eui-64 ke saath; address kya hai?" Answer: <code>2001:db8:5:0:219:e8ff:fea1:2b3c</code>. Galat options mein flip missing hoga (<code>19:e8ff</code>), <code>fffe</code> galat jagah hoga, ya <code>1b</code> mein flip hoga.</p></div>

<div class="scn"><h4>Badla gaya router naye address ke saath</h4><p>Ek branch router fail hua aur same model se badal diya gaya. Config backup se restore hua, par monitoring router ke management address tak nahi pahunch paaya. Engineer ne purana config aur naya <code>show ipv6 interface brief</code> compare kiya: management interface <code>ipv6 address 2001:db8:50:1::/64 eui-64</code> use karta tha. Naye chassis ke MAC addresses alag the, isliye EUI-64 address badal gaya, aur monitoring system aur ACLs ab bhi purane ki taraf point kar rahe the. Fix tha management interface ko manual address, <code>2001:db8:50:1::1/64</code>, dena aur DNS update karna.</p><p><b>Seekh:</b> EUI-64 addresses hardware ke saath badalte hain. Jise doosre systems ko dhoondhna ho, us par manual addresses use karo.</p></div>

<div class="iv"><p class="q">"Samjhao ki router EUI-64 interface ID kaise banata hai."</p><p>Strong answer: 48-bit MAC lo, use do 24-bit hisson mein todo, 64 bits banane ke liye beech mein FFFE daalo, aur pehle byte ka 7th bit, universal/local bit, ulta karo. Phir ise /64 prefix ke peeche jodo. Ek chhota example do, batao ki Cisco ise automatic link-locals aur eui-64 keyword ke liye use karta hai, aur jodo ki hosts privacy ke liye aksar iski jagah random ya stable-privacy IDs use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modified EUI-64 = MAC beech se toda + beech mein ff:fe + pehle byte ka 7th bit (U/L) ulta.</li>
<li>Sirf pehle byte ka doosra hex digit badalta hai: 0 aur 2, 4 aur 6, 8 aur a, c aur e (aur baaki) aapas mein badalte hain.</li>
<li>Jis ID ke beech mein ff:fe ho, woh lagbhag hamesha EUI-64 hai.</li>
<li>IOS automatic link-local addresses ke liye aur <code>ipv6 address prefix/64 eui-64</code> ke saath EUI-64 use karta hai; address [EUI] dikhata hai.</li>
<li>EUI-64 hardware ke saath badalta hai aur MAC expose karta hai; clients aam taur par random ya stable-privacy IDs pasand karte hain.</li>
</ul></div>
`}};export{e as default};