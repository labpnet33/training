var e={id:`qos-models`,h:{en:`QoS models: best effort, IntServ and DiffServ`,hi:`QoS models: best effort, IntServ aur DiffServ`},body:{en:`
<p>Think of three ways to run a highway. In the first, there are no rules: whoever arrives first drives first, and ambulances sit in traffic like everyone else. In the second, every ambulance must phone every toll booth on its route before leaving and book a reserved lane; each booth keeps a notebook of every booking. In the third, ambulances simply switch on a siren, and every junction has one simple rule: "siren goes first". Those are the three QoS models: <b>best effort</b>, <b>IntServ</b> and <b>DiffServ</b>.</p>

<h3>Best effort</h3>
<p><b>Best effort</b> means no QoS at all. Every packet is treated the same and served <b>first in, first out (FIFO)</b>. It is simple, needs no configuration and scales perfectly, which is why the public internet mostly works this way. The price: no guarantee of delay, jitter or loss for anyone. A voice packet waits behind a large file transfer. For links that are never congested, best effort is perfectly fine.</p>

<h3>IntServ and RSVP</h3>
<p><b>Integrated Services (IntServ)</b> gives hard, per-flow guarantees. Before sending, an application uses <b>RSVP</b> (Resource Reservation Protocol) to signal its needs along the whole path. The sender sends a <b>PATH</b> message describing the flow; the receiver answers with a <b>RESV</b> message that asks every router, hop by hop back toward the sender, to reserve bandwidth. Each router performs <b>admission control</b>: if it cannot honour the request, the reservation is refused and the call can be blocked rather than degrade existing calls.</p>
<ul>
<li>Strength: an explicit, end-to-end guarantee per flow.</li>
<li>Weakness: every router keeps <b>state for every flow</b> and refreshes it constantly. Ten thousand phone calls means ten thousand reservations in every core router. That does not scale.</li>
</ul>
<p>RSVP is not dead: <b>RSVP-TE</b> reserves bandwidth for MPLS traffic engineering tunnels, and some voice designs use RSVP-based call admission control. But as a general enterprise QoS model, IntServ lost.</p>

<h3>DiffServ</h3>
<p><b>Differentiated Services (DiffServ)</b> is the model used in practically every enterprise and service provider network, and the one ENCOR expects you to configure. Its idea:</p>
<ol>
<li>At the <b>edge</b> of the network, <b>classify</b> each packet and <b>mark</b> it by writing a value, the <b>DSCP</b>, into its IP header.</li>
<li>Every router inside the <b>DiffServ domain</b> looks only at that marking and applies a <b>per-hop behaviour (PHB)</b>: priority queue, guaranteed share, higher drop probability, and so on.</li>
<li>No signalling and no per-flow state. Routers deal with a handful of <b>classes</b> (aggregates), not with thousands of flows.</li>
</ol>
<p>The trade-off is that DiffServ gives <b>relative</b> treatment, not an absolute end-to-end guarantee. It only works if every hop applies a consistent policy for the same markings, and if you do not admit more voice than the priority class can carry.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Three QoS models compared">
<rect x="10" y="20" width="195" height="180" rx="10" fill="#e2e8f0"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="14">Best effort</text>
<text x="107" y="80" text-anchor="middle" class="svg-muted" font-size="12">one FIFO queue</text><text x="107" y="105" text-anchor="middle" class="svg-muted" font-size="12">no marking</text><text x="107" y="130" text-anchor="middle" class="svg-muted" font-size="12">no guarantees</text><text x="107" y="165" text-anchor="middle" class="svg-accent" font-size="12">scales perfectly</text>
<rect x="222" y="20" width="195" height="180" rx="10" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">IntServ</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">RSVP PATH / RESV</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">per-flow state</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">admission control</text><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">hard guarantee, poor scale</text>
<rect x="435" y="20" width="195" height="180" rx="10" fill="#bbf7d0"/><text x="532" y="45" text-anchor="middle" class="svg-ink" font-size="14">DiffServ</text>
<text x="532" y="80" text-anchor="middle" class="svg-muted" font-size="12">mark DSCP at edge</text><text x="532" y="105" text-anchor="middle" class="svg-muted" font-size="12">PHB at every hop</text><text x="532" y="130" text-anchor="middle" class="svg-muted" font-size="12">per-class, no signalling</text><text x="532" y="165" text-anchor="middle" class="svg-accent" font-size="12">scales, relative QoS</text>
</svg><p class="cap">Best effort does nothing, IntServ reserves per flow, DiffServ marks once and treats classes at every hop.</p></div>

<table class="cmp"><tr><th></th><th>Best effort</th><th>IntServ</th><th>DiffServ</th></tr>
<tr><td>Signalling</td><td>none</td><td>RSVP, end to end</td><td>none</td></tr>
<tr><td>State in routers</td><td>none</td><td>per flow</td><td>per class</td></tr>
<tr><td>Guarantee</td><td>none</td><td>absolute, per flow</td><td>relative, per class</td></tr>
<tr><td>Scalability</td><td>excellent</td><td>poor</td><td>excellent</td></tr>
<tr><td>Typical use</td><td>internet, uncongested links</td><td>MPLS TE, call admission</td><td>enterprise and SP QoS</td></tr></table>

<h3>The DiffServ toolkit</h3>
<p>The rest of this module is the DiffServ toolkit, applied in this order along a packet's path:</p>
<ul>
<li><b>Classification and marking</b> (chapters 3 to 5): decide what a packet is, write the DSCP, usually <b>inbound</b> at the edge.</li>
<li><b>Congestion management, queuing</b> (chapter 6): decide who is sent next when the output queue fills, <b>outbound</b>.</li>
<li><b>Congestion avoidance</b> (chapter 7): drop some low-priority packets early, before the queue is full.</li>
<li><b>Policing and shaping</b> (chapter 8): enforce a rate by dropping or by delaying.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A branch has 30 concurrent G.711 calls. With IntServ, each call signals RSVP and every router on the path keeps 60 reservations (one per direction), refreshed every 30 seconds by default. With DiffServ, the phones' packets are marked EF once at the access edge, and every router has one priority class of, for example, 30 × 80 kbps = 2.4 Mbps, which it sizes and checks with a single policy. Growing to 3000 calls changes the size of the class, not the amount of state.</p></div>

<div class="warn"><p><b>Common mistake.</b> Believing that marking alone gives priority. A DSCP value is only a label. If the next router has no policy that matches EF and gives it a priority queue, the packet is still served FIFO.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Per-flow state, signalling, admission control, RSVP" always points to IntServ. "DSCP, PHB, aggregate classes, scalable" always points to DiffServ. Best effort is also a model, not the absence of one.</p></div>

<div class="scn"><h4>Two companies, two meanings of AF31</h4><p>After a merger, two WANs were connected. Calls between the old sites were fine, but calls across the new link broke up during business hours. Company A marked voice EF; company B's legacy phones marked voice AF31, and B's routers put AF31 into the priority queue. A's routers treated AF31 as ordinary data. The engineer re-marked AF31 from B's phones to EF at the interconnect and aligned both policies to one DSCP plan.</p><p><b>Lesson:</b> DiffServ only works when the whole domain agrees on what each marking means. Write down one DSCP plan and enforce it at every boundary.</p></div>

<div class="iv"><p class="q">"Compare IntServ and DiffServ. Which one would you deploy and why?"</p><p>Strong answer: IntServ uses RSVP PATH and RESV messages to reserve resources per flow with admission control, giving hard guarantees but requiring per-flow state in every router, so it does not scale. DiffServ classifies and marks DSCP at the edge and applies per-hop behaviours per class at each hop, with no signalling, so it scales. I would deploy DiffServ, sized so that the priority class can carry the admitted voice, and mention that RSVP survives in MPLS TE and call admission control.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Best effort: one FIFO queue, no guarantees, scales perfectly.</li>
<li>IntServ: RSVP PATH/RESV, per-flow reservation and admission control; hard guarantees but poor scalability.</li>
<li>DiffServ: mark DSCP at the edge, per-hop behaviour per class inside the domain; the enterprise standard.</li>
<li>A marking does nothing unless every hop has a matching policy.</li>
<li>The DiffServ toolkit: classify and mark, queue, avoid congestion, police and shape.</li>
</ul></div>
`,hi:`
<p>Highway chalane ke teen tarike socho. Pehle mein koi rule nahi: jo pehle aaya woh pehle chalega, aur ambulance bhi baaki sabki tarah traffic mein baithi rehti hai. Doosre mein har ambulance ko nikalne se pehle apne raaste ke har toll booth ko phone karke ek reserved lane book karni padti hai; har booth har booking ki notebook rakhta hai. Teesre mein ambulance bas siren on karti hai, aur har junction par ek simple rule hai: "siren pehle jaayega". Yahi teen QoS models hain: <b>best effort</b>, <b>IntServ</b> aur <b>DiffServ</b>.</p>

<h3>Best effort</h3>
<p><b>Best effort</b> ka matlab hai koi QoS nahi. Har packet ke saath same bartaav hota hai aur <b>first in, first out (FIFO)</b> serve hota hai. Yeh simple hai, koi configuration nahi chahiye aur perfectly scale karta hai, isiliye public internet zyada tar aise hi chalta hai. Keemat: kisi ke liye delay, jitter ya loss ki koi guarantee nahi. Voice packet ek badi file transfer ke peeche intezaar karta hai. Jo links kabhi congested nahi hote, unke liye best effort bilkul theek hai.</p>

<h3>IntServ aur RSVP</h3>
<p><b>Integrated Services (IntServ)</b> har flow ke liye hard guarantee deta hai. Bhejne se pehle application <b>RSVP</b> (Resource Reservation Protocol) se poore path par apni zaroorat signal karti hai. Sender flow describe karne wala <b>PATH</b> message bhejta hai; receiver <b>RESV</b> message se jawab deta hai jo sender ki taraf wapas hop by hop har router se bandwidth reserve karne ko kehta hai. Har router <b>admission control</b> karta hai: agar woh request poori nahi kar sakta, to reservation mana ho jaata hai aur call block ho sakti hai, taaki existing calls kharab na hon.</p>
<ul>
<li>Taakat: har flow ke liye explicit, end-to-end guarantee.</li>
<li>Kamzori: har router <b>har flow ka state</b> rakhta hai aur use lagatar refresh karta hai. Das hazaar phone calls matlab har core router mein das hazaar reservations. Yeh scale nahi karta.</li>
</ul>
<p>RSVP mara nahi hai: <b>RSVP-TE</b> MPLS traffic engineering tunnels ke liye bandwidth reserve karta hai, aur kuch voice designs RSVP-based call admission control use karte hain. Par general enterprise QoS model ke roop mein IntServ haar gaya.</p>

<h3>DiffServ</h3>
<p><b>Differentiated Services (DiffServ)</b> lagbhag har enterprise aur service provider network mein use hone wala model hai, aur wahi jise ENCOR aapse configure karwana chahta hai. Iska idea:</p>
<ol>
<li>Network ke <b>edge</b> par har packet ko <b>classify</b> karo aur uske IP header mein ek value, <b>DSCP</b>, likhkar use <b>mark</b> karo.</li>
<li><b>DiffServ domain</b> ke andar har router sirf woh marking dekhta hai aur ek <b>per-hop behaviour (PHB)</b> lagata hai: priority queue, guaranteed hissa, zyada drop probability, waghaira.</li>
<li>Koi signalling nahi aur koi per-flow state nahi. Routers hazaaron flows se nahi, kuch hi <b>classes</b> (aggregates) se deal karte hain.</li>
</ol>
<p>Trade-off yeh hai ki DiffServ <b>relative</b> treatment deta hai, absolute end-to-end guarantee nahi. Yeh tabhi kaam karta hai jab har hop same markings ke liye consistent policy lagaye, aur jab aap priority class ki capacity se zyada voice admit na karo.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Three QoS models compared">
<rect x="10" y="20" width="195" height="180" rx="10" fill="#e2e8f0"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="14">Best effort</text>
<text x="107" y="80" text-anchor="middle" class="svg-muted" font-size="12">ek FIFO queue</text><text x="107" y="105" text-anchor="middle" class="svg-muted" font-size="12">koi marking nahi</text><text x="107" y="130" text-anchor="middle" class="svg-muted" font-size="12">koi guarantee nahi</text><text x="107" y="165" text-anchor="middle" class="svg-accent" font-size="12">perfect scale</text>
<rect x="222" y="20" width="195" height="180" rx="10" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">IntServ</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">RSVP PATH / RESV</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">per-flow state</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">admission control</text><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">hard guarantee, kam scale</text>
<rect x="435" y="20" width="195" height="180" rx="10" fill="#bbf7d0"/><text x="532" y="45" text-anchor="middle" class="svg-ink" font-size="14">DiffServ</text>
<text x="532" y="80" text-anchor="middle" class="svg-muted" font-size="12">edge par DSCP mark</text><text x="532" y="105" text-anchor="middle" class="svg-muted" font-size="12">har hop par PHB</text><text x="532" y="130" text-anchor="middle" class="svg-muted" font-size="12">per-class, signalling nahi</text><text x="532" y="165" text-anchor="middle" class="svg-accent" font-size="12">scale, relative QoS</text>
</svg><p class="cap">Best effort kuch nahi karta, IntServ har flow ke liye reserve karta hai, DiffServ ek baar mark karke har hop par classes treat karta hai.</p></div>

<table class="cmp"><tr><th></th><th>Best effort</th><th>IntServ</th><th>DiffServ</th></tr>
<tr><td>Signalling</td><td>koi nahi</td><td>RSVP, end to end</td><td>koi nahi</td></tr>
<tr><td>Routers mein state</td><td>koi nahi</td><td>per flow</td><td>per class</td></tr>
<tr><td>Guarantee</td><td>koi nahi</td><td>absolute, per flow</td><td>relative, per class</td></tr>
<tr><td>Scalability</td><td>behtareen</td><td>kamzor</td><td>behtareen</td></tr>
<tr><td>Aam use</td><td>internet, uncongested links</td><td>MPLS TE, call admission</td><td>enterprise aur SP QoS</td></tr></table>

<h3>DiffServ toolkit</h3>
<p>Is module ka baaki hissa DiffServ toolkit hai, packet ke raaste par isi kram mein lagaya jaata hai:</p>
<ul>
<li><b>Classification aur marking</b> (chapters 3 se 5): packet kya hai decide karo, DSCP likho, aam taur par edge par <b>inbound</b>.</li>
<li><b>Congestion management, queuing</b> (chapter 6): output queue bharne par agla kaun jaaye decide karo, <b>outbound</b>.</li>
<li><b>Congestion avoidance</b> (chapter 7): queue full hone se pehle kuch low-priority packets jaldi drop karo.</li>
<li><b>Policing aur shaping</b> (chapter 8): drop karke ya delay karke rate lagu karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek branch mein 30 concurrent G.711 calls hain. IntServ mein har call RSVP signal karti hai aur path ka har router 60 reservations rakhta hai (har direction ka ek), default mein har 30 seconds refresh. DiffServ mein phones ke packets access edge par ek baar EF mark hote hain, aur har router ki ek priority class hoti hai, jaise 30 × 80 kbps = 2.4 Mbps, jise woh ek hi policy se size aur check karta hai. 3000 calls tak badhne par class ka size badalta hai, state ki maatra nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki sirf marking se priority mil jaati hai. DSCP value sirf ek label hai. Agar agle router par koi policy nahi jo EF match karke use priority queue de, to packet phir bhi FIFO serve hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Per-flow state, signalling, admission control, RSVP" hamesha IntServ ki taraf ishara karta hai. "DSCP, PHB, aggregate classes, scalable" hamesha DiffServ ki taraf. Best effort bhi ek model hai, model ki kami nahi.</p></div>

<div class="scn"><h4>Do companies, AF31 ke do matlab</h4><p>Merger ke baad do WANs jode gaye. Purani sites ke beech calls theek thi, par nayi link ke aar-paar calls business hours mein toot-ti thi. Company A voice ko EF mark karti thi; company B ke legacy phones voice ko AF31 mark karte the, aur B ke routers AF31 ko priority queue mein daalte the. A ke routers AF31 ko aam data maante the. Engineer ne interconnect par B ke phones ka AF31 EF mein re-mark kiya aur dono policies ek DSCP plan par align ki.</p><p><b>Seekh:</b> DiffServ tabhi kaam karta hai jab poora domain har marking ke matlab par sehmat ho. Ek DSCP plan likho aur use har boundary par lagu karo.</p></div>

<div class="iv"><p class="q">"IntServ aur DiffServ compare karo. Aap kaunsa deploy karoge aur kyun?"</p><p>Strong answer: IntServ RSVP PATH aur RESV messages se har flow ke liye resources reserve karta hai admission control ke saath, hard guarantee deta hai par har router mein per-flow state chahiye, isliye scale nahi karta. DiffServ edge par DSCP classify aur mark karta hai aur har hop par per class per-hop behaviours lagata hai, bina signalling ke, isliye scale karta hai. Main DiffServ deploy karunga, aise size karke ki priority class admitted voice le ja sake, aur batata ki RSVP MPLS TE aur call admission control mein zinda hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Best effort: ek FIFO queue, koi guarantee nahi, perfect scale.</li>
<li>IntServ: RSVP PATH/RESV, per-flow reservation aur admission control; hard guarantee par kamzor scalability.</li>
<li>DiffServ: edge par DSCP mark, domain ke andar per class per-hop behaviour; enterprise standard.</li>
<li>Marking tab tak kuch nahi karti jab tak har hop par matching policy na ho.</li>
<li>DiffServ toolkit: classify aur mark, queue, congestion avoid, police aur shape.</li>
</ul></div>
`}};export{e as default};