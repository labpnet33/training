var e={id:`big-picture`,h:{en:`The big picture: why providers and data centres need new tools`,hi:`Big picture: providers aur data centres ko naye tools kyun chahiye`},body:{en:`
<p><b>What you will learn in this module.</b> You will meet the whole Segment Routing and EVPN track before touching a single command. You will learn why a service provider wants labels without a separate label protocol, why a data centre wants an overlay with a real control plane, how the eight modules fit together, how the simulated labs behave, and a one-page map of every term you will meet later. <b>Prerequisites:</b> you know what an IP address, a subnet, a router and a switch are, and you have seen a routing protocol (OSPF or IS-IS) work. Nothing else is assumed.</p>

<h3>An analogy: the railway and the courier</h3>
<p>Imagine a country with a railway network. A normal IP network is like a train system where every station decides, for every parcel, which platform it goes to next, by reading the full address on the parcel. That works, but every station needs the whole map and every parcel is examined at every station.</p>
<p>Now give every parcel a short coloured tag. A station only reads the tag and puts the parcel on the matching train; it does not read the address. That is <b>MPLS</b>: a short <b>label</b> replaces the address lookup inside the provider network. The question is who tells the stations which tag means which destination. The old answer is a second protocol (LDP). The new answer, <b>Segment Routing (SR)</b>, lets the routing protocol you already run (IS-IS) hand out the tags itself. One protocol fewer to run, one fewer thing to break.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IP lookup versus labels">
<rect x="10" y="20" width="290" height="120" rx="8" fill="#e2e8f0"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">Plain IP</text>
<text x="155" y="75" text-anchor="middle" class="svg-muted" font-size="12">every router reads the full address</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="12">every router needs a big routing table</text>
<rect x="340" y="20" width="290" height="120" rx="8" fill="#bae6fd"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">Labels (MPLS / SR)</text>
<text x="485" y="75" text-anchor="middle" class="svg-muted" font-size="12">core routers read only a short label</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="12">core needs no customer routes</text>
</svg><p class="cap">Labels move the heavy work to the edge of the network.</p></div>

<h3>Two worlds, one track</h3>
<p>This track covers two connected worlds.</p>
<ul>
<li><b>The provider world (Segment Routing, L3VPN).</b> A provider such as our simulated Kaveri Telecom carries many customers over one core. The core must be fast, simple and protected against link failures. SR gives the labels; an L3VPN gives each customer a private network on top.</li>
<li><b>The data centre world (VXLAN, EVPN, ESI).</b> A data centre has hundreds of racks. Virtual machines move and need the same subnet in different racks. <b>VXLAN</b> stretches a Layer 2 network over a Layer 3 fabric; <b>EVPN</b> is the control plane (based on BGP) that tells every switch where every MAC address and IP prefix lives; <b>ESI</b> lets a server connect to two switches at once without loops.</li>
</ul>
<p>Both worlds share one idea: <b>an underlay that is simple and an overlay that carries the service</b>. The underlay only moves packets between loopbacks. The overlay says who may talk to whom. Once you see this pattern, SR with L3VPN and VXLAN with EVPN stop looking like two topics.</p>

<div class="eg"><b>Worked example.</b> Ananta Foods has an office in Mumbai and a plant in Chennai. Kaveri Telecom connects them over a five-router ring. The core routers never see Ananta Foods addresses: they see only a label that means "deliver to the Chennai edge router". When the customer next door (Bharat Retail) uses the same 172.16.1.0/24 addresses, nothing clashes because each customer has its own VRF at the edge.</div>

<div class="warn"><b>Common mistake.</b> Beginners think SR and MPLS are rivals. They are not: SR is a different way to distribute the same MPLS labels. The packets on the wire still carry MPLS labels.</div>

<div class="scn"><h4>The 2 a.m. call</h4><p>A provider engineer is told that a customer VPN is down. Pings between PE loopbacks work, so she assumes the core is healthy. In the lab you will see why that is a trap: plain IP works while labelled traffic fails, because the core has a router that forgot to switch on SR in IS-IS. She finds it by reading the label table, not by pinging.</p><p><b>Lesson:</b> check the data plane the way the customer traffic uses it, with labels.</p></div>

<div class="iv"><p class="q">"Why would a provider replace LDP with segment routing?"</p><p>Fewer protocols: IS-IS distributes the labels, so there is no separate LDP session to maintain or to desynchronise. Labels are derived from an index and a common label block, so they are predictable. SR also enables TI-LFA fast reroute and traffic engineering without RSVP state in the core.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS labels let core routers forward without customer routes.</li>
<li>Segment Routing lets the IGP (IS-IS) distribute the labels, replacing LDP.</li>
<li>VXLAN plus EVPN does for data centres what labels plus VPNs do for providers: an overlay with a control plane.</li>
<li>Always think underlay (moves packets between loopbacks) and overlay (carries the service).</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Ek bhi command chhune se pehle aap poora Segment Routing aur EVPN track dekhoge. Aap seekhoge ki service provider ko alag label protocol ke bina labels kyun chahiye, data centre ko asli control plane wala overlay kyun chahiye, aath modules kaise jude hain, simulated labs kaise behave karte hain, aur har term ka one-page map jo aage milne wala hai. <b>Prerequisites:</b> aap jaante ho IP address, subnet, router aur switch kya hote hain, aur aapne koi routing protocol (OSPF ya IS-IS) chalta dekha hai. Isse zyada kuch assume nahi kiya gaya.</p>

<h3>Ek analogy: railway aur courier</h3>
<p>Ek desh socho jisme railway network hai. Normal IP network aisa train system hai jahan har station, har parcel ke liye, parcel par likha poora address padh kar tay karta hai ki agla platform kaunsa hoga. Yeh chalta hai, par har station ko poora map chahiye aur har parcel har station par examine hota hai.</p>
<p>Ab har parcel ko ek chhota coloured tag do. Station sirf tag padhta hai aur parcel ko matching train mein daal deta hai; address nahi padhta. Yahi <b>MPLS</b> hai: provider network ke andar ek chhota <b>label</b> address lookup ki jagah leta hai. Sawaal yeh hai ki stations ko kaun batata hai ki kaunsa tag kis destination ka hai. Purana jawab ek doosra protocol (LDP) hai. Naya jawab, <b>Segment Routing (SR)</b>, aapke chalte routing protocol (IS-IS) ko hi tags baantne deta hai. Ek protocol kam chalana, tootne ki ek cheez kam.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IP lookup versus labels">
<rect x="10" y="20" width="290" height="120" rx="8" fill="#e2e8f0"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">Plain IP</text>
<text x="155" y="75" text-anchor="middle" class="svg-muted" font-size="12">har router poora address padhta hai</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="12">har router ko badi routing table chahiye</text>
<rect x="340" y="20" width="290" height="120" rx="8" fill="#bae6fd"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">Labels (MPLS / SR)</text>
<text x="485" y="75" text-anchor="middle" class="svg-muted" font-size="12">core router sirf chhota label padhta hai</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="12">core ko customer routes nahi chahiye</text>
</svg><p class="cap">Labels bhaari kaam ko network ke edge par le jaate hain.</p></div>

<h3>Do duniya, ek track</h3>
<p>Yeh track do jude hue worlds cover karta hai.</p>
<ul>
<li><b>Provider world (Segment Routing, L3VPN).</b> Hamare simulated Kaveri Telecom jaisa provider ek core par kai customers ko le jaata hai. Core fast, simple aur link failures se protected hona chahiye. SR labels deta hai; L3VPN har customer ko uske upar private network deta hai.</li>
<li><b>Data centre world (VXLAN, EVPN, ESI).</b> Data centre mein sau-sau racks hote hain. Virtual machines move karti hain aur alag racks mein same subnet chahiye. <b>VXLAN</b> Layer 2 network ko Layer 3 fabric par stretch karta hai; <b>EVPN</b> woh control plane hai (BGP par based) jo har switch ko batata hai ki har MAC address aur IP prefix kahan hai; <b>ESI</b> server ko ek saath do switches se jodta hai bina loops ke.</li>
</ul>
<p>Dono worlds ka ek hi idea hai: <b>underlay simple, overlay service le jaaye</b>. Underlay sirf loopbacks ke beech packets move karta hai. Overlay batata hai kaun kisse baat kar sakta hai. Yeh pattern dikh jaaye to SR ke saath L3VPN aur VXLAN ke saath EVPN do alag topics nahi lagte.</p>

<div class="eg"><b>Worked example.</b> Ananta Foods ka Mumbai mein office aur Chennai mein plant hai. Kaveri Telecom unhe paanch routers ki ring se jodta hai. Core routers kabhi Ananta Foods ke addresses nahi dekhte: woh sirf ek label dekhte hain jiska matlab hai "Chennai edge router ko deliver karo". Jab paas ka customer (Bharat Retail) wahi 172.16.1.0/24 addresses use kare, to koi clash nahi hota kyunki har customer ka edge par apna VRF hai.</div>

<div class="warn"><b>Common mistake.</b> Beginners sochte hain SR aur MPLS rivals hain. Aisa nahi hai: SR wahi MPLS labels distribute karne ka alag tareeka hai. Wire par packets ab bhi MPLS labels le jaate hain.</div>

<div class="scn"><h4>Raat 2 baje ka call</h4><p>Provider engineer ko bataya jaata hai ki customer VPN down hai. PE loopbacks ke beech ping chalte hain, isliye woh maan leti hai ki core theek hai. Lab mein aap dekhoge ki yeh trap kyun hai: plain IP chalta hai jabki labelled traffic fail hota hai, kyunki core ke ek router ne IS-IS mein SR on karna bhula diya. Woh ise ping se nahi, label table padh kar dhoondhti hai.</p><p><b>Lesson:</b> data plane ko usi tarah check karo jaise customer traffic use karta hai, labels ke saath.</p></div>

<div class="iv"><p class="q">"Provider LDP ki jagah segment routing kyun lagayega?"</p><p>Kam protocols: IS-IS labels distribute karta hai, isliye maintain karne ya out-of-sync hone wala alag LDP session nahi. Labels ek index aur common label block se nikalte hain, isliye predictable hain. SR se TI-LFA fast reroute aur core mein RSVP state ke bina traffic engineering bhi milta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS labels core routers ko customer routes ke bina forward karne dete hain.</li>
<li>Segment Routing IGP (IS-IS) ko labels distribute karne deta hai, LDP ki jagah.</li>
<li>VXLAN plus EVPN data centres ke liye wahi karta hai jo labels plus VPNs providers ke liye: control plane wala overlay.</li>
<li>Hamesha underlay (loopbacks ke beech packets) aur overlay (service) ke terms mein socho.</li>
</ul></div>
`}};export{e as default};