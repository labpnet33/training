var e={id:`masks-cidr`,h:{en:`Subnet masks and CIDR prefixes`,hi:`Subnet masks aur CIDR prefixes`},body:{en:`
<p>Think of a stencil laid over a number. The holes show the part the post office must read (the street), and the solid part hides the house number. A <b>subnet mask</b> is that stencil for an IPv4 address. It is also 32 bits long, and its rule is simple: a run of <b>1s</b> from the left marks the network part, then <b>0s</b> to the end mark the host part. The number of 1s is the <b>prefix length</b>, written with a slash: /24, /26, /30.</p>

<h3>Two ways to write the same thing</h3>
<p>255.255.255.192 and /26 are the same mask. The dotted form is the 32 bits split into octets; the slash form simply counts the 1s:</p>
<pre class="out">/26 = 11111111.11111111.11111111.11000000
    =   255   .  255   .  255   .  192</pre>
<p>Where you will see each form: IOS <code>ip address</code> takes the <b>dotted mask</b>; IOS show outputs and routing tables print the <b>prefix</b>; Linux uses the prefix (<code>/25</code>); Windows shows the dotted mask; macOS <code>ifconfig</code> prints it in <b>hex</b> (<code>0xffffff80</code>). A good engineer converts between them without thinking.</p>

<h3>Prefix to mask in three steps</h3>
<ol><li>Divide the prefix by 8. The whole number is how many octets are <b>255</b>.</li>
<li>The remainder is how many 1s go into the next octet; read its value from the "bits on from the left" list: 1=128, 2=192, 3=224, 4=240, 5=248, 6=252, 7=254.</li>
<li>Every octet after that is <b>0</b>.</li></ol>
<div class="eg"><p><b>Worked examples.</b> /21: 21 = 8 + 8 + 5, so 255.255.<b>248</b>.0. /27: 8 + 8 + 8 + 3, so 255.255.255.<b>224</b>. /12: 8 + 4, so 255.<b>240</b>.0.0. /30: 8 + 8 + 8 + 6, so 255.255.255.<b>252</b>. And backwards, 255.255.252.0 = 8 + 8 + 6 + 0 = <b>/22</b>; 255.192.0.0 = 8 + 2 = <b>/10</b>.</p></div>

<h3>The reference table</h3>
<p>You should be able to rebuild this table from scratch in the exam in about a minute. The <b>block size</b> column (256 minus the interesting mask octet) is the key to chapter 6.</p>
<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Interesting octet</th><th>Block size</th></tr>
<tr><td>/8</td><td>255.0.0.0</td><td>-</td><td>1 in octet 1</td></tr>
<tr><td>/16</td><td>255.255.0.0</td><td>-</td><td>1 in octet 2</td></tr>
<tr><td>/19</td><td>255.255.224.0</td><td>3rd</td><td>32</td></tr>
<tr><td>/20</td><td>255.255.240.0</td><td>3rd</td><td>16</td></tr>
<tr><td>/21</td><td>255.255.248.0</td><td>3rd</td><td>8</td></tr>
<tr><td>/22</td><td>255.255.252.0</td><td>3rd</td><td>4</td></tr>
<tr><td>/23</td><td>255.255.254.0</td><td>3rd</td><td>2</td></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>-</td><td>1 in octet 3</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>4th</td><td>128</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>4th</td><td>64</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>4th</td><td>32</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>4th</td><td>16</td></tr>
<tr><td>/29</td><td>255.255.255.248</td><td>4th</td><td>8</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4th</td><td>4</td></tr>
<tr><td>/31</td><td>255.255.255.254</td><td>4th</td><td>2</td></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>4th</td><td>1</td></tr></table>

<h3>Valid and invalid masks</h3>
<p>A mask must be ones then zeros, never mixed. 255.255.255.200 is invalid because 200 = <code>11001000</code>. 255.0.255.0 is invalid because a 0 octet sits between 255s. 255.255.250.0 is invalid because 250 is not in the list. If an exam option shows a mask octet other than 0, 128, 192, 224, 240, 248, 252, 254 or 255, cross it out.</p>

<h3>How a host uses the mask</h3>
<p>Before sending, a host compares its own network with the destination's network. It does a bitwise <b>AND</b> of each address with its own mask (1 AND 1 = 1, anything AND 0 = 0). If the results match, the destination is on the same subnet and the host ARPs for it directly. If not, it ARPs for its <b>default gateway</b> and sends the frame there.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Local or remote decision">
<rect x="20" y="20" width="190" height="56" rx="8" fill="#bbf7d0"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">PCA 192.168.50.126</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">mask /25</text>
<rect x="240" y="20" width="170" height="56" rx="8" fill="#e2e8f0"/><text x="325" y="44" text-anchor="middle" class="svg-ink" font-size="13">own net .0</text><text x="325" y="62" text-anchor="middle" class="svg-muted" font-size="12">dest .190 net .128</text>
<line x1="210" y1="48" x2="240" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="20" width="180" height="56" rx="8" fill="#fde68a"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">different: remote</text><text x="530" y="62" text-anchor="middle" class="svg-muted" font-size="12">ARP for gateway .1</text>
<line x1="410" y1="48" x2="440" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="240" y="120" width="170" height="56" rx="8" fill="#e2e8f0"/><text x="325" y="144" text-anchor="middle" class="svg-ink" font-size="13">dest .20 net .0</text><text x="325" y="162" text-anchor="middle" class="svg-muted" font-size="12">same as own</text>
<line x1="115" y1="76" x2="240" y2="148" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="120" width="180" height="56" rx="8" fill="#bae6fd"/><text x="530" y="144" text-anchor="middle" class="svg-ink" font-size="13">same: local</text><text x="530" y="162" text-anchor="middle" class="svg-muted" font-size="12">ARP for .20 directly</text>
<line x1="410" y1="148" x2="440" y2="148" stroke="#64748b" stroke-width="2"/>
<text x="320" y="206" text-anchor="middle" class="svg-accent" font-size="12">the host always uses ITS OWN mask for both addresses</text>
</svg><p class="cap">PCA from Lab 1 decides local or remote by ANDing both addresses with its /25 mask.</p></div>

<div class="eg"><p><b>Worked example (Lab 1).</b> PCA is 192.168.50.126/25 and pings PCB at 192.168.50.190. Only the fourth octet matters. 126 AND 128: <code>01111110</code> AND <code>10000000</code> = 0. 190 AND 128: <code>10111110</code> AND <code>10000000</code> = 128. Networks .0 and .128 differ, so PCA sends the ping to its gateway 192.168.50.1 (R1).</p></div>

<h3>A first look at the wildcard mask</h3>
<p>ACLs and the OSPF <code>network</code> command use the <b>wildcard mask</b>, the inverse of the subnet mask: subtract each octet from 255. /26 = 255.255.255.192 becomes wildcard 0.0.0.63. In Lab 1 the routers already run <code>network 192.168.50.0 0.0.0.255 area 0</code>, where 0.0.0.255 is the wildcard of a /24. You will use wildcards properly in the OSPF and ACL modules.</p>

<div class="warn"><p><b>Common mistakes.</b> Typing a wildcard where a mask is expected (or the reverse). Typing a prefix in the IOS <code>ip address</code> command: it takes a dotted mask, as in <code>ip address 192.168.50.129 255.255.255.192</code>. And assuming a mask from the class: 10.1.1.1 does not have to be /8.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often give the mask in one form and the answers in the other. Convert first, then calculate. Also note that 255.255.255.255 (/32) is a valid mask for a single host route or loopback, and 0.0.0.0 (/0) is the default route's mask.</p></div>

<div class="scn"><h4>The server nobody in VLAN 5 could reach</h4><p>A server was installed at 10.1.4.20 in VLAN 4 (10.1.4.0/24) and worked for everyone except users in VLAN 5, 10.1.5.0/24. The server admin had typed 255.255.254.0. With a /23 the server believed 10.1.4.0 to 10.1.5.255 was all local, so it ARPed directly for VLAN 5 users instead of sending replies to its gateway. Those ARPs went unanswered because VLAN 5 sits behind the router. The engineer compared the design (/24) with <code>ipconfig</code> output and fixed the mask.</p><p><b>Lesson:</b> a mask that is too short makes a host treat remote hosts as local. Symptoms appear only for some destinations.</p></div>

<div class="iv"><p class="q">"Convert /27 to a dotted mask and explain how a host decides whether a destination is local."</p><p>Strong answer: /27 is 24 ones plus 3 more, 11100000 = 224, so 255.255.255.224. Then describe the AND: the host ANDs its own address and the destination with its own mask; equal results mean same subnet and a direct ARP, different results mean it ARPs for and sends to the default gateway. Mention that the mask never travels in the packet; each device uses its own.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A mask is contiguous 1s then 0s; the prefix length counts the 1s.</li>
<li>Prefix to mask: prefix div 8 gives the 255 octets, the remainder picks 128/192/224/240/248/252/254.</li>
<li>Block size = 256 minus the interesting mask octet.</li>
<li>Hosts AND addresses with their own mask to decide local (ARP directly) or remote (ARP for the gateway).</li>
<li>Wildcard = 255 minus each mask octet; used by ACLs and OSPF, not by <code>ip address</code>.</li>
</ul></div>
`,hi:`
<p>Ek number ke upar rakhi stencil socho. Chhed woh hissa dikhate hain jo post office ko padhna hai (street), aur solid hissa house number chhupata hai. <b>Subnet mask</b> IPv4 address ke liye wahi stencil hai. Yeh bhi 32 bits ka hota hai, aur iska rule simple hai: left se <b>1s</b> ki line network part mark karti hai, phir end tak <b>0s</b> host part mark karte hain. 1s ki ginti <b>prefix length</b> hai, jo slash ke saath likhi jaati hai: /24, /26, /30.</p>

<h3>Ek hi cheez likhne ke do tareeke</h3>
<p>255.255.255.192 aur /26 ek hi mask hain. Dotted form 32 bits ko octets mein baanta hai; slash form bas 1s ginta hai:</p>
<pre class="out">/26 = 11111111.11111111.11111111.11000000
    =   255   .  255   .  255   .  192</pre>
<p>Kaunsa form kahan dikhega: IOS <code>ip address</code> <b>dotted mask</b> leta hai; IOS show outputs aur routing tables <b>prefix</b> print karte hain; Linux prefix use karta hai (<code>/25</code>); Windows dotted mask dikhata hai; macOS <code>ifconfig</code> ise <b>hex</b> mein print karta hai (<code>0xffffff80</code>). Achha engineer bina soche inke beech convert karta hai.</p>

<h3>Prefix se mask, teen steps mein</h3>
<ol><li>Prefix ko 8 se divide karo. Poora number batata hai kitne octets <b>255</b> hain.</li>
<li>Remainder batata hai agle octet mein kitne 1s jaate hain; uski value "left se on bits" list se padho: 1=128, 2=192, 3=224, 4=240, 5=248, 6=252, 7=254.</li>
<li>Uske baad ka har octet <b>0</b> hai.</li></ol>
<div class="eg"><p><b>Worked examples.</b> /21: 21 = 8 + 8 + 5, to 255.255.<b>248</b>.0. /27: 8 + 8 + 8 + 3, to 255.255.255.<b>224</b>. /12: 8 + 4, to 255.<b>240</b>.0.0. /30: 8 + 8 + 8 + 6, to 255.255.255.<b>252</b>. Aur ulta, 255.255.252.0 = 8 + 8 + 6 + 0 = <b>/22</b>; 255.192.0.0 = 8 + 2 = <b>/10</b>.</p></div>

<h3>Reference table</h3>
<p>Exam mein aapko yeh table lagbhag ek minute mein shuru se bana leni chahiye. <b>Block size</b> column (256 minus interesting mask octet) chapter 6 ki chaabi hai.</p>
<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Interesting octet</th><th>Block size</th></tr>
<tr><td>/8</td><td>255.0.0.0</td><td>-</td><td>octet 1 mein 1</td></tr>
<tr><td>/16</td><td>255.255.0.0</td><td>-</td><td>octet 2 mein 1</td></tr>
<tr><td>/19</td><td>255.255.224.0</td><td>3rd</td><td>32</td></tr>
<tr><td>/20</td><td>255.255.240.0</td><td>3rd</td><td>16</td></tr>
<tr><td>/21</td><td>255.255.248.0</td><td>3rd</td><td>8</td></tr>
<tr><td>/22</td><td>255.255.252.0</td><td>3rd</td><td>4</td></tr>
<tr><td>/23</td><td>255.255.254.0</td><td>3rd</td><td>2</td></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>-</td><td>octet 3 mein 1</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>4th</td><td>128</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>4th</td><td>64</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>4th</td><td>32</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>4th</td><td>16</td></tr>
<tr><td>/29</td><td>255.255.255.248</td><td>4th</td><td>8</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4th</td><td>4</td></tr>
<tr><td>/31</td><td>255.255.255.254</td><td>4th</td><td>2</td></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>4th</td><td>1</td></tr></table>

<h3>Valid aur invalid masks</h3>
<p>Mask pehle ones phir zeros hona chahiye, kabhi mixed nahi. 255.255.255.200 invalid hai kyunki 200 = <code>11001000</code>. 255.0.255.0 invalid hai kyunki 255s ke beech 0 octet baitha hai. 255.255.250.0 invalid hai kyunki 250 list mein nahi hai. Agar exam option mein 0, 128, 192, 224, 240, 248, 252, 254 ya 255 ke alawa koi mask octet dikhe, use kaat do.</p>

<h3>Host mask ko kaise use karta hai</h3>
<p>Bhejne se pehle host apne network ko destination ke network se compare karta hai. Woh har address ka apne mask ke saath bitwise <b>AND</b> karta hai (1 AND 1 = 1, kuch bhi AND 0 = 0). Agar results match karein, destination same subnet par hai aur host uske liye seedha ARP karta hai. Agar nahi, woh apne <b>default gateway</b> ke liye ARP karta hai aur frame wahan bhejta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Local ya remote decision">
<rect x="20" y="20" width="190" height="56" rx="8" fill="#bbf7d0"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">PCA 192.168.50.126</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">mask /25</text>
<rect x="240" y="20" width="170" height="56" rx="8" fill="#e2e8f0"/><text x="325" y="44" text-anchor="middle" class="svg-ink" font-size="13">apna net .0</text><text x="325" y="62" text-anchor="middle" class="svg-muted" font-size="12">dest .190 net .128</text>
<line x1="210" y1="48" x2="240" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="20" width="180" height="56" rx="8" fill="#fde68a"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">alag: remote</text><text x="530" y="62" text-anchor="middle" class="svg-muted" font-size="12">gateway .1 ke liye ARP</text>
<line x1="410" y1="48" x2="440" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="240" y="120" width="170" height="56" rx="8" fill="#e2e8f0"/><text x="325" y="144" text-anchor="middle" class="svg-ink" font-size="13">dest .20 net .0</text><text x="325" y="162" text-anchor="middle" class="svg-muted" font-size="12">apne jaisa</text>
<line x1="115" y1="76" x2="240" y2="148" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="120" width="180" height="56" rx="8" fill="#bae6fd"/><text x="530" y="144" text-anchor="middle" class="svg-ink" font-size="13">same: local</text><text x="530" y="162" text-anchor="middle" class="svg-muted" font-size="12">.20 ke liye seedha ARP</text>
<line x1="410" y1="148" x2="440" y2="148" stroke="#64748b" stroke-width="2"/>
<text x="320" y="206" text-anchor="middle" class="svg-accent" font-size="12">host dono addresses ke liye hamesha APNA mask use karta hai</text>
</svg><p class="cap">Lab 1 ka PCA dono addresses ko apne /25 mask se AND karke local ya remote decide karta hai.</p></div>

<div class="eg"><p><b>Worked example (Lab 1).</b> PCA 192.168.50.126/25 hai aur PCB ko 192.168.50.190 par ping karta hai. Sirf fourth octet matter karta hai. 126 AND 128: <code>01111110</code> AND <code>10000000</code> = 0. 190 AND 128: <code>10111110</code> AND <code>10000000</code> = 128. Networks .0 aur .128 alag hain, isliye PCA ping ko apne gateway 192.168.50.1 (R1) par bhejta hai.</p></div>

<h3>Wildcard mask par pehli nazar</h3>
<p>ACLs aur OSPF <code>network</code> command <b>wildcard mask</b> use karte hain, jo subnet mask ka ulta hai: har octet ko 255 se ghatao. /26 = 255.255.255.192 wildcard 0.0.0.63 ban jaata hai. Lab 1 mein routers pehle se <code>network 192.168.50.0 0.0.0.255 area 0</code> chala rahe hain, jahan 0.0.0.255 ek /24 ka wildcard hai. Wildcards ko aap OSPF aur ACL modules mein theek se use karoge.</p>

<div class="warn"><p><b>Common galtiyan.</b> Jahan mask chahiye wahan wildcard type karna (ya ulta). IOS <code>ip address</code> command mein prefix type karna: yeh dotted mask leta hai, jaise <code>ip address 192.168.50.129 255.255.255.192</code>. Aur class se mask maan lena: 10.1.1.1 ka /8 hona zaroori nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions aksar mask ek form mein dete hain aur answers doosre form mein. Pehle convert karo, phir calculate karo. Yeh bhi note karo ki 255.255.255.255 (/32) single host route ya loopback ke liye valid mask hai, aur 0.0.0.0 (/0) default route ka mask hai.</p></div>

<div class="scn"><h4>Woh server jis tak VLAN 5 mein koi nahi pahunch pata tha</h4><p>Ek server VLAN 4 (10.1.4.0/24) mein 10.1.4.20 par install hua aur VLAN 5, 10.1.5.0/24, ke users ko chhodkar sabke liye kaam karta tha. Server admin ne 255.255.254.0 type kiya tha. /23 ke saath server 10.1.4.0 se 10.1.5.255 tak sab local samajhta tha, isliye replies gateway ko bhejne ki jagah VLAN 5 users ke liye seedha ARP karta tha. Un ARPs ka jawab nahi aaya kyunki VLAN 5 router ke peeche hai. Engineer ne design (/24) ko <code>ipconfig</code> output se compare kiya aur mask fix kiya.</p><p><b>Seekh:</b> bahut chhota mask host se remote hosts ko local samjhwata hai. Symptoms sirf kuch destinations ke liye dikhte hain.</p></div>

<div class="iv"><p class="q">"/27 ko dotted mask mein convert karo aur batao host kaise decide karta hai ki destination local hai."</p><p>Strong answer: /27 matlab 24 ones plus 3 aur, 11100000 = 224, to 255.255.255.224. Phir AND samjhao: host apne address aur destination dono ko apne mask se AND karta hai; barabar results matlab same subnet aur seedha ARP, alag results matlab woh default gateway ke liye ARP karke use bhejta hai. Batao ki mask packet mein kabhi travel nahi karta; har device apna use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mask lagataar 1s phir 0s hota hai; prefix length 1s ginti hai.</li>
<li>Prefix se mask: prefix div 8 se 255 octets milte hain, remainder 128/192/224/240/248/252/254 chunta hai.</li>
<li>Block size = 256 minus interesting mask octet.</li>
<li>Hosts addresses ko apne mask se AND karke local (seedha ARP) ya remote (gateway ke liye ARP) decide karte hain.</li>
<li>Wildcard = 255 minus har mask octet; ACLs aur OSPF use karte hain, <code>ip address</code> nahi.</li>
</ul></div>
`}};export{e as default};