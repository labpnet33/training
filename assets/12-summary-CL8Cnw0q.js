var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module unable to explain what a mask does, and you finish it able to subnet in your head, design with VLSM, summarise routes and fix a broken host from its own settings. Use this chapter as your revision sheet the night before the exam and your quick reference on the job.</p>

<h3>The whole module on one card</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Subnetting cheat card">
<rect x="10" y="10" width="620" height="36" rx="6" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Mask octets: 128 192 224 240 248 252 254 255</text>
<rect x="10" y="54" width="620" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">Block size = 256 − interesting octet · subnets start on multiples</text>
<rect x="10" y="98" width="620" height="36" rx="6" fill="#fde68a"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">Hosts = 2^h − 2 · Subnets = 2^s · VLSM largest first</text>
<rect x="10" y="142" width="620" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">10/8 · 172.16/12 · 192.168/16 · 169.254/16 APIPA · 127/8 loopback</text>
</svg><p class="cap">Four lines that answer most N10-009 objective 1.7 questions.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can convert any octet between decimal and binary, and list the nine valid mask octets.</li>
<li>I can convert between dotted masks and prefixes (/20 = 255.255.240.0) in seconds.</li>
<li>Given an address and prefix, I can find network, broadcast, first and last usable, and host count.</li>
<li>I can choose a prefix from a host or subnet requirement and check the other constraint.</li>
<li>I can build a VLSM plan largest-first with no overlaps.</li>
<li>I can write the tightest summary for a set of contiguous networks and spot over-summarisation.</li>
<li>I can classify RFC 1918, APIPA, loopback, CGNAT, documentation, multicast and classes A to E.</li>
<li>I can configure router interfaces and hosts, and verify on Windows, Linux, macOS and the router.</li>
<li>I can diagnose wrong mask, wrong gateway, APIPA and duplicate IP from symptoms.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Octet</dt><dd>8 bits of an IPv4 address, written as 0 to 255.</dd>
<dt>Subnet mask / prefix</dt><dd>Marks the network bits; dotted (255.255.255.192) or CIDR (/26).</dd>
<dt>Network address</dt><dd>Host bits all 0; names the subnet; not assignable.</dd>
<dt>Broadcast address</dt><dd>Host bits all 1; reaches every host in the subnet; not assignable.</dd>
<dt>Block size</dt><dd>256 minus the interesting mask octet; the step between subnets.</dd>
<dt>CIDR</dt><dd>Classless Inter-Domain Routing: any prefix length, no class rules.</dd>
<dt>VLSM</dt><dd>Different prefix lengths inside one block, sized per need.</dd>
<dt>Summary route</dt><dd>One shorter prefix that covers several contiguous subnets.</dd>
<dt>RFC 1918</dt><dd>Private ranges 10/8, 172.16/12, 192.168/16; need NAT for the internet.</dd>
<dt>APIPA</dt><dd>169.254.0.0/16, self-assigned when DHCP fails; link-local only.</dd>
<dt>Loopback</dt><dd>127.0.0.0/8; 127.0.0.1 is localhost; tests the local stack.</dd>
<dt>Proxy ARP</dt><dd>A router answering ARP for hosts in other subnets; can hide a wrong mask.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Usable hosts /30, /29, /28, /27, /26, /25, /24</td><td>2, 6, 14, 30, 62, 126, 254</td></tr>
<tr><td>Class A / B / C first octet</td><td>1–126 / 128–191 / 192–223</td></tr>
<tr><td>Class D / E</td><td>224–239 multicast / 240–255 reserved</td></tr>
<tr><td>Private 172 range ends at</td><td>172.31.255.255</td></tr>
<tr><td>APIPA means</td><td>DHCP was not reached</td></tr>
<tr><td>Local works, remote fails</td><td>Default gateway</td></tr>
<tr><td>/31 and /32</td><td>Point-to-point exception; single host route</td></tr>
<tr><td>Lab plan</td><td>Sales .0/26 (R1 .1, PC .62), HR .64/26 (.65, .126), IT .128/26 (.129, .190), growth .192/26 (broadcast .255)</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Router (Cisco-style)</span>
interface GigabitEthernet0/0
 ip address 192.168.50.1 255.255.255.192
 no shutdown
show ip interface brief
show ip route connected
show ip arp
<span class="c">! Lab host shell</span>
ip 192.168.50.62/26 192.168.50.1
show ip
show arp
ping 192.168.50.126
trace 192.168.50.62
<span class="c">! Windows</span>
ipconfig /all
ipconfig /release
ipconfig /renew
<span class="c">! Linux</span>
ip addr
ip route
<span class="c">! macOS</span>
ifconfig en0
route -n get default</pre>

<h3>Final mixed drill</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Broadcast of 192.168.50.64/26</td><td>192.168.50.127</td></tr>
<tr><td>Usable hosts in /27</td><td>30</td></tr>
<tr><td>Network of 10.40.13.77/21</td><td>10.40.8.0</td></tr>
<tr><td>Smallest prefix for 500 hosts</td><td>/23</td></tr>
<tr><td>Summary of 10.1.4.0/24 – 10.1.7.0/24</td><td>10.1.4.0/22</td></tr>
<tr><td>Is 172.32.5.5 private?</td><td>No, the private block ends at 172.31</td></tr>
<tr><td>Mask shown as 0xfffffff0 on macOS</td><td>255.255.255.240 (/28)</td></tr>
</table>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Forgetting −2 on hosts; using the wrong octet for the block size on prefixes shorter than /24; allocating VLSM smallest-first; picking 172.16.0.0/16 as "the" private 172 range; and blaming DNS for an APIPA address.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Write the nine mask values and the powers of two on your scratch board as soon as the exam starts. For every subnet question, find the interesting octet and block size first; most wrong options fall away immediately. Read every mask twice.</p></div>

<div class="scn"><h4>Five minutes on the bridge call</h4><p>During an outage call, a manager asked whether 10.40.13.77 could be the rogue device flooding the guest network 10.40.8.0/21. A junior engineer answered in ten seconds: "/21 is block 8 in the third octet, so the guest range is 10.40.8.0 to 10.40.15.255; yes, it is inside." The security team isolated that address, and the flood stopped. Afterwards the manager asked the engineer to run the next addressing review.</p><p><b>Lesson:</b> fast, correct subnetting is a visible skill. It is what makes people trust you on a call.</p></div>

<div class="iv"><p class="q">"Give me the network, broadcast and usable range for 192.168.50.100/26, and tell me how you got it."</p><p>Strong answer: "/26 is 255.255.255.192, block size 64 in the fourth octet. Multiples are 0, 64, 128; 100 falls in 64 to 127. Network 192.168.50.64, broadcast .127, usable .65 to .126, 62 hosts." Follow with a practical note, such as the router taking .65 as the gateway, to show you connect maths to real configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nine mask values, powers of two and the block size solve almost every subnet question.</li>
<li>Know the special ranges and classes cold: RFC 1918, APIPA, loopback, A–E.</li>
<li>Design with host and subnet counts, VLSM largest-first and clean summaries.</li>
<li>Verify from both ends: host tools on every OS and router show commands.</li>
<li>Troubleshoot address, mask and gateway before anything else.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module is haalat mein shuru kiya ki mask kya karta hai samjha nahi paate the, aur ab khatam kar rahe ho jab aap dimaag mein subnet kar sakte ho, VLSM se design kar sakte ho, routes summarise kar sakte ho aur ek toote host ko uski apni settings se theek kar sakte ho. Is chapter ko exam se pehle ki raat revision sheet aur job par quick reference ki tarah use karo.</p>

<h3>Poora module ek card par</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Subnetting cheat card">
<rect x="10" y="10" width="620" height="36" rx="6" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Mask octets: 128 192 224 240 248 252 254 255</text>
<rect x="10" y="54" width="620" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">Block size = 256 − interesting octet · subnets multiples par shuru</text>
<rect x="10" y="98" width="620" height="36" rx="6" fill="#fde68a"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">Hosts = 2^h − 2 · Subnets = 2^s · VLSM largest first</text>
<rect x="10" y="142" width="620" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">10/8 · 172.16/12 · 192.168/16 · 169.254/16 APIPA · 127/8 loopback</text>
</svg><p class="cap">Chaar lines jo N10-009 objective 1.7 ke zyada tar questions ka jawab deti hain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main kisi bhi octet ko decimal aur binary ke beech convert kar sakta hoon, aur nau valid mask octets bata sakta hoon.</li>
<li>Main dotted masks aur prefixes ke beech seconds mein convert kar sakta hoon (/20 = 255.255.240.0).</li>
<li>Address aur prefix diya ho to main network, broadcast, pehla aur aakhri usable, aur host count nikaal sakta hoon.</li>
<li>Main host ya subnet requirement se prefix chun sakta hoon aur doosri condition check kar sakta hoon.</li>
<li>Main bina overlap ke largest-first VLSM plan bana sakta hoon.</li>
<li>Main lagatar networks ke set ka sabse tight summary likh sakta hoon aur over-summarisation pakad sakta hoon.</li>
<li>Main RFC 1918, APIPA, loopback, CGNAT, documentation, multicast aur classes A se E classify kar sakta hoon.</li>
<li>Main router interfaces aur hosts configure kar sakta hoon, aur Windows, Linux, macOS aur router par verify kar sakta hoon.</li>
<li>Main symptoms se galat mask, galat gateway, APIPA aur duplicate IP diagnose kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Octet</dt><dd>IPv4 address ke 8 bits, 0 se 255 ke roop mein likhe.</dd>
<dt>Subnet mask / prefix</dt><dd>Network bits mark karta hai; dotted (255.255.255.192) ya CIDR (/26).</dd>
<dt>Network address</dt><dd>Saare host bits 0; subnet ka naam; assign nahi hota.</dd>
<dt>Broadcast address</dt><dd>Saare host bits 1; subnet ke har host tak; assign nahi hota.</dd>
<dt>Block size</dt><dd>256 minus interesting mask octet; subnets ke beech ka step.</dd>
<dt>CIDR</dt><dd>Classless Inter-Domain Routing: koi bhi prefix length, class rules nahi.</dd>
<dt>VLSM</dt><dd>Ek block ke andar alag prefix lengths, zaroorat ke hisaab se size.</dd>
<dt>Summary route</dt><dd>Ek chhota prefix jo kai lagatar subnets cover kare.</dd>
<dt>RFC 1918</dt><dd>Private ranges 10/8, 172.16/12, 192.168/16; internet ke liye NAT chahiye.</dd>
<dt>APIPA</dt><dd>169.254.0.0/16, DHCP fail hone par khud assign; sirf link-local.</dd>
<dt>Loopback</dt><dd>127.0.0.0/8; 127.0.0.1 localhost hai; local stack test karta hai.</dd>
<dt>Proxy ARP</dt><dd>Router doosre subnets ke hosts ke liye ARP ka jawab deta hai; galat mask chhupa sakta hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Usable hosts /30, /29, /28, /27, /26, /25, /24</td><td>2, 6, 14, 30, 62, 126, 254</td></tr>
<tr><td>Class A / B / C pehla octet</td><td>1–126 / 128–191 / 192–223</td></tr>
<tr><td>Class D / E</td><td>224–239 multicast / 240–255 reserved</td></tr>
<tr><td>Private 172 range kahan khatam</td><td>172.31.255.255</td></tr>
<tr><td>APIPA ka matlab</td><td>DHCP tak nahi pahuncha</td></tr>
<tr><td>Local chalta hai, remote fail</td><td>Default gateway</td></tr>
<tr><td>/31 aur /32</td><td>Point-to-point exception; single host route</td></tr>
<tr><td>Lab plan</td><td>Sales .0/26 (R1 .1, PC .62), HR .64/26 (.65, .126), IT .128/26 (.129, .190), growth .192/26 (broadcast .255)</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Router (Cisco-style)</span>
interface GigabitEthernet0/0
 ip address 192.168.50.1 255.255.255.192
 no shutdown
show ip interface brief
show ip route connected
show ip arp
<span class="c">! Lab host shell</span>
ip 192.168.50.62/26 192.168.50.1
show ip
show arp
ping 192.168.50.126
trace 192.168.50.62
<span class="c">! Windows</span>
ipconfig /all
ipconfig /release
ipconfig /renew
<span class="c">! Linux</span>
ip addr
ip route
<span class="c">! macOS</span>
ifconfig en0
route -n get default</pre>

<h3>Final mixed drill</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Answer</th></tr>
<tr><td>192.168.50.64/26 ka broadcast</td><td>192.168.50.127</td></tr>
<tr><td>/27 mein usable hosts</td><td>30</td></tr>
<tr><td>10.40.13.77/21 ka network</td><td>10.40.8.0</td></tr>
<tr><td>500 hosts ke liye sabse chhota prefix</td><td>/23</td></tr>
<tr><td>10.1.4.0/24 – 10.1.7.0/24 ka summary</td><td>10.1.4.0/22</td></tr>
<tr><td>Kya 172.32.5.5 private hai?</td><td>Nahi, private block 172.31 par khatam hota hai</td></tr>
<tr><td>macOS par 0xfffffff0 dikhne wala mask</td><td>255.255.255.240 (/28)</td></tr>
</table>

<div class="warn"><p><b>Aakhri waqt ki galtiyan jinse bachna hai.</b> Hosts par −2 bhoolna; /24 se chhote prefixes par block size ke liye galat octet use karna; VLSM smallest-first allocate karna; 172.16.0.0/16 ko "the" private 172 range chunna; aur APIPA address ke liye DNS ko blame karna.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Exam shuru hote hi nau mask values aur powers of two apne scratch board par likh lo. Har subnet question mein pehle interesting octet aur block size nikaalo; zyada tar galat options turant hat jaate hain. Har mask do baar padho.</p></div>

<div class="scn"><h4>Bridge call par paanch minute</h4><p>Ek outage call ke dauraan manager ne poocha ki kya 10.40.13.77 woh rogue device ho sakta hai jo guest network 10.40.8.0/21 ko flood kar raha hai. Ek junior engineer ne das second mein jawab diya: "/21 matlab teesre octet mein block 8, to guest range 10.40.8.0 se 10.40.15.255 hai; haan, yeh andar hai." Security team ne us address ko isolate kiya, aur flood ruk gaya. Baad mein manager ne agla addressing review usi engineer ko diya.</p><p><b>Seekh:</b> tez aur sahi subnetting ek dikhne wali skill hai. Isi se log call par aap par bharosa karte hain.</p></div>

<div class="iv"><p class="q">"192.168.50.100/26 ka network, broadcast aur usable range batao, aur yeh bhi ki kaise nikaala."</p><p>Strong answer: "/26 matlab 255.255.255.192, chauthe octet mein block size 64. Multiples 0, 64, 128 hain; 100, 64 se 127 mein aata hai. Network 192.168.50.64, broadcast .127, usable .65 se .126, 62 hosts." Uske baad ek practical note do, jaise router .65 ko gateway ki tarah leta hai, taaki dikhe ki aap maths ko real configuration se jodte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nau mask values, powers of two aur block size lagbhag har subnet question solve karte hain.</li>
<li>Special ranges aur classes pakke yaad rakho: RFC 1918, APIPA, loopback, A–E.</li>
<li>Host aur subnet counts, largest-first VLSM aur saaf summaries se design karo.</li>
<li>Dono siron se verify karo: har OS par host tools aur router show commands.</li>
<li>Kisi bhi cheez se pehle address, mask aur gateway troubleshoot karo.</li>
</ul></div>
`}};export{e as default};