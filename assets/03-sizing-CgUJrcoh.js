var e={id:`sizing`,h:{en:`Sizing and scale: how many controllers, and how many connections`,hi:`Sizing aur scale: kitne controllers, aur kitne connections`},body:{en:`
<p>When a city plans a bus station, it does not count only the buses. It counts passengers at rush hour, platforms, ticket counters and the number of routes that start there. In the same way, controller sizing is not decided by the number of branches alone. It depends on how many connections each branch makes, how many routes they advertise, how long statistics are kept and how many people use the dashboard. This chapter gives you the method to size a design and the vocabulary to discuss it. It deliberately does not quote exact capacity numbers, because those change with every release and hardware profile. The exact figures always come from the current Cisco scale and compatibility documents for the release you deploy.</p>

<h3>What loads each controller</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="What drives the load on each controller">
<rect x="10" y="15" width="200" height="150" rx="12" fill="#fde68a"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Manager</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="11">devices managed</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="11">statistics volume and age</text><text x="110" y="98" text-anchor="middle" class="svg-muted" font-size="11">dashboard and API users</text><text x="110" y="116" text-anchor="middle" class="svg-muted" font-size="11">templates and pushes</text><text x="110" y="145" text-anchor="middle" class="svg-ink" font-size="11">CPU, memory, disk</text>
<rect x="225" y="15" width="200" height="150" rx="12" fill="#ddd6fe"/><text x="325" y="38" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="325" y="62" text-anchor="middle" class="svg-muted" font-size="11">control connections</text><text x="325" y="80" text-anchor="middle" class="svg-muted" font-size="11">OMP routes and TLOCs</text><text x="325" y="98" text-anchor="middle" class="svg-muted" font-size="11">policy complexity</text><text x="325" y="116" text-anchor="middle" class="svg-muted" font-size="11">VPN count</text><text x="325" y="145" text-anchor="middle" class="svg-ink" font-size="11">CPU, memory</text>
<rect x="440" y="15" width="190" height="150" rx="12" fill="#bae6fd"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="14">Validator</text><text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="11">first-contact bursts</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="11">reconnects after outages</text><text x="535" y="98" text-anchor="middle" class="svg-muted" font-size="11">no user traffic</text><text x="535" y="145" text-anchor="middle" class="svg-ink" font-size="11">Light, but critical</text>
<rect x="30" y="185" width="580" height="55" rx="10" fill="#f1f5f9"/><text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="12">Check the release scale sheet: it gives supported device counts for each profile.</text><text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="11">Design to a safe fraction of the limit, not to the limit itself.</text>
</svg><p class="cap">Each controller has its own load drivers. Sizing is done per controller type.</p></div>

<h3>The Manager</h3>
<p>The Manager does the heaviest and most varied work. It keeps the configuration database, collects statistics from every device, runs the web interface and the API, and pushes templates. Its size grows with the number of devices and with the volume and retention period of statistics. Cisco offers the Manager in different VM sizes for different device counts. For larger fabrics it is deployed as a <b>cluster</b> of several nodes (chapter 9), where different nodes can take different jobs. Disk performance matters; the statistics database is sensitive to slow storage.</p>

<h3>The Controller</h3>
<p>The Controller holds one OMP session per device and one control connection per TLOC (up to the configured limit). Its load depends on the number of connections, the number of OMP routes and TLOCs it must reflect, and the size of the policy it applies. One Controller supports a limited number of devices. When the limit is reached you do not buy a larger one; you <b>add more Controllers</b> and spread the edges over them. This is scale-out.</p>

<h3>The Validator</h3>
<p>The Validator carries only short authentication exchanges, so a single instance can serve many devices. However, every device needs it on first start and after an outage, so after a large failure thousands of edges may reconnect at once. This is why a design uses at least two Validators, and why the Validator is considered critical even though it is light.</p>

<h3>How many connections does an edge make?</h3>
<p>The number of control connections is the unit that you count. An edge connects over each of its transports (each TLOC). On each transport it forms connections to the Controllers, up to the value of <code>max-control-connections</code>, which defaults to 2. It also forms one connection to the Manager. The connection to the Validator exists only while the device starts.</p>
<table class="cmp"><tr><th>Item</th><th>Rule of thumb</th></tr>
<tr><td>Controller connections per edge</td><td>TLOCs x controllers per TLOC (limited by max-control-connections)</td></tr>
<tr><td>Manager connections per edge</td><td>One</td></tr>
<tr><td>Validator connections per edge</td><td>Transient, only at start and re-start</td></tr>
<tr><td>OMP sessions per edge</td><td>One per connected Controller</td></tr></table>
<div class="eg"><p><b>Worked example.</b> A fabric has 600 edges, each with 2 transports, and two Controllers. With max-control-connections at its default of 2, each transport connects to both Controllers. That is 2 x 2 = 4 Controller connections per edge, so 600 x 4 = 2400 connections across the pair. If the edges are shared equally, each Controller carries 1200. You compare that figure, and the OMP route count, with the supported scale in the sheet for your release and keep headroom for growth and for one Controller being down. If one fails, the other must carry all 2400 connections.</p></div>

<h3>Controller groups and spreading the load</h3>
<p>To spread edges across Controllers you use <b>controller groups</b>. Each Controller is given a controller group ID, and each edge is given a list of groups it may use. An edge connects to Controllers in the groups on its list, in order of preference. For example, Controllers in the Mumbai data centre are group 1 and those in Delhi are group 2. Western branches list group 1 first, northern branches list group 2 first, and each branch still has the other group as a fallback.</p>
<pre class="code"><span class="c">! Reference configuration: controller group (exact paths vary by release)</span>
<span class="c">! On a Controller (VSMART)</span>
system
 controller-group-id 1
<span class="c">! On an edge (IOS XE, SD-WAN mode)</span>
system
 controller-group-list 1 2</pre>

<h3>Capacity checklist</h3>
<ul>
<li>Count devices now, in three years, and in a failure (one controller of a pair gone).</li>
<li>Count TLOCs, not only devices, because connections follow TLOCs.</li>
<li>Estimate the number of VPNs and routes per VPN, because OMP load follows them.</li>
<li>Decide statistics retention and plan disk accordingly on the Manager.</li>
<li>Choose VM profiles from the compatibility matrix and reserve CPU and memory, because over-committed resources cause control-connection flaps.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Sizing to the exact maximum with no headroom; counting devices but ignoring TLOCs; putting every edge on one Controller group; sharing hypervisor resources so the Manager is starved of disk performance; trusting a number from memory instead of the current scale sheet.</p></div>

<div class="exam"><p><b>Exam traps.</b> Controllers scale out by adding more Controllers, not by one larger instance. The connection to the Validator is transient on an edge. The default of max-control-connections is 2. A larger fabric uses a Manager cluster.</p></div>

<div class="scn"><h4>Failover that nearly failed</h4><p>A design placed 1800 edges evenly on two Controllers, each already at 80 percent of its supported connections. During a planned upgrade of one Controller, the other received all edges and hit its limit; some edges stayed disconnected until the upgrade finished. After the incident the team added a third Controller so that two could carry the whole fabric.</p><p><b>Lesson:</b> size for the failure case, not for the normal case.</p></div>

<div class="iv"><p class="q">"How would you size the controllers for a new 1000-site deployment?"</p><p>Strong answer: count edges and TLOCs, estimate OMP routes and VPNs, and decide statistics retention. Use the current scale sheet for the release to pick VM profiles. Use at least two Controllers and two Validators, spread across two locations, with controller groups to balance edges. Size so that the loss of one Controller still fits within the limit. Use a Manager cluster for this size. State that you take numbers from the official sheet, not from memory.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each controller has different load drivers: devices and statistics, connections and routes, start-up bursts.</li>
<li>Count control connections by TLOC, using max-control-connections (default 2).</li>
<li>Scale out by adding Controllers and balance with controller groups.</li>
<li>Size for the failure case with headroom.</li>
<li>Take exact limits from the current Cisco scale sheet.</li>
</ul></div>
`,hi:`
<p>Jab koi shehar bus station plan karta hai to woh sirf buses nahi ginta. Woh rush hour ke yatri, platforms, ticket counters aur wahan se shuru hone wale routes ginta hai. Isi tarah controller sizing sirf branches ki sankhya se tay nahi hoti. Yeh is par depend karti hai ki har branch kitne connections banati hai, kitne routes advertise karti hai, statistics kitne samay rakhe jaate hain aur dashboard kitne log use karte hain. Yeh chapter aapko design size karne ka tareeka aur us par baat karne ki bhasha deta hai. Yeh jaanbujh kar exact capacity numbers nahi deta, kyunki woh har release aur hardware profile ke saath badalte hain. Exact figures hamesha us release ke current Cisco scale aur compatibility documents se aate hain jise aap deploy karte ho.</p>

<h3>Har controller par load kya daalta hai</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Har controller par load ke karan">
<rect x="10" y="15" width="200" height="150" rx="12" fill="#fde68a"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Manager</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="11">manage kiye devices</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="11">statistics ka volume aur umar</text><text x="110" y="98" text-anchor="middle" class="svg-muted" font-size="11">dashboard aur API users</text><text x="110" y="116" text-anchor="middle" class="svg-muted" font-size="11">templates aur pushes</text><text x="110" y="145" text-anchor="middle" class="svg-ink" font-size="11">CPU, memory, disk</text>
<rect x="225" y="15" width="200" height="150" rx="12" fill="#ddd6fe"/><text x="325" y="38" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="325" y="62" text-anchor="middle" class="svg-muted" font-size="11">control connections</text><text x="325" y="80" text-anchor="middle" class="svg-muted" font-size="11">OMP routes aur TLOCs</text><text x="325" y="98" text-anchor="middle" class="svg-muted" font-size="11">policy ki jatilta</text><text x="325" y="116" text-anchor="middle" class="svg-muted" font-size="11">VPN ki sankhya</text><text x="325" y="145" text-anchor="middle" class="svg-ink" font-size="11">CPU, memory</text>
<rect x="440" y="15" width="190" height="150" rx="12" fill="#bae6fd"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="14">Validator</text><text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="11">first-contact bursts</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="11">outage ke baad reconnects</text><text x="535" y="98" text-anchor="middle" class="svg-muted" font-size="11">user traffic nahi</text><text x="535" y="145" text-anchor="middle" class="svg-ink" font-size="11">Halka, par critical</text>
<rect x="30" y="185" width="580" height="55" rx="10" fill="#f1f5f9"/><text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="12">Release ki scale sheet dekho: har profile ke liye supported device counts deti hai.</text><text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="11">Limit ke safe hisse tak design karo, limit tak nahi.</text>
</svg><p class="cap">Har controller ke apne load drivers hain. Sizing controller type ke hisaab se hoti hai.</p></div>

<h3>Manager</h3>
<p>Manager sabse bhaari aur sabse alag-alag kaam karta hai. Woh configuration database rakhta hai, har device se statistics collect karta hai, web interface aur API chalata hai aur templates push karta hai. Uska size devices ki sankhya aur statistics ke volume aur retention period ke saath badhta hai. Cisco alag device counts ke liye Manager ko alag VM sizes mein deta hai. Bade fabrics ke liye ise kai nodes ke <b>cluster</b> ke roop mein deploy kiya jaata hai (chapter 9), jahan alag nodes alag kaam le sakte hain. Disk performance maayne rakhti hai; statistics database slow storage par sensitive hai.</p>

<h3>Controller</h3>
<p>Controller har device ka ek OMP session aur har TLOC ka ek control connection rakhta hai (configured limit tak). Uska load connections ki sankhya, reflect karne wale OMP routes aur TLOCs ki sankhya aur lagu policy ke size par depend karta hai. Ek Controller limited devices support karta hai. Limit aane par aap bada wala nahi kharidte; aap <b>aur Controllers jodte ho</b> aur edges unke beech failate ho. Yeh scale-out hai.</p>

<h3>Validator</h3>
<p>Validator sirf chhote authentication exchanges carry karta hai, isliye ek instance kaafi devices ko serve kar sakta hai. Phir bhi har device ko pehli start par aur outage ke baad iski zaroorat hoti hai, isliye bade failure ke baad hazaron edges ek saath reconnect ho sakte hain. Isi wajah se design mein kam se kam do Validators hote hain, aur Validator halka hone par bhi critical maana jaata hai.</p>

<h3>Ek edge kitne connections banata hai?</h3>
<p>Control connections ki sankhya woh unit hai jo aap ginte ho. Edge apne har transport (har TLOC) par connect karta hai. Har transport par woh Controllers se connections banata hai, <code>max-control-connections</code> ki value tak, jiska default 2 hai. Woh Manager se ek connection bhi banata hai. Validator ka connection sirf device ke start hone ke dauran rehta hai.</p>
<table class="cmp"><tr><th>Item</th><th>Rule of thumb</th></tr>
<tr><td>Per edge Controller connections</td><td>TLOCs x har TLOC par controllers (max-control-connections se seemit)</td></tr>
<tr><td>Per edge Manager connections</td><td>Ek</td></tr>
<tr><td>Per edge Validator connections</td><td>Transient, sirf start aur re-start par</td></tr>
<tr><td>Per edge OMP sessions</td><td>Har connected Controller ke liye ek</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Ek fabric mein 600 edges hain, har ke 2 transports, aur do Controllers. max-control-connections default 2 par, har transport dono Controllers se connect hota hai. Yani 2 x 2 = 4 Controller connections per edge, to jodi par 600 x 4 = 2400 connections. Agar edges barabar baante jaayein to har Controller 1200 carry karta hai. Aap us figure aur OMP route count ko apni release ki sheet ke supported scale se compare karte ho aur growth ke liye aur ek Controller ke down hone ke liye headroom rakhte ho. Agar ek fail ho jaye to doosre ko poore 2400 connections sambhalne honge.</p></div>

<h3>Controller groups aur load baantna</h3>
<p>Edges ko Controllers par failane ke liye aap <b>controller groups</b> use karte ho. Har Controller ko ek controller group ID di jaati hai, aur har edge ko groups ki ek list di jaati hai jo woh use kar sakta hai. Edge apni list ke groups ke Controllers se preference ke order mein connect hota hai. Maslan Mumbai data centre ke Controllers group 1 hain aur Delhi ke group 2. Pashchim ki branches group 1 pehle list karti hain, uttar ki branches group 2 pehle, aur har branch ke paas doosra group fallback ke roop mein rehta hai.</p>
<pre class="code"><span class="c">! Reference configuration: controller group (exact paths vary by release)</span>
<span class="c">! On a Controller (VSMART)</span>
system
 controller-group-id 1
<span class="c">! On an edge (IOS XE, SD-WAN mode)</span>
system
 controller-group-list 1 2</pre>

<h3>Capacity checklist</h3>
<ul>
<li>Devices abhi, teen saal baad aur failure mein (jodi ka ek controller gaya) ginti karo.</li>
<li>Sirf devices nahi, TLOCs ginti karo, kyunki connections TLOCs ke saath chalte hain.</li>
<li>VPNs aur har VPN ke routes ka andaaza lagao, kyunki OMP load unke saath chalta hai.</li>
<li>Statistics retention tay karo aur Manager par disk usi ke hisaab se plan karo.</li>
<li>Compatibility matrix se VM profiles chuno aur CPU aur memory reserve karo, kyunki over-committed resources control-connection flaps karate hain.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Bina headroom ke exact maximum par size karna; devices ginna par TLOCs ignore karna; har edge ko ek hi Controller group par rakhna; hypervisor resources share karna jisse Manager ko disk performance nahi milti; current scale sheet ke bajaye yaad se number par bharosa karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Controllers aur Controllers jodkar scale out hote hain, ek bade instance se nahi. Edge par Validator connection transient hota hai. max-control-connections ka default 2 hai. Bada fabric Manager cluster use karta hai.</p></div>

<div class="scn"><h4>Failover jo lagbhag fail ho gaya</h4><p>Ek design ne 1800 edges ko do Controllers par barabar rakha, har ek apne supported connections ke 80 percent par pehle se. Ek Controller ke planned upgrade ke dauran doosre ko saare edges mile aur woh apni limit par pahunch gaya; kuch edges upgrade khatam hone tak disconnected rahe. Incident ke baad team ne teesra Controller joda taaki do poore fabric ko sambhal sakein.</p><p><b>Seekh:</b> failure case ke liye size karo, normal case ke liye nahi.</p></div>

<div class="iv"><p class="q">"Naye 1000-site deployment ke liye controllers kaise size karoge?"</p><p>Strong answer: edges aur TLOCs ginti karo, OMP routes aur VPNs ka andaaza lagao, aur statistics retention tay karo. VM profiles chunne ke liye release ki current scale sheet use karo. Kam se kam do Controllers aur do Validators, do locations mein, edges balance karne ke liye controller groups ke saath. Aisa size karo ki ek Controller jaane par bhi limit ke andar rahe. Is size ke liye Manager cluster use karo. Kaho ki numbers official sheet se lete ho, yaad se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har controller ke alag load drivers hain: devices aur statistics, connections aur routes, start-up bursts.</li>
<li>Control connections TLOC ke hisaab se ginti karo, max-control-connections (default 2) ke saath.</li>
<li>Controllers jodkar scale out karo aur controller groups se balance karo.</li>
<li>Headroom ke saath failure case ke liye size karo.</li>
<li>Exact limits current Cisco scale sheet se lo.</li>
</ul></div>
`}};export{e as default};