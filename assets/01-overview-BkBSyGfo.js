var e={id:`overview`,h:{en:`Overview: classify, mark, treat, and where QoS is applied`,hi:`Overview: classify, mark, treat, aur QoS kahan lagti hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these nine chapters you will be able to sort traffic into classes with MQC class-maps, stamp each class with a DSCP or CoS value in a policy-map, decide at the network edge whose stamps you believe and whose you erase, translate between Layer 2 CoS and Layer 3 DSCP at the border, prove it all with counters, and find the fault when traffic that should be marked ends up in <code>class-default</code>. The labs use a Pune branch of Bharat Retail, a 10 Mbps circuit to Mumbai and Sahyadri University's lecture hall network.</p>
<p><b>Prerequisites.</b> The starter module <i>Multicast and QoS from zero</i> (what congestion is and why queues exist), IP addressing and routing basics, standard and extended ACLs, and comfort with a router and switch command line. You do not need any earlier QoS knowledge.</p>

<h3>Start with an analogy: the airport</h3>
<p>At an airport three things happen to you before you board. First you are <b>sorted</b>: a counter agent looks at your ticket and decides you are economy, business, or a crew member. Then you are <b>tagged</b>: a boarding pass and a coloured bag sticker record that decision, so nobody downstream has to look at your ticket again. Finally you are <b>treated</b>: business passengers use a short priority lane, economy passengers wait in the long one. The sorting and tagging happen once, at the entrance. The treatment happens later, at every bottleneck.</p>
<p>QoS (Quality of Service) on a network works the same way. The three jobs are called <b>classification</b>, <b>marking</b> and <b>treatment</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Classify, mark, treat">
<rect x="10" y="30" width="170" height="80" rx="10" fill="#bae6fd"/><text x="95" y="62" text-anchor="middle" class="svg-ink" font-size="15">1 Classify</text><text x="95" y="85" text-anchor="middle" class="svg-muted" font-size="12">class-map: what is it?</text>
<rect x="235" y="30" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="15">2 Mark</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">set dscp / set cos</text>
<rect x="460" y="30" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="545" y="62" text-anchor="middle" class="svg-ink" font-size="15">3 Treat</text><text x="545" y="85" text-anchor="middle" class="svg-muted" font-size="12">queue, drop, shape</text>
<line x1="180" y1="70" x2="235" y2="70" stroke="#64748b" stroke-width="2"/><line x1="405" y1="70" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="207" y="62" text-anchor="middle" class="svg-muted" font-size="11">class</text><text x="432" y="62" text-anchor="middle" class="svg-muted" font-size="11">tag</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">This module covers steps 1 and 2. Treatment is the next three modules.</text>
</svg><p class="cap">Classify and mark once, near the source. Treat many times, at every congested link.</p></div>

<h3>The three jobs, defined</h3>
<dl class="terms">
<dt>Classification</dt><dd>Looking at a packet (its addresses, protocol, port, existing marking, arrival interface) and deciding which <b>class</b> it belongs to. A class is just a name for a kind of traffic, such as VOICE or BACKUP.</dd>
<dt>Marking</dt><dd>Writing a small number into a header field so the decision travels with the packet. At Layer 3 the field is <b>DSCP</b> (6 bits in the IP header). At Layer 2 it is <b>CoS</b> (3 bits in the 802.1Q tag). Chapter 3 explains both.</dd>
<dt>Treatment</dt><dd>What a device does to a packet because of its class: put it in a priority queue, guarantee it bandwidth, drop it earlier under pressure, police it, shape it. The technical name for the treatment a hop gives to a marking is the <b>per-hop behaviour (PHB)</b>.</dd>
</dl>
<p>The reason for splitting the work is scale. Classifying needs a deep look at the packet and can be slow and detailed. Treatment must be fast and simple, on every hop. So we do the expensive looking once, write the answer into the packet as a marking, and let every later device react only to the marking.</p>

<h3>Where QoS is applied</h3>
<table class="cmp"><tr><th>Place</th><th>Typical job</th><th>Direction</th></tr>
<tr><td>Access switch port facing a PC or phone</td><td>Decide whether to trust the marking the device sent</td><td>Ingress</td></tr>
<tr><td>Branch router, LAN side</td><td>Classify and mark, or re-mark to zero</td><td>Input</td></tr>
<tr><td>Branch router, WAN side</td><td>Queue, police, shape (modules after this one)</td><td>Output</td></tr>
<tr><td>Provider edge</td><td>Trust or rewrite your markings according to the contract</td><td>Both</td></tr>
</table>
<p>Notice the rule of thumb: <b>mark early, queue late</b>. Marking belongs at the first point you control, going in. Queuing only matters where packets actually wait, which is the output side of a slow or busy link. In IOS XE you attach a policy to an interface with <code>service-policy input</code> or <code>service-policy output</code>, and the direction decides what the policy sees.</p>

<div class="eg"><p><b>Worked example.</b> The Pune branch of Bharat Retail has a 10 Mbps MPLS circuit. In the evening five phone calls (about 400 kbps), a store-wide web session (about 1 Mbps) and a nightly SMB backup (about 6 Mbps) share it, and a power user adds a 12 Mbps copy job. Offered load is far above 10 Mbps. With no marking, every packet looks the same, so the queue drops calls and backup alike. If R1 marks calls EF, web AF21, the backup CS1 and the WAN queue knows what EF means, the calls cross untouched and the copy job absorbs the loss.</p></div>

<h3>A first look at the configuration</h3>
<p>This is the shape of everything you will build in this module. Do not memorise it yet; each line gets its own chapter.</p>
<pre class="code"><span class="c">! 1 classify</span>
class-map match-any VOICE
 match access-group name VOICE-RTP
<span class="c">! 2 mark</span>
policy-map MARK-IN
 class VOICE
  set dscp ef
<span class="c">! apply it, as traffic enters from the LAN</span>
interface GigabitEthernet0/1
 service-policy input MARK-IN</pre>

<div class="warn"><p><b>Common mistake.</b> Believing that marking makes traffic faster. A DSCP value is only a label. Until a queue somewhere reads the label and treats the packet differently, nothing changes. Marking without a matching treatment policy does no harm and no good.</p></div>
<div class="exam"><p><b>Exam trap.</b> QoS does not create bandwidth. On an uncongested link every class gets what it asks for. QoS only decides who loses when demand exceeds capacity.</p></div>

<div class="scn"><h4>Calls break up every evening in Pune</h4><p>The Pune store manager complained that IP phone calls to Mumbai turn robotic between 7 and 9 pm. The network engineer checked CPU and link errors (all clean), then looked at the WAN interface utilisation: 100 percent during the backup window. The fault was not a broken device but a missing policy: no packet carried a marking, so the router had no way to protect voice. The fix had three parts, in order: classify and mark at the LAN edge, trust only what the edge marked, and give EF a priority queue on the WAN.</p><p><b>Lesson:</b> a clean link with 100 percent utilisation and no policy is a QoS problem, not a hardware problem.</p></div>
<div class="iv"><p class="q">"Explain the difference between classification, marking and queuing."</p><p>Classification decides which class a packet is in. Marking writes that decision into a header field (DSCP or CoS) so later hops need not repeat the work. Queuing is the treatment each hop applies because of the marking. Add that you classify and mark near the source, going in, and queue at the congested output interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS has three jobs: classify, mark, treat. This module owns the first two.</li>
<li>Marking is a label in the packet; treatment is what a device does because of the label.</li>
<li>Mark early (input, near the source). Queue late (output, at the bottleneck).</li>
<li>Policies attach to an interface with <code>service-policy input</code> or <code>output</code>.</li>
<li>QoS cannot create bandwidth; it only chooses who is hurt during congestion.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In nau chapters ke baad aap MQC class-maps se traffic ko classes mein baant paoge, policy-map mein har class par DSCP ya CoS value laga paoge, network edge par tay kar paoge ki kiske stamps par bharosa karna hai aur kiske mitane hain, border par Layer 2 CoS aur Layer 3 DSCP ke beech translate kar paoge, sab kuch counters se sabit kar paoge, aur woh fault dhoondh paoge jab mark hone wala traffic <code>class-default</code> mein pahunch jaata hai. Labs mein Bharat Retail ki Pune branch, Mumbai tak 10 Mbps circuit aur Sahyadri University ka lecture hall network use hota hai.</p>
<p><b>Prerequisites.</b> Starter module <i>Multicast and QoS from zero</i> (congestion kya hai aur queues kyun hoti hain), IP addressing aur routing basics, standard aur extended ACLs, aur router tatha switch command line ka comfort. Pehle se QoS ka knowledge zaroori nahi hai.</p>

<h3>Analogy se shuru karte hain: airport</h3>
<p>Airport par board karne se pehle aapke saath teen cheezein hoti hain. Pehle aapko <b>sort</b> kiya jaata hai: counter agent aapka ticket dekhkar tay karta hai ki aap economy ho, business ho ya crew. Phir aapko <b>tag</b> kiya jaata hai: boarding pass aur rangeen bag sticker us decision ko record kar dete hain, taaki aage kisi ko aapka ticket dobara na dekhna pade. Aakhir mein aapke saath <b>treatment</b> hota hai: business passengers chhoti priority lane use karte hain, economy wale lambi lane mein intezaar karte hain. Sorting aur tagging ek baar, entrance par hoti hai. Treatment baad mein, har bottleneck par hota hai.</p>
<p>Network par QoS (Quality of Service) bilkul aise hi kaam karti hai. Teen kaam ke naam hain <b>classification</b>, <b>marking</b> aur <b>treatment</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Classify, mark, treat">
<rect x="10" y="30" width="170" height="80" rx="10" fill="#bae6fd"/><text x="95" y="62" text-anchor="middle" class="svg-ink" font-size="15">1 Classify</text><text x="95" y="85" text-anchor="middle" class="svg-muted" font-size="12">class-map: yeh kya hai?</text>
<rect x="235" y="30" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="15">2 Mark</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">set dscp / set cos</text>
<rect x="460" y="30" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="545" y="62" text-anchor="middle" class="svg-ink" font-size="15">3 Treat</text><text x="545" y="85" text-anchor="middle" class="svg-muted" font-size="12">queue, drop, shape</text>
<line x1="180" y1="70" x2="235" y2="70" stroke="#64748b" stroke-width="2"/><line x1="405" y1="70" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="207" y="62" text-anchor="middle" class="svg-muted" font-size="11">class</text><text x="432" y="62" text-anchor="middle" class="svg-muted" font-size="11">tag</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Yeh module step 1 aur 2 cover karta hai. Treatment agle teen modules mein hai.</text>
</svg><p class="cap">Source ke paas ek baar classify aur mark karo. Har congested link par baar-baar treat karo.</p></div>

<h3>Teen kaam, define karke</h3>
<dl class="terms">
<dt>Classification</dt><dd>Packet ko dekhna (uske addresses, protocol, port, pehle se maujood marking, aane wala interface) aur tay karna ki woh kaunsi <b>class</b> mein aata hai. Class bas ek naam hai ek tarah ke traffic ka, jaise VOICE ya BACKUP.</dd>
<dt>Marking</dt><dd>Header ke ek chhote field mein ek chhota number likhna taaki decision packet ke saath safar kare. Layer 3 par field <b>DSCP</b> hai (IP header mein 6 bits). Layer 2 par woh <b>CoS</b> hai (802.1Q tag mein 3 bits). Chapter 3 dono samjhata hai.</dd>
<dt>Treatment</dt><dd>Class ki wajah se device packet ke saath jo karta hai: priority queue mein daalna, bandwidth guarantee dena, pressure mein pehle drop karna, police karna, shape karna. Marking ko ek hop jo treatment deta hai uska technical naam <b>per-hop behaviour (PHB)</b> hai.</dd>
</dl>
<p>Kaam baantne ki wajah scale hai. Classify karne ke liye packet ko gehrai se dekhna padta hai aur woh slow aur detailed ho sakta hai. Treatment fast aur simple hona chahiye, har hop par. Isliye mehnga dekhne ka kaam ek baar karte hain, jawab ko marking ki shakal mein packet mein likh dete hain, aur baad ka har device sirf marking par react karta hai.</p>

<h3>QoS kahan lagti hai</h3>
<table class="cmp"><tr><th>Jagah</th><th>Aam kaam</th><th>Direction</th></tr>
<tr><td>Access switch port jo PC ya phone ki taraf hai</td><td>Tay karo ki device ki bheji marking par bharosa karna hai ya nahi</td><td>Ingress</td></tr>
<tr><td>Branch router, LAN side</td><td>Classify aur mark karo, ya zero par re-mark karo</td><td>Input</td></tr>
<tr><td>Branch router, WAN side</td><td>Queue, police, shape (is module ke baad ke modules)</td><td>Output</td></tr>
<tr><td>Provider edge</td><td>Contract ke hisaab se aapki markings par trust ya unhe rewrite karna</td><td>Dono</td></tr>
</table>
<p>Rule of thumb yaad rakho: <b>mark early, queue late</b>. Marking us pehle point par hoti hai jo aapke control mein hai, andar aate waqt. Queuing sirf wahan matter karti hai jahan packets sach mein intezaar karte hain, yaani slow ya busy link ki output side. IOS XE mein aap interface par policy <code>service-policy input</code> ya <code>service-policy output</code> se lagate ho, aur direction tay karti hai ki policy kya dekhegi.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ki Pune branch ke paas 10 Mbps MPLS circuit hai. Shaam ko paanch phone calls (lagbhag 400 kbps), store-wide web session (lagbhag 1 Mbps) aur raat ka SMB backup (lagbhag 6 Mbps) isi par chalte hain, aur ek power user 12 Mbps ka copy job jod deta hai. Offered load 10 Mbps se bahut upar hai. Marking ke bina har packet ek jaisa dikhta hai, isliye queue calls aur backup dono ko drop karti hai. Agar R1 calls ko EF, web ko AF21, backup ko CS1 mark kare aur WAN queue ko EF ka matlab pata ho, to calls bina kisi nuksaan ke guzar jaati hain aur copy job loss absorb karta hai.</p></div>

<h3>Configuration ki pehli jhalak</h3>
<p>Is module mein jo bhi aap banaoge uska shape yahi hai. Abhi ratna mat; har line ka apna chapter hai.</p>
<pre class="code"><span class="c">! 1 classify</span>
class-map match-any VOICE
 match access-group name VOICE-RTP
<span class="c">! 2 mark</span>
policy-map MARK-IN
 class VOICE
  set dscp ef
<span class="c">! apply it, as traffic enters from the LAN</span>
interface GigabitEthernet0/1
 service-policy input MARK-IN</pre>

<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki marking traffic ko tez bana deti hai. DSCP value sirf ek label hai. Jab tak kahin koi queue label padhkar packet ko alag treat nahi karti, kuch nahi badalta. Matching treatment policy ke bina marking na nuksaan karti hai na faayda.</p></div>
<div class="exam"><p><b>Exam trap.</b> QoS bandwidth paida nahi karti. Uncongested link par har class ko jitna maangti hai milta hai. QoS sirf yeh tay karti hai ki demand capacity se zyada ho to kaun haarega.</p></div>

<div class="scn"><h4>Pune mein har shaam calls toot-ti hain</h4><p>Pune ke store manager ne shikayat ki ki Mumbai ki IP phone calls shaam 7 se 9 baje robotic ho jaati hain. Network engineer ne CPU aur link errors check kiye (sab clean), phir WAN interface utilisation dekhi: backup window mein 100 percent. Fault kisi toote device ka nahi tha balki missing policy ka tha: kisi packet par marking nahi thi, isliye router ke paas voice ko protect karne ka tareeka hi nahi tha. Fix ke teen hisse the, is order mein: LAN edge par classify aur mark, sirf wahi trust karo jo edge ne mark kiya, aur WAN par EF ko priority queue do.</p><p><b>Lesson:</b> clean link jis par 100 percent utilisation hai aur koi policy nahi, woh QoS problem hai, hardware problem nahi.</p></div>
<div class="iv"><p class="q">"Classification, marking aur queuing mein farak samjhaiye."</p><p>Classification tay karti hai ki packet kaunsi class mein hai. Marking us decision ko header field (DSCP ya CoS) mein likhti hai taaki baad ke hops ko kaam dohrana na pade. Queuing woh treatment hai jo har hop marking ki wajah se lagata hai. Yeh bhi bolo ki classify aur mark source ke paas, andar aate waqt karte hain, aur queue congested output interface par.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS ke teen kaam hain: classify, mark, treat. Is module mein pehle do hain.</li>
<li>Marking packet mein label hai; treatment woh hai jo device label ki wajah se karta hai.</li>
<li>Mark early (input, source ke paas). Queue late (output, bottleneck par).</li>
<li>Policy interface par <code>service-policy input</code> ya <code>output</code> se lagti hai.</li>
<li>QoS bandwidth paida nahi kar sakti; sirf congestion mein kaun nuksaan uthayega yeh chunti hai.</li>
</ul></div>
`}};export{e as default};