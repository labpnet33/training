var e={id:`rtbh`,h:{en:`Surviving a DDoS: remotely triggered black hole filtering (RTBH)`,hi:`DDoS se bachna: remotely triggered black hole filtering (RTBH)`},body:{en:`
<p><b>The dilemma.</b> A customer host, say 203.0.113.10, is hit by a volumetric flood. The traffic is so large that it fills the provider's transit links and hurts every other customer. Waiting is not an option. The provider (or the customer) can decide to sacrifice the one victim address to save everyone else: <b>discard all traffic to 203.0.113.10 at the edge of the network</b>. This is called a <b>black hole</b>. The challenge is doing it on hundreds of routers within seconds. The answer is to use BGP as the messenger: <b>Remotely Triggered Black Hole (RTBH)</b> filtering.</p>
<h3>The mechanism in three steps</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Trigger</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">originates /32 route</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">iBGP</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">distributes the route</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Edge routers</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">next-hop 192.0.2.1</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Null0</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">packets discarded</text></svg><p class="cap">The pre-configured discard next-hop turns a BGP update into a drop on every router.</p></div>
<ul><li><b>Step 1, preparation (done once, in peacetime).</b> On every edge router configure a static route for an unused address, for example 192.0.2.1/32, pointing to <code>Null0</code>. That address is the <b>discard next-hop</b>. Nothing uses it until an attack.</li>
<li><b>Step 2, trigger.</b> The trigger originates a /32 route for the victim, 203.0.113.10/32, with BGP next-hop 192.0.2.1 and usually a community such as no-export. It is injected into iBGP, often through route reflectors.</li>
<li><b>Step 3, discard.</b> Each edge router receives the route, recursively resolves 192.0.2.1 to Null0, and drops all traffic to 203.0.113.10 in its forwarding table. The flood now dies at the first router it meets.</li></ul>
<p><b>Reference configuration (not run in the simulator).</b> Peacetime preparation, on every edge router, then the trigger route.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE</span>
<span class="c">! 1) On every edge router: the discard next-hop</span>
ip route 192.0.2.1 255.255.255.255 Null0

<span class="c">! 2) On the trigger router: mark victims with a tag, turn them into BGP routes</span>
route-map RTBH-TRIGGER permit 10
 match tag 66
 set ip next-hop 192.0.2.1
 set community no-export
 set origin igp
router bgp 65010
 redistribute static route-map RTBH-TRIGGER

<span class="c">! 3) When the attack starts, the operator adds ONE static route</span>
ip route 203.0.113.10 255.255.255.255 Null0 tag 66</pre>
<h3>Destination-based and source-based RTBH</h3>
<p>What you have just seen is <b>destination-based RTBH</b>. It stops the flood, but it also finishes the attacker's job for the victim: 203.0.113.10 is now unreachable by everyone. It protects the network, not the victim's service. If the attack comes from a small set of sources, <b>source-based RTBH</b> is better. It uses the same discard next-hop but the trigger route is for the attacking source address. Edges with loose uRPF then drop packets whose source resolves to the discard next-hop, because loose uRPF fails for a source whose route points to Null0. Source-based RTBH needs loose uRPF on the edge and works only if you know the sources; spoofed floods with random sources make it unreliable.</p>
<h3>Customer-triggered RTBH (RFC 7999)</h3>
<p>Customers should not need a phone call. Many providers let the customer signal black holing over eBGP: the customer announces the victim /32 with the well-known community <b>BLACKHOLE, 65535:666</b> (RFC 7999), or a provider-specific community. The provider's ingress policy checks that the prefix belongs to that customer, then sets the discard next-hop. The check matters: without it a customer could black-hole someone else's space.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - provider side</span>
ip prefix-list CUST-A-RANGE permit 203.0.113.0/24 le 32
ip community-list standard CL-BLACKHOLE permit 65535:666
route-map CUST-A-IN permit 10
 match ip address prefix-list CUST-A-RANGE
 match community CL-BLACKHOLE
 set ip next-hop 192.0.2.1
 set community no-export additive
route-map CUST-A-IN permit 20
 match ip address prefix-list CUST-A-RANGE
 <span class="c">! normal customer routes follow here</span></pre>
<div class="warn"><p><b>Common mistake.</b> Skipping the preparation step. If 192.0.2.1 is not routed to Null0, the black-hole route has no discard behaviour and traffic keeps flowing. Also, forgetting no-export can leak the /32 to the Internet; and accepting /32s from customers outside their own range is dangerous.</p></div>
<div class="exam"><p><b>Exam trap.</b> RTBH discards ALL traffic to the victim, good and bad. It trades the victim's availability for the network's. It needs only BGP and a static route, no special hardware. Flowspec (next chapter) is the finer tool.</p></div>
<div class="scn"><h4>Saving the other customers</h4><p>A flood of tens of gigabits aimed at one hosting customer saturated a provider's peering link, and neighbouring customers saw packet loss. The on-call engineer added one tagged static route on the trigger router. Within seconds every edge router had the /32 resolving to Null0 and the peering link recovered. The hosting customer was offline for that address, so the customer then moved the service to another address and the /32 was removed after the attack subsided.</p><p><b>Lesson:</b> RTBH is a blunt but fast emergency brake.</p></div>
<div class="iv"><p class="q">"Explain RTBH step by step."</p><p>Preparation: every edge router has a static route to Null0 for a reserved next-hop such as 192.0.2.1. Trigger: a router originates the victim /32 into iBGP with that next-hop and no-export. Effect: each edge recursively resolves the next-hop to Null0 and drops traffic to the victim. Customers can trigger via the BLACKHOLE community 65535:666 with a prefix check. Source-based RTBH adds loose uRPF.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>RTBH uses BGP to install a discard route on all edge routers quickly.</li>
<li>Prepare 192.0.2.1 (or another reserved address) to Null0 everywhere, in advance.</li>
<li>Destination-based RTBH drops all traffic to the victim; source-based needs loose uRPF.</li>
<li>Customer trigger: community 65535:666 (RFC 7999) with prefix validation.</li>
<li>Use no-export and tight filters to avoid leaking /32s.</li></ul></div>
`,hi:`
<p><b>Dilemma.</b> Customer ka ek host, maan lo 203.0.113.10, volumetric flood ka shikaar hai. Traffic itna bada hai ki provider ke transit links bhar jaate hain aur baaki sabhi customers ko nuksaan hota hai. Intezaar karna option nahi hai. Provider (ya customer) decide kar sakta hai ki baaki sabko bachane ke liye ek victim address ko qurbaan kar do: <b>network ke edge par 203.0.113.10 ka saara traffic discard karo</b>. Isse <b>black hole</b> kehte hain. Chunauti yeh hai ki yeh sainkdon routers par seconds mein kaise ho. Jawab hai BGP ko messenger banana: <b>Remotely Triggered Black Hole (RTBH)</b> filtering.</p>
<h3>Mechanism teen steps mein</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Trigger</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">/32 route originate</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">iBGP</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">route distribute</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Edge routers</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">next-hop 192.0.2.1</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Null0</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">packets discard</text></svg><p class="cap">Pehle se configured discard next-hop BGP update ko har router par drop mein badal deta hai.</p></div>
<ul><li><b>Step 1, preparation (ek baar, shanti ke samay).</b> Har edge router par ek unused address, jaise 192.0.2.1/32, ke liye static route <code>Null0</code> ki taraf configure karo. Yeh address <b>discard next-hop</b> hai. Attack tak koi use nahi karta.</li>
<li><b>Step 2, trigger.</b> Trigger victim ke liye /32 route, 203.0.113.10/32, originate karta hai jiska BGP next-hop 192.0.2.1 hota hai aur aam taur par no-export jaisa community. Ise iBGP mein inject karte hain, aksar route reflectors ke zariye.</li>
<li><b>Step 3, discard.</b> Har edge router route receive karta hai, 192.0.2.1 ko recursively Null0 par resolve karta hai, aur apni forwarding table mein 203.0.113.10 ka saara traffic drop karta hai. Flood ab pehle router par hi mar jaata hai.</li></ul>
<p><b>Reference configuration (not run in the simulator).</b> Shanti ke samay ki preparation, har edge router par, phir trigger route.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE</span>
<span class="c">! 1) On every edge router: the discard next-hop</span>
ip route 192.0.2.1 255.255.255.255 Null0

<span class="c">! 2) On the trigger router: mark victims with a tag, turn them into BGP routes</span>
route-map RTBH-TRIGGER permit 10
 match tag 66
 set ip next-hop 192.0.2.1
 set community no-export
 set origin igp
router bgp 65010
 redistribute static route-map RTBH-TRIGGER

<span class="c">! 3) When the attack starts, the operator adds ONE static route</span>
ip route 203.0.113.10 255.255.255.255 Null0 tag 66</pre>
<h3>Destination-based aur source-based RTBH</h3>
<p>Aapne abhi <b>destination-based RTBH</b> dekha. Yeh flood rokta hai, par victim ke liye attacker ka kaam bhi poora kar deta hai: 203.0.113.10 ab sabke liye unreachable hai. Yeh network ko protect karta hai, victim ki service ko nahi. Agar attack sources ke chhote set se aa raha ho to <b>source-based RTBH</b> behtar hai. Yeh wahi discard next-hop use karta hai par trigger route attacking source address ka hota hai. Loose uRPF wale edges phir un packets ko drop karte hain jinka source discard next-hop par resolve hota hai, kyunki Null0 ki taraf wale route wale source ke liye loose uRPF fail hota hai. Source-based RTBH ko edge par loose uRPF chahiye aur yeh tabhi chalta hai jab sources pata hon; random spoofed sources wale flood ke saath yeh unreliable hai.</p>
<h3>Customer-triggered RTBH (RFC 7999)</h3>
<p>Customers ko phone call ki zaroorat nahi honi chahiye. Kai providers customer ko eBGP par black holing signal karne dete hain: customer victim /32 ko well-known community <b>BLACKHOLE, 65535:666</b> (RFC 7999) ya provider-specific community ke saath announce karta hai. Provider ki ingress policy check karti hai ki prefix us customer ka hai, phir discard next-hop set karti hai. Yeh check zaroori hai: iske bina customer kisi aur ka space black-hole kar sakta tha.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - provider side</span>
ip prefix-list CUST-A-RANGE permit 203.0.113.0/24 le 32
ip community-list standard CL-BLACKHOLE permit 65535:666
route-map CUST-A-IN permit 10
 match ip address prefix-list CUST-A-RANGE
 match community CL-BLACKHOLE
 set ip next-hop 192.0.2.1
 set community no-export additive
route-map CUST-A-IN permit 20
 match ip address prefix-list CUST-A-RANGE
 <span class="c">! normal customer routes follow here</span></pre>
<div class="warn"><p><b>Common mistake.</b> Preparation step skip karna. Agar 192.0.2.1 Null0 par routed nahi hai to black-hole route mein discard behaviour nahi hota aur traffic chalta rehta hai. Saath hi no-export bhoolne se /32 Internet par leak ho sakta hai; aur customer ki apni range ke bahar ke /32 accept karna khatarnak hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> RTBH victim ka SAARA traffic, achha aur bura, discard karta hai. Yeh victim ki availability ko network ki availability ke badle deta hai. Ise sirf BGP aur static route chahiye, special hardware nahi. Flowspec (agla chapter) behtar tool hai.</p></div>
<div class="scn"><h4>Baaki customers ko bachana</h4><p>Ek hosting customer par tens of gigabits ke flood ne provider ka peering link saturate kar diya, aur padosi customers ko packet loss dikha. On-call engineer ne trigger router par ek tagged static route add kiya. Seconds mein har edge router par /32 Null0 par resolve ho gaya aur peering link recover ho gaya. Hosting customer us address par offline raha, isliye usne service doosre address par move ki aur attack thamne par /32 hata diya gaya.</p><p><b>Lesson:</b> RTBH blunt par tez emergency brake hai.</p></div>
<div class="iv"><p class="q">"RTBH step by step samjhao."</p><p>Preparation: har edge router par reserved next-hop, jaise 192.0.2.1, ke liye Null0 ka static route hota hai. Trigger: ek router victim /32 ko us next-hop aur no-export ke saath iBGP mein originate karta hai. Effect: har edge next-hop ko recursively Null0 par resolve karke victim ka traffic drop karta hai. Customers BLACKHOLE community 65535:666 se prefix check ke saath trigger kar sakte hain. Source-based RTBH loose uRPF jodta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>RTBH BGP se saare edge routers par discard route jaldi install karta hai.</li>
<li>192.0.2.1 (ya doosra reserved address) pehle se Null0 par har jagah taiyar rakho.</li>
<li>Destination-based RTBH victim ka saara traffic drop karta hai; source-based ko loose uRPF chahiye.</li>
<li>Customer trigger: community 65535:666 (RFC 7999) prefix validation ke saath.</li>
<li>/32 leak se bachne ke liye no-export aur tight filters use karo.</li></ul></div>
`}};export{e as default};