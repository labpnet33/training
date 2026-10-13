var e={id:`toolbox-diffserv`,h:{en:`The QoS toolbox and the DiffServ model`,hi:`QoS toolbox aur DiffServ model`},body:{en:`
<p>Think of a courier hub. Parcels arrive at the dock, a clerk reads each label and sorts it into express, normal or bulk, a sticker goes on the parcel, a weighing station refuses oversized loads, and the loading bay sends express vans first. Each step is a separate job done by a separate person. QoS tools are the same: small, single-purpose steps that you chain together. Once you can name the steps and their order, every QoS question on the exam becomes easy.</p>

<h3>Three ways to deliver traffic</h3>
<dl class="terms">
<dt>Best effort</dt><dd>No QoS at all. Every packet is treated alike, first in, first out, and the network promises nothing. This is the default on every interface and the model of the plain Internet.</dd>
<dt>Integrated Services (IntServ)</dt><dd>Each application asks the network to <b>reserve</b> resources end to end, using the signalling protocol RSVP, before it sends. It gives hard guarantees but every router must keep state for every flow, so it does not scale. You only need to recognise the name.</dd>
<dt>Differentiated Services (DiffServ)</dt><dd>Traffic is sorted into a few <b>classes</b>. Each packet carries a small marking in its header, and every router treats that marking according to its own configured rule, called a <b>per-hop behavior (PHB)</b>. No per-flow state, no signalling, so it scales to the Internet. This is what enterprise networks and the CCNA use.</dd>
</dl>
<p>The key phrase is <b>per-hop</b>. DiffServ does not give an end-to-end promise. Each router makes its own local decision about how to forward a packet based on the marking. If one router on the path ignores or rewrites the marking, the treatment breaks at that hop. That is why consistent policy across all devices matters.</p>

<h3>The toolbox, in the order a packet meets it</h3>
<div class="dia"><svg viewBox="0 0 660 200" role="img" aria-label="QoS tools in order">
<rect x="6" y="50" width="100" height="60" rx="6" fill="#bae6fd"/><text x="56" y="76" text-anchor="middle" class="svg-ink" font-size="12">Classify</text><text x="56" y="94" text-anchor="middle" class="svg-muted" font-size="11">who is this?</text>
<rect x="116" y="50" width="100" height="60" rx="6" fill="#bae6fd"/><text x="166" y="76" text-anchor="middle" class="svg-ink" font-size="12">Mark</text><text x="166" y="94" text-anchor="middle" class="svg-muted" font-size="11">write DSCP</text>
<rect x="226" y="50" width="100" height="60" rx="6" fill="#ddd6fe"/><text x="276" y="76" text-anchor="middle" class="svg-ink" font-size="12">Police</text><text x="276" y="94" text-anchor="middle" class="svg-muted" font-size="11">limit the rate</text>
<rect x="336" y="50" width="100" height="60" rx="6" fill="#ddd6fe"/><text x="386" y="76" text-anchor="middle" class="svg-ink" font-size="12">Queue</text><text x="386" y="94" text-anchor="middle" class="svg-muted" font-size="11">wait in order</text>
<rect x="446" y="50" width="100" height="60" rx="6" fill="#fde68a"/><text x="496" y="76" text-anchor="middle" class="svg-ink" font-size="12">Shape</text><text x="496" y="94" text-anchor="middle" class="svg-muted" font-size="11">smooth the rate</text>
<rect x="556" y="50" width="98" height="60" rx="6" fill="#bbf7d0"/><text x="605" y="76" text-anchor="middle" class="svg-ink" font-size="12">Transmit</text><text x="605" y="94" text-anchor="middle" class="svg-muted" font-size="11">onto the wire</text>
<path d="M106 80 H116 M216 80 H226 M326 80 H336 M436 80 H446 M546 80 H556" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="166" y="140" text-anchor="middle" class="svg-accent" font-size="12">usually at the edge, on input</text>
<text x="446" y="140" text-anchor="middle" class="svg-accent" font-size="12">congestion tools, on output</text>
<text x="330" y="180" text-anchor="middle" class="svg-muted" font-size="11">Congestion avoidance (WRED) works inside the queue stage, dropping early.</text>
</svg><p class="cap">Left to right: edge tools first, congestion tools at the exit. Policing can also be applied outbound.</p></div>
<div class="tbl"><table>
<tr><th>Tool</th><th>What it does</th><th>MQC keyword</th><th>Typical place</th></tr>
<tr><td>Classification</td><td>Decides which class a packet belongs to by looking at header fields</td><td><code>class-map</code>, <code>match ...</code></td><td>First on the device</td></tr>
<tr><td>Marking</td><td>Writes a value (CoS, DSCP) into the packet or frame so later devices can classify cheaply</td><td><code>set dscp</code>, <code>set cos</code></td><td>Network edge, on input</td></tr>
<tr><td>Policing</td><td>Enforces a rate; excess is dropped or re-marked</td><td><code>police</code></td><td>Input or output</td></tr>
<tr><td>Queuing</td><td>Holds packets in several queues and decides which to send next</td><td><code>priority</code>, <code>bandwidth</code>, <code>fair-queue</code></td><td>Output only</td></tr>
<tr><td>Congestion avoidance</td><td>Drops some packets early to slow TCP before the queue overflows</td><td><code>random-detect</code></td><td>Output, inside a queue</td></tr>
<tr><td>Shaping</td><td>Buffers excess so traffic leaves at a smooth, defined rate</td><td><code>shape average</code></td><td>Output only</td></tr>
</table></div>
<p>Classification and marking are separate ideas. Classification is <i>deciding</i> what a packet is; marking is <i>writing</i> that decision into the packet so the next router does not have to repeat the work. A router can classify without marking (match DSCP EF and put it in a priority queue) and mark without queuing (an access switch that only sets DSCP).</p>

<h3>The whole policy in one view</h3>
<p>The policy you will build in chapter 8 contains one marking policy for the LAN edge and one queuing policy for the WAN exit. The simulator prints the full definition with <code>show policy-map</code>.</p>
<pre class="code">R1# show policy-map</pre>
<pre class="out">  Policy Map MARK-IN
    Class VOICE
      set dscp ef
    Class BULK
      police cir 3000000
        conform-action transmit 
        exceed-action drop 
      set dscp af11
    Class class-default
      set dscp default

  Policy Map WAN-OUT
    Class EF-Q
      priority 1000 (kbps)
    Class AF11-Q
      bandwidth 2000 (kbps)
    Class class-default
      fair-queue</pre>
<p>Read it as two stories. <b>MARK-IN</b> (classify, mark, police) runs when packets <i>enter</i> from the LAN. <b>WAN-OUT</b> (classify on the mark, then queue) runs when packets <i>leave</i> for the WAN. Every router has a built-in <code>class-default</code> that catches whatever no other class matched.</p>

<div class="eg"><p><b>Worked example.</b> Follow one voice packet from the phone at 10.10.10.10. (1) It enters R1 on Gi0/1. MARK-IN classifies it as VOICE because the UDP port is in the ACL range, and marks DSCP EF (46). (2) R1 routes it to Gi0/0. (3) WAN-OUT classifies again, this time on DSCP, and finds EF-Q. (4) EF-Q is the priority queue, so the packet jumps ahead of waiting bulk packets. (5) It leaves on the wire. The first classification used a slow, flexible ACL; the second used a cheap field that the first policy wrote. That is the entire point of marking.</p></div>

<h3>The trust boundary idea in one line</h3>
<p>Mark close to the source, then trust the mark inside your own network. The point where you decide to believe or rewrite a mark is the <b>trust boundary</b>, covered in the next chapter.</p>

<div class="warn"><p><b>Common mistakes.</b> Mixing up marking and queuing: setting DSCP EF does nothing by itself unless a queue somewhere is configured to give EF priority. Expecting end-to-end guarantees from DiffServ: each hop must be configured. Trying to apply <code>priority</code> or <code>shape</code> to input traffic: queuing and shaping are output-only actions on routers.</p></div>

<div class="exam"><p><b>Exam traps.</b> The three models are best effort, IntServ (RSVP, reservations) and DiffServ (classes, PHB). DiffServ is "per hop", it keeps no per-flow state. The order is classify, mark, then police, queue, shape. Congestion management is queuing; congestion avoidance is early drop. Shaping buffers, policing does not.</p></div>

<div class="scn"><h4>The marking nobody honoured</h4><p>An engineer enabled DSCP EF marking on the access switches in Hyderabad and was disappointed that calls over the MPLS WAN were unchanged. The provider edge rewrote every packet to DSCP 0 because the contract only offered QoS for an extra fee. Inside the building the marking worked perfectly; across the cloud it was erased. Once the provider mapped EF into their real-time class, the calls improved.</p><p><b>Lesson:</b> DiffServ is per hop. Marking is a request; each network on the path decides whether to honour it.</p></div>

<div class="iv"><p class="q">"Explain DiffServ in two minutes."</p><p>Say: traffic is grouped into classes, each packet carries a DSCP marking in the IP header, and every router applies a per-hop behavior to that marking, such as priority or a bandwidth guarantee. Contrast with best effort (no differentiation) and IntServ (per-flow reservations that do not scale). Mention that markings should be set at the edge and honoured consistently hop by hop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Models: best effort, IntServ (RSVP, per-flow reservation) and DiffServ (classes and per-hop behaviors).</li>
<li>The toolbox in order: classify, mark, police, queue, shape, with early drop (WRED) inside queues.</li>
<li>Classification decides, marking writes the decision into the packet.</li>
<li>Queuing and shaping are output-only; marking and policing work on input or output.</li>
<li>Every router has <code>class-default</code> for unmatched traffic. DiffServ gives no end-to-end promise by itself.</li>
</ul></div>
`,hi:`
<p>Courier hub socho. Parcels dock par aate hain, clerk har label padhkar use express, normal ya bulk mein sort karta hai, parcel par sticker lagta hai, weighing station bhaari loads ko mana kar deta hai, aur loading bay express vans ko pehle bhejta hai. Har step alag kaam hai jo alag insaan karta hai. QoS tools bhi aise hi hain: chhote, single-purpose steps jinhe aap chain karte ho. Jaise hi aap steps aur unka order bol sakte ho, exam ka har QoS sawaal aasaan ho jaata hai.</p>

<h3>Traffic deliver karne ke teen tareeke</h3>
<dl class="terms">
<dt>Best effort</dt><dd>Koi QoS nahi. Har packet ek jaisa, first in first out, aur network kuch promise nahi karta. Har interface par yahi default hai aur plain Internet ka model yahi hai.</dd>
<dt>Integrated Services (IntServ)</dt><dd>Har application bhejne se pehle RSVP signalling protocol se network se end to end resources <b>reserve</b> karne ko kehta hai. Hard guarantees milti hain, lekin har router ko har flow ka state rakhna padta hai, isliye yeh scale nahi karta. Aapko bas naam pehchanna hai.</dd>
<dt>Differentiated Services (DiffServ)</dt><dd>Traffic ko kuch <b>classes</b> mein sort kiya jaata hai. Har packet apne header mein chhota marking le jaata hai, aur har router us marking ko apne configured rule se treat karta hai, jise <b>per-hop behavior (PHB)</b> kehte hain. Na per-flow state, na signalling, isliye Internet tak scale karta hai. Enterprise networks aur CCNA yahi use karte hain.</dd>
</dl>
<p>Key phrase hai <b>per-hop</b>. DiffServ end-to-end promise nahi deta. Har router marking dekhkar packet ko kaise forward karna hai, yeh apna local decision leta hai. Agar path ka ek router marking ignore ya rewrite kar de, to us hop par treatment toot jaata hai. Isliye saare devices par consistent policy zaroori hai.</p>

<h3>Toolbox, us order mein jisme packet unse milta hai</h3>
<div class="dia"><svg viewBox="0 0 660 200" role="img" aria-label="QoS tools order mein">
<rect x="6" y="50" width="100" height="60" rx="6" fill="#bae6fd"/><text x="56" y="76" text-anchor="middle" class="svg-ink" font-size="12">Classify</text><text x="56" y="94" text-anchor="middle" class="svg-muted" font-size="11">yeh kaun hai?</text>
<rect x="116" y="50" width="100" height="60" rx="6" fill="#bae6fd"/><text x="166" y="76" text-anchor="middle" class="svg-ink" font-size="12">Mark</text><text x="166" y="94" text-anchor="middle" class="svg-muted" font-size="11">DSCP likho</text>
<rect x="226" y="50" width="100" height="60" rx="6" fill="#ddd6fe"/><text x="276" y="76" text-anchor="middle" class="svg-ink" font-size="12">Police</text><text x="276" y="94" text-anchor="middle" class="svg-muted" font-size="11">rate limit</text>
<rect x="336" y="50" width="100" height="60" rx="6" fill="#ddd6fe"/><text x="386" y="76" text-anchor="middle" class="svg-ink" font-size="12">Queue</text><text x="386" y="94" text-anchor="middle" class="svg-muted" font-size="11">order mein wait</text>
<rect x="446" y="50" width="100" height="60" rx="6" fill="#fde68a"/><text x="496" y="76" text-anchor="middle" class="svg-ink" font-size="12">Shape</text><text x="496" y="94" text-anchor="middle" class="svg-muted" font-size="11">rate smooth karo</text>
<rect x="556" y="50" width="98" height="60" rx="6" fill="#bbf7d0"/><text x="605" y="76" text-anchor="middle" class="svg-ink" font-size="12">Transmit</text><text x="605" y="94" text-anchor="middle" class="svg-muted" font-size="11">wire par</text>
<path d="M106 80 H116 M216 80 H226 M326 80 H336 M436 80 H446 M546 80 H556" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="166" y="140" text-anchor="middle" class="svg-accent" font-size="12">aam taur par edge par, input mein</text>
<text x="446" y="140" text-anchor="middle" class="svg-accent" font-size="12">congestion tools, output mein</text>
<text x="330" y="180" text-anchor="middle" class="svg-muted" font-size="11">Congestion avoidance (WRED) queue stage ke andar chalta hai, jaldi drop karke.</text>
</svg><p class="cap">Left se right: edge tools pehle, congestion tools exit par. Policing outbound bhi lag sakti hai.</p></div>
<div class="tbl"><table>
<tr><th>Tool</th><th>Kya karta hai</th><th>MQC keyword</th><th>Aam jagah</th></tr>
<tr><td>Classification</td><td>Header fields dekhkar tay karta hai ki packet kis class ka hai</td><td><code>class-map</code>, <code>match ...</code></td><td>Device par sabse pehle</td></tr>
<tr><td>Marking</td><td>Packet ya frame mein value (CoS, DSCP) likhta hai taaki aage ke devices sasta classify kar saken</td><td><code>set dscp</code>, <code>set cos</code></td><td>Network edge, input par</td></tr>
<tr><td>Policing</td><td>Rate enforce karta hai; excess drop ya re-mark hota hai</td><td><code>police</code></td><td>Input ya output</td></tr>
<tr><td>Queuing</td><td>Packets ko kai queues mein rakhta hai aur tay karta hai ki agla kaun jaaye</td><td><code>priority</code>, <code>bandwidth</code>, <code>fair-queue</code></td><td>Sirf output</td></tr>
<tr><td>Congestion avoidance</td><td>Queue overflow se pehle kuch packets jaldi drop karke TCP ko dheema karta hai</td><td><code>random-detect</code></td><td>Output, queue ke andar</td></tr>
<tr><td>Shaping</td><td>Excess ko buffer karta hai taaki traffic smooth, tay rate par nikle</td><td><code>shape average</code></td><td>Sirf output</td></tr>
</table></div>
<p>Classification aur marking alag idea hain. Classification packet ko <i>pehchanna</i> hai; marking us faisle ko packet mein <i>likhna</i> hai taaki agle router ko kaam dohrana na pade. Router bina marking ke classify kar sakta hai (DSCP EF match karke priority queue mein daalna) aur bina queuing ke mark kar sakta hai (access switch jo sirf DSCP set karta hai).</p>

<h3>Poori policy ek nazar mein</h3>
<p>Chapter 8 mein jo policy banaoge usme LAN edge ke liye ek marking policy aur WAN exit ke liye ek queuing policy hai. Simulator <code>show policy-map</code> se poori definition print karta hai.</p>
<pre class="code">R1# show policy-map</pre>
<pre class="out">  Policy Map MARK-IN
    Class VOICE
      set dscp ef
    Class BULK
      police cir 3000000
        conform-action transmit 
        exceed-action drop 
      set dscp af11
    Class class-default
      set dscp default

  Policy Map WAN-OUT
    Class EF-Q
      priority 1000 (kbps)
    Class AF11-Q
      bandwidth 2000 (kbps)
    Class class-default
      fair-queue</pre>
<p>Ise do kahaniyon ki tarah padho. <b>MARK-IN</b> (classify, mark, police) tab chalti hai jab packets LAN se <i>andar aate</i> hain. <b>WAN-OUT</b> (mark par classify, phir queue) tab chalti hai jab packets WAN ke liye <i>bahar jaate</i> hain. Har router mein built-in <code>class-default</code> hota hai jo woh sab pakadta hai jo kisi aur class se match nahi hua.</p>

<div class="eg"><p><b>Worked example.</b> 10.10.10.10 wale phone ka ek voice packet follow karo. (1) Woh R1 mein Gi0/1 par aata hai. MARK-IN use VOICE classify karti hai kyunki UDP port ACL range mein hai, aur DSCP EF (46) mark karti hai. (2) R1 use Gi0/0 par route karta hai. (3) WAN-OUT dobara classify karti hai, is baar DSCP par, aur EF-Q milti hai. (4) EF-Q priority queue hai, isliye packet intezaar kar rahe bulk packets se aage nikal jaata hai. (5) Woh wire par chala jaata hai. Pehli classification mein slow, flexible ACL lagi; doosri mein sasta field jo pehli policy ne likha. Marking ka poora maqsad yahi hai.</p></div>

<h3>Trust boundary ka idea ek line mein</h3>
<p>Source ke paas mark karo, phir apne network ke andar mark par bharosa karo. Woh point jahan aap mark par vishwas karte ho ya use rewrite karte ho <b>trust boundary</b> kehlata hai, jo agle chapter mein hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Marking aur queuing mix karna: DSCP EF set karne se akele kuch nahi hota jab tak kisi queue mein EF ko priority dene ke liye configure na kiya ho. DiffServ se end-to-end guarantee expect karna: har hop configure hona chahiye. Input traffic par <code>priority</code> ya <code>shape</code> lagane ki koshish: routers par queuing aur shaping sirf output actions hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Teen models: best effort, IntServ (RSVP, reservations) aur DiffServ (classes, PHB). DiffServ "per hop" hai, per-flow state nahi rakhta. Order: classify, mark, phir police, queue, shape. Congestion management matlab queuing; congestion avoidance matlab early drop. Shaping buffer karta hai, policing nahi.</p></div>

<div class="scn"><h4>Woh marking jise kisi ne maana hi nahi</h4><p>Hyderabad ke access switches par engineer ne DSCP EF marking enable kari aur MPLS WAN par calls mein koi farq na dekhkar niraash hua. Provider edge har packet ko DSCP 0 mein rewrite kar raha tha kyunki contract mein QoS sirf extra fee par tha. Building ke andar marking bilkul kaam kar rahi thi; cloud ke paar woh mit jaati thi. Jab provider ne EF ko apni real-time class mein map kiya, calls behtar ho gayi.</p><p><b>Seekh:</b> DiffServ per hop hai. Marking ek request hai; path ka har network tay karta hai ki use maanna hai ya nahi.</p></div>

<div class="iv"><p class="q">"DiffServ do minute mein samjhao."</p><p>Bolo: traffic classes mein baanta jaata hai, har packet IP header mein DSCP marking le jaata hai, aur har router us marking par per-hop behavior lagata hai, jaise priority ya bandwidth guarantee. Best effort (koi farq nahi) aur IntServ (per-flow reservations jo scale nahi karte) se contrast karo. Batao ki markings edge par set honi chahiye aur har hop par consistently maani jaani chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Models: best effort, IntServ (RSVP, per-flow reservation) aur DiffServ (classes aur per-hop behaviors).</li>
<li>Toolbox order mein: classify, mark, police, queue, shape, aur queues ke andar early drop (WRED).</li>
<li>Classification faisla karta hai, marking us faisle ko packet mein likhti hai.</li>
<li>Queuing aur shaping sirf output mein; marking aur policing input ya output par.</li>
<li>Har router mein unmatched traffic ke liye <code>class-default</code> hai. DiffServ akela end-to-end promise nahi deta.</li>
</ul></div>
`}};export{e as default};