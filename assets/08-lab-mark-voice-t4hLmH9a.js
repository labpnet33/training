var e={id:`lab-mark`,h:{en:`Warm-up lab walkthrough: mark voice and read the counters`,hi:`Warm-up lab walkthrough: voice mark karo aur counters padho`},body:{en:`
<p>This chapter walks you through the lab <b>mq-start-mark-voice</b>. It is a single-router lab, so there is nothing to route: all the learning is about classifying, marking and reading counters.</p>
<p><b>The work order.</b> Zenith Logistics wants IP phone calls from its Nashik depot to carry DSCP EF so later devices can treat them first. A phone (10.10.10.10) and a data PC (10.10.10.20) share the LAN on R1 Gi0/0, through a switch. The head office server (10.20.0.100) sits on Gi0/1. You will build a class-map for the voice flow, a policy-map that marks it EF, apply it inbound, send traffic and prove the result.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Single-router QoS lab">
<rect x="10" y="30" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="53" text-anchor="middle" class="svg-ink" font-size="12">PHONE</text>
<rect x="10" y="130" width="90" height="36" rx="8" fill="#fed7aa"/><text x="55" y="153" text-anchor="middle" class="svg-ink" font-size="12">PC-DATA</text>
<rect x="160" y="80" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="195" y="105" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="300" y="75" width="80" height="50" rx="8" fill="#bae6fd"/><text x="340" y="105" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="500" y="80" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="555" y="105" text-anchor="middle" class="svg-ink" font-size="12">HQ-SRV</text>
<line x1="100" y1="50" x2="160" y2="95" stroke="#64748b" stroke-width="2"/><line x1="100" y1="148" x2="160" y2="108" stroke="#64748b" stroke-width="2"/><line x1="230" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="2"/><line x1="380" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="265" y="92" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 .1</text><text x="440" y="92" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 10.20.0.1</text>
<text x="340" y="160" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.10.10.0/24 (R1 = .1)</text>
<text x="340" y="180" text-anchor="middle" class="svg-accent" font-size="12">policy MARK-IN: input on Gi0/0</text>
</svg><p class="cap">Packets enter R1 on Gi0/0, get classified and marked, and leave on Gi0/1 towards the server.</p></div>

<h3>Task 1: classify the voice flow</h3>
<p>First describe the flow. An extended access list names the phone subnet and the UDP port range used by RTP (the protocol that carries voice). Then a class-map refers to the list.</p>
<pre class="code">ip access-list extended VOICE-RTP
 permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
class-map match-any VOICE
 match access-group name VOICE-RTP</pre>
<p>Remember: the <code>permit</code> in this list means "belongs to the class", nothing more. Confirm with <code>show class-map VOICE</code>:</p>
<pre class="out">R1# show class-map VOICE
 Class Map match-any VOICE (id 1)
   Match access-group name VOICE-RTP</pre>
<p>The checker also tests that the class would match a UDP packet to port 20000 from the phone but not a UDP packet to port 5001 from the PC, nor a TCP packet. So the port range and the protocol both matter.</p>

<h3>Task 2: mark it and apply the policy</h3>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
interface GigabitEthernet0/0
 service-policy input MARK-IN</pre>
<pre class="out">R1# show policy-map MARK-IN

  Policy Map MARK-IN
    Class VOICE
      set dscp ef</pre>
<p>Why input and why Gi0/0? Phone packets enter the router on Gi0/0, so that is where they can be seen and marked first. A policy attached <code>output</code> on Gi0/0 would only see packets leaving towards the LAN, never the phone's own packets. This is the "mark at the edge, on the way in" rule from chapter 5.</p>

<h3>Task 3: send traffic and prove the mark</h3>
<p>Two flows are generated, one that should match and one that should not. On PHONE type <code>traffic 10.20.0.100 udp/20000 400 10</code> (400 kbps for 10 seconds, port 20000, inside the voice range). On PC-DATA type <code>traffic 10.20.0.100 udp/5001 2000 10</code> (2 Mbps, port 5001, outside the range). Wait ten seconds, then <code>traffic show</code> on the phone. The checker now looks for two facts: packets with DSCP 46 left R1 towards the server, and class VOICE counted packets.</p>

<h3>Task 4: read the counters</h3>
<pre class="out">R1# show policy-map interface GigabitEthernet0/0 input
 GigabitEthernet0/0

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)
      <span class="hl">2500 packets, 500000 bytes</span>
      Match: access-group name VOICE-RTP
        2500 packets, 500000 bytes
      QoS Set
        dscp ef
          <span class="hl">Packets marked 2500</span>

    Class-map: class-default (match-any)
      <span class="hl">12500 packets, 2500000 bytes</span>
      Match: any</pre>
<p>Read it like this. Class VOICE saw 2,500 packets: 400 kbps in 200-byte packets is 250 packets per second, for ten seconds. All 2,500 were marked EF. Class <b>class-default</b> saw 12,500 packets: the data flow of 2 Mbps in 200-byte packets is 1,250 packets per second. <b>class-default</b> is the built-in catch-all class: any packet that no other class picks lands there. So the answer to the last task is class-default. The data PC was not marked, and that is exactly what we wanted.</p>

<div class="eg"><p><b>Worked example.</b> Check the arithmetic yourself. Rate 400 kbps = 400,000 bits per second. A packet of 200 bytes is 1,600 bits. 400,000 / 1,600 = 250 packets per second. Over 10 seconds that is 2,500 packets, which matches the counter. Whenever counters look odd, do this small calculation: it quickly shows whether the numbers are plausible.</p></div>

<h3>Why this tiny lab matters</h3>
<p>You have just done, on one router, what every QoS design in the later modules builds on: describe a flow, mark it, and prove the mark with counters. The next modules add more classes (mq-mark), queues that act on the mark (mq-queue), and rate limits for slow links (mq-wan). Notice what this lab did not do: it did not make voice faster. Without congestion and an output queue policy, nothing changes on the wire. That follows in mq-queue.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading the output policy when the policy is input; add the word <code>input</code> or <code>output</code> to <code>show policy-map interface</code>. (2) Sending the test flow outside the port range and wondering why VOICE stays at zero. (3) Checking the counters before the flow has finished.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>class-default</code> exists in every policy-map even if you do not write it. Packets matching no other class go there.</p></div>

<div class="scn"><h4>The CEO's softphone</h4><p>After a rollout, the CEO's softphone sent voice on UDP port 40000, outside the 16384 to 32767 range. Calls were not marked, and they sounded poor during backups. The counters of class VOICE did not grow while the CEO talked, but class-default did. Extending the ACL range to include port 40000, or better, matching the application's own DSCP at a trusted boundary, fixed it.</p><p><b>Lesson:</b> a class-map can only mark what it matches. Watch the class-default counter; unexpectedly large numbers there mean something important is not being classified.</p></div>

<div class="iv"><p class="q">"How can you prove that your marking policy works, not only that it is configured?"</p><p>Strong answer: send test traffic that should match and traffic that should not, then check that the matching class counts the packets and the set action shows the same number of marked packets, that class-default counts the rest, and that packets leaving the next interface carry the new DSCP, for example seen in a capture.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Class-map picks the flow, policy-map marks it, service-policy input applies it where traffic enters.</li>
<li>show policy-map interface with input or output shows matched and marked packets per class.</li>
<li>class-default catches everything no other class matches.</li>
<li>Check the arithmetic: kbps divided by bits per packet gives packets per second.</li>
<li>Marking alone does not speed traffic up; it only enables later queuing decisions.</li>
</ul></div>
`,hi:`
<p>Yeh chapter aapko lab <b>mq-start-mark-voice</b> walk through karata hai. Yeh single-router lab hai, isliye route karne ko kuch nahi: poori seekh classify, mark aur counters padhne ki hai.</p>
<p><b>Work order.</b> Zenith Logistics chahta hai ki Nashik depot ki IP phone calls DSCP EF leke jaayein taaki aage ke devices unhe pehle treat karein. Ek phone (10.10.10.10) aur ek data PC (10.10.10.20) switch ke through R1 Gi0/0 ke LAN par hain. Head office server (10.20.0.100) Gi0/1 par hai. Aap voice flow ke liye class-map banaoge, ek policy-map jo use EF mark kare, use inbound apply karoge, traffic bhejoge aur result prove karoge.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Single-router QoS lab">
<rect x="10" y="30" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="53" text-anchor="middle" class="svg-ink" font-size="12">PHONE</text>
<rect x="10" y="130" width="90" height="36" rx="8" fill="#fed7aa"/><text x="55" y="153" text-anchor="middle" class="svg-ink" font-size="12">PC-DATA</text>
<rect x="160" y="80" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="195" y="105" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="300" y="75" width="80" height="50" rx="8" fill="#bae6fd"/><text x="340" y="105" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="500" y="80" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="555" y="105" text-anchor="middle" class="svg-ink" font-size="12">HQ-SRV</text>
<line x1="100" y1="50" x2="160" y2="95" stroke="#64748b" stroke-width="2"/><line x1="100" y1="148" x2="160" y2="108" stroke="#64748b" stroke-width="2"/><line x1="230" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="2"/><line x1="380" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="265" y="92" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 .1</text><text x="440" y="92" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 10.20.0.1</text>
<text x="340" y="160" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.10.10.0/24 (R1 = .1)</text>
<text x="340" y="180" text-anchor="middle" class="svg-accent" font-size="12">policy MARK-IN: Gi0/0 par input</text>
</svg><p class="cap">Packets R1 mein Gi0/0 par aate hain, classify aur mark hote hain, aur Gi0/1 se server ki taraf nikalte hain.</p></div>

<h3>Task 1: voice flow classify karo</h3>
<p>Pehle flow describe karo. Ek extended access list phone subnet aur RTP (jo protocol voice le jaata hai) ke UDP port range ko naam deti hai. Phir class-map us list ko refer karta hai.</p>
<pre class="code">ip access-list extended VOICE-RTP
 permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
class-map match-any VOICE
 match access-group name VOICE-RTP</pre>
<p>Yaad rakho: is list ka <code>permit</code> ka matlab "class ka hissa hai", aur kuch nahi. <code>show class-map VOICE</code> se confirm karo:</p>
<pre class="out">R1# show class-map VOICE
 Class Map match-any VOICE (id 1)
   Match access-group name VOICE-RTP</pre>
<p>Checker yeh bhi test karta hai ki class phone se UDP port 20000 wale packet ko match kare lekin PC se UDP port 5001 wale packet ko nahi, aur TCP packet ko bhi nahi. Isliye port range aur protocol dono matter karte hain.</p>

<h3>Task 2: mark karo aur policy apply karo</h3>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
interface GigabitEthernet0/0
 service-policy input MARK-IN</pre>
<pre class="out">R1# show policy-map MARK-IN

  Policy Map MARK-IN
    Class VOICE
      set dscp ef</pre>
<p>Input aur Gi0/0 kyun? Phone ke packets router mein Gi0/0 par aate hain, isliye wahin woh pehle dikhte aur mark hote hain. Gi0/0 par <code>output</code> lagayi policy sirf LAN ki taraf jaate packets dekhti, phone ke apne packets kabhi nahi. Yeh chapter 5 ka "edge par, andar aate hi mark karo" rule hai.</p>

<h3>Task 3: traffic bhejo aur mark prove karo</h3>
<p>Do flows generate hote hain, ek jo match kare aur ek jo na kare. PHONE par <code>traffic 10.20.0.100 udp/20000 400 10</code> type karo (400 kbps 10 second ke liye, port 20000, voice range ke andar). PC-DATA par <code>traffic 10.20.0.100 udp/5001 2000 10</code> (2 Mbps, port 5001, range ke bahar). Das second ruko, phir phone par <code>traffic show</code>. Checker ab do facts dekhta hai: DSCP 46 wale packets R1 se server ki taraf nikle, aur class VOICE ne packets gine.</p>

<h3>Task 4: counters padho</h3>
<pre class="out">R1# show policy-map interface GigabitEthernet0/0 input
 GigabitEthernet0/0

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)
      <span class="hl">2500 packets, 500000 bytes</span>
      Match: access-group name VOICE-RTP
        2500 packets, 500000 bytes
      QoS Set
        dscp ef
          <span class="hl">Packets marked 2500</span>

    Class-map: class-default (match-any)
      <span class="hl">12500 packets, 2500000 bytes</span>
      Match: any</pre>
<p>Aise padho. Class VOICE ne 2,500 packets dekhe: 200-byte packets mein 400 kbps matlab 250 packets per second, das second ke liye. Saare 2,500 EF mark hue. Class <b>class-default</b> ne 12,500 packets dekhe: 200-byte packets mein 2 Mbps ka data flow matlab 1,250 packets per second. <b>class-default</b> built-in catch-all class hai: jo packet koi aur class nahi chunti woh wahan jaata hai. Isliye aakhri task ka jawab class-default hai. Data PC mark nahi hua, aur hum yahi chahte the.</p>

<div class="eg"><p><b>Worked example.</b> Arithmetic khud check karo. Rate 400 kbps = 4,00,000 bits per second. 200 byte ka packet 1,600 bits ka hota hai. 4,00,000 / 1,600 = 250 packets per second. 10 second mein 2,500 packets, jo counter se match karta hai. Jab bhi counters ajeeb lagein, yeh chhota calculation karo: isse jaldi pata chalta hai ki numbers plausible hain ya nahi.</p></div>

<h3>Yeh chhota lab kyun matter karta hai</h3>
<p>Aapne abhi ek router par wahi kiya jis par baad ke modules ke har QoS design bante hain: flow describe karo, mark karo, aur counters se mark prove karo. Agle modules aur classes jodte hain (mq-mark), woh queues jo mark par act karti hain (mq-queue), aur slow links ke liye rate limits (mq-wan). Dhyan do ki is lab ne kya nahi kiya: usne voice ko tez nahi banaya. Congestion aur output queue policy ke bina wire par kuch nahi badalta. Woh mq-queue mein aayega.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Policy input ho to output policy padhna; <code>show policy-map interface</code> mein <code>input</code> ya <code>output</code> shabd jodo. (2) Test flow port range ke bahar bhejna aur sochna ki VOICE zero kyun hai. (3) Flow khatam hone se pehle counters check karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>class-default</code> har policy-map mein hota hai chahe aap use na likho. Jo packets kisi aur class se match nahi karte woh wahin jaate hain.</p></div>

<div class="scn"><h4>CEO ka softphone</h4><p>Rollout ke baad CEO ke softphone ne voice UDP port 40000 par bheji, jo 16384 se 32767 range ke bahar hai. Calls mark nahi hui, aur backups ke dauraan kharab sunayi dein. CEO ke bolte waqt class VOICE ke counters nahi badhe, lekin class-default ke badhe. ACL range mein port 40000 jodna, ya behtar, trusted boundary par application ka apna DSCP match karna, ne theek kiya.</p><p><b>Seekh:</b> class-map sirf wahi mark kar sakta hai jo woh match karta hai. class-default counter dekhte raho; wahan achanak bade numbers ka matlab hai ki kuch important classify nahi ho raha.</p></div>

<div class="iv"><p class="q">"Aap kaise prove karoge ki aapki marking policy kaam karti hai, sirf configured nahi hai?"</p><p>Strong answer: aisa test traffic bhejo jo match kare aur jo na kare, phir check karo ki matching class packets gine aur set action utne hi marked packets dikhaye, class-default baaki gine, aur agle interface se nikalte packets naya DSCP carry karein, jaise capture mein dikhe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Class-map flow chunta hai, policy-map mark karta hai, service-policy input use wahan lagata hai jahan traffic andar aata hai.</li>
<li>show policy-map interface input ya output ke saath har class ke matched aur marked packets dikhata hai.</li>
<li>class-default woh sab pakadta hai jo koi aur class match nahi karti.</li>
<li>Arithmetic check karo: kbps ko bits per packet se divide karo to packets per second milte hain.</li>
<li>Sirf marking traffic ko tez nahi karti; yeh sirf baad ke queuing decisions ko enable karti hai.</li>
</ul></div>
`}};export{e as default};