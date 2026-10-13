var e={id:`overview`,h:{en:`Service provider architecture: what you will learn and the big picture`,hi:`Service provider architecture: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a service provider network is organised (access, aggregation, core and edge), why it is built that way, how Cisco's three operating systems differ (IOS, IOS XE and IOS XR), how the IOS XR configuration model works, and where network functions virtualization (NFV) fits. This is the architecture block of the Cisco CCNP Service Provider core exam (SPCOR 350-501), and it gives you the vocabulary for every later SPCOR module.</p>
<p><b>Prerequisites.</b> You should know IP routing basics, VLANs and what MPLS is at a high level. Deeper protocol detail comes in spcor-isis, spcor-bgp, spcor-mpls-ldp and spcor-l3vpn, which you can study before or after this module.</p>
<p><b>Honest note about practice.</b> This module has no labs, because it is mostly about design and platform concepts, and the simulator does not model IOS XR or NFV platforms. Configuration shown here is labelled <i>Reference configuration (not run in the simulator)</i>. To practise the protocols that run inside this architecture, use spcor-mpls-ldp and spcor-l3vpn.</p>

<h3>Analogy: a city's road and rail system</h3>
<p>Think of a big city. Residents leave their homes by <b>local streets</b> (the access network). Those streets feed <b>district roads and bus depots</b> where traffic from many streets is gathered (aggregation). District roads join <b>expressways and rail trunks</b> that carry huge volumes quickly between districts (the core). At the city border sit <b>airports, ports and highway toll gates</b> (the edge) that connect to the outside world. Each tier has a different job: reach everyone cheaply, collect traffic efficiently, move it fast, and exchange it with others. A provider network is organised the same way, and the equipment in each tier is chosen for that tier's job.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SP network tiers">
<rect x="15" y="40" width="120" height="150" rx="10" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="14">Access</text><text x="75" y="95" text-anchor="middle" class="svg-muted" font-size="11">homes, businesses,</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="11">cell sites</text><text x="75" y="140" text-anchor="middle" class="svg-muted" font-size="11">many low-speed ports</text>
<rect x="165" y="40" width="130" height="150" rx="10" fill="#bbf7d0"/><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="14">Aggregation</text><text x="230" y="95" text-anchor="middle" class="svg-muted" font-size="11">collects access,</text><text x="230" y="110" text-anchor="middle" class="svg-muted" font-size="11">applies service policy</text>
<rect x="325" y="40" width="130" height="150" rx="10" fill="#ddd6fe"/><text x="390" y="70" text-anchor="middle" class="svg-ink" font-size="14">Core</text><text x="390" y="95" text-anchor="middle" class="svg-muted" font-size="11">fast, simple,</text><text x="390" y="110" text-anchor="middle" class="svg-muted" font-size="11">highly available</text>
<rect x="485" y="40" width="140" height="150" rx="10" fill="#fde68a"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="14">Edge / peering</text><text x="555" y="95" text-anchor="middle" class="svg-muted" font-size="11">Internet, other</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="11">providers, data centres</text>
<line x1="135" y1="115" x2="165" y2="115" stroke="#64748b" stroke-width="2"/><line x1="295" y1="115" x2="325" y2="115" stroke="#64748b" stroke-width="2"/><line x1="455" y1="115" x2="485" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">Traffic is gathered on the way in and distributed on the way out</text>
</svg><p class="cap">The classic four tiers of a service provider network.</p></div>

<h3>Key terms</h3>
<dl class="terms">
<dt>Service provider (SP)</dt><dd>An organisation that sells connectivity or network services to many customers: broadband, mobile, enterprise VPNs, Internet transit.</dd>
<dt>PE (provider edge)</dt><dd>A router at the edge of the provider network that connects to customers and holds service state such as VRFs and pseudowires.</dd>
<dt>P (provider core)</dt><dd>A core router that only forwards labelled or IP traffic and carries no customer state.</dd>
<dt>CE (customer edge)</dt><dd>The customer's own router or switch.</dd>
<dt>Control plane / data plane</dt><dd>The part of a router that builds routing and label tables, and the part that forwards packets with them.</dd>
<dt>NFV</dt><dd>Network functions virtualization: running network functions as software on standard servers instead of dedicated appliances.</dd>
</dl>

<h3>Why a provider network differs from an enterprise network</h3>
<ul>
<li><b>Scale</b>: millions of subscribers, hundreds of thousands of routes, and very high port speeds.</li>
<li><b>Multi-tenancy</b>: many customers share one infrastructure and must be isolated.</li>
<li><b>Availability</b>: five-nines targets mean failures must be handled without human help, often in tens of milliseconds.</li>
<li><b>Service revenue</b>: every outage is lost income and may break a contract, so change control and in-service upgrades matter.</li>
<li><b>Operational model</b>: automation, telemetry and a clear division between a lean core and a rich edge.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A regional operator has 800,000 broadband subscribers served by 400 access nodes. Each access node uplinks to one of 20 aggregation pairs. The 20 aggregation pairs connect to 4 core sites. Two Internet gateways at two of the core sites connect to transit and peering. A fault at an access node affects about 2,000 subscribers. A fault at one aggregation router should affect nobody, because there is a pair. Designing the numbers backwards from "what may fail and how many people notice" is the core of SP design.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the provider network as a bigger enterprise campus. A campus tolerates minutes of downtime and manual fixes; a provider design assumes constant failures and automated recovery.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know which tier does what: access connects users, aggregation collects and applies policy, the core moves traffic with simple fast forwarding, and the edge connects to other networks and holds service state.</p></div>

<div class="scn"><h4>Putting the BNG in the wrong tier</h4><p>An operator placed subscriber management functions in the core to save devices. When a core router rebooted for an upgrade, tens of thousands of subscribers dropped sessions at once. The next design moved subscriber management to the edge in redundant pairs, leaving the core with only label forwarding.</p><p><b>Lesson:</b> keep per-subscriber state at the edge and keep the core simple.</p></div>

<div class="iv"><p class="q">"Describe the layers of a service provider network."</p><p>Access connects subscribers and cell sites. Aggregation collects access traffic, enforces policy and often hosts service edges. The core transports traffic quickly with simple forwarding and rapid recovery. The edge connects to other networks and customers' VPNs. Mention PE, P and CE roles and that state is pushed to the edge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SP networks are tiered: access, aggregation, core, edge.</li>
<li>PE holds service state; P only forwards.</li>
<li>Scale, multi-tenancy and availability shape every design choice.</li>
<li>Cisco software comes as IOS, IOS XE and IOS XR, each for different roles.</li>
<li>No labs here; practise protocols in spcor-mpls-ldp and spcor-l3vpn.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki service provider network kaise organise hota hai (access, aggregation, core aur edge), woh aise kyun banaya jaata hai, Cisco ke teen operating systems (IOS, IOS XE aur IOS XR) mein kya farq hai, IOS XR configuration model kaise kaam karta hai, aur network functions virtualization (NFV) kahan fit hota hai. Yeh Cisco CCNP Service Provider core exam (SPCOR 350-501) ka architecture block hai, aur yeh aapko baaki SPCOR modules ki vocabulary deta hai.</p>
<p><b>Prerequisites.</b> Aapko IP routing basics, VLANs aur MPLS kya hai (high level par) pata hona chahiye. Protocol ki gehri detail spcor-isis, spcor-bgp, spcor-mpls-ldp aur spcor-l3vpn mein aati hai, jo aap is module se pehle ya baad mein padh sakte ho.</p>
<p><b>Practice ke baare mein honest note.</b> Is module mein labs nahi hain, kyunki yeh zyaadatar design aur platform concepts ke baare mein hai, aur simulator IOS XR ya NFV platforms model nahi karta. Yahan dikhayi gayi configuration par <i>Reference configuration (not run in the simulator)</i> likha hai. Is architecture ke andar chalne wale protocols practise karne ke liye spcor-mpls-ldp aur spcor-l3vpn use karo.</p>

<h3>Analogy: shehar ka road aur rail system</h3>
<p>Ek bade shehar ke baare mein socho. Residents apne gharon se <b>local streets</b> (access network) par nikalte hain. Yeh streets <b>district roads aur bus depots</b> mein milti hain jahan kai streets ka traffic ikattha hota hai (aggregation). District roads <b>expressways aur rail trunks</b> se judti hain jo districts ke beech bahut bada volume tezi se le jaate hain (core). Shehar ki seema par <b>airports, ports aur highway toll gates</b> (edge) hain jo bahar ki duniya se jodte hain. Har tier ka kaam alag hai: sabko sasta pahunchana, traffic kushalta se ikattha karna, tezi se le jaana, aur doosron se exchange karna. Provider network bhi isi tarah organise hota hai, aur har tier ka equipment us tier ke kaam ke liye chuna jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SP network tiers">
<rect x="15" y="40" width="120" height="150" rx="10" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="14">Access</text><text x="75" y="95" text-anchor="middle" class="svg-muted" font-size="11">ghar, businesses,</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="11">cell sites</text><text x="75" y="140" text-anchor="middle" class="svg-muted" font-size="11">kai low-speed ports</text>
<rect x="165" y="40" width="130" height="150" rx="10" fill="#bbf7d0"/><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="14">Aggregation</text><text x="230" y="95" text-anchor="middle" class="svg-muted" font-size="11">access ikattha karta hai,</text><text x="230" y="110" text-anchor="middle" class="svg-muted" font-size="11">service policy lagata hai</text>
<rect x="325" y="40" width="130" height="150" rx="10" fill="#ddd6fe"/><text x="390" y="70" text-anchor="middle" class="svg-ink" font-size="14">Core</text><text x="390" y="95" text-anchor="middle" class="svg-muted" font-size="11">tez, simple,</text><text x="390" y="110" text-anchor="middle" class="svg-muted" font-size="11">highly available</text>
<rect x="485" y="40" width="140" height="150" rx="10" fill="#fde68a"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="14">Edge / peering</text><text x="555" y="95" text-anchor="middle" class="svg-muted" font-size="11">Internet, doosre</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="11">providers, data centres</text>
<line x1="135" y1="115" x2="165" y2="115" stroke="#64748b" stroke-width="2"/><line x1="295" y1="115" x2="325" y2="115" stroke="#64748b" stroke-width="2"/><line x1="455" y1="115" x2="485" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">Andar aate waqt traffic ikattha hota hai, bahar jaate waqt distribute</text>
</svg><p class="cap">Service provider network ke classic chaar tiers.</p></div>

<h3>Key terms</h3>
<dl class="terms">
<dt>Service provider (SP)</dt><dd>Aisi organisation jo kai customers ko connectivity ya network services bechti hai: broadband, mobile, enterprise VPNs, Internet transit.</dd>
<dt>PE (provider edge)</dt><dd>Provider network ke edge par router jo customers se jodta hai aur VRFs tatha pseudowires jaisi service state rakhta hai.</dd>
<dt>P (provider core)</dt><dd>Core router jo sirf labelled ya IP traffic forward karta hai aur customer state nahi rakhta.</dd>
<dt>CE (customer edge)</dt><dd>Customer ka apna router ya switch.</dd>
<dt>Control plane / data plane</dt><dd>Router ka woh hissa jo routing aur label tables banata hai, aur woh hissa jo unse packets forward karta hai.</dd>
<dt>NFV</dt><dd>Network functions virtualization: network functions ko dedicated appliances ki jagah standard servers par software ke roop mein chalana.</dd>
</dl>

<h3>Provider network enterprise network se alag kyun hai</h3>
<ul>
<li><b>Scale</b>: millions subscribers, lakhon routes, aur bahut high port speeds.</li>
<li><b>Multi-tenancy</b>: kai customers ek infrastructure share karte hain aur unhe isolate rehna zaroori hai.</li>
<li><b>Availability</b>: five-nines targets ka matlab hai failures bina insaani madad ke handle ho, aksar das-dahaai milliseconds mein.</li>
<li><b>Service revenue</b>: har outage lost income hai aur contract tod sakta hai, isliye change control aur in-service upgrades matter karte hain.</li>
<li><b>Operational model</b>: automation, telemetry aur lean core tatha rich edge ke beech saaf baant.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Regional operator ke 800,000 broadband subscribers 400 access nodes se serve hote hain. Har access node 20 aggregation pairs mein se ek se uplink karta hai. 20 aggregation pairs 4 core sites se jude hain. Do Internet gateways do core sites par transit aur peering se jude hain. Ek access node ki fault lagbhag 2,000 subscribers ko affect karti hai. Ek aggregation router ki fault kisi ko affect nahi karni chahiye, kyunki pair hai. "Kya fail ho sakta hai aur kitne logon ko pata chalega" se numbers ko ulta design karna SP design ka core hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Provider network ko bada enterprise campus samajhna. Campus minutes ka downtime aur manual fixes sah leta hai; provider design maan ke chalta hai ki failures lagataar hongi aur recovery automatic hogi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano kaun sa tier kya karta hai: access users ko jodta hai, aggregation ikattha karta aur policy lagata hai, core simple fast forwarding se traffic le jaata hai, aur edge doosre networks se jodta aur service state rakhta hai.</p></div>

<div class="scn"><h4>BNG ko galat tier mein rakhna</h4><p>Operator ne devices bachane ke liye subscriber management functions core mein rakhe. Jab ek core router upgrade ke liye reboot hua, to hazaron subscribers ke sessions ek saath gir gaye. Agle design mein subscriber management ko edge mein redundant pairs mein le jaya gaya, aur core mein sirf label forwarding rakhi gayi.</p><p><b>Lesson:</b> per-subscriber state edge par rakho aur core ko simple rakho.</p></div>

<div class="iv"><p class="q">"Service provider network ki layers describe karo."</p><p>Access subscribers aur cell sites ko jodta hai. Aggregation access traffic ikattha karta hai, policy lagata hai aur aksar service edges host karta hai. Core simple forwarding aur rapid recovery se traffic tezi se transport karta hai. Edge doosre networks aur customers ke VPNs se jodta hai. PE, P aur CE roles batao aur yeh ki state edge ki taraf dhakeli jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SP networks tiered hote hain: access, aggregation, core, edge.</li>
<li>PE service state rakhta hai; P sirf forward karta hai.</li>
<li>Scale, multi-tenancy aur availability har design choice ko shape karte hain.</li>
<li>Cisco software IOS, IOS XE aur IOS XR ke roop mein aata hai, har ek alag roles ke liye.</li>
<li>Yahan labs nahi; protocols spcor-mpls-ldp aur spcor-l3vpn mein practise karo.</li>
</ul></div>
`}};export{e as default};