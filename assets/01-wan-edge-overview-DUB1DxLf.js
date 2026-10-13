var e={id:`overview`,h:{en:`The WAN edge: where a fast LAN meets a slow circuit`,hi:`WAN edge: jahan fast LAN slow circuit se milta hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of nine chapters you will be able to explain how a token bucket works, choose between policing and shaping, write both in MQC, build a two-level policy that shapes a 1 Gbps handoff down to a 20 Mbps contract and protects voice inside it, recognise bufferbloat and cure it without buying bandwidth, and design the policy for a multi-city network where every site has a different provider rate. You also learn a method for the call every network engineer gets: "the WAN is slow when people are working".</p>
<p><b>Prerequisites.</b> You should know classification and marking (the <b>mq-mark</b> module: class-maps, DSCP, trust boundaries) and queuing with CBWFQ and LLQ (the <b>mq-queue</b> module). We use those tools inside every policy here and we do not re-teach them.</p>

<h3>Start with a picture: a six-lane motorway and a one-lane bridge</h3>
<p>Imagine a six-lane motorway that ends at a one-lane bridge. On a quiet night every car crosses. At rush hour, cars arrive far faster than the bridge can pass them. What happens next depends on who manages the bridge. If a police officer stands at the bridge and simply turns away every car above the limit, drivers lose their trip and some of them are ambulances. If instead there is a car park before the bridge with a marshal who releases cars at the speed of the bridge, nobody is turned away, ambulances go to the front, and only the least important cars wait a long time or give up.</p>
<p>The officer is a <b>policer</b>. The marshal and the car park are a <b>shaper</b> with <b>queues</b>. The WAN edge is the place where your network is the motorway and the provider circuit is the bridge.</p>

<h3>The speed mismatch</h3>
<p>Inside a building, links run at 1 or 10 Gbps. Between buildings you usually buy a service with a <b>contracted rate</b>: 20 Mbps, 50 Mbps, 100 Mbps. This rate is called the <b>CIR</b> (committed information rate), the speed the provider promises to carry. Most providers deliver the service on a fast Ethernet port (1 Gbps) because Ethernet ports are cheap and the rate is enforced by a policer inside the provider edge router, not by the cable.</p>
<p>That has a surprising consequence. Your router looks at its WAN interface, sees 1 Gbps, and concludes there is plenty of room. Its output queues stay empty, so the QoS policy you wrote for voice never activates. The congestion is real, but it happens one hop away, inside the provider, where a policer discards packets without caring whether they are voice, backup or a payroll file.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Speed mismatch at the WAN edge">
<rect x="10" y="60" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="70" y="90" text-anchor="middle" class="svg-ink" font-size="13">Branch LAN</text><text x="70" y="110" text-anchor="middle" class="svg-muted" font-size="12">66 Mbps offered</text>
<rect x="190" y="60" width="110" height="70" rx="8" fill="#bae6fd"/><text x="245" y="90" text-anchor="middle" class="svg-ink" font-size="13">CE router R1</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="12">port says 1 Gbps</text>
<rect x="360" y="60" width="120" height="70" rx="8" fill="#fed7aa"/><text x="420" y="90" text-anchor="middle" class="svg-ink" font-size="13">Provider edge</text><text x="420" y="110" text-anchor="middle" class="svg-muted" font-size="12">policer 20 Mbps</text>
<rect x="540" y="60" width="90" height="70" rx="8" fill="#ddd6fe"/><text x="585" y="90" text-anchor="middle" class="svg-ink" font-size="13">Head office</text>
<line x1="130" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="3"/><line x1="300" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="3"/><line x1="480" y1="95" x2="540" y2="95" stroke="#64748b" stroke-width="1.5"/>
<text x="330" y="82" text-anchor="middle" class="svg-accent" font-size="12">1 Gbps handoff</text>
<text x="510" y="82" text-anchor="middle" class="svg-accent" font-size="12">20 Mbps</text>
<text x="420" y="160" text-anchor="middle" class="svg-ink" font-size="12">Packets above 20 Mbps are dropped here, in any class</text>
</svg><p class="cap">The queue that matters is not on your router. Unless you shape, the provider policer decides who loses.</p></div>

<h3>The toolbox at the edge</h3>
<ul>
<li><b>Policing</b> measures a rate and immediately transmits, remarks or drops what is above it. No buffering, no delay.</li>
<li><b>Shaping</b> measures a rate and holds the excess in a queue, releasing it later. It smooths traffic and adds delay.</li>
<li><b>Hierarchical policy</b> puts a shaper in a parent policy so that the child queues (priority, bandwidth guarantees) see congestion at the contract rate instead of the port rate.</li>
<li><b>Queue management</b> (queue-limit, fair-queue, WRED) keeps the queues short enough that delay stays low.</li>
</ul>
<p>The usual recipe for a branch: <b>shape outbound to just below the CIR, with a child policy that protects voice</b>. Policing is for enforcing contracts and capping classes, for example a guest network or a backup, usually inbound.</p>

<div class="eg"><p><b>Worked example.</b> The Pune branch of Bharat Retail has a 20 Mbps contract on a 1 Gbps port. At 10 pm the bulk copy offers 60 Mbps, the billing database 5 Mbps and phones 0.6 Mbps: about 65.6 Mbps in total. The provider policer lets 20 Mbps through, so roughly 70 percent of every flow is lost, voice included. On R2 (the provider edge) you see this:</p>
<pre class="out">R2#show policy-map interface GigabitEthernet0/0
  Service-policy input: PE-CIR
    Class-map: class-default (match-any)
      police:
          cir 20000000 bps, bc 2500000 bytes
        conformed 212500 packets, 42500000 bytes; actions:
          transmit
        <span class="hl">exceeded 400636 packets, 88690400 bytes; actions:</span>
          drop</pre>
<p>After you shape R1 to 19 Mbps and add a child policy, the same load produces zero loss for voice and billing, and all the drops move to the bulk class on R1. That is lab <b>mq-wan-shape-hqos</b>.</p></div>

<h3>The four labs of this module</h3>
<table class="cmp"><tr><th>Lab</th><th>Kind</th><th>What you prove</th></tr>
<tr><td>mq-wan-police</td><td>config</td><td>Cap a backup at 2 Mbps, remark a video stream above 3 Mbps</td></tr>
<tr><td>mq-wan-shape-hqos</td><td>config</td><td>Parent shaper below the CIR with a child policy; voice survives</td></tr>
<tr><td>mq-wan-bufferbloat</td><td>troubleshoot</td><td>Find every fault in a bad WAN policy without adding capacity</td></tr>
<tr><td>mq-wan-provider-cir</td><td>config, three cities</td><td>Shape every CE to its own provider CIR, including the hub per spoke</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Buying a bigger circuit before checking the policy. A 20 Mbps line with a correct shaper and a priority queue often feels faster for calls than a 100 Mbps line with no QoS, because delay and loss for voice depend on the queue, not on the size of the pipe.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Policing delays traffic" is false. A policer never buffers; only a shaper adds delay. Another favourite: queuing and shaping exist only in the output direction.</p></div>

<div class="scn"><h4>Calls break only after 9 pm</h4><p>A Pune branch reports that phone calls are fine all day and robotic after 9 pm, exactly when the backup starts. The engineer looks at R1: the WAN interface shows 3 percent utilisation of its 1 Gbps port and no queue drops. He almost concludes that the network is healthy. Then he checks the provider edge counters and sees thousands of exceeded packets in the 20 Mbps policer. The traffic was being dropped one hop away, invisibly.</p><p><b>Lesson:</b> interface utilisation against the port speed tells you nothing. Compare your traffic to the contracted rate, and shape to it.</p></div>
<div class="iv"><p class="q">"Why do you need a shaper if you already have LLQ on the WAN interface?"</p><p>A strong answer: LLQ only acts when the router thinks the interface is congested. On a 1 Gbps handoff with a 20 Mbps contract the router never queues, so LLQ never triggers and the provider policer drops indiscriminately. A parent shaper at the contract rate creates the congestion on our side, so the child LLQ and CBWFQ classes decide who is dropped.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A WAN service has a contracted rate (CIR) that is usually lower than the Ethernet port speed.</li>
<li>The provider enforces the CIR with a policer that ignores your priorities.</li>
<li>Policing drops or remarks immediately; shaping buffers and delays; queuing decides order.</li>
<li>The branch recipe is a parent shaper just below the CIR with a child policy for voice.</li>
<li>Always compare traffic with the contract, not with the port speed.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Nau chapters ke baad aap samjha paoge ki token bucket kaise kaam karta hai, policing aur shaping mein se kya chunna hai, dono MQC mein kaise likhte hain, 1 Gbps handoff ko 20 Mbps contract tak shape karne wali aur andar voice ko bachane wali do-level policy kaise banate hain, bufferbloat ko kaise pehchanna aur bandwidth kharide bina theek karna hai, aur aise multi-city network ki policy kaise design karni hai jahan har site ka provider rate alag hai. Aap woh method bhi seekhoge jo har network engineer ko chahiye jab call aaye: "log kaam karte hain to WAN slow ho jaata hai".</p>
<p><b>Prerequisites.</b> Aapko classification aur marking (<b>mq-mark</b> module: class-maps, DSCP, trust boundaries) aur CBWFQ/LLQ queuing (<b>mq-queue</b> module) aani chahiye. In tools ko hum har policy mein use karte hain aur dobara nahi sikhate.</p>

<h3>Ek tasveer se shuru karo: chhe-lane motorway aur ek-lane pul</h3>
<p>Socho ek chhe-lane motorway jo ek-lane pul par khatam hota hai. Shaant raat mein har gaadi guzar jaati hai. Rush hour mein gaadiyan pul ke guzarne se bahut tez aati hain. Aage kya hoga woh is par nirbhar hai ki pul kaun sambhal raha hai. Agar pul par ek police wala khada hai jo limit se upar ki har gaadi ko lauta deta hai, to drivers ka safar bekaar jaata hai aur unme se kuch ambulance bhi hoti hain. Agar pul se pehle ek car park hai aur ek marshal gaadiyon ko pul ki raftaar se chhodta hai, to koi lauta nahi, ambulance aage jaati hai, aur sirf kam zaroori gaadiyan der tak rukti hain ya haar maan leti hain.</p>
<p>Police wala <b>policer</b> hai. Marshal aur car park <b>queues</b> ke saath <b>shaper</b> hain. WAN edge woh jagah hai jahan aapka network motorway hai aur provider circuit pul hai.</p>

<h3>Speed mismatch</h3>
<p>Building ke andar links 1 ya 10 Gbps par chalte hain. Buildings ke beech aap aam taur par ek <b>contracted rate</b> wali service kharidte ho: 20 Mbps, 50 Mbps, 100 Mbps. Is rate ko <b>CIR</b> (committed information rate) kehte hain, yaani woh speed jo provider carry karne ka vaada karta hai. Zyadatar providers service ko fast Ethernet port (1 Gbps) par dete hain kyunki Ethernet ports sasti hain aur rate cable se nahi balki provider edge router ke andar ke policer se lagu hota hai.</p>
<p>Iska ek hairaan karne wala nateeja hai. Aapka router apne WAN interface ko dekhta hai, 1 Gbps dikhta hai, aur maan leta hai ki bahut jagah hai. Uski output queues khaali rehti hain, isliye voice ke liye likhi QoS policy kabhi activate hi nahi hoti. Congestion asli hai, lekin ek hop door provider ke andar hota hai, jahan policer packets gira deta hai bina dekhe ki woh voice hai, backup hai ya payroll file.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="WAN edge par speed mismatch">
<rect x="10" y="60" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="70" y="90" text-anchor="middle" class="svg-ink" font-size="13">Branch LAN</text><text x="70" y="110" text-anchor="middle" class="svg-muted" font-size="12">66 Mbps offered</text>
<rect x="190" y="60" width="110" height="70" rx="8" fill="#bae6fd"/><text x="245" y="90" text-anchor="middle" class="svg-ink" font-size="13">CE router R1</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="12">port 1 Gbps dikhata hai</text>
<rect x="360" y="60" width="120" height="70" rx="8" fill="#fed7aa"/><text x="420" y="90" text-anchor="middle" class="svg-ink" font-size="13">Provider edge</text><text x="420" y="110" text-anchor="middle" class="svg-muted" font-size="12">policer 20 Mbps</text>
<rect x="540" y="60" width="90" height="70" rx="8" fill="#ddd6fe"/><text x="585" y="90" text-anchor="middle" class="svg-ink" font-size="13">Head office</text>
<line x1="130" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="3"/><line x1="300" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="3"/><line x1="480" y1="95" x2="540" y2="95" stroke="#64748b" stroke-width="1.5"/>
<text x="330" y="82" text-anchor="middle" class="svg-accent" font-size="12">1 Gbps handoff</text>
<text x="510" y="82" text-anchor="middle" class="svg-accent" font-size="12">20 Mbps</text>
<text x="420" y="160" text-anchor="middle" class="svg-ink" font-size="12">20 Mbps se upar ke packets yahin gire jaate hain, kisi bhi class ke</text>
</svg><p class="cap">Jo queue matter karti hai woh aapke router par nahi hai. Shape nahi karoge to provider policer decide karega kaun haarega.</p></div>

<h3>Edge ka toolbox</h3>
<ul>
<li><b>Policing</b> ek rate napta hai aur usse upar ke packets ko turant transmit, remark ya drop kar deta hai. Na buffering, na delay.</li>
<li><b>Shaping</b> ek rate napta hai aur extra ko queue mein rokta hai, baad mein chhodta hai. Traffic smooth karta hai aur delay badhata hai.</li>
<li><b>Hierarchical policy</b> parent policy mein shaper rakhti hai taaki child queues (priority, bandwidth guarantees) ko congestion port rate ki jagah contract rate par dikhe.</li>
<li><b>Queue management</b> (queue-limit, fair-queue, WRED) queues ko itna chhota rakhta hai ki delay kam rahe.</li>
</ul>
<p>Branch ka aam recipe: <b>outbound ko CIR se thoda neeche shape karo, child policy ke saath jo voice ko bachaye</b>. Policing contracts lagu karne aur classes cap karne ke liye hai, jaise guest network ya backup, aam taur par inbound.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ki Pune branch ka 1 Gbps port par 20 Mbps contract hai. Raat 10 baje bulk copy 60 Mbps offer karti hai, billing database 5 Mbps aur phones 0.6 Mbps: kul lagbhag 65.6 Mbps. Provider policer 20 Mbps jaane deta hai, isliye har flow ka lagbhag 70 percent kho jaata hai, voice bhi. R2 (provider edge) par aap yeh dekhte ho:</p>
<pre class="out">R2#show policy-map interface GigabitEthernet0/0
  Service-policy input: PE-CIR
    Class-map: class-default (match-any)
      police:
          cir 20000000 bps, bc 2500000 bytes
        conformed 212500 packets, 42500000 bytes; actions:
          transmit
        <span class="hl">exceeded 400636 packets, 88690400 bytes; actions:</span>
          drop</pre>
<p>R1 ko 19 Mbps par shape karke aur child policy lagakar wahi load voice aur billing ke liye zero loss deta hai, aur saare drops R1 par bulk class mein chale jaate hain. Yahi lab <b>mq-wan-shape-hqos</b> hai.</p></div>

<h3>Is module ke chaar labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Kind</th><th>Aap kya sabit karoge</th></tr>
<tr><td>mq-wan-police</td><td>config</td><td>Backup ko 2 Mbps par cap karo, 3 Mbps se upar video stream remark karo</td></tr>
<tr><td>mq-wan-shape-hqos</td><td>config</td><td>CIR se neeche parent shaper aur child policy; voice bachti hai</td></tr>
<tr><td>mq-wan-bufferbloat</td><td>troubleshoot</td><td>Capacity badhaye bina kharab WAN policy ke har fault ko dhundo</td></tr>
<tr><td>mq-wan-provider-cir</td><td>config, teen shehar</td><td>Har CE ko uske apne provider CIR par shape karo, hub ko har spoke ke liye alag</td></tr></table>

<div class="warn"><p><b>Aam galti.</b> Policy check kiye bina bada circuit kharidna. Sahi shaper aur priority queue wali 20 Mbps line calls ke liye aksar bina QoS ki 100 Mbps line se behtar lagti hai, kyunki voice ka delay aur loss queue par nirbhar hai, pipe ke size par nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Policing traffic ko delay karta hai" galat hai. Policer kabhi buffer nahi karta; sirf shaper delay badhata hai. Ek aur favourite: queuing aur shaping sirf output direction mein hote hain.</p></div>

<div class="scn"><h4>Calls sirf raat 9 baje ke baad toot-ti hain</h4><p>Pune branch report karti hai ki phone calls din bhar theek hain aur raat 9 baje ke baad robotic, theek jab backup shuru hota hai. Engineer R1 dekhta hai: WAN interface apne 1 Gbps port ka 3 percent utilisation dikhata hai aur koi queue drop nahi. Woh lagbhag maan leta hai ki network theek hai. Phir woh provider edge ke counters dekhta hai aur 20 Mbps policer mein hazaaron exceeded packets paata hai. Traffic ek hop door, bina dikhe, gir raha tha.</p><p><b>Lesson:</b> port speed ke saamne interface utilisation kuch nahi batata. Apne traffic ko contracted rate se compare karo, aur usi par shape karo.</p></div>
<div class="iv"><p class="q">"Agar WAN interface par LLQ pehle se hai to shaper kyun chahiye?"</p><p>Achha jawab: LLQ tabhi kaam karti hai jab router ko lagta hai ki interface congested hai. 20 Mbps contract wale 1 Gbps handoff par router kabhi queue nahi banata, isliye LLQ kabhi trigger nahi hoti aur provider policer bina bhedbhav ke drop karta hai. Contract rate par parent shaper congestion hamari side par banata hai, isliye child LLQ aur CBWFQ classes decide karti hain ki kaun girega.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WAN service ka ek contracted rate (CIR) hota hai jo aam taur par Ethernet port speed se kam hota hai.</li>
<li>Provider CIR ko aise policer se lagu karta hai jo aapki priorities ignore karta hai.</li>
<li>Policing turant drop ya remark karti hai; shaping buffer karke delay badhati hai; queuing kram tay karti hai.</li>
<li>Branch ka recipe CIR se thoda neeche parent shaper aur voice ke liye child policy hai.</li>
<li>Hamesha traffic ko contract se compare karo, port speed se nahi.</li>
</ul></div>
`}};export{e as default};