var e={id:`vpn-and-overlay`,h:{en:`Overlays: how one network carries many customers`,hi:`Overlays: ek network kai customers ko kaise le jaata hai`},body:{en:`
<p>The provider core of the previous chapter is only a transport. The business is what rides on it: <b>virtual private networks</b>. This chapter introduces the overlay idea with the L3VPN you will build in sre-sr-vpn, and then shows the same idea in a data centre.</p>

<h3>The problem: many customers, one core, overlapping addresses</h3>
<p>Ananta Foods uses 172.16.1.0/24 in Mumbai. Bharat Retail, another customer of the same provider, also uses 172.16.1.0/24. If the core simply routed both, their packets would mix. The provider needs <b>separation</b> without buying a separate network for each customer.</p>

<h3>The L3VPN answer in four terms</h3>
<dl class="terms">
<dt>VRF</dt><dd>A separate routing table on the PE. Each customer-facing interface belongs to exactly one VRF.</dd>
<dt>Route distinguisher (RD)</dt><dd>A 64-bit tag put in front of every customer prefix inside BGP (65000:1:172.16.1.0/24) so that overlapping prefixes become unique. It makes routes distinct; it does not decide who imports them.</dd>
<dt>Route target (RT)</dt><dd>An extended community attached to a route. A VRF exports routes with its export RT and imports every route that carries one of its import RTs. RTs decide the topology.</dd>
<dt>VPN label</dt><dd>The inner label that tells the egress PE which VRF a packet belongs to.</dd></dl>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two customers over one core">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#fde68a"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="12">Ananta Mumbai</text>
<rect x="20" y="120" width="110" height="40" rx="8" fill="#fed7aa"/><text x="75" y="145" text-anchor="middle" class="svg-ink" font-size="12">Bharat Pune</text>
<rect x="180" y="70" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="215" y="100" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="290" y="70" width="60" height="50" rx="8" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">core</text>
<rect x="390" y="70" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="425" y="100" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<rect x="510" y="20" width="110" height="40" rx="8" fill="#fde68a"/><text x="565" y="45" text-anchor="middle" class="svg-ink" font-size="12">Ananta Chennai</text>
<rect x="510" y="120" width="110" height="40" rx="8" fill="#fed7aa"/><text x="565" y="145" text-anchor="middle" class="svg-ink" font-size="12">Bharat Delhi</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="40" x2="180" y2="85"/><line x1="130" y1="140" x2="180" y2="105"/><line x1="250" y1="95" x2="290" y2="95"/><line x1="350" y1="95" x2="390" y2="95"/><line x1="460" y1="85" x2="510" y2="40"/><line x1="460" y1="105" x2="510" y2="140"/></g>
</svg><p class="cap">Two customers, both with 172.16.1.0/24, share the same PE routers and core but live in different VRFs.</p></div>

<h3>The same idea in a data centre</h3>
<p>A data centre has the same need: many tenants and many racks over one physical network. The answer is again an overlay.</p>
<table class="cmp"><tr><th>Question</th><th>Provider (L3VPN over SR)</th><th>Data centre (VXLAN with EVPN)</th></tr>
<tr><td>Underlay</td><td>IS-IS with SR labels between PE loopbacks</td><td>OSPF between leaf and spine loopbacks</td></tr>
<tr><td>Overlay tunnel</td><td>Label stack (transport plus VPN label)</td><td>VXLAN header with a 24-bit VNI</td></tr>
<tr><td>Separation tag</td><td>VRF, RD, RT</td><td>VNI, EVI, RD, RT</td></tr>
<tr><td>Control plane</td><td>MP-BGP VPNv4</td><td>MP-BGP EVPN</td></tr>
<tr><td>Edge device</td><td>PE</td><td>Leaf (VTEP)</td></tr></table>
<p>Notice how the rows match one to one. If you learn route targets once, you will recognise them in EVPN. That is why this track teaches both halves together.</p>

<div class="eg"><b>Worked example.</b> A route target is like a mailing list. The VRF of Ananta Foods in Mumbai "posts" its routes to list 65000:1 and "subscribes" to list 65000:1. The VRF of the Chennai site does the same, so the two exchange routes. If Chennai subscribed to 65000:10 by a typo, it would never receive the Mumbai posts, even though the BGP session is healthy.</div>

<div class="warn"><b>Common mistake.</b> Believing the RD controls who sees a route. It only makes the prefix unique. Wrong visibility is almost always a route-target problem.</div>

<div class="exam"><b>Exam trap.</b> Route targets travel as BGP extended communities. A neighbour that is activated for VPNv4 but not sending extended communities delivers routes without RTs, and the receiver imports nothing.</div>

<div class="scn"><h4>The half-working VPN</h4><p>Chennai could open pages in Mumbai but Mumbai got nothing back. The sessions were all up. The engineer compared the VRF routing tables on both PEs, not only the BGP summary, and found that one PE held no remote routes. The cause was a missing extended community setting on the other PE.</p><p><b>Lesson:</b> when a VPN works one way, compare what each PE imported.</p></div>

<div class="iv"><p class="q">"What is the difference between an RD and an RT?"</p><p>The RD makes overlapping prefixes unique inside BGP; the RT controls which VRFs import and export routes and so defines the VPN topology. Add that the VPN label identifies the VRF in the data plane.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An overlay carries the service; the underlay only moves packets between loopbacks.</li>
<li>VRF separates tables, RD makes prefixes unique, RT decides who imports.</li>
<li>L3VPN over SR and EVPN over VXLAN are two instances of the same pattern.</li>
<li>VPN problems are usually RT, extended-community or transport-label problems.</li>
</ul></div>
`,hi:`
<p>Pichhle chapter ka provider core sirf transport hai. Business woh hai jo uspar chalta hai: <b>virtual private networks</b>. Yeh chapter sre-sr-vpn mein banne wale L3VPN ke saath overlay idea batata hai, aur phir wahi idea data centre mein dikhata hai.</p>

<h3>Problem: kai customers, ek core, overlapping addresses</h3>
<p>Ananta Foods Mumbai mein 172.16.1.0/24 use karta hai. Bharat Retail, usi provider ka doosra customer, bhi 172.16.1.0/24 use karta hai. Agar core dono ko seedha route kare to unke packets mix ho jayenge. Provider ko har customer ke liye alag network kharide bina <b>separation</b> chahiye.</p>

<h3>L3VPN ka jawab, chaar terms mein</h3>
<dl class="terms">
<dt>VRF</dt><dd>PE par alag routing table. Har customer-facing interface bilkul ek VRF ka hota hai.</dd>
<dt>Route distinguisher (RD)</dt><dd>64-bit tag jo BGP ke andar har customer prefix ke aage lagta hai (65000:1:172.16.1.0/24) taaki overlapping prefixes unique ho jaayein. Yeh routes ko alag banata hai; kaun import karega yeh tay nahi karta.</dd>
<dt>Route target (RT)</dt><dd>Route ke saath juda extended community. VRF apne export RT se routes export karta hai aur har woh route import karta hai jisme uska koi import RT ho. RTs topology tay karte hain.</dd>
<dt>VPN label</dt><dd>Andar wala label jo egress PE ko batata hai ki packet kaunse VRF ka hai.</dd></dl>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two customers over one core">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#fde68a"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="12">Ananta Mumbai</text>
<rect x="20" y="120" width="110" height="40" rx="8" fill="#fed7aa"/><text x="75" y="145" text-anchor="middle" class="svg-ink" font-size="12">Bharat Pune</text>
<rect x="180" y="70" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="215" y="100" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="290" y="70" width="60" height="50" rx="8" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">core</text>
<rect x="390" y="70" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="425" y="100" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<rect x="510" y="20" width="110" height="40" rx="8" fill="#fde68a"/><text x="565" y="45" text-anchor="middle" class="svg-ink" font-size="12">Ananta Chennai</text>
<rect x="510" y="120" width="110" height="40" rx="8" fill="#fed7aa"/><text x="565" y="145" text-anchor="middle" class="svg-ink" font-size="12">Bharat Delhi</text>
<g stroke="#64748b" stroke-width="2"><line x1="130" y1="40" x2="180" y2="85"/><line x1="130" y1="140" x2="180" y2="105"/><line x1="250" y1="95" x2="290" y2="95"/><line x1="350" y1="95" x2="390" y2="95"/><line x1="460" y1="85" x2="510" y2="40"/><line x1="460" y1="105" x2="510" y2="140"/></g>
</svg><p class="cap">Do customers, dono ke paas 172.16.1.0/24, same PE routers aur core share karte hain par alag VRFs mein rehte hain.</p></div>

<h3>Wahi idea data centre mein</h3>
<p>Data centre ko bhi wahi zaroorat hai: ek physical network par kai tenants aur kai racks. Jawab phir overlay hai.</p>
<table class="cmp"><tr><th>Sawaal</th><th>Provider (SR par L3VPN)</th><th>Data centre (EVPN ke saath VXLAN)</th></tr>
<tr><td>Underlay</td><td>PE loopbacks ke beech SR labels ke saath IS-IS</td><td>Leaf aur spine loopbacks ke beech OSPF</td></tr>
<tr><td>Overlay tunnel</td><td>Label stack (transport plus VPN label)</td><td>24-bit VNI wala VXLAN header</td></tr>
<tr><td>Separation tag</td><td>VRF, RD, RT</td><td>VNI, EVI, RD, RT</td></tr>
<tr><td>Control plane</td><td>MP-BGP VPNv4</td><td>MP-BGP EVPN</td></tr>
<tr><td>Edge device</td><td>PE</td><td>Leaf (VTEP)</td></tr></table>
<p>Dekho rows ek-ek karke match karti hain. Route targets ek baar seekh lo to EVPN mein pehchaan loge. Isi liye yeh track dono halves ek saath sikhata hai.</p>

<div class="eg"><b>Worked example.</b> Route target ek mailing list jaisa hai. Mumbai mein Ananta Foods ka VRF apne routes list 65000:1 par "post" karta hai aur list 65000:1 ko "subscribe" karta hai. Chennai site ka VRF bhi yahi karta hai, isliye dono routes exchange karte hain. Agar Chennai ne typo se 65000:10 subscribe kar liya, to woh Mumbai ke posts kabhi receive nahi karega, bhale BGP session healthy ho.</div>

<div class="warn"><b>Common mistake.</b> Yeh maan lena ki RD tay karta hai kaun route dekhega. Woh sirf prefix ko unique banata hai. Galat visibility lagbhag hamesha route-target problem hoti hai.</div>

<div class="exam"><b>Exam trap.</b> Route targets BGP extended communities ki tarah jaate hain. Jo neighbour VPNv4 ke liye activate hai par extended communities nahi bhej raha, woh bina RT ke routes deta hai, aur receiver kuch import nahi karta.</div>

<div class="scn"><h4>Aadha chalta VPN</h4><p>Chennai Mumbai ke pages khol sakta tha par Mumbai ko kuch wapas nahi mila. Sab sessions up the. Engineer ne sirf BGP summary nahi, dono PEs ki VRF routing tables compare ki, aur dekha ki ek PE ke paas koi remote route nahi tha. Wajah doosre PE par extended community setting ka missing hona thi.</p><p><b>Lesson:</b> jab VPN ek taraf chalta hai, to dekho har PE ne kya import kiya.</p></div>

<div class="iv"><p class="q">"RD aur RT mein kya fark hai?"</p><p>RD BGP ke andar overlapping prefixes ko unique banata hai; RT tay karta hai ki kaunse VRFs routes import aur export karte hain aur isliye VPN topology define karta hai. Jodo ki VPN label data plane mein VRF ko pehchanta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overlay service le jaata hai; underlay sirf loopbacks ke beech packets move karta hai.</li>
<li>VRF tables alag karta hai, RD prefixes ko unique banata hai, RT tay karta hai kaun import karega.</li>
<li>SR par L3VPN aur VXLAN par EVPN ek hi pattern ke do instances hain.</li>
<li>VPN problems aam taur par RT, extended-community ya transport-label problems hoti hain.</li>
</ul></div>
`}};export{e as default};