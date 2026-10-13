var e={id:`masks`,h:{en:`Subnet masks, prefixes and CIDR: how a host decides local or remote`,hi:`Subnet masks, prefixes aur CIDR: host local ya remote kaise tay karta hai`},body:{en:`
<p>The mask is the most important number on any host, and the one people copy without understanding. In this chapter you learn to read a mask in both of its forms, convert between them in seconds, and see exactly how a host uses it to make the one decision that matters: deliver directly, or hand to the gateway.</p>

<h3>An analogy: the stencil over the address</h3>
<p>Imagine laying a stencil over the 32 bits of an address. Where the stencil has a <b>1</b>, it lets the bit show through: that part is the <b>network</b>. Where it has a <b>0</b>, it blocks the bit: that part is the <b>host</b>, and it does not matter for deciding "which network". The stencil is the subnet mask. Because a mask is always 1s followed by 0s, you can describe it just by counting the 1s. That count is the <b>prefix length</b>.</p>

<h3>Two ways to write the same mask</h3>
<p><b>Dotted decimal</b>: 255.255.255.192. <b>Prefix length</b> (CIDR notation): /26, meaning 26 ones. CIDR, <b>Classless Inter-Domain Routing</b>, replaced classful addressing in 1993 so that any prefix length can be used, not just /8, /16 and /24. Cisco-style routers take the dotted form in <code>ip address</code>; Linux shows and accepts the prefix form; Windows shows "Subnet Mask" in dotted decimal. You must be fluent in both.</p>

<h3>Converting in seconds</h3>
<p>Each full octet of 1s is 8 bits (255). Divide the prefix into eights, then take the remainder from the nine-value list in chapter 2.</p>
<div class="eg"><p><b>/20</b> = 8 + 8 + 4 → 255.255.<b>240</b>.0 (four bits on = 240).<br/><b>/27</b> = 8 + 8 + 8 + 3 → 255.255.255.<b>224</b>.<br/><b>255.255.252.0</b> → 8 + 8 + 6 (252 = six bits) = <b>/22</b>.<br/><b>255.240.0.0</b> → 8 + 4 = <b>/12</b>, the size of the 172.16.0.0/12 private block.</p></div>

<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Prefix</th><th>Mask</th></tr>
<tr><td>/8</td><td>255.0.0.0</td><td>/24</td><td>255.255.255.0</td></tr>
<tr><td>/16</td><td>255.255.0.0</td><td>/25</td><td>255.255.255.128</td></tr>
<tr><td>/17</td><td>255.255.128.0</td><td>/26</td><td>255.255.255.192</td></tr>
<tr><td>/18</td><td>255.255.192.0</td><td>/27</td><td>255.255.255.224</td></tr>
<tr><td>/19</td><td>255.255.224.0</td><td>/28</td><td>255.255.255.240</td></tr>
<tr><td>/20</td><td>255.255.240.0</td><td>/29</td><td>255.255.255.248</td></tr>
<tr><td>/21</td><td>255.255.248.0</td><td>/30</td><td>255.255.255.252</td></tr>
<tr><td>/22</td><td>255.255.252.0</td><td>/31</td><td>255.255.255.254</td></tr>
<tr><td>/23</td><td>255.255.254.0</td><td>/32</td><td>255.255.255.255</td></tr>
</table>

<h3>Finding the network: the AND operation</h3>
<p>To find which network an address belongs to, a device performs a bitwise <b>AND</b> of address and mask: 1 AND 1 = 1, anything AND 0 = 0. In practice only the octet where the mask is neither 255 nor 0 (the <b>interesting octet</b>) needs work: a 255 octet copies the address, a 0 octet becomes 0.</p>
<div class="eg"><p><b>Worked example: 192.168.50.100/26.</b> The interesting octet is the fourth (mask 192).<br/>100 = <code>01100100</code><br/>192 = <code>11000000</code><br/>AND = <code>01000000</code> = 64.<br/>Network: <b>192.168.50.64/26</b>. So .100 is in the HR subnet of our branch.</p></div>

<h3>How a host decides: local or remote</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Local or remote decision">
<rect x="200" y="10" width="240" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Packet for destination D</text>
<line x1="320" y1="50" x2="320" y2="72" stroke="#64748b"/>
<rect x="150" y="72" width="340" height="44" rx="8" fill="#fde68a"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="13">My IP AND my mask = D AND my mask ?</text>
<line x1="250" y1="116" x2="130" y2="150" stroke="#64748b"/><line x1="390" y1="116" x2="510" y2="150" stroke="#64748b"/>
<text x="170" y="140" class="svg-accent" font-size="12">yes</text><text x="455" y="140" class="svg-accent" font-size="12">no</text>
<rect x="20" y="150" width="220" height="50" rx="8" fill="#bbf7d0"/><text x="130" y="172" text-anchor="middle" class="svg-ink" font-size="13">Local: ARP for D</text><text x="130" y="190" text-anchor="middle" class="svg-muted" font-size="12">send straight to D</text>
<rect x="400" y="150" width="220" height="50" rx="8" fill="#bae6fd"/><text x="510" y="172" text-anchor="middle" class="svg-ink" font-size="13">Remote: ARP for gateway</text><text x="510" y="190" text-anchor="middle" class="svg-muted" font-size="12">send frame to router</text>
</svg><p class="cap">The host always uses its own mask. The router's mask plays no part in this decision.</p></div>
<p>PC-SALES is 192.168.50.62/26. It wants to reach PC-HR at 192.168.50.126. 62 AND 192 = 0; 126 AND 192 = 64. Different networks (.0 versus .64), so the destination is <b>remote</b>: PC-SALES ARPs for its gateway 192.168.50.1 and sends the packet to R1. Now give PC-SALES a wrong /16 mask: both addresses AND to 192.168.0.0, so it believes PC-HR is <b>local</b> and ARPs for 192.168.50.126 directly on the Sales link, where PC-HR is not. That is the first fault in the troubleshooting lab; chapter 11 shows why it sometimes appears to work anyway.</p>

<h3>A look ahead: the wildcard mask</h3>
<p>ACLs and OSPF on Cisco-style devices use the <b>wildcard mask</b>, the inverse of the subnet mask: subtract each octet from 255. /26 (255.255.255.192) becomes 0.0.0.63. You will use it in the routing and security modules.</p>

<h3>Drills</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>/19 as a mask</td><td>255.255.224.0</td></tr>
<tr><td>255.255.255.248 as a prefix</td><td>/29</td></tr>
<tr><td>Network of 10.20.130.7/12</td><td>10.16.0.0 (octet 2: 20 AND 240 = 16; the later octets become 0)</td></tr>
<tr><td>Is 192.168.50.70 local to 192.168.50.62/26?</td><td>No: 70 AND 192 = 64, 62 AND 192 = 0</td></tr>
<tr><td>Wildcard for 255.255.240.0</td><td>0.0.15.255</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Converting /20 as 255.255.255.240 (that is /28): count the eights first. And assuming the router's mask protects a host with a wrong mask; it does not, because each host decides with its own.</p></div>

<div class="exam"><p><b>Exam trap.</b> A question may show the same address with two masks in different forms, for example a host on 255.255.255.0 and the gateway on /23. Convert both to the same form before comparing, and remember that a mismatch between host and router masks is itself a fault.</p></div>

<div class="scn"><h4>The monitoring server that lost one server</h4><p>A Linux server was built as 10.20.30.40/28 instead of /24. At boot the default route failed with <code>Error: Nexthop has invalid gateway.</code> because 10.20.30.1 lies outside 10.20.30.32/28. The monitoring server at 10.20.30.200, in the same VLAN, marked it down. The engineer ran <code>ip addr</code>, saw <code>inet 10.20.30.40/28</code>, compared it with the VLAN's /24 plan, corrected the prefix and re-added the default route. Everything turned green.</p><p><b>Lesson:</b> the mask decides who is local and whether the gateway is even reachable. Check it first.</p></div>

<div class="iv"><p class="q">"Walk me through how a host decides whether to use its default gateway."</p><p>Strong answer: the host ANDs its own address with its own mask and the destination with the same mask. If the results match, the destination is on-link, so it ARPs for the destination. If not, it ARPs for the default gateway and sends the frame there, with the destination IP unchanged. Stress that only the host's mask matters, so a wrong mask on one host breaks that host even when the router is perfect.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A mask is contiguous 1s then 0s; the prefix length counts the 1s (CIDR notation).</li>
<li>Convert by counting eights, then pick the remainder from 128/192/224/240/248/252/254.</li>
<li>Network address = address AND mask; only the interesting octet needs real work.</li>
<li>Same network after AND → local, ARP for the destination; different → ARP for the gateway.</li>
<li>Wildcard mask = 255 minus each mask octet (/26 → 0.0.0.63).</li>
</ul></div>
`,hi:`
<p>Mask kisi bhi host ka sabse important number hai, aur wahi jise log bina samjhe copy karte hain. Is chapter mein aap mask ko uske dono forms mein padhna seekhoge, seconds mein ek se doosre mein convert karoge, aur dekhoge ki host iska use us ek decision ke liye kaise karta hai jo matter karta hai: seedha deliver karo, ya gateway ko do.</p>

<h3>Ek analogy: address ke upar stencil</h3>
<p>Socho address ke 32 bits ke upar ek stencil rakha hai. Jahan stencil mein <b>1</b> hai, woh bit ko dikhne deta hai: woh hissa <b>network</b> hai. Jahan <b>0</b> hai, woh bit ko dhak deta hai: woh hissa <b>host</b> hai, aur "kaunsa network" tay karne mein uska koi role nahi. Yeh stencil subnet mask hai. Kyunki mask hamesha 1s ke baad 0s hota hai, aap use sirf 1s gin kar describe kar sakte ho. Woh ginti <b>prefix length</b> hai.</p>

<h3>Ek hi mask likhne ke do tareeke</h3>
<p><b>Dotted decimal</b>: 255.255.255.192. <b>Prefix length</b> (CIDR notation): /26, yaani 26 ones. CIDR, <b>Classless Inter-Domain Routing</b>, ne 1993 mein classful addressing ki jagah li taaki koi bhi prefix length use ho sake, sirf /8, /16 aur /24 nahi. Cisco-style routers <code>ip address</code> mein dotted form lete hain; Linux prefix form dikhata aur leta hai; Windows "Subnet Mask" dotted decimal mein dikhata hai. Aapko dono mein fluent hona hai.</p>

<h3>Seconds mein convert karna</h3>
<p>1s ka har poora octet 8 bits (255) hai. Prefix ko aath-aath mein baanto, phir baaki bache bits chapter 2 ki nau-value list se lo.</p>
<div class="eg"><p><b>/20</b> = 8 + 8 + 4 → 255.255.<b>240</b>.0 (chaar bits on = 240).<br/><b>/27</b> = 8 + 8 + 8 + 3 → 255.255.255.<b>224</b>.<br/><b>255.255.252.0</b> → 8 + 8 + 6 (252 = chhe bits) = <b>/22</b>.<br/><b>255.240.0.0</b> → 8 + 4 = <b>/12</b>, jo 172.16.0.0/12 private block ka size hai.</p></div>

<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Prefix</th><th>Mask</th></tr>
<tr><td>/8</td><td>255.0.0.0</td><td>/24</td><td>255.255.255.0</td></tr>
<tr><td>/16</td><td>255.255.0.0</td><td>/25</td><td>255.255.255.128</td></tr>
<tr><td>/17</td><td>255.255.128.0</td><td>/26</td><td>255.255.255.192</td></tr>
<tr><td>/18</td><td>255.255.192.0</td><td>/27</td><td>255.255.255.224</td></tr>
<tr><td>/19</td><td>255.255.224.0</td><td>/28</td><td>255.255.255.240</td></tr>
<tr><td>/20</td><td>255.255.240.0</td><td>/29</td><td>255.255.255.248</td></tr>
<tr><td>/21</td><td>255.255.248.0</td><td>/30</td><td>255.255.255.252</td></tr>
<tr><td>/22</td><td>255.255.252.0</td><td>/31</td><td>255.255.255.254</td></tr>
<tr><td>/23</td><td>255.255.254.0</td><td>/32</td><td>255.255.255.255</td></tr>
</table>

<h3>Network nikaalna: AND operation</h3>
<p>Address kis network ka hai yeh jaanne ke liye device address aur mask ka bitwise <b>AND</b> karta hai: 1 AND 1 = 1, kuch bhi AND 0 = 0. Practically sirf woh octet kaam maangta hai jahan mask na 255 hai na 0 (<b>interesting octet</b>): 255 wala octet address copy karta hai, 0 wala octet 0 ban jaata hai.</p>
<div class="eg"><p><b>Worked example: 192.168.50.100/26.</b> Interesting octet chautha hai (mask 192).<br/>100 = <code>01100100</code><br/>192 = <code>11000000</code><br/>AND = <code>01000000</code> = 64.<br/>Network: <b>192.168.50.64/26</b>. Yaani .100 hamari branch ke HR subnet mein hai.</p></div>

<h3>Host kaise tay karta hai: local ya remote</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Local ya remote decision">
<rect x="200" y="10" width="240" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Destination D ke liye packet</text>
<line x1="320" y1="50" x2="320" y2="72" stroke="#64748b"/>
<rect x="150" y="72" width="340" height="44" rx="8" fill="#fde68a"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="13">Mera IP AND mera mask = D AND mera mask ?</text>
<line x1="250" y1="116" x2="130" y2="150" stroke="#64748b"/><line x1="390" y1="116" x2="510" y2="150" stroke="#64748b"/>
<text x="170" y="140" class="svg-accent" font-size="12">haan</text><text x="455" y="140" class="svg-accent" font-size="12">nahi</text>
<rect x="20" y="150" width="220" height="50" rx="8" fill="#bbf7d0"/><text x="130" y="172" text-anchor="middle" class="svg-ink" font-size="13">Local: D ke liye ARP</text><text x="130" y="190" text-anchor="middle" class="svg-muted" font-size="12">seedha D ko bhejo</text>
<rect x="400" y="150" width="220" height="50" rx="8" fill="#bae6fd"/><text x="510" y="172" text-anchor="middle" class="svg-ink" font-size="13">Remote: gateway ke liye ARP</text><text x="510" y="190" text-anchor="middle" class="svg-muted" font-size="12">frame router ko bhejo</text>
</svg><p class="cap">Host hamesha apna mask use karta hai. Is decision mein router ke mask ka koi role nahi.</p></div>
<p>PC-SALES 192.168.50.62/26 hai. Use PC-HR, 192.168.50.126, tak pahunchna hai. 62 AND 192 = 0; 126 AND 192 = 64. Alag networks (.0 aur .64), isliye destination <b>remote</b> hai: PC-SALES apne gateway 192.168.50.1 ke liye ARP karta hai aur packet R1 ko bhejta hai. Ab PC-SALES ko galat /16 mask do: dono addresses AND hokar 192.168.0.0 bante hain, to woh maanta hai ki PC-HR <b>local</b> hai aur Sales link par seedha 192.168.50.126 ke liye ARP karta hai, jahan PC-HR hai hi nahi. Yahi troubleshooting lab ka pehla fault hai; chapter 11 dikhata hai ki yeh kabhi kabhi phir bhi kaam karta kyun dikhta hai.</p>

<h3>Aage ki jhalak: wildcard mask</h3>
<p>Cisco-style devices par ACLs aur OSPF <b>wildcard mask</b> use karte hain, jo subnet mask ka ulta hai: har octet ko 255 se minus karo. /26 (255.255.255.192) 0.0.0.63 ban jaata hai. Aap ise routing aur security modules mein use karoge.</p>

<h3>Drills</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Answer</th></tr>
<tr><td>/19 mask ke roop mein</td><td>255.255.224.0</td></tr>
<tr><td>255.255.255.248 prefix ke roop mein</td><td>/29</td></tr>
<tr><td>10.20.130.7/12 ka network</td><td>10.16.0.0 (octet 2: 20 AND 240 = 16; baaki octets 0)</td></tr>
<tr><td>Kya 192.168.50.70, 192.168.50.62/26 ke liye local hai?</td><td>Nahi: 70 AND 192 = 64, 62 AND 192 = 0</td></tr>
<tr><td>255.255.240.0 ka wildcard</td><td>0.0.15.255</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> /20 ko 255.255.255.240 convert karna (woh /28 hai): pehle aath-aath gino. Aur yeh maan lena ki router ka mask galat mask wale host ko bacha lega; nahi bachata, kyunki har host apne mask se decide karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Question ek hi address ko do masks ke saath alag forms mein dikha sakta hai, jaise host 255.255.255.0 par aur gateway /23 par. Compare karne se pehle dono ko ek form mein badlo, aur yaad rakho ki host aur router ke masks ka mismatch khud ek fault hai.</p></div>

<div class="scn"><h4>Monitoring server jisne ek server kho diya</h4><p>Ek Linux server /24 ki jagah 10.20.30.40/28 ke saath bana. Boot par default route <code>Error: Nexthop has invalid gateway.</code> ke saath fail hua kyunki 10.20.30.1, 10.20.30.32/28 ke bahar hai. Usi VLAN mein 10.20.30.200 par monitoring server ne use down mark kar diya. Engineer ne <code>ip addr</code> chalaya, <code>inet 10.20.30.40/28</code> dekha, VLAN ke /24 plan se milaya, prefix theek kiya aur default route dobara add kiya. Sab green ho gaya.</p><p><b>Seekh:</b> mask tay karta hai ki local kaun hai aur gateway pahunch mein hai bhi ya nahi. Pehle use check karo.</p></div>

<div class="iv"><p class="q">"Mujhe samjhao ki host kaise tay karta hai ki default gateway use karna hai ya nahi."</p><p>Strong answer: host apne address ko apne mask se AND karta hai aur destination ko bhi usi mask se. Results match karein to destination on-link hai, to woh destination ke liye ARP karta hai. Match na karein to woh default gateway ke liye ARP karta hai aur frame wahan bhejta hai, destination IP wahi rehta hai. Zor do ki sirf host ka mask matter karta hai, isliye ek host par galat mask us host ko tod deta hai chahe router perfect ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mask lagatar 1s phir 0s hota hai; prefix length 1s ginta hai (CIDR notation).</li>
<li>Aath-aath gin kar convert karo, phir baaki 128/192/224/240/248/252/254 se chuno.</li>
<li>Network address = address AND mask; sirf interesting octet mein asli kaam hai.</li>
<li>AND ke baad same network → local, destination ke liye ARP; alag → gateway ke liye ARP.</li>
<li>Wildcard mask = 255 minus har mask octet (/26 → 0.0.0.63).</li>
</ul></div>
`}};export{e as default};