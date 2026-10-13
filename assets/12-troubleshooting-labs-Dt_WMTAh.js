var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking both labs`,hi:`Troubleshooting workflow: dono labs walk karna`},body:{en:`
<p>A good doctor does not order every test for every patient. She asks where it hurts, checks the vital signs, and orders the one test that confirms or rules out the likely cause. EIGRP troubleshooting works the same way: a fixed sequence of cheap checks, each one narrowing the field, and debugs only at the end to confirm. In this chapter you walk both labs of the module exactly as you would in the exam or on a real ticket.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="EIGRP troubleshooting flow">
<rect x="200" y="10" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Is the neighbour listed?</text>
<rect x="20" y="80" width="270" height="56" rx="8" fill="#fed7aa"/><text x="155" y="103" text-anchor="middle" class="svg-ink" font-size="12">No: AS, K, subnet, passive,</text><text x="155" y="122" text-anchor="middle" class="svg-ink" font-size="12">network, ACL, auth (key ID)</text>
<rect x="350" y="80" width="270" height="56" rx="8" fill="#fde68a"/><text x="485" y="103" text-anchor="middle" class="svg-ink" font-size="12">Yes but flapping / Q Cnt: one-way</text><text x="485" y="122" text-anchor="middle" class="svg-ink" font-size="12">auth, unicast ACL, MTU, hold time</text>
<line x1="280" y1="50" x2="155" y2="80" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="485" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="166" width="320" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="191" text-anchor="middle" class="svg-ink" font-size="13">Stable: is the prefix in the topology table?</text>
<line x1="485" y1="136" x2="400" y2="166" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="236" width="290" height="50" rx="8" fill="#ddd6fe"/><text x="165" y="257" text-anchor="middle" class="svg-ink" font-size="12">No: sender stub, summary, filter out,</text><text x="165" y="275" text-anchor="middle" class="svg-ink" font-size="12">split horizon, not advertised at source</text>
<rect x="330" y="236" width="290" height="50" rx="8" fill="#e2e8f0"/><text x="475" y="257" text-anchor="middle" class="svg-ink" font-size="12">Yes but not in RIB: AD, filter in;</text><text x="475" y="275" text-anchor="middle" class="svg-ink" font-size="12">in RIB: Null0, ACL, return path</text>
<line x1="280" y1="206" x2="165" y2="236" stroke="#64748b" stroke-width="2"/><line x1="360" y1="206" x2="475" y2="236" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three questions sort almost every EIGRP ticket.</p></div>

<h3>The toolkit</h3>
<table class="cmp"><tr><th>Question</th><th>Command</th></tr>
<tr><td>Who are my neighbours, are they stable?</td><td><code>show ip eigrp neighbors [detail]</code> (uptime, Q Cnt, stub flags)</td></tr>
<tr><td>Which interfaces run EIGRP, with what settings?</td><td><code>show ip eigrp interfaces detail</code> (timers, split horizon, authentication)</td></tr>
<tr><td>AS, K values, networks, passive, filters, stub, variance?</td><td><code>show ip protocols</code></td></tr>
<tr><td>What do I know about this prefix?</td><td><code>show ip eigrp topology PREFIX</code>, <code>all-links</code>, <code>active</code></td></tr>
<tr><td>What did I install?</td><td><code>show ip route eigrp</code>, <code>show ip route PREFIX MASK</code></td></tr>
<tr><td>Keys?</td><td><code>show key chain</code></td></tr>
<tr><td>Confirm with debugs</td><td><code>debug eigrp packets hello</code>, <code>debug eigrp fsm</code>, <code>debug ip eigrp</code> (route events, can be limited to an AS and prefix)</td></tr>
</table>
<p>Named-mode equivalents use <code>show eigrp address-family ipv4 ...</code>. Keep <code>eigrp log-neighbor-changes</code> on (it is by default) so adjacency changes reach the log.</p>

<h3>Walking the lab: Named mode, stub branches and summaries</h3>
<p>This is a configuration lab, but each task has a typical failure:</p>
<ol>
<li><b>SP1 and SP2 in named mode.</b> If <code>show eigrp address-family ipv4 neighbors</code> on HUB is empty, check <code>show eigrp address-family ipv4 interfaces</code> on the branch: if Gi0/0 is missing, it is passive (you forgot <code>no passive-interface</code> under af-interface Gi0/0) or not covered by a network statement. The AS must be 10; the name NK-WAN is only for tidiness.</li>
<li><b>Stubs.</b> On HUB, <code>show eigrp address-family ipv4 neighbors detail</code> must show "Suppressing queries" twice.</li>
<li><b>Summaries.</b> HUB must show only <code>D 10.1.0.0/22</code> and <code>D 10.2.0.0/22</code>. If the /22 is missing but the /24s are gone too, the stub is <code>connected</code> without <code>summary</code>. If the /24s are still there, the summary is on the wrong af-interface or has the wrong mask.</li>
<li><b>The AD question.</b> <code>show ip route 10.1.0.0 255.255.252.0</code> on SP1: distance <b>5</b>, via Null0.</li>
<li><b>Reachability.</b> PCDC pings 10.1.3.1 and 10.2.3.1: traffic follows the /22s.</li>
</ol>

<h3>Walking the lab: Flapping and missing EIGRP neighbours</h3>
<p><b>Step 1: neighbours.</b></p>
<pre class="out">HUB#show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   10.20.2.2               Gi0/1                    13 00:00:52    1  5000  1  0</span></pre>
<p>Only SP2 appears, with RTO 5000, Q Cnt 1 and Seq 0: HUB has never received an acknowledgement. SP1 and SP3 are missing entirely.</p>
<p><b>Step 2: SP2, the one-way neighbour.</b> <code>show ip eigrp interfaces detail</code> on HUB: Gi0/0 and Gi0/2 say <code>Authentication mode is md5, key-chain is "NK-KEYS"</code>, but <b>Gi0/1</b> says <code>Authentication mode is not set</code>. That is the answer to the lab question. Fix: <code>interface GigabitEthernet0/1</code>, <code>ip authentication mode eigrp 10 md5</code>, <code>ip authentication key-chain eigrp 10 NK-KEYS</code>. SP2 stabilises and HUB learns 192.168.2.0/24.</p>
<p><b>Step 3: SP1, the wrong key ID.</b> <code>show key chain</code> on SP1 shows <code>key 2 -- text "Kings@26"</code>; HUB has key 1. Fix on SP1: <code>key chain NK-KEYS</code>, <code>no key 2</code>, <code>key 1</code>, <code>key-string Kings@26</code>.</p>
<p><b>Step 4: SP3, the silent uplink.</b></p>
<pre class="out">SP3#show ip protocols | begin Passive
  Passive Interface(s):
<span class="hl">    GigabitEthernet0/0</span>
    Loopback0
    Loopback1</pre>
<p><code>passive-interface default</code> made the uplink passive. Fix without removing the default: <code>router eigrp 10</code>, <code>no passive-interface GigabitEthernet0/0</code>. The loopbacks stay passive, as the lab requires.</p>
<p><b>Step 5: stubs.</b> <code>eigrp stub</code> on SP1, SP2 and SP3 (default connected summary). HUB's <code>show ip eigrp neighbors detail</code> now shows "Suppressing queries" three times.</p>
<p><b>Step 6: prove it.</b> From SP1, <code>ping 192.168.3.1</code> succeeds: stubs still receive every route from the hub.</p>

<div class="eg"><p><b>Worked example: why fix SP2 first?</b> SP2 was the only neighbour HUB could see, so it was the cheapest proof that the method works. A flapping neighbour also generates log noise and resets that hide other problems. Fix the one-way neighbour, then the ones that are absent.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Removing authentication "to test" (you then fail the requirement); using <code>no passive-interface default</code> on SP3 instead of the single interface; forgetting that stub changes reset adjacencies, so waiting a few seconds before checking; running debugs on a busy production router without <code>logging buffered</code> and a plan to stop them.</p></div>

<div class="exam"><p><b>Exam trap.</b> In a ticket with several broken neighbours, the faults are usually different. Do not assume one fix solves all. RTO 5000 with Seq 0 and a non-zero Q Cnt means reliable packets are never acknowledged; an absent neighbour means Hellos are not accepted at all.</p></div>

<div class="scn"><h4>Three faults, one change window</h4><p>After a security rollout, an ISP's managed-WAN team got a single ticket: "three branches down or unstable". The first engineer spent an hour on SP2's circuit because it was flapping. A second engineer ran the workflow: neighbours (only SP2, Q Cnt 1), interfaces detail (Gi0/1 without authentication), key chains (SP1 using key 2), protocols (SP3 uplink passive). Three different faults, fixed in fifteen minutes, each proven by one command.</p><p><b>Lesson:</b> a structured workflow finds several independent faults quickly, because it checks everything cheaply before diving deep into one.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting an EIGRP neighbour that is not forming."</p><p>Go in order: interface up and in EIGRP (<code>show ip eigrp interfaces</code>), passive and network statements (<code>show ip protocols</code>), AS and K values (<code>show ip protocols</code>), primary subnet, ACLs permitting EIGRP to 224.0.0.10 and unicast, authentication (<code>interfaces detail</code>, <code>show key chain</code>, matching key IDs), then <code>debug eigrp packets hello</code> to confirm. Separate "never forms" from "forms and flaps", and mention the Q Cnt fingerprint.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three questions: is the neighbour there, is it stable, is the prefix in the topology table and the RIB?</li>
<li><code>show ip protocols</code>, <code>show ip eigrp interfaces detail</code> and <code>show key chain</code> solve most neighbour tickets.</li>
<li>The flapping lab has three different faults: one-sided authentication, wrong key ID, passive uplink.</li>
<li>The named-mode lab's usual failures: passive uplink, stub without summary, summary on the wrong interface.</li>
<li>Debugs confirm; they do not replace the workflow.</li>
</ul></div>
`,hi:`
<p>Achhi doctor har patient ke liye har test nahi likhti. Woh poochti hai dard kahan hai, vital signs check karti hai, aur woh ek test likhti hai jo sambhavit wajah ko confirm ya rule out kare. EIGRP troubleshooting bhi aise hi kaam karta hai: saste checks ka ek fixed sequence, har ek field ko chhota karta hua, aur confirm karne ke liye debugs sirf end mein. Is chapter mein aap module ke dono labs bilkul waise walk karte ho jaise exam mein ya real ticket par karoge.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="EIGRP troubleshooting flow">
<rect x="200" y="10" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Kya neighbour list hai?</text>
<rect x="20" y="80" width="270" height="56" rx="8" fill="#fed7aa"/><text x="155" y="103" text-anchor="middle" class="svg-ink" font-size="12">Nahi: AS, K, subnet, passive,</text><text x="155" y="122" text-anchor="middle" class="svg-ink" font-size="12">network, ACL, auth (key ID)</text>
<rect x="350" y="80" width="270" height="56" rx="8" fill="#fde68a"/><text x="485" y="103" text-anchor="middle" class="svg-ink" font-size="12">Haan par flap / Q Cnt: one-way</text><text x="485" y="122" text-anchor="middle" class="svg-ink" font-size="12">auth, unicast ACL, MTU, hold time</text>
<line x1="280" y1="50" x2="155" y2="80" stroke="#64748b" stroke-width="2"/><line x1="360" y1="50" x2="485" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="166" width="320" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="191" text-anchor="middle" class="svg-ink" font-size="13">Stable: kya prefix topology table mein hai?</text>
<line x1="485" y1="136" x2="400" y2="166" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="236" width="290" height="50" rx="8" fill="#ddd6fe"/><text x="165" y="257" text-anchor="middle" class="svg-ink" font-size="12">Nahi: sender stub, summary, filter out,</text><text x="165" y="275" text-anchor="middle" class="svg-ink" font-size="12">split horizon, source par advertise nahi</text>
<rect x="330" y="236" width="290" height="50" rx="8" fill="#e2e8f0"/><text x="475" y="257" text-anchor="middle" class="svg-ink" font-size="12">Haan par RIB mein nahi: AD, filter in;</text><text x="475" y="275" text-anchor="middle" class="svg-ink" font-size="12">RIB mein: Null0, ACL, return path</text>
<line x1="280" y1="206" x2="165" y2="236" stroke="#64748b" stroke-width="2"/><line x1="360" y1="206" x2="475" y2="236" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen sawaal lagbhag har EIGRP ticket ko sort kar dete hain.</p></div>

<h3>Toolkit</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Command</th></tr>
<tr><td>Mere neighbours kaun hain, kya woh stable hain?</td><td><code>show ip eigrp neighbors [detail]</code> (uptime, Q Cnt, stub flags)</td></tr>
<tr><td>Kaunse interfaces EIGRP chalate hain, kin settings ke saath?</td><td><code>show ip eigrp interfaces detail</code> (timers, split horizon, authentication)</td></tr>
<tr><td>AS, K values, networks, passive, filters, stub, variance?</td><td><code>show ip protocols</code></td></tr>
<tr><td>Is prefix ke baare mein mujhe kya pata hai?</td><td><code>show ip eigrp topology PREFIX</code>, <code>all-links</code>, <code>active</code></td></tr>
<tr><td>Maine kya install kiya?</td><td><code>show ip route eigrp</code>, <code>show ip route PREFIX MASK</code></td></tr>
<tr><td>Keys?</td><td><code>show key chain</code></td></tr>
<tr><td>Debugs se confirm karo</td><td><code>debug eigrp packets hello</code>, <code>debug eigrp fsm</code>, <code>debug ip eigrp</code> (route events, ek AS aur prefix tak limit ho sakta hai)</td></tr>
</table>
<p>Named-mode equivalents <code>show eigrp address-family ipv4 ...</code> use karte hain. <code>eigrp log-neighbor-changes</code> on rakho (default on hai) taaki adjacency changes log tak pahunchein.</p>

<h3>Lab walk karna: Named mode, stub branches and summaries</h3>
<p>Yeh configuration lab hai, lekin har task ki ek typical failure hai:</p>
<ol>
<li><b>SP1 aur SP2 named mode mein.</b> Agar HUB par <code>show eigrp address-family ipv4 neighbors</code> khaali hai, branch par <code>show eigrp address-family ipv4 interfaces</code> check karo: agar Gi0/0 missing hai, to woh passive hai (aap af-interface Gi0/0 ke neeche <code>no passive-interface</code> bhool gaye) ya kisi network statement se cover nahi hai. AS 10 hona chahiye; naam NK-WAN sirf saaf-suthrai ke liye hai.</li>
<li><b>Stubs.</b> HUB par <code>show eigrp address-family ipv4 neighbors detail</code> mein do baar "Suppressing queries" dikhna chahiye.</li>
<li><b>Summaries.</b> HUB par sirf <code>D 10.1.0.0/22</code> aur <code>D 10.2.0.0/22</code> dikhne chahiye. Agar /22 missing hai lekin /24s bhi gayab hain, to stub bina <code>summary</code> ke <code>connected</code> hai. Agar /24s ab bhi hain, to summary galat af-interface par hai ya mask galat hai.</li>
<li><b>AD sawaal.</b> SP1 par <code>show ip route 10.1.0.0 255.255.252.0</code>: distance <b>5</b>, Null0 ke through.</li>
<li><b>Reachability.</b> PCDC 10.1.3.1 aur 10.2.3.1 ping karta hai: traffic /22s ko follow karta hai.</li>
</ol>

<h3>Lab walk karna: Flapping and missing EIGRP neighbours</h3>
<p><b>Step 1: neighbours.</b></p>
<pre class="out">HUB#show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   10.20.2.2               Gi0/1                    13 00:00:52    1  5000  1  0</span></pre>
<p>Sirf SP2 dikhta hai, RTO 5000, Q Cnt 1 aur Seq 0 ke saath: HUB ko kabhi acknowledgement nahi mila. SP1 aur SP3 poori tarah missing hain.</p>
<p><b>Step 2: SP2, one-way neighbour.</b> HUB par <code>show ip eigrp interfaces detail</code>: Gi0/0 aur Gi0/2 kehte hain <code>Authentication mode is md5, key-chain is "NK-KEYS"</code>, lekin <b>Gi0/1</b> kehta hai <code>Authentication mode is not set</code>. Yahi lab question ka jawab hai. Fix: <code>interface GigabitEthernet0/1</code>, <code>ip authentication mode eigrp 10 md5</code>, <code>ip authentication key-chain eigrp 10 NK-KEYS</code>. SP2 stable hota hai aur HUB 192.168.2.0/24 seekhta hai.</p>
<p><b>Step 3: SP1, galat key ID.</b> SP1 par <code>show key chain</code> <code>key 2 -- text "Kings@26"</code> dikhata hai; HUB ke paas key 1 hai. SP1 par fix: <code>key chain NK-KEYS</code>, <code>no key 2</code>, <code>key 1</code>, <code>key-string Kings@26</code>.</p>
<p><b>Step 4: SP3, khamosh uplink.</b></p>
<pre class="out">SP3#show ip protocols | begin Passive
  Passive Interface(s):
<span class="hl">    GigabitEthernet0/0</span>
    Loopback0
    Loopback1</pre>
<p><code>passive-interface default</code> ne uplink ko passive bana diya. Default hataye bina fix: <code>router eigrp 10</code>, <code>no passive-interface GigabitEthernet0/0</code>. Loopbacks passive rehte hain, jaisa lab maangta hai.</p>
<p><b>Step 5: stubs.</b> SP1, SP2 aur SP3 par <code>eigrp stub</code> (default connected summary). HUB ka <code>show ip eigrp neighbors detail</code> ab teen baar "Suppressing queries" dikhata hai.</p>
<p><b>Step 6: prove karo.</b> SP1 se <code>ping 192.168.3.1</code> succeed hota hai: stubs ko hub se ab bhi har route milta hai.</p>

<div class="eg"><p><b>Worked example: SP2 pehle kyun theek karein?</b> SP2 hi akela neighbour tha jo HUB dekh sakta tha, isliye yeh sabse sasta saboot tha ki method kaam karta hai. Flap karta neighbour log noise aur resets bhi paida karta hai jo doosri problems chhupa dete hain. Pehle one-way neighbour theek karo, phir jo absent hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "Test karne ke liye" authentication hata dena (phir aap requirement fail karte ho); SP3 par single interface ki jagah <code>no passive-interface default</code> use karna; bhool jaana ki stub changes adjacencies reset karte hain, isliye check karne se pehle kuch second wait karna; busy production router par bina <code>logging buffered</code> aur band karne ke plan ke debugs chalana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Kai toote neighbours wale ticket mein faults aam taur par alag hote hain. Mat maano ki ek fix sab solve kar dega. Seq 0 aur non-zero Q Cnt ke saath RTO 5000 matlab reliable packets ka kabhi acknowledgement nahi aata; absent neighbour matlab Hellos accept hi nahi ho rahe.</p></div>

<div class="scn"><h4>Teen faults, ek change window</h4><p>Ek security rollout ke baad ek ISP ki managed-WAN team ko ek hi ticket mila: "teen branches down ya unstable". Pehle engineer ne ek ghanta SP2 ke circuit par lagaya kyunki woh flap kar raha tha. Doosre engineer ne workflow chalaya: neighbours (sirf SP2, Q Cnt 1), interfaces detail (Gi0/1 bina authentication), key chains (SP1 key 2 use kar raha tha), protocols (SP3 uplink passive). Teen alag faults, pandrah minute mein theek, har ek ek command se prove.</p><p><b>Seekh:</b> structured workflow kai independent faults jaldi dhoondh leta hai, kyunki woh kisi ek mein gehre utarne se pehle sab kuch saste mein check karta hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao, jo EIGRP neighbour nahi ban raha use kaise troubleshoot karoge."</p><p>Order mein chalo: interface up aur EIGRP mein (<code>show ip eigrp interfaces</code>), passive aur network statements (<code>show ip protocols</code>), AS aur K values (<code>show ip protocols</code>), primary subnet, 224.0.0.10 aur unicast par EIGRP permit karti ACLs, authentication (<code>interfaces detail</code>, <code>show key chain</code>, matching key IDs), phir confirm karne ke liye <code>debug eigrp packets hello</code>. "Kabhi nahi banta" ko "banta hai aur flap karta hai" se alag karo, aur Q Cnt fingerprint ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen sawaal: kya neighbour hai, kya woh stable hai, kya prefix topology table aur RIB mein hai?</li>
<li><code>show ip protocols</code>, <code>show ip eigrp interfaces detail</code> aur <code>show key chain</code> zyada tar neighbour tickets solve karte hain.</li>
<li>Flapping lab mein teen alag faults hain: ek side authentication, galat key ID, passive uplink.</li>
<li>Named-mode lab ki usual failures: passive uplink, bina summary ka stub, galat interface par summary.</li>
<li>Debugs confirm karte hain; woh workflow ki jagah nahi lete.</li>
</ul></div>
`}};export{e as default};