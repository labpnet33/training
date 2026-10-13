var e={id:`sizing`,h:{en:`Sizing a fabric: ports, oversubscription and scale`,hi:`Fabric ko size karna: ports, oversubscription aur scale`},body:{en:`
<p>A stadium architect counts two numbers before anything else: how many seats, and how many people can leave through the exits per minute. If there are 50,000 seats but exits for only 5,000 people a minute, the stadium empties slowly, and that is acceptable because people do not all leave in the same second. A fabric designer does the same maths with ports and bandwidth. In this chapter you will learn to size a spine-leaf fabric with real numbers.</p>

<h3>Downlinks, uplinks and oversubscription</h3>
<dl class="terms">
<dt>Downlinks</dt><dd>Leaf ports facing servers, storage or services.</dd>
<dt>Uplinks</dt><dd>Leaf ports facing the spines.</dd>
<dt>Oversubscription ratio</dt><dd>Total downlink bandwidth ÷ total uplink bandwidth on a leaf, written as X:1.</dd>
<dt>Non-blocking</dt><dd>1:1. Every server can send at full rate across the fabric at the same moment.</dd>
</dl>
<p>Oversubscription is not a mistake. Servers rarely all transmit at line rate together, so a moderate ratio saves a lot of money. The question is how much, for which workload.</p>
<table class="cmp"><tr><th>Workload</th><th>Typical leaf ratio</th></tr>
<tr><td>General virtualised compute, web, enterprise apps</td><td>3:1 to 2:1</td></tr>
<tr><td>Big data, IP storage, busy databases</td><td>2:1 to 1.5:1</td></tr>
<tr><td>AI/ML training, HPC, storage back-end</td><td>1:1 (non-blocking)</td></tr></table>

<h3>Worked calculations</h3>
<div class="eg"><p><b>Example 1: the classic 25G leaf.</b> 48 × 25G down, 6 × 100G up. Down = 1,200G; up = 600G. Ratio = 1200 ÷ 600 = <b>2:1</b>.</p>
<p><b>Example 2: an older 10G leaf.</b> 48 × 10G down, 4 × 40G up. Down = 480G; up = 160G. Ratio = <b>3:1</b>.</p>
<p><b>Example 3: working backwards.</b> Target 3:1 with 48 × 25G servers and 100G uplinks. Required uplink = 1,200 ÷ 3 = 400G, so <b>4 × 100G</b> uplinks, which also means up to 4 spines.</p>
<p><b>Example 4: non-blocking for AI.</b> A leaf has 32 × 400G ports. Break 16 of them out into 4 × 100G each: 64 × 100G server ports = 6,400G. The other 16 × 400G = 6,400G go to the spines. Ratio = <b>1:1</b>.</p>
<p><b>Example 5: plan for failure (N-1).</b> Example 3 with four spines is 3:1. If one spine fails, uplink drops to 300G: 1,200 ÷ 300 = <b>4:1</b>. If the business cannot accept 4:1 during a failure, design for 2:1 or add a fifth spine.</p></div>

<h3>Uplinks limit spines, spine ports limit leaves</h3>
<p>Two hardware facts set the shape of the fabric:</p>
<ul>
<li><b>The number of leaf uplink ports caps the number of spines.</b> A leaf with 6 uplinks can reach at most 6 spines with one link each, or 3 spines with two links each. Most designs use 2, 4 or 6 spines.</li>
<li><b>The number of spine ports caps the number of leaves.</b> Each leaf uses one port on every spine. A fixed spine with 64 × 100G ports supports up to 64 leaves. A modular spine chassis with 8 line cards of 36 × 100G ports supports up to 288.</li>
</ul>
<div class="eg"><p><b>Example 6: how big can this fabric grow?</b> Spines: 4 fixed switches with 64 × 100G. Leaves: 48 × 25G down, 4 of the 6 uplinks used (one per spine).</p>
<p>Max leaves = 64 (spine port count). Reserve 2 border leaves and 2 service leaves: 60 server leaves × 48 = <b>2,880 server ports</b>. Servers dual-homed to a leaf pair use 2 ports each: about <b>1,440 servers</b>. Ratio per leaf = 1,200 ÷ 400 = 3:1. Growth path: add spines 5 and 6 using the two spare uplinks to reach 2:1.</p></div>

<h3>Beyond one spine layer: the 5-stage Clos</h3>
<p>When you need more leaves than your spines have ports, add another layer. Build several <b>pods</b>, each a normal spine-leaf fabric, and connect every pod spine to a layer of <b>super-spines</b>. The path between pods becomes leaf, spine, super-spine, spine, leaf: five stages, still equal for every pair of pods. Hyperscale operators build this way.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Five-stage Clos with super-spines">
<rect x="180" y="10" width="120" height="32" rx="6" fill="#fed7aa"/><text x="240" y="31" text-anchor="middle" class="svg-ink" font-size="12">Super-spine 1</text>
<rect x="340" y="10" width="120" height="32" rx="6" fill="#fed7aa"/><text x="400" y="31" text-anchor="middle" class="svg-ink" font-size="12">Super-spine 2</text>
<rect x="40" y="95" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="90" y="116" text-anchor="middle" class="svg-ink" font-size="12">Pod1 Spine1</text>
<rect x="160" y="95" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="210" y="116" text-anchor="middle" class="svg-ink" font-size="12">Pod1 Spine2</text>
<rect x="380" y="95" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="430" y="116" text-anchor="middle" class="svg-ink" font-size="12">Pod2 Spine1</text>
<rect x="500" y="95" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="550" y="116" text-anchor="middle" class="svg-ink" font-size="12">Pod2 Spine2</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="240" y1="42" x2="90" y2="95"/><line x1="240" y1="42" x2="210" y2="95"/><line x1="240" y1="42" x2="430" y2="95"/><line x1="240" y1="42" x2="550" y2="95"/><line x1="400" y1="42" x2="90" y2="95"/><line x1="400" y1="42" x2="210" y2="95"/><line x1="400" y1="42" x2="430" y2="95"/><line x1="400" y1="42" x2="550" y2="95"/></g>
<rect x="40" y="180" width="100" height="30" rx="6" fill="#bae6fd"/><text x="90" y="200" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="160" y="180" width="100" height="30" rx="6" fill="#bae6fd"/><text x="210" y="200" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="380" y="180" width="100" height="30" rx="6" fill="#bae6fd"/><text x="430" y="200" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="500" y="180" width="100" height="30" rx="6" fill="#bae6fd"/><text x="550" y="200" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="90" y1="127" x2="90" y2="180"/><line x1="90" y1="127" x2="210" y2="180"/><line x1="210" y1="127" x2="90" y2="180"/><line x1="210" y1="127" x2="210" y2="180"/><line x1="430" y1="127" x2="430" y2="180"/><line x1="430" y1="127" x2="550" y2="180"/><line x1="550" y1="127" x2="430" y2="180"/><line x1="550" y1="127" x2="550" y2="180"/></g>
<text x="150" y="226" text-anchor="middle" class="svg-muted" font-size="12">Pod 1</text><text x="490" y="226" text-anchor="middle" class="svg-muted" font-size="12">Pod 2</text>
</svg><p class="cap">A 5-stage Clos: each pod is a normal spine-leaf; super-spines join the pods.</p></div>

<h3>Multi-pod and multi-site (preview)</h3>
<p>Sometimes pods sit in different rooms or buildings. Cisco offers two families of designs you will study later. In <b>ACI Multi-Pod</b>, several pods share one APIC controller cluster and connect through an <b>Inter-Pod Network (IPN)</b>. In <b>ACI Multi-Site</b> and <b>VXLAN EVPN Multi-Site</b>, independent fabrics (often in different cities) are joined by an orchestrator or by <b>border gateways</b>, keeping each site its own failure domain. For now, remember the idea: one fabric per failure domain, joined by a controlled interconnect.</p>

<h3>Special leaves</h3>
<ul>
<li><b>Border leaf.</b> Connects the fabric to the outside: WAN routers, internet edge, other data centers. Runs routing peering (BGP or OSPF) with external devices. Always deploy as a pair.</li>
<li><b>Service leaf.</b> Hosts firewalls, load balancers and other appliances, keeping them in one place.</li>
<li><b>Storage leaf.</b> Connects IP storage arrays (iSCSI, NFS, NVMe over TCP); may need deeper buffers or a 1:1 ratio.</li>
<li><b>Compute leaf.</b> The ordinary server leaf; the most common kind.</li>
</ul>
<p>In small fabrics one leaf pair may play several roles, for example a combined border and service leaf. The rule stays the same: attach them to leaves, never to spines.</p>

<div class="warn"><p><b>Common mistakes.</b> Inverting the ratio (it is down ÷ up). Forgetting that breakout cables consume ports on both sides. Sizing for the healthy state only and ignoring N-1. Choosing spines with too few ports, which caps growth. Attaching the internet router to a spine "because it is central".</p></div>
<div class="exam"><p><b>Exam tip.</b> Oversubscription = downlink bandwidth ÷ uplink bandwidth. Leaf uplinks cap spines; spine ports cap leaves. Border leaves connect external networks. More than one spine layer = 5-stage Clos with super-spines.</p></div>

<div class="scn"><h4>The fabric that ran out of room</h4><p>A SaaS company built its first fabric with two fixed spines of 32 × 100G ports each, which looked generous for 12 leaves. Eighteen months later they had 30 leaves, plus 2 border leaves, and every spine port was used. The next rack could not be connected. The team had two choices: replace the spines with 64-port or modular models during maintenance windows, or add a super-spine layer and build a second pod. They chose larger modular spines and moved leaf uplinks one leaf at a time, relying on ECMP to keep traffic flowing through the other spine during each move.</p><p><b>Lesson:</b> spine port count sets the maximum number of leaves; size spines for the growth you expect over the fabric's life, not for day one.</p></div>

<div class="iv"><p class="q">"How do you calculate oversubscription, and what ratio would you design for?"</p><p>Strong answer: ratio = total server-facing bandwidth ÷ total uplink bandwidth on a leaf. Example: 48 × 25G = 1,200G down and 4 × 100G = 400G up gives 3:1. General virtualised workloads are fine at 3:1 to 2:1; storage and AI/HPC need close to 1:1. Then add the senior touches: check the ratio with one spine failed (N-1), remember that uplink count caps the number of spines and spine ports cap the number of leaves, and leave spare uplinks for growth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Oversubscription = downlink ÷ uplink bandwidth per leaf; 1:1 is non-blocking.</li>
<li>3:1 to 2:1 suits general compute; storage and AI clusters aim for 1:1.</li>
<li>Always check the ratio with one spine down (N-1).</li>
<li>Leaf uplink count caps the number of spines; spine port count caps the number of leaves.</li>
<li>Grow beyond one spine layer with super-spines (5-stage Clos); border, service and storage leaves attach at the leaf layer.</li>
</ul></div>
`,hi:`
<p>Stadium architect sabse pehle do numbers ginta hai: kitni seats hain, aur exits se ek minute mein kitne log bahar nikal sakte hain. Agar 50,000 seats hain lekin exits sirf 5,000 log per minute ke liye hain, to stadium dheere khaali hota hai, aur yeh acceptable hai kyunki saare log ek hi second mein nahi nikalte. Fabric designer ports aur bandwidth ke saath yahi maths karta hai. Is chapter mein aap real numbers ke saath spine-leaf fabric ko size karna seekhoge.</p>

<h3>Downlinks, uplinks aur oversubscription</h3>
<dl class="terms">
<dt>Downlinks</dt><dd>Leaf ke woh ports jo servers, storage ya services ki taraf hain.</dd>
<dt>Uplinks</dt><dd>Leaf ke woh ports jo spines ki taraf hain.</dd>
<dt>Oversubscription ratio</dt><dd>Leaf par total downlink bandwidth ÷ total uplink bandwidth, X:1 ki tarah likha jaata hai.</dd>
<dt>Non-blocking</dt><dd>1:1. Har server ek hi samay par full rate se fabric ke paar bhej sakta hai.</dd>
</dl>
<p>Oversubscription koi galti nahi hai. Servers shayad hi kabhi saath mein line rate par bhejte hain, isliye moderate ratio bahut paisa bachata hai. Sawaal yeh hai ki kitna, kaunse workload ke liye.</p>
<table class="cmp"><tr><th>Workload</th><th>Typical leaf ratio</th></tr>
<tr><td>General virtualised compute, web, enterprise apps</td><td>3:1 se 2:1</td></tr>
<tr><td>Big data, IP storage, busy databases</td><td>2:1 se 1.5:1</td></tr>
<tr><td>AI/ML training, HPC, storage back-end</td><td>1:1 (non-blocking)</td></tr></table>

<h3>Worked calculations</h3>
<div class="eg"><p><b>Example 1: classic 25G leaf.</b> 48 × 25G neeche, 6 × 100G upar. Down = 1,200G; up = 600G. Ratio = 1200 ÷ 600 = <b>2:1</b>.</p>
<p><b>Example 2: purana 10G leaf.</b> 48 × 10G neeche, 4 × 40G upar. Down = 480G; up = 160G. Ratio = <b>3:1</b>.</p>
<p><b>Example 3: ulta calculate karna.</b> 48 × 25G servers aur 100G uplinks ke saath target 3:1. Zaroori uplink = 1,200 ÷ 3 = 400G, yaani <b>4 × 100G</b> uplinks, jiska matlab yeh bhi hai ki 4 spines tak.</p>
<p><b>Example 4: AI ke liye non-blocking.</b> Ek leaf ke 32 × 400G ports hain. Unmein se 16 ko 4 × 100G mein break out karo: 64 × 100G server ports = 6,400G. Baaki 16 × 400G = 6,400G spines ki taraf jaate hain. Ratio = <b>1:1</b>.</p>
<p><b>Example 5: failure ke liye plan (N-1).</b> Chaar spines ke saath example 3 3:1 hai. Agar ek spine fail ho, uplink 300G par aa jaata hai: 1,200 ÷ 300 = <b>4:1</b>. Agar business failure ke dauraan 4:1 accept nahi kar sakta, to 2:1 ke liye design karo ya paanchva spine jodo.</p></div>

<h3>Uplinks spines ko limit karte hain, spine ports leaves ko</h3>
<p>Do hardware facts fabric ka shape tay karte hain:</p>
<ul>
<li><b>Leaf uplink ports ki sankhya spines ki sankhya ki limit hai.</b> 6 uplinks wala leaf zyada se zyada 6 spines tak ek-ek link se pahunch sakta hai, ya 3 spines tak do-do links se. Zyada tar designs 2, 4 ya 6 spines use karte hain.</li>
<li><b>Spine ports ki sankhya leaves ki sankhya ki limit hai.</b> Har leaf har spine par ek port use karta hai. 64 × 100G ports wala fixed spine 64 leaves tak support karta hai. 36 × 100G ports ke 8 line cards wala modular spine chassis 288 tak support karta hai.</li>
</ul>
<div class="eg"><p><b>Example 6: yeh fabric kitna bada ho sakta hai?</b> Spines: 64 × 100G wale 4 fixed switches. Leaves: 48 × 25G neeche, 6 mein se 4 uplinks use (har spine ke liye ek).</p>
<p>Max leaves = 64 (spine port count). 2 border leaves aur 2 service leaves reserve karo: 60 server leaves × 48 = <b>2,880 server ports</b>. Leaf pair par dual-homed servers 2 ports use karte hain: lagbhag <b>1,440 servers</b>. Har leaf ka ratio = 1,200 ÷ 400 = 3:1. Growth path: do spare uplinks use karke spines 5 aur 6 jodo aur 2:1 tak pahuncho.</p></div>

<h3>Ek spine layer se aage: 5-stage Clos</h3>
<p>Jab aapko apne spines ke ports se zyada leaves chahiye, to ek aur layer jodo. Kai <b>pods</b> banao, har ek normal spine-leaf fabric, aur har pod spine ko <b>super-spines</b> ki ek layer se jodo. Pods ke beech path ban jaata hai leaf, spine, super-spine, spine, leaf: paanch stages, phir bhi pods ke har pair ke liye barabar. Hyperscale operators aise hi banate hain.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Super-spines ke saath five-stage Clos">
<rect x="180" y="10" width="120" height="32" rx="6" fill="#fed7aa"/><text x="240" y="31" text-anchor="middle" class="svg-ink" font-size="12">Super-spine 1</text>
<rect x="340" y="10" width="120" height="32" rx="6" fill="#fed7aa"/><text x="400" y="31" text-anchor="middle" class="svg-ink" font-size="12">Super-spine 2</text>
<rect x="40" y="95" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="90" y="116" text-anchor="middle" class="svg-ink" font-size="12">Pod1 Spine1</text>
<rect x="160" y="95" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="210" y="116" text-anchor="middle" class="svg-ink" font-size="12">Pod1 Spine2</text>
<rect x="380" y="95" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="430" y="116" text-anchor="middle" class="svg-ink" font-size="12">Pod2 Spine1</text>
<rect x="500" y="95" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="550" y="116" text-anchor="middle" class="svg-ink" font-size="12">Pod2 Spine2</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="240" y1="42" x2="90" y2="95"/><line x1="240" y1="42" x2="210" y2="95"/><line x1="240" y1="42" x2="430" y2="95"/><line x1="240" y1="42" x2="550" y2="95"/><line x1="400" y1="42" x2="90" y2="95"/><line x1="400" y1="42" x2="210" y2="95"/><line x1="400" y1="42" x2="430" y2="95"/><line x1="400" y1="42" x2="550" y2="95"/></g>
<rect x="40" y="180" width="100" height="30" rx="6" fill="#bae6fd"/><text x="90" y="200" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="160" y="180" width="100" height="30" rx="6" fill="#bae6fd"/><text x="210" y="200" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="380" y="180" width="100" height="30" rx="6" fill="#bae6fd"/><text x="430" y="200" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<rect x="500" y="180" width="100" height="30" rx="6" fill="#bae6fd"/><text x="550" y="200" text-anchor="middle" class="svg-ink" font-size="12">Leaf</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="90" y1="127" x2="90" y2="180"/><line x1="90" y1="127" x2="210" y2="180"/><line x1="210" y1="127" x2="90" y2="180"/><line x1="210" y1="127" x2="210" y2="180"/><line x1="430" y1="127" x2="430" y2="180"/><line x1="430" y1="127" x2="550" y2="180"/><line x1="550" y1="127" x2="430" y2="180"/><line x1="550" y1="127" x2="550" y2="180"/></g>
<text x="150" y="226" text-anchor="middle" class="svg-muted" font-size="12">Pod 1</text><text x="490" y="226" text-anchor="middle" class="svg-muted" font-size="12">Pod 2</text>
</svg><p class="cap">5-stage Clos: har pod ek normal spine-leaf hai; super-spines pods ko jodte hain.</p></div>

<h3>Multi-pod aur multi-site (preview)</h3>
<p>Kabhi kabhi pods alag rooms ya buildings mein hote hain. Cisco designs ki do families deta hai jo aap baad mein padhoge. <b>ACI Multi-Pod</b> mein kai pods ek APIC controller cluster share karte hain aur <b>Inter-Pod Network (IPN)</b> ke through judte hain. <b>ACI Multi-Site</b> aur <b>VXLAN EVPN Multi-Site</b> mein independent fabrics (aksar alag shehron mein) ek orchestrator ya <b>border gateways</b> se jode jaate hain, aur har site apna alag failure domain rehti hai. Abhi ke liye idea yaad rakho: har failure domain ka ek fabric, controlled interconnect se juda hua.</p>

<h3>Special leaves</h3>
<ul>
<li><b>Border leaf.</b> Fabric ko bahar se jodta hai: WAN routers, internet edge, dusre data centers. External devices ke saath routing peering (BGP ya OSPF) chalata hai. Hamesha pair mein deploy karo.</li>
<li><b>Service leaf.</b> Firewalls, load balancers aur dusre appliances ko host karta hai, unhe ek jagah rakhta hai.</li>
<li><b>Storage leaf.</b> IP storage arrays (iSCSI, NFS, NVMe over TCP) ko jodta hai; deeper buffers ya 1:1 ratio chahiye ho sakta hai.</li>
<li><b>Compute leaf.</b> Normal server leaf; sabse common type.</li>
</ul>
<p>Chhote fabrics mein ek leaf pair kai roles nibha sakta hai, jaise combined border aur service leaf. Rule same rehta hai: inhe leaves se jodo, kabhi spines se nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> Ratio ulta kar dena (yeh down ÷ up hai). Yeh bhoolna ki breakout cables dono sides par ports lete hain. Sirf healthy state ke liye size karna aur N-1 ignore karna. Bahut kam ports wale spines chunna, jo growth ko cap kar deta hai. Internet router ko spine se jodna "kyunki woh central hai".</p></div>
<div class="exam"><p><b>Exam tip.</b> Oversubscription = downlink bandwidth ÷ uplink bandwidth. Leaf uplinks spines ko cap karte hain; spine ports leaves ko cap karte hain. Border leaves external networks jodte hain. Ek se zyada spine layer = super-spines ke saath 5-stage Clos.</p></div>

<div class="scn"><h4>Fabric jiske paas jagah khatam ho gayi</h4><p>Ek SaaS company ne apna pehla fabric 32 × 100G ports wale do fixed spines ke saath banaya, jo 12 leaves ke liye kaafi lagta tha. Athaarah mahine baad unke paas 30 leaves the, plus 2 border leaves, aur har spine port use ho chuka tha. Agla rack connect hi nahi ho sakta tha. Team ke paas do options the: maintenance windows mein spines ko 64-port ya modular models se replace karna, ya ek super-spine layer jod kar doosra pod banana. Unhone bade modular spines chune aur leaf uplinks ko ek-ek leaf karke move kiya, har move ke dauraan traffic ko dusre spine se chalu rakhne ke liye ECMP par bharosa karte hue.</p><p><b>Seekh:</b> spine port count leaves ki maximum sankhya tay karta hai; spines ko fabric ki poori life mein expected growth ke liye size karo, sirf day one ke liye nahi.</p></div>

<div class="iv"><p class="q">"Oversubscription kaise calculate karte ho, aur aap kaunse ratio ke liye design karoge?"</p><p>Strong answer: ratio = leaf par total server-facing bandwidth ÷ total uplink bandwidth. Example: 48 × 25G = 1,200G neeche aur 4 × 100G = 400G upar, to 3:1. General virtualised workloads 3:1 se 2:1 par theek hain; storage aur AI/HPC ko 1:1 ke paas chahiye. Phir senior touches jodo: ek spine fail hone par (N-1) ratio check karo, yaad rakho ki uplink count spines ki sankhya ko cap karta hai aur spine ports leaves ki sankhya ko, aur growth ke liye spare uplinks chhodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Oversubscription = har leaf par downlink ÷ uplink bandwidth; 1:1 non-blocking hai.</li>
<li>3:1 se 2:1 general compute ke liye theek hai; storage aur AI clusters 1:1 target karte hain.</li>
<li>Hamesha ek spine down (N-1) ke saath ratio check karo.</li>
<li>Leaf uplink count spines ki sankhya cap karta hai; spine port count leaves ki sankhya cap karta hai.</li>
<li>Ek spine layer se aage super-spines (5-stage Clos) se badho; border, service aur storage leaves leaf layer par judte hain.</li>
</ul></div>
`}};export{e as default};